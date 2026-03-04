# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CarRestrictionsController' do
  let(:user) { create(:user, office:) }
  let(:office) { create(:office) }

  before do
    sign_in user
    cookies[:tenant_cd] = office.tenant_cd
  end

  describe 'GET /car_restrictions' do
    it 'returns http success' do
      get car_restrictions_path
      expect(response).to have_http_status(:ok)
    end

    it 'returns correct number of car restrictions' do
      get car_restrictions_path
      json = response.parsed_body
      expect(json['car_restrictions'].size).to eq(8)
    end

    it 'returns car restriction details with name' do
      get car_restrictions_path
      json = response.parsed_body
      expect(json['car_restrictions'].first).to have_key('name')
      expect(json['car_restrictions'].first['name']).to be_present
    end
  end
end
