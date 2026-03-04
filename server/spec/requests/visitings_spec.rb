# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe 'VisitingsController' do
  let!(:office) { create(:office) }
  let!(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:customer1) do
    create(:customer, office:, default_pick_up_point_id: bookmark1.bid,
                      default_drop_off_point_id: bookmark1.bid)
  end
  let!(:customer2) do
    create(:customer, office:, default_pick_up_point_id: bookmark2.bid,
                      default_drop_off_point_id: bookmark2.bid)
  end
  let!(:customer3) do
    create(:customer, office:, default_pick_up_point_id: bookmark3.bid,
                      default_drop_off_point_id: bookmark3.bid)
  end
  let!(:car_restriction1) { create(:car_restriction) }
  let!(:car_restriction2) { create(:car_restriction) }
  let!(:car_restriction3) { create(:car_restriction) }

  let!(:bookmark1) { create(:bookmark, car_restriction_id: car_restriction1.id, office_code: office.cd) }
  let!(:bookmark2) { create(:bookmark, car_restriction_id: car_restriction2.id, office_code: office.cd) }
  let!(:bookmark3) { create(:bookmark, car_restriction_id: car_restriction3.id, office_code: office.cd) }
  let!(:p_bookmark1) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark1.bid, customer_cd: customer1.cd, point: 'A')
  end
  let!(:p_bookmark2) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark2.bid, customer_cd: customer2.cd, point: 'A')
  end
  let!(:p_bookmark3) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark3.bid, customer_cd: customer3.cd, point: 'A')
  end
  let!(:office_bookmark) do
    create(:bookmark, car_restriction_id: car_restriction1.id, office_code: office.cd, reference_id: 'A001')
  end
  let!(:car) { create(:car, office:) }
  let!(:driver) { create(:staff, office:, can_driver: true) }
  let!(:visiting) do
    create(:visiting, office:, car:, driver_id: driver.id, date: Date.current, bin_order: 1, departure_time: '09:00',
                      arrival_time: '10:00')
  end
  let!(:visiting_customer1) do
    create(:visitings_customer, visiting:, customer: customer1, order: 1, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: '09:00', visiting_id: visiting.id, point_id: bookmark1.bid,
                                base_point_id: office_bookmark.bid)
  end
  let!(:visiting_customer2) do
    create(:visitings_customer, visiting:, customer: customer2, order: 2, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: '09:10', visiting_id: visiting.id, point_id: bookmark2.bid,
                                base_point_id: office_bookmark.bid)
  end
  let!(:visiting_customer3) do
    create(:visitings_customer, visiting:, customer: customer3, order: 3, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: '09:20', visiting_id: visiting.id, point_id: bookmark3.bid,
                                base_point_id: office_bookmark.bid)
  end
  let!(:visiting_point_office) do
    create(:visitings_point, visiting:, point_id: office_bookmark.bid, order: 4, arrival: true,
                             actual_time: '10:00', date: Date.current)
  end
  let!(:visiting_customer4) do
    create(:visitings_customer, customer: customer1, order: 1, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: '09:20', visiting_id: nil, point_id: bookmark1.bid, date: Date.current + 7)
  end

  before do
    bookmark1.update(reference_id: customer1.cd)
    bookmark2.update(reference_id: customer2.cd)
    bookmark3.update(reference_id: customer3.cd)
  end

  describe 'GET /visitings' do
    subject { get visitings_path, params: }

    let(:params) do
      {
        visiting_search: {
          date: Date.current
        }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_groups'][0][0]['id']).to eq(visiting.id)
      expect(json['visitings_groups'][0][0]['car_id']).to eq(visiting.car_id)
      expect(json['visitings_groups'][0][0]['bin_order']).to eq(1)
      expect(json['visitings_groups'][0][0]['departure_time']).to eq(visiting.formatted_departure_time)
      expect(json['visitings_groups'][0][0]['arrival_time']).to eq(visiting.formatted_arrival_time)
      expect(json['visitings_groups'][0][0]['user_count']).to eq(3)
      expect(json['visitings_groups'][0][0]['wc_user_count']).to eq(0)
      expect(json['visitings_groups'][0][0]['cargo_volume']).to eq('0.0')
      expect(json['visitings_groups'][0][0]['driver_name']).to eq(visiting.driver.name)
      expect(json['visitings_groups'][0][0]['tenjo_name']).to eq(visiting.tenjo.name)
      expect(json['visitings_groups'][0][0]['first_address']).to eq(visiting.customers.first.bookmark.address)
      expect(json['visitings_groups'][0][0]['route_points'].size).to eq(3)
      expect(json['visitings_groups'][0][0]['route_points'][0]['id']).to eq(visiting_customer1.id)
      expect(json['visitings_groups'][0][0]['route_points'][0]['soge_type']).to eq(visiting_customer1.soge_type)
      expect(json['visitings_groups'][0][0]['route_points'][0]['display_name']).to eq(visiting_customer1.customer.name)
      expect(json['visitings_groups'][0][0]['route_points'][0]['wc']).to eq(visiting_customer1.customer.wc)
      expect(json['visitings_groups'][0][0]['route_points'][0]['actual_time'])
        .to eq(visiting_customer1.formatted_actual_time)
      expect(json['visitings_groups'][0][0]['route_points'][0]['point_type']).to eq('VisitingsCustomer')
      expect(json['cars'].size).to eq(1)
    end

    it 'filters by date' do
      params[:visiting_search][:date] = Date.current + 1
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_groups'][0][0]['id']).to be_nil
    end
  end

  describe 'GET /visitings/:id' do
    subject { get visiting_path(visiting) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visiting data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['visiting']['id']).to eq(visiting.id)
      expect(json['visiting']['date']).to eq(visiting.date.strftime('%Y-%m-%d'))
      expect(json['visiting']['car_id']).to eq(visiting.car_id)
      expect(json['visiting']['driver_name']).to eq(visiting.driver.name)
      expect(json['visiting']['tenjo_name']).to eq(visiting.tenjo.name)
      expect(json['visiting']['departure_time']).to eq(visiting.formatted_departure_time)
      expect(json['visiting']['arrival_time']).to eq(visiting.formatted_arrival_time)
      expect(json['visiting']['customers_count']).to eq(3)
      expect(json['visiting']['route_points'][0]['id']).to eq(visiting_customer1.id)
      expect(json['visiting']['route_points'][0]['display_name']).to eq(visiting_customer1.customer.name)
      expect(json['visiting']['route_points'][0]['soge_type']).to eq(visiting_customer1.soge_type)
      expect(json['visiting']['route_points'][0]['wc']).to eq(visiting_customer1.customer.wc)
      expect(json['visiting']['route_points'][0]['schedule_time']).to eq(visiting_customer1.formatted_schedule_time)
    end
  end

  describe 'PATCH /visitings/:id/update_time', :google_maps_api do
    subject { put update_time_visiting_path(visiting), params:, as: :json }

    let(:params) do
      {
        route_points: [
          {
            id: visiting_customer1.id,
            order: 1,
            point_type: 'VisitingsCustomer'
          },
          {
            id: visiting_customer3.id,
            order: 2,
            point_type: 'VisitingsCustomer'
          },
          {
            id: visiting_customer2.id,
            order: 3,
            point_type: 'VisitingsCustomer'
          }
        ],
        adjustment_time: 0
      }
    end

    it 'updates visiting time successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'updates customers order successfully' do
      subject
      expect(response).to have_http_status(:ok)
      expect(visiting_customer1.reload.order).to eq(1)
      expect(visiting_customer2.reload.order).to eq(3)
      expect(visiting_customer3.reload.order).to eq(2)
    end
  end

  describe 'GET /visitings/car_index' do
    subject { get car_index_visitings_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns cars data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['cars']).not_to be_empty
    end
  end

  describe 'GET /visitings/visitings_customer_index' do
    subject do
      get visitings_customer_index_visitings_path, params: { visiting_customer_search: { date: Date.current } }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings customer data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers_except_self']).to be_an(Array)
      expect(json['visitings_customers_self']).to be_an(Array)
    end
  end

  describe 'POST /visitings/new_data' do
    subject { post new_data_visitings_path, params:, as: :json }

    let(:params) do
      {
        new_data: {
          date: Date.current,
          car_id: car.id,
          bin_order: 1
        }
      }
    end

    it 'creates new visiting data' do
      subject
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['id']).to be_present
    end
  end

  describe 'GET /visitings/:id/can_driving_staff' do
    subject { get can_driving_staff_visiting_path(visiting) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns available staff data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['can_driver'][0]['id']).to eq(driver.id)
    end
  end

  describe 'PATCH /visitings/:id/update_staffs' do
    subject { put update_staffs_visiting_path(visiting), params:, as: :json }

    let(:params) do
      {
        staffs_update: {
          driver_id: driver.id,
          tenjo_id: nil
        }
      }
    end

    it 'updates visiting staff successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /visitings/:id/route' do
    subject { get route_visiting_path(visiting) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns route data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points'][0]['position']['lat']).to eq(bookmark1.lat)
      expect(json['points'][0]['position']['lng']).to eq(bookmark1.lng)
      expect(json['points'][1]['position']['lat']).to eq(bookmark2.lat)
      expect(json['points'][1]['position']['lng']).to eq(bookmark2.lng)
      expect(json['points'][2]['position']['lat']).to eq(bookmark3.lat)
      expect(json['points'][2]['position']['lng']).to eq(bookmark3.lng)
    end
  end

  describe 'POST /visitings/replicate' do
    subject { post replicate_visitings_path, params:, as: :json }

    let(:params) do
      {
        replicate: {
          target_date: (Date.current + 7).strftime('%Y-%m-%d'),
          weeks_ago: 1
        }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns replicate data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['replicated_count']).to eq(1)
    end

    it 'replicates correct number of visiting customers' do
      expect do
        subject

        Current.office = office
      end.to change {
               VisitingsCustomer.where(date: Date.current + 7,
                                       visiting_id: Visiting.where(date: Date.current + 7)).count
             }.by(1)
    end
  end

  describe 'GET /visitings/requested_soge' do
    subject { get requested_soge_visitings_path, params: }

    let(:params) do
      {
        visiting_search: {
          date: Date.current
        }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns shared visitings (is_shared: true)' do
      shared_visiting = Visiting.create!(
        office:,
        is_shared: true,
        date: Date.current,
        bin_order: 1,
        departure_time: '09:00',
        arrival_time: '10:00',
        shared_car_name: '共有車A',
        shared_driver_name: '運転手A',
        shared_tenjo_name: '添乗A'
      )
      create(:visitings_customer, office:, visiting: shared_visiting, customer: customer1,
                                  date: Date.current, order: 1, soge_type: :pick_up, point_id: bookmark1.bid)

      subject

      json = response.parsed_body.with_indifferent_access
      ids = json['visitings_groups'].flatten.pluck('id').compact
      expect(ids).to include(shared_visiting.id)
      expect(ids).not_to include(visiting.id) # is_shared: false は除外される
    end

    it 'groups visitings_groups by shared_car_name' do
      shared_visiting_a = Visiting.create!(
        office:, is_shared: true, date: Date.current, bin_order: 1,
        departure_time: '09:00', arrival_time: '10:00', shared_car_name: '共有車A'
      )
      shared_visiting_b = Visiting.create!(
        office:, is_shared: true, date: Date.current, bin_order: 1,
        departure_time: '09:00', arrival_time: '10:00', shared_car_name: '共有車B'
      )
      create(:visitings_customer, office:, visiting: shared_visiting_a, customer: customer1,
                                  date: Date.current, order: 1, soge_type: :pick_up, point_id: bookmark1.bid)
      create(:visitings_customer, office:, visiting: shared_visiting_b, customer: customer2,
                                  date: Date.current, order: 1, soge_type: :pick_up, point_id: bookmark2.bid)

      subject

      json = response.parsed_body.with_indifferent_access
      car_names = json['visitings_groups'][0].pluck('car_name')
      expect(car_names).to include('共有車A', '共有車B')
      expect(json['cars']).to match_array(%w[共有車A 共有車B])
    end

    it 'returns empty when no shared data exists' do
      # 既存の visiting は is_shared: false のため、共有データは存在しない
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_groups']).to eq([])
      expect(json['cars']).to eq([])
    end
  end

  describe 'POST /visitings/share_to_office' do
    subject { post share_to_office_visitings_path, params:, as: :json }

    let(:params) do
      {
        date: Date.current.strftime('%Y-%m-%d'),
        visiting_ids: [share_visiting.id]
      }
    end

    let!(:request_office) { create(:office, name: '共有先事業所') }
    let!(:request_office_bookmark) do
      create(:bookmark, office_code: request_office.cd, reference_id: 'A001', car_restriction_id: car_restriction1.id)
    end

    let!(:request_office_customer) do
      create(
        :customer,
        office: request_office,
        cd: 'SRC001',
        name: '受託利用者',
        name_kana: 'ジュタク',
        default_pick_up_point_id: request_office_bookmark.bid,
        default_drop_off_point_id: request_office_bookmark.bid
      )
    end

    let!(:requested_customer) do
      RequestedCustomer.create!(
        office: request_office,
        cd: 'REQ001',
        name: 'リクエスト利用者',
        name_kana: 'リクエスト',
        date: Date.current,
        soge_type: :pick_up,
        schedule_time: '09:00',
        point_id: request_office_bookmark.bid,
        base_point_id: request_office_bookmark.bid,
        source_id: request_office_customer.id,
        source_vc_id: 1
      )
    end

    let!(:share_customer) do
      create(:customer, office:, requested_customer_id: requested_customer.id, default_pick_up_point_id: bookmark1.bid,
                        default_drop_off_point_id: bookmark1.bid)
    end

    let!(:share_visiting) do
      create(:visiting, office:, car:, driver_id: driver.id, date: Date.current, bin_order: 2,
                        departure_time: '09:00', arrival_time: '10:00',
                        departure_point_id: office_bookmark.bid, arrival_point_id: office_bookmark.bid)
    end

    let!(:share_vc) do
      create(:visitings_customer, office:, visiting: share_visiting, customer: share_customer,
                                  date: Date.current, order: 1, soge_type: :pick_up, point_id: bookmark1.bid,
                                  is_requested: true, is_requesting: false)
    end

    it 'returns http success and message includes destination office name' do
      subject

      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['message']).to include(request_office.name)

      shared = Visiting.unscoped.find_by(
        is_shared: true,
        source_visiting_id: share_visiting.id,
        source_office_id: office.id,
        office_id: request_office.id
      )
      expect(shared).to be_present
      expect(shared.shared_car_name).to eq(share_visiting.car.name)
    end

    it 'returns no content when visiting_ids is empty' do
      params[:visiting_ids] = []
      subject
      expect(response).to have_http_status(:no_content)
    end

    it 'returns no content when there is no share target' do
      # is_requested が無いと共有先office_idが抽出できず、共有対象が0になる
      share_vc.update!(is_requested: false)
      subject
      expect(response).to have_http_status(:no_content)
    end

    it 'returns 404 when date does not match' do
      params[:date] = (Date.current + 1).strftime('%Y-%m-%d')
      subject
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /visitings/replicate_with_overwrite' do
    subject { post replicate_with_overwrite_visitings_path, params:, as: :json }

    let(:target_date) { Date.current + 7 }

    let(:params) do
      {
        replicate: {
          target_date: target_date.strftime('%Y-%m-%d'),
          weeks_ago: 1
        }
      }
    end

    it 'returns http success and overwrites existing data' do
      existing_target_visiting = create(:visiting, office:, car:, driver_id: driver.id,
                                                   date: target_date,
                                                   bin_order: 9,
                                                   departure_time: '09:00',
                                                   arrival_time: '10:00')
      VisitingsPoint.create!(office:, visiting: existing_target_visiting,
                             point_id: office_bookmark.bid, date: target_date,
                             arrival: true, order: 0, soge_type: :pick_up)

      # 既存データ（上書き対象）として、target_dateのVCを既存便に紐づけておく
      visiting_customer4.update!(visiting_id: existing_target_visiting.id)

      subject

      Current.office = office
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['replicated_count']).to eq(1)

      expect(Visiting.where(id: existing_target_visiting.id)).not_to exist
      new_visiting = Visiting.where(date: target_date).order(:id).last
      expect(new_visiting).to be_present

      expect(visiting_customer4.reload.visiting_id).to eq(new_visiting.id)
    end

    it 'returns 404 when there is no source data to replicate' do
      params[:replicate][:target_date] = (Date.current + 14).strftime('%Y-%m-%d') # source_date は Date.current + 7
      subject
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /visitings/point_options' do
    subject { get point_options_visitings_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns point options list' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['point_options']).to be_an(Array)
      expect(json['point_options']).not_to be_empty
      expect(json['point_options'].pluck('value')).to include(office_bookmark.bid)
    end
  end

  describe 'DELETE /visitings/:id/remove_all_customers' do
    subject { delete remove_all_customers_visiting_path(visiting_to_remove) }

    let!(:visiting_to_remove) do
      create(:visiting, office:, car:, driver_id: driver.id, date: Date.current, bin_order: 99, departure_time: '09:00',
                        arrival_time: '10:00')
    end
    let!(:vc_to_remove) do
      create(:visitings_customer, office:, visiting: visiting_to_remove, customer: customer1,
                                  date: Date.current, order: 1, soge_type: :pick_up, point_id: bookmark1.bid)
    end
    let!(:vp_to_remove) do
      VisitingsPoint.create!(office:, visiting: visiting_to_remove, point_id: office_bookmark.bid, date: Date.current,
                             arrival: true, order: 0, soge_type: :pick_up)
    end

    it 'returns http success and removes visiting and related data' do
      subject

      Current.office = office
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('便を削除しました')

      expect(Visiting.where(id: visiting_to_remove.id)).not_to exist
      expect(vc_to_remove.reload.visiting_id).to be_nil
      expect(VisitingsPoint.where(id: vp_to_remove.id)).not_to exist
    end

    it 'returns 404 when visiting does not exist' do
      delete remove_all_customers_visiting_path(id: 99_999_999)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT /visitings/:id/update_point' do
    subject { put update_point_visiting_path(visiting_to_update), params:, as: :json }

    let!(:visiting_to_update) do
      create(
        :visiting,
        office:,
        car:,
        driver_id: driver.id,
        date: Date.current,
        bin_order: 88,
        departure_time: '09:00',
        arrival_time: '10:00',
        departure_point_id: bookmark1.bid,
        arrival_point_id: bookmark2.bid
      )
    end

    let!(:arrival_point_vp) do
      VisitingsPoint.create!(
        office:,
        visiting: visiting_to_update,
        point_id: visiting_to_update.arrival_point_id,
        date: visiting_to_update.date,
        arrival: true,
        order: 0,
        soge_type: :pick_up
      )
    end

    let(:params) do
      {
        point_update: {
          departure_point_id: bookmark3.bid,
          arrival_point_id: office_bookmark.bid
        }
      }
    end

    it 'returns http success and updates departure/arrival points (including arrival VP)' do
      subject

      Current.office = office
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to be_present

      expect(visiting_to_update.reload.departure_point_id).to eq(bookmark3.bid)
      expect(visiting_to_update.reload.arrival_point_id).to eq(office_bookmark.bid)
      expect(arrival_point_vp.reload.point_id).to eq(office_bookmark.bid)
    end

    it 'returns error when point_id is invalid' do
      invalid_bid = Area::Bookmark.maximum(:bid).to_i + 10_000
      params[:point_update][:arrival_point_id] = invalid_bid

      begin
        subject
        expect(response).to have_http_status(:internal_server_error)
      rescue ActiveRecord::InvalidForeignKey, ActiveRecord::StatementInvalid => e
        expect(e).to be_a(ActiveRecord::InvalidForeignKey).or be_a(ActiveRecord::StatementInvalid)
      end
    end
  end
end
