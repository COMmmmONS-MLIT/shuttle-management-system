# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'DashboardController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:driver) { create(:staff, office:, can_driver: true, driver_type: 1) }
  let!(:car) { create(:car, office:) }
  let!(:visiting) { create(:visiting, office:, driver:, car:) }
  let!(:customer) { create(:customer, office:) }
  let!(:visitings_customer) do
    create(:visitings_customer, visiting:, customer:, soge_type: 'pick_up', date: Date.current)
  end

  describe 'GET /dashboard/schedule' do
    subject { get schedule_dashboard_index_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns schedule data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['drivers']).not_to be_empty
      expect(json['cars']).not_to be_empty
      expect(json['schedules']).to be_an(Array)
    end

    it 'filters by date' do
      Date.tomorrow
      subject

      expect(response).to have_http_status(:ok)
    end

    context 'when departure_time or arrival_time is nil' do
      let!(:visiting_without_times) do
        create(:visiting,
               office:,
               driver:,
               car:,
               date: Date.current,
               departure_time: nil,
               arrival_time: nil)
      end

      it 'does not include visiting in schedules' do
        subject
        json = response.parsed_body.with_indifferent_access
        schedule_ids = json['schedules'].pluck('id')
        expect(schedule_ids).not_to include(visiting_without_times.id)
      end
    end

    context 'when driver is excluded' do
      let!(:retired_driver) { create(:staff, office:, can_driver: true, driver_type: '退職') }
      let!(:excluded_driver) { create(:staff, office:, can_driver: true, driver_type: '送迎から除外') }

      it 'does not include retired driver' do
        subject
        json = response.parsed_body.with_indifferent_access
        driver_ids = json['drivers'].pluck('id')
        expect(driver_ids).not_to include(retired_driver.id)
      end

      it 'does not include excluded driver' do
        subject
        json = response.parsed_body.with_indifferent_access
        driver_ids = json['drivers'].pluck('id')
        expect(driver_ids).not_to include(excluded_driver.id)
      end
    end

    context 'when car is stopped' do
      let!(:stopped_car) { create(:car, office:, stopped: true) }

      it 'does not include stopped car' do
        subject
        json = response.parsed_body.with_indifferent_access
        car_ids = json['cars'].pluck('id')
        expect(car_ids).not_to include(stopped_car.id)
      end
    end

    context 'when customer information is present' do
      let!(:car_restriction) { create(:car_restriction, name: '車椅子対応') }
      let!(:detailed_bookmark) do
        create(:bookmark,
               office_code: office.cd,
               address: '東京都渋谷区1-2-3',
               car_restriction:)
      end
      let!(:detailed_customer) do
        create(:customer,
               office:,
               name: 'テスト太郎',
               wc: true,
               walker: true)
      end
      let!(:p_bookmark) do
        create(:p_bookmark,
               office_code: office.cd,
               bookmark_id: detailed_bookmark.bid,
               customer_cd: detailed_customer.cd,
               point: 'A')
      end
      let!(:detailed_visiting_customer) do
        create(:visitings_customer,
               visiting:,
               customer: detailed_customer,
               point_id: detailed_bookmark.bid,
               soge_type: 'pick_up',
               date: Date.current)
      end

      before do
        detailed_bookmark.update!(reference_id: detailed_customer.cd)
      end

      it 'includes customer name' do
        subject
        json = response.parsed_body.with_indifferent_access
        customers = json['schedules'].first['customers']
        customer_names = customers.pluck('name')
        expect(customer_names).to include('テスト太郎')
      end

      it 'includes customer address' do
        subject
        json = response.parsed_body.with_indifferent_access
        customers = json['schedules'].first['customers']
        addresses = customers.pluck('address')
        expect(addresses).to include('東京都渋谷区1-2-3')
      end

      it 'includes wheelchair information' do
        subject
        json = response.parsed_body.with_indifferent_access
        customers = json['schedules'].first['customers']
        customer_with_wc = customers.find { |c| c['name'] == 'テスト太郎' }
        expect(customer_with_wc['wc']).to be true
      end

      it 'includes walker information' do
        subject
        json = response.parsed_body.with_indifferent_access
        customers = json['schedules'].first['customers']
        customer_with_walker = customers.find { |c| c['name'] == 'テスト太郎' }
        expect(customer_with_walker['walker']).to be true
      end
    end
  end

  describe 'GET /dashboard/statistics' do
    subject { get statistics_dashboard_index_path, params: }

    let!(:customer) { create(:customer, office:) }
    let!(:visiting_customer) do
      create(:visitings_customer, visiting:, customer:, soge_type: 'pick_up', date: Date.current)
    end
    let!(:params) { { date: Date.current } }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns statistics data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['statistics']['total_customers']).to eq(2)
      expect(json['statistics']['absent_customers']).to eq(0)
    end

    it 'filters by date' do
      params[:date] = Date.tomorrow
      subject

      Current.office = office
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['statistics']['total_customers']).to eq(0)
      expect(json['statistics']['absent_customers']).to eq(0)
    end

    context 'when customer has invalid contract status' do
      let!(:invalid_status_customer) { create(:customer, office:, contract_status: '停止') }
      let!(:invalid_vc) do
        create(:visitings_customer,
               visiting:,
               customer: invalid_status_customer,
               soge_type: 'pick_up',
               date: Date.current)
      end

      it 'does not count customers with invalid contract status' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['statistics']['total_customers']).to eq(2)
      end
    end

    context 'when customer has 他事業所 status' do
      let!(:other_office_customer) { create(:customer, office:, contract_status: '他事業所') }
      let!(:other_office_vc) do
        create(:visitings_customer,
               visiting:,
               customer: other_office_customer,
               soge_type: 'pick_up',
               date: Date.current)
      end

      it 'does not count customers with 他事業所 status' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['statistics']['total_customers']).to eq(2)
      end
    end

    context 'when soge_type is drop_off' do
      let!(:dropoff_customer) { create(:customer, office:, contract_status: '契約') }
      let!(:dropoff_vc) do
        create(:visitings_customer,
               visiting:,
               customer: dropoff_customer,
               soge_type: 'drop_off',
               date: Date.current)
      end

      it 'does not count drop_off type customers' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['statistics']['total_customers']).to eq(2)
      end
    end

    context 'when customer is absent' do
      let!(:absent_customer) { create(:customer, office:, contract_status: '契約') }
      let!(:absent_vc) do
        create(:visitings_customer,
               visiting:,
               customer: absent_customer,
               soge_type: 'pick_up',
               date: Date.current,
               is_absent: true)
      end

      it 'counts absent customer in absent_customers' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['statistics']['absent_customers']).to eq(1)
      end
    end
  end
end
