# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CustomersController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let(:customer1) do
    create(:customer, office:, default_pick_up_point_id: bookmark1.bid,
                      default_drop_off_point_id: bookmark1.bid)
  end
  let(:customer2) do
    create(:customer, office:, default_pick_up_point_id: bookmark2.bid,
                      default_drop_off_point_id: bookmark2.bid)
  end
  let(:customer3) do
    create(:customer, office:, default_pick_up_point_id: bookmark3.bid,
                      default_drop_off_point_id: bookmark3.bid)
  end
  let!(:customer_use_case1) { create(:customer_use_case, customer: customer1, office:) }
  let!(:customer_use_case2) { create(:customer_use_case, customer: customer2, office:) }
  let!(:customer_use_case3) { create(:customer_use_case, customer: customer3, office:) }
  let!(:bookmark1) { create(:bookmark, office_code: office.cd) }
  let!(:bookmark2) { create(:bookmark, office_code: office.cd) }
  let!(:bookmark3) { create(:bookmark, office_code: office.cd) }
  let!(:p_bookmark1) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark1.bid, customer_cd: customer1.cd, point: 'A')
  end
  let!(:p_bookmark2) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark2.bid, customer_cd: customer2.cd, point: 'A')
  end
  let!(:p_bookmark3) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark3.bid, customer_cd: customer3.cd, point: 'A')
  end
  let!(:office_bookmark) { create(:bookmark, office_code: office.cd, reference_id: 'A001') }

  before do
    bookmark1.update(reference_id: customer1.cd)
    bookmark2.update(reference_id: customer2.cd)
    bookmark3.update(reference_id: customer3.cd)
  end

  describe 'GET /customers' do
    subject { get customers_path, params: }

    let(:params) do
      {
        search_params: {
          page: 1, per: 10
        }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns customers data' do
      subject

      Current.office = office
      json = response.parsed_body
      expect(json['customers'].size).to eq(3)
      expect(json['customers'][0]['id']).to eq(customer1.id)
      expect(json['customers'][0]['cd']).to eq(customer1.cd)
      expect(json['customers'][0]['name']).to eq(customer1.name)
      expect(json['customers'][0]['name_kana']).to eq(customer1.name_kana)
      expect(json['customers'][0]['stopped_at']).to eq(customer1.stopped_at)
      expect(json['customers'][0]['wc']).to eq(customer1.wc)
      expect(json['customers'][0]['walker']).to eq(customer1.walker)
      expect(json['customers'][0]['walker_size']).to eq(customer1.walker_size.to_s)
      expect(json['customers'][0]['car_restriction']).to eq(customer1.car_restriction_name)
      expect(json['customers'][1]['id']).to eq(customer2.id)
      expect(json['customers'][2]['id']).to eq(customer3.id)
    end

    it 'filters by customer_id_or_kana' do
      params[:search_params][:customer_id_or_kana] = customer2.cd
      subject

      Current.office = office
      json = response.parsed_body
      expect(json['customers'].size).to eq(1)
      expect(json['customers'][0]['id']).to eq(customer2.id)
      expect(json['customers'][0]['cd']).to eq(customer2.cd)
      expect(json['customers'][0]['name']).to eq(customer2.name)
      expect(json['customers'][0]['name_kana']).to eq(customer2.name_kana)
      expect(json['customers'][0]['stopped_at']).to eq(customer2.stopped_at)
      expect(json['customers'][0]['wc']).to eq(customer2.wc)
      expect(json['customers'][0]['walker']).to eq(customer2.walker)
      expect(json['customers'][0]['walker_size']).to eq(customer2.walker_size.to_s)
      expect(json['customers'][0]['car_restriction']).to eq(customer2.car_restriction_name)
    end
  end

  describe 'GET /customers/:id' do
    subject { get customer_path(customer1) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer']['id']).to eq(customer1.id)
      expect(json['customer']['cd']).to eq(customer1.cd)
      expect(json['customer']['name']).to eq(customer1.name)
      expect(json['customer']['name_kana']).to eq(customer1.name_kana)
      expect(json['customer']['contract_status']).to eq(customer1.contract_status_before_type_cast)
    end
  end

  describe 'POST /customers' do
    subject { post customers_path, params: customer_params, as: :json }

    let(:customer_params) do
      {
        customer_params: {
          customer: {
            cd: 'TEST001',
            name: 'テスト顧客',
            name_kana: 'テストコキャク',
            contract_status: 1,
            wc: false,
            walker_size: 0,
            walker: false,
            need_helper: false,
            seat_assignment: 1,
            default_pick_up_point_order: 1,
            default_drop_off_point_order: 1,
            departure_time: '09:00',
            arrival_time: '17:00',
            start_time: '09:30',
            self_pick_up: false,
            self_drop_off: false,
            common_note: '',
            walking_note: '',
            pick_up_note: '',
            drop_off_note: '',
            stopped_at: nil,
            stopped_reason: '',
            image: nil
          },
          use_cases: [
            {
              id: nil,
              customer_id: customer1.id,
              day_of_week: 1,
              departure_time: '09:00',
              pick_up_point_order: 1,
              start_time: '09:30',
              arrival_time: '17:00',
              drop_off_point_order: 1,
              self_pick_up: false,
              self_drop_off: false,
              active: true,
              pick_up_request: false,
              drop_off_request: false
            }
          ],
          addresses: [
            {
              bid: nil,
              order: 1,
              address_label: 'テスト住所',
              postal_code: '1234567',
              address: '東京都千代田区永田町1-7-1',
              room_name: '101',
              phone_number: '09012345678',
              lat: 35.681236,
              lng: 139.767125,
              distance: 0,
              time: 0,
              wait_time: 0,
              acceptance_rate: 0,
              car_restriction_id: CarRestriction.second.id
            }
          ]
        }
      }
    end

    it 'creates a new customer successfully' do
      expect do
        subject
        Current.office = office
      end.to change(Customer, :count).by(1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns error with invalid params' do
      customer_params[:customer_params][:customer][:cd] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /customers/:id' do
    subject { patch customer_path(customer1), params: update_params, as: :json }

    let(:update_params) do
      {
        customer_params: {
          customer: {
            id: customer1.id,
            cd: customer1.cd,
            name: '更新後顧客名',
            name_kana: customer1.name_kana,
            contract_status: customer1.contract_status,
            wc: customer1.wc,
            walker_size: customer1.walker_size,
            walker: customer1.walker,
            need_helper: customer1.need_helper,
            seat_assignment: customer1.seat_assignment,
            default_pick_up_point_order: 1,
            default_drop_off_point_order: 1,
            departure_time: customer1.formatted_departure_time,
            arrival_time: customer1.formatted_arrival_time,
            start_time: customer1.formatted_start_time,
            self_pick_up: customer1.self_pick_up,
            self_drop_off: customer1.self_drop_off,
            common_note: customer1.common_note,
            walking_note: customer1.walking_note,
            pick_up_note: customer1.pick_up_note,
            drop_off_note: customer1.drop_off_note,
            stopped_at: customer1.stopped_at,
            stopped_reason: customer1.stopped_reason,
            image: nil
          },
          use_cases: [
            {
              id: customer_use_case1.id,
              customer_id: customer1.id,
              day_of_week: customer_use_case1.day_of_week,
              departure_time: customer_use_case1.formatted_departure_time,
              pick_up_point_order: 1,
              start_time: customer_use_case1.formatted_start_time,
              arrival_time: customer_use_case1.formatted_arrival_time,
              drop_off_point_order: 1,
              self_pick_up: customer_use_case1.self_pick_up,
              self_drop_off: customer_use_case1.self_drop_off,
              active: customer_use_case1.active,
              pick_up_request: customer_use_case1.pick_up_request,
              drop_off_request: customer_use_case1.drop_off_request
            }
          ],
          addresses: [
            {
              bid: bookmark1.bid,
              order: 1,
              address_label: bookmark1.address_label,
              postal_code: bookmark1.postal_code,
              address: bookmark1.address,
              room_name: bookmark1.room_name,
              phone_number: bookmark1.phone_number,
              lat: bookmark1.lat,
              lng: bookmark1.lng,
              distance: bookmark1.distance,
              time: bookmark1.time,
              wait_time: bookmark1.wait_time,
              acceptance_rate: bookmark1.acceptance_rate,
              car_restriction_id: CarRestriction.second.id
            }
          ]
        }
      }
    end

    it 'updates customer successfully' do
      subject
      expect(response).to have_http_status(:ok)
      customer1.reload
      expect(customer1.name).to eq('更新後顧客名')
    end

    it 'returns error with invalid params' do
      update_params[:customer_params][:customer][:cd] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'GET /customers/office_latlng' do
    it 'returns http success' do
      get office_latlng_customers_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /customers/point_options' do
    it 'returns http success' do
      get point_options_customers_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /customers/:id/customer_bookmarks_options' do
    subject { get customer_bookmarks_options_customer_path(customer1) }

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '顧客に紐づくbookmarksの一覧を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_bookmarks']).to be_present
      expect(json['customer_bookmarks'].size).to eq(1)
    end

    it 'label（address_label）とvalue（bid）を含む' do
      subject
      json = response.parsed_body.with_indifferent_access

      first_bookmark = json['customer_bookmarks'][0]
      expect(first_bookmark['label']).to eq(bookmark1.address_label)
      expect(first_bookmark['value']).to eq(bookmark1.bid)
    end

    context 'when customer does not exist' do
      it '顧客が存在しない場合はエラーが発生する' do
        expect do
          get customer_bookmarks_options_customer_path(99_999)
        end.to raise_error(NoMethodError)
      end
    end
  end
end
