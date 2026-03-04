# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Education::VisitingsController' do
  let!(:office) { create(:office, category: 'education') }
  let!(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:car) { create(:car, office:) }
  let!(:car_restriction) { create(:car_restriction) }
  let!(:bookmark) { create(:bookmark, office_code: office.cd, car_restriction:, reference_id: 'A001') }

  describe 'GET /education/visitings' do
    subject { get education_visitings_path, params: }

    let(:params) do
      {
        visiting_search: { date: Date.current.to_s }
      }
    end

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer) { create(:customer, office:) }
    let!(:visitings_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_groups']).to be_present
      expect(json['cars']).to be_present
    end
  end

  describe 'GET /education/visitings/:id' do
    subject { get education_visiting_path(visiting) }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer) { create(:customer, office:) }
    let!(:visitings_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visiting details' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visiting']).to be_present
      expect(json['visiting']['id']).to eq(visiting.id)
      expect(json['visiting']['car_id']).to eq(car.id)
      expect(json['visiting']['date']).to eq(Date.current.to_s)
    end
  end

  describe 'PUT /education/visitings/:id/update_time' do
    subject { put update_time_education_visiting_path(visiting), params:, as: :json }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer1) { create(:customer, office:) }
    let!(:customer2) { create(:customer, office:) }

    let!(:visiting_customer1) do
      create(:visitings_customer,
             office:,
             customer: customer1,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up',
             order: 1)
    end

    let!(:visiting_customer2) do
      create(:visitings_customer,
             office:,
             customer: customer2,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up',
             order: 2)
    end

    let(:params) do
      {
        route_points: [
          {
            id: visiting_customer2.id,
            order: 1,
            point_type: 'VisitingsCustomer'
          },
          {
            id: visiting_customer1.id,
            order: 2,
            point_type: 'VisitingsCustomer'
          }
        ],
        customer_ids: [customer1.id, customer2.id],
        adjustment_time: 0
      }
    end

    it 'updates visiting time successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to be_present
    end
  end

  describe 'GET /education/visitings/:id/route' do
    subject { get route_education_visiting_path(visiting) }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer1) { create(:customer, office:) }
    let!(:visiting_customer1) do
      create(:visitings_customer,
             office:,
             customer: customer1,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns route information' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['points']).to be_present
      expect(json['car_name']).to eq(car.name)
      expect(json['bin_order']).to eq(visiting.bin_order)
    end
  end

  describe 'POST /education/visitings/new_data' do
    subject { post new_data_education_visitings_path, params:, as: :json }

    let!(:new_car) { create(:car, office:) }
    let!(:customer) { create(:customer, office:) }

    let!(:visitings_customer_for_new_visiting) do
      create(:visitings_customer,
             office:,
             customer:,
             visiting_id: nil,
             date: (Date.current + 10.days),
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    let(:params) do
      {
        new_data: {
          date: (Date.current + 10.days).to_s,
          car_id: new_car.id,
          bin_order: 100
        },
        customer_ids: [visitings_customer_for_new_visiting.id]
      }
    end

    before do
      # DistanceServiceをモックしてGoogle APIの呼び出しを回避
      # Co2coモデルは削除済み、ハッシュを返す
      allow(DistanceService).to receive(:find_co2co).and_return({ distance: 10.0, time: 15 })
    end

    it 'creates a new visiting successfully' do
      expect do
        subject
        Current.office = office
      end.to change(Visiting, :count).by(1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns visiting id' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['id']).to be_present
    end

    it 'creates base point for arrival' do
      subject
      Current.office = office
      visiting = Visiting.last
      expect(visiting.base_points.where(arrival: true)).to be_present
    end
  end

  describe 'DELETE /education/visitings/:id/remove_all_customers' do
    subject { delete remove_all_customers_education_visiting_path(visiting) }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer) { create(:customer, office:) }
    let!(:visiting_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             visiting:,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    it 'deletes visiting successfully' do
      expect do
        subject
        Current.office = office
      end.to change(Visiting, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('便を削除しました')
    end

    context 'when visiting does not exist' do
      it 'returns HTTP 404' do
        delete remove_all_customers_education_visiting_path(99_999)
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body.with_indifferent_access
        expect(json['errors']).to include('指定された便が見つかりません')
      end
    end
  end

  describe 'PUT /education/visitings/:id/update_point' do
    subject { put update_point_education_visiting_path(visiting), params:, as: :json }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:arrival_base_point) do
      visiting.base_points.create!(
        point_id: bookmark.bid,
        date: visiting.date,
        arrival: true,
        order: 1
      )
    end

    let!(:new_bookmark) { create(:bookmark, office_code: office.cd, car_restriction:, reference_id: 'A001') }

    let(:params) do
      {
        point_update: {
          departure_point_id: new_bookmark.bid,
          arrival_point_id: new_bookmark.bid
        }
      }
    end

    it 'updates departure and arrival points successfully' do
      subject
      expect(response).to have_http_status(:ok)
      visiting.reload
      expect(visiting.departure_point_id).to eq(new_bookmark.bid)
      expect(visiting.arrival_point_id).to eq(new_bookmark.bid)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to be_present
    end
  end

  describe 'GET /education/visitings/:id/can_driving_staff' do
    subject { get can_driving_staff_education_visiting_path(visiting) }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid,
             departure_time: '09:00',
             arrival_time: '12:00')
    end

    let!(:driver_staff) { create(:staff, office:, can_driver: true) }
    let!(:helper_staff) { create(:staff, office:, can_helper: true) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns available drivers' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['can_driver']).to be_present
    end

    it 'returns available helpers' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['can_tenjo']).to be_present
    end

    it 'returns selected staff ids' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json).to have_key('selected_driver_id')
      expect(json).to have_key('selected_tenjo_id')
    end
  end

  describe 'PUT /education/visitings/:id/update_staffs' do
    subject { put update_staffs_education_visiting_path(visiting), params:, as: :json }

    let!(:visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:driver_staff) { create(:staff, office:, can_driver: true) }
    let!(:helper_staff) { create(:staff, office:, can_helper: true) }

    let(:params) do
      {
        staffs_update: {
          driver_id: driver_staff.id,
          tenjo_id: helper_staff.id
        }
      }
    end

    it 'updates staffs successfully' do
      subject
      expect(response).to have_http_status(:ok)
      visiting.reload
      expect(visiting.driver_id).to eq(driver_staff.id)
      expect(visiting.tenjo_id).to eq(helper_staff.id)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to be_present
    end
  end

  describe 'POST /education/visitings/replicate' do
    subject { post replicate_education_visitings_path, params:, as: :json }

    let(:params) do
      {
        target_date: (Date.current + 7.days).to_s,
        weeks_ago: 1
      }
    end

    let!(:past_visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:past_customer) { create(:customer, office:) }
    let!(:past_visitings_customer) do
      create(:visitings_customer,
             office:,
             customer: past_customer,
             visiting: past_visiting,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    before do
      service_mock = instance_double(VisitingReplicationService)
      allow(VisitingReplicationService).to receive(:new).and_return(service_mock)
      allow(service_mock).to receive_messages(check_existing_data: { has_existing: false }, replicate: {
                                                success: true,
                                                message: '送迎を複製しました',
                                                replicated_count: 1
                                              })
    end

    it 'replicates visitings successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message with count' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['message']).to eq('送迎を複製しました')
      expect(json['replicated_count']).to eq(1)
    end

    context 'when existing data exists' do
      before do
        service_mock = instance_double(VisitingReplicationService)
        allow(VisitingReplicationService).to receive(:new).and_return(service_mock)
        allow(service_mock).to receive(:check_existing_data).and_return({
                                                                          has_existing: true,
                                                                          message: '既にデータが存在します'
                                                                        })
      end

      it 'returns conflict status' do
        subject
        expect(response).to have_http_status(:conflict)
        json = response.parsed_body.with_indifferent_access
        expect(json['message']).to eq('既にデータが存在します')
      end
    end
  end

  describe 'POST /education/visitings/replicate_with_overwrite' do
    subject { post replicate_with_overwrite_education_visitings_path, params:, as: :json }

    let(:params) do
      {
        target_date: (Date.current + 7.days).to_s,
        weeks_ago: 1
      }
    end

    before do
      service_mock = instance_double(VisitingReplicationService)
      allow(VisitingReplicationService).to receive(:new).and_return(service_mock)
      allow(service_mock).to receive(:replicate_with_overwrite).and_return({
                                                                             success: true,
                                                                             message: '送迎を上書き複製しました',
                                                                             replicated_count: 2
                                                                           })
    end

    it 'replicates with overwrite successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message with count' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['message']).to eq('送迎を上書き複製しました')
      expect(json['replicated_count']).to eq(2)
    end
  end

  describe 'POST /education/visitings/share_to_office' do
    subject { post share_to_office_education_visitings_path, params:, as: :json }

    let!(:request_office) { create(:office, name: '受託事業所') }
    let!(:visiting_to_share) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: false,
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let(:params) do
      {
        date: Date.current.to_s,
        visiting_ids: [visiting_to_share.id]
      }
    end

    before do
      allow(VisitingShareService).to receive(:share_visitings).and_return([request_office.id])
    end

    it 'shares visitings successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message with office names' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['message']).to include('受託事業所')
      expect(json['message']).to include('送迎を共有しました')
    end

    it 'calls VisitingShareService' do
      subject
      expect(VisitingShareService).to have_received(:share_visitings).with(
        Date.current.to_s,
        [visiting_to_share.id]
      )
    end
  end

  describe 'GET /education/visitings/car_index' do
    subject { get car_index_education_visitings_path }

    let!(:car1) { create(:car, office:, name: '車両1', number: 'CAR-001') }
    let!(:car2) { create(:car, office:, name: '車両2', number: 'CAR-002') }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns cars data' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['cars']).to be_present
      expect(json['cars'].size).to be >= 2
    end

    it 'includes car details' do
      subject
      json = response.parsed_body.with_indifferent_access
      car_names = json['cars'].pluck('name')
      expect(car_names).to include('車両1', '車両2')
    end
  end

  describe 'GET /education/visitings/visitings_customer_index' do
    subject { get visitings_customer_index_education_visitings_path, params: }

    let(:params) do
      {
        visiting_customer_search: { date: Date.current.to_s }
      }
    end

    let!(:customer1) { create(:customer, office:) }
    let!(:visitings_customer1) do
      create(:visitings_customer,
             office:,
             customer: customer1,
             visiting_id: nil,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up',
             is_self: false,
             is_absent: false)
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings customers data' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers_except_self']).to be_present
    end

    it 'includes customer details' do
      subject
      json = response.parsed_body.with_indifferent_access
      customers = json['visitings_customers_except_self'].first['visitings_customers']
      expect(customers.first['name']).to eq(customer1.name)
    end
  end

  describe 'GET /education/visitings/point_options' do
    subject { get point_options_education_visitings_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns point options' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['point_options']).to be_present
    end
  end

  describe 'GET /education/visitings/requested_soge' do
    subject { get requested_soge_education_visitings_path, params: }

    let(:params) do
      {
        visiting_search: { date: Date.current.to_s }
      }
    end

    let!(:shared_visiting) do
      create(:visiting,
             office:,
             car:,
             date: Date.current,
             is_shared: true,
             shared_car_name: '共有車両',
             departure_point_id: bookmark.bid,
             arrival_point_id: bookmark.bid)
    end

    let!(:customer_for_shared) { create(:customer, office:) }
    let!(:visitings_customer_for_shared) do
      create(:visitings_customer,
             office:,
             customer: customer_for_shared,
             visiting: shared_visiting,
             date: Date.current,
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns shared visitings data' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_groups']).to be_present
    end

    it 'includes car names' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['cars']).to be_present
    end
  end
end
