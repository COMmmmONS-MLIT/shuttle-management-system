# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'AuthController' do
  let!(:office) { create(:office) }
  let!(:user) { create(:user, office:) }
  let!(:admin) { create(:admin) }

  describe 'GET /auth' do
    context 'when not authenticated' do
      it 'returns http unauthorized' do
        get auth_index_path
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as a user' do
      before do
        sign_in user
        Current.office = office
        cookies[:tenant_cd] = office.tenant_cd
      end

      it 'returns http success' do
        get auth_index_path
        expect(response).to have_http_status(:ok)
      end

      it 'returns user and office information' do
        get auth_index_path
        json = response.parsed_body
        expect(json['user']['id']).to eq(user.id)
        expect(json['role']).to eq('Staff')
        expect(json['category']).to eq(office.category)
      end
    end

    context 'when authenticated as an admin' do
      before do
        sign_in admin
        Current.office = office
        cookies[:tenant_cd] = office.tenant_cd
      end

      it 'returns http success' do
        get admin_auth_index_path
        expect(response).to have_http_status(:ok)
      end

      it 'returns admin and office information' do
        get admin_auth_index_path
        json = response.parsed_body
        expect(json['user']['id']).to eq(admin.id)
        expect(json['role']).to eq('Admin')
        expect(json['category']).to eq('admin')
      end
    end
  end
end
