# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CarsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let(:car_pattern) { create(:car_pattern, office:) }
  let!(:car_restrictions_car_pattern) do
    create(:car_restrictions_car_pattern, office:, car_pattern:, car_restriction: CarRestriction.first)
  end
  let!(:car_pattern_wc_number1) do
    create(:car_pattern_wc_number, normal_seat: 8, wc_seat: 0, office:, car_pattern:)
  end
  let!(:car_pattern_wc_number2) do
    create(:car_pattern_wc_number, normal_seat: 7, wc_seat: 1, office:, car_pattern:)
  end
  let!(:car1) { create(:car, office:, car_pattern:) }
  let!(:car2) { create(:car, office:, car_pattern:) }
  let!(:car3) { create(:car, office:, car_pattern:) }

  describe 'GET /cars' do
    subject { get cars_path, params: { search_params: { page: 1, per: 10 } } }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns cars data' do
      subject
      json = response.parsed_body
      expect(json['cars'].size).to eq(3)
      expect(json['cars'][0]['id']).to eq(car1.id)
      expect(json['cars'][0]['name']).to eq(car1.name)
      expect(json['cars'][0]['number']).to eq(car1.number)
      expect(json['cars'][1]['id']).to eq(car2.id)
      expect(json['cars'][2]['id']).to eq(car3.id)
    end
  end

  describe 'GET /cars/:id' do
    subject { get car_path(car1) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns car data' do
      subject
      json = response.parsed_body
      expect(json['car']['id']).to eq(car1.id)
      expect(json['car']['name']).to eq(car1.name)
      expect(json['car']['number']).to eq(car1.number)
      expect(json['car']['stopped']).to eq(car1.stopped)
      expect(json['car']['max_seat']).to eq(car1.max_seat)
      expect(json['car']['max_wc_seat']).to eq(car1.max_wc_seat)
    end
  end

  describe 'POST /cars' do
    subject { post cars_path, params: car_params }

    let(:car_params) do
      {
        car: {
          name: 'テスト車両',
          number: 'TEST-001',
          stopped: false,
          max_seat: 8,
          max_wc_seat: 1,
          pattern: {
            id: car_pattern.id,
            name: car_pattern.name,
            car_type: car_pattern.car_type,
            restriction_ids: [CarRestriction.first.id],
            wc_numbers: [
              {
                id: nil,
                wc_seat: 0,
                normal_seat: 8,
                cargo_volume: 0
              }
            ]
          }
        }
      }
    end

    it 'creates a new car successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'creates a new car' do
      expect do
        subject
        Current.office = office
      end.to change(Car, :count).by(1)
    end

    it 'new car' do
      subject

      Current.office = office
      car = Car.last
      expect(car.name).to eq('テスト車両')
      expect(car.number).to eq('TEST-001')
      expect(car.stopped).to be(false)
      expect(car.max_seat).to eq(8)
      expect(car.max_wc_seat).to eq(1)
      expect(car.car_pattern_id).to eq(car_pattern.id)
      expect(car.car_pattern.car_type).to eq(car_pattern.car_type)
      expect(car.car_pattern.car_restrictions.first.id).to eq(CarRestriction.first.id)
      expect(car.car_pattern.car_pattern_wc_numbers.first.wc_seat).to eq(0)
      expect(car.car_pattern.car_pattern_wc_numbers.first.normal_seat).to eq(8)
      expect(car.car_pattern.car_pattern_wc_numbers.first.cargo_volume).to eq(0)
    end

    it 'returns error with invalid params' do
      car_params[:car][:name] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /cars/:id' do
    subject { patch car_path(car1), params: update_params }

    let(:update_params) do
      {
        car: {
          id: car1.id,
          name: '更新後車両名',
          number: car1.number,
          stopped: car1.stopped,
          max_seat: car1.max_seat,
          max_wc_seat: car1.max_wc_seat,
          pattern: {
            id: car_pattern.id,
            name: car_pattern.name,
            car_type: car_pattern.car_type,
            restriction_ids: [CarRestriction.first.id],
            wc_numbers: [
              { id: car_pattern_wc_number1.id, wc_seat: car_pattern_wc_number1.wc_seat,
                normal_seat: car_pattern_wc_number1.normal_seat, cargo_volume: car_pattern_wc_number1.cargo_volume }
            ]
          }
        }
      }
    end

    it 'updates car successfully' do
      subject
      expect(response).to have_http_status(:ok)
      car1.reload
      expect(car1.name).to eq('更新後車両名')
    end

    it 'returns error with invalid params' do
      update_params[:car][:name] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'GET /cars/locations' do
    subject { get locations_cars_path, params: }

    let(:params) { {} }
    let!(:office_bookmark) { create(:bookmark, office_code: office.cd, reference_id: 'A001') }

    before do
      allow(CarLocationService).to receive(:new).and_call_original
    end

    context 'with no parameters' do
      it '正常にHTTP 200を返す' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it '車両の位置情報を返す' do
        nowpos1 = double('nowpos',
                         lat: 35.681236,
                         lng: 139.767125,
                         日付: Date.current,
                         時間: Time.zone.parse('09:00'),
                         status: 'operating')
        nowpos2 = double('nowpos',
                         lat: 35.682236,
                         lng: 139.768125,
                         日付: Date.current,
                         時間: Time.zone.parse('10:00'),
                         status: 'operating')

        cars_with_locations = [
          { car: car1, nowpos: nowpos1 },
          { car: car2, nowpos: nowpos2 }
        ]
        allow_any_instance_of(CarLocationService).to receive(:find_cars_with_locations)
          .and_return(cars_with_locations)

        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['cars']).to be_present
        expect(json['cars'].size).to eq(2)
      end
    end

    context 'when filtering by date parameter' do
      let(:params) { { date: '20260122' } }

      it 'dateパラメータでフィルタできる' do
        allow(CarLocationService).to receive(:new).and_call_original
        subject
        expect(CarLocationService).to have_received(:new)
          .with(office:, car_id_param: nil, date_param: '20260122')
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when filtering by id parameter' do
      let(:params) { { id: car1.id } }

      it 'idパラメータで特定の車両を指定できる' do
        allow(CarLocationService).to receive(:new).and_call_original
        subject
        expect(CarLocationService).to have_received(:new)
          .with(office:, car_id_param: car1.id.to_s, date_param: nil)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'with invalid date parameter' do
      let(:params) { { date: 'invalid-date' } }

      it '不正なパラメータの場合はHTTP 400を返す' do
        subject
        expect(response).to have_http_status(:bad_request)
      end

      it 'エラーメッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['messages']).to be_present
        expect(json['messages'][0]).to include('Invalid date format')
      end
    end
  end

  describe 'GET /cars/point_options' do
    subject { get point_options_cars_path }

    let!(:office_bookmark) { create(:bookmark, office_code: office.cd, reference_id: 'A001') }
    let!(:request_office) { create(:office) }
    let!(:request_office_bookmark) { create(:bookmark, office_code: request_office.cd, reference_id: 'A001') }
    let!(:other_bookmark) { create(:bookmark, office_code: office.cd, reference_id: 'B001') }

    before do
      allow_any_instance_of(Office).to receive(:request_offices).and_return([request_office])
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '事業所地点（reference_id: \'A001\'）の一覧を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['point_options']).to be_present

      bookmark_values = json['point_options'].pluck('value')
      expect(bookmark_values).to include(office_bookmark.bid)
      expect(bookmark_values).not_to include(other_bookmark.bid)
    end

    it 'request_officesの地点も含む' do
      subject
      json = response.parsed_body.with_indifferent_access

      bookmark_values = json['point_options'].pluck('value')
      expect(bookmark_values).to include(office_bookmark.bid)
      expect(bookmark_values).to include(request_office_bookmark.bid)
    end
  end
end
