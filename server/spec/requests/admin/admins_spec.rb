# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Admins' do
  let(:admin) { create(:admin) }

  describe 'GET #index' do
    subject { get admin_admins_path }

    before do
      sign_in admin
    end

    let!(:admin1) { create(:admin, email: 'admin1@example.com') }
    let!(:admin2) { create(:admin, email: 'admin2@example.com') }

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns all admins with id and email' do
      subject
      json = response.parsed_body
      expect(json['admins'].length).to be >= 2
      admin_ids = json['admins'].pluck('id')
      admin_emails = json['admins'].pluck('email')
      expect(admin_ids).to include(admin1.id, admin2.id)
      expect(admin_emails).to include('admin1@example.com', 'admin2@example.com')
      first = json['admins'].find { |a| a['id'] == admin1.id }
      expect(first['id']).to eq(admin1.id)
      expect(first['email']).to eq(admin1.email)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in create(:user, office: create(:office))
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST #create' do
    subject { post admin_admins_path, params: }

    before do
      sign_in admin
    end

    let(:params) do
      {
        admin: {
          email: 'newadmin@example.com',
          password: 'password123'
        }
      }
    end

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'creates a new admin' do
      expect { subject }.to change(Admin, :count).by(1)
    end

    it 'creates admin with correct email' do
      subject
      expect(Admin.last.email).to eq('newadmin@example.com')
    end

    it 'returns error with invalid params' do
      post admin_admins_path, params: { admin: { email: '', password: '' } }
      expect(response).to have_http_status(:bad_request)
    end

    it 'cannot access with regular user' do
      sign_out admin
      sign_in create(:user, office: create(:office))
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
