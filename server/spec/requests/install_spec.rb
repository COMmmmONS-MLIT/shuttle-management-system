# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Install' do
  it 'does not require authentication for index and create' do
    get '/install'
    expect(response).to have_http_status(:ok)
    post '/install', params: { admin: { email: 'auth_check@example.com', password: 'password123' } }
    expect(response).to have_http_status(:ok)
  end

  describe 'GET #index' do
    subject { get '/install' }

    context 'when no admin exists' do
      it 'returns ok with admin_exists false' do
        subject
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['admin_exists']).to be false
      end
    end

    context 'when admin exists' do
      before { create(:admin, email: 'admin@example.com') }

      it 'returns ok with admin_exists true' do
        subject
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['admin_exists']).to be true
      end
    end

    it 'does not require authentication' do
      subject
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #create' do
    subject { post '/install', params: }

    let(:params) do
      {
        admin: {
          email: 'setup@example.com',
          password: 'password123'
        }
      }
    end

    it 'creates a new admin and returns ok with success message' do
      expect { subject }.to change(Admin, :count).by(1)
      expect(response).to have_http_status(:ok)
      expect(Admin.last.email).to eq('setup@example.com')
      expect(response.parsed_body['messages']).to be_present
    end

    context 'with invalid params' do
      before do
        params[:admin][:email] = ''
        params[:admin][:password] = ''
      end

      it 'returns bad_request' do
        subject
        expect(response).to have_http_status(:bad_request)
      end

      it 'does not create admin' do
        expect { subject }.not_to change(Admin, :count)
      end

      it 'returns error messages' do
        subject
        json = response.parsed_body
        expect(json['full_messages']).to be_present
      end
    end
  end
end
