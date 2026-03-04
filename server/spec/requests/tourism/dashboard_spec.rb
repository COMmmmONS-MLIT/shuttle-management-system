# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Tourism::DashboardController' do
  let!(:office) { create(:office, category: :tourism) }
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
  let!(:visitings_customer1) do
    create(:visitings_customer, visiting:, customer:, soge_type: 'pick_up', date: Date.current, passenger_count: 2)
  end
  let!(:visitings_customer2) do
    create(:visitings_customer, visiting:, customer:, soge_type: 'pick_up', date: Date.current, passenger_count: 3)
  end

  describe 'GET /dashboard/statistics' do
    subject { get statistics_tourism_dashboard_index_path, params: }

    let!(:params) { { date: Date.current } }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns statistics data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['statistics']['total_customers']).to eq(5)
    end

    it 'filters by date' do
      params[:date] = Date.tomorrow
      subject

      Current.office = office
      expect(response).to have_http_status(:ok)
      json = response.parsed_body.with_indifferent_access
      expect(json['statistics']['total_customers']).to eq(0)
    end
  end
end
