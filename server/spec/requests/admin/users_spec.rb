# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Users' do
  let(:admin) { create(:admin) }
  let!(:user1) { create(:user, office:) }
  let!(:user2) { create(:user, office:) }
  let!(:user3) { create(:user, office:) }
  let!(:office) { create(:office) }

  before do
    sign_in admin
  end

  describe 'GET /admin/offices/:office_id/users' do
    subject { get admin_office_users_path(office) }

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns all users for the office' do
      subject
      json = response.parsed_body
      expect(json['users'].length).to eq(3)
      expect(json['users'][0]['id']).to eq(user1.id)
      expect(json['users'][0]['name']).to eq(user1.name)
      expect(json['users'][0]['email']).to eq(user1.email)
      expect(json['users'][0]['is_active']).to eq(user1.is_active)
      expect(json['users'][1]['id']).to eq(user2.id)
      expect(json['users'][2]['id']).to eq(user3.id)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in user1
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /admin/offices/:office_id/users' do
    subject { post admin_office_users_path(office), params: user_params }

    let(:user_params) do
      {
        user: {
          name: 'テストユーザー',
          kana: 'テストユーザー',
          email: 'test@example.com',
          password: 'password123',
          is_active: true
        }
      }
    end

    it 'creates a new user successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'assigns the correct office to the user' do
      subject
      new_user = User.last
      expect(new_user.office_id).to eq(office.id)
    end

    it 'returns error with invalid params' do
      user_params[:user][:name] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in user1
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /admin/offices/:office_id/users/:id' do
    subject { patch admin_office_user_path(office, user1), params: update_params }

    let(:update_params) do
      {
        user: {
          is_active: false
        }
      }
    end

    it 'updates user successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'updated user' do
      subject
      user1.reload
      expect(user1.is_active).to be(false)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in user1
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /admin/offices/:office_id/users/:id/password' do
    subject { patch password_admin_office_user_path(office, user1), params: password_params }

    let(:password_params) do
      {
        user: {
          password: 'newpassword123',
          password_confirmation: 'newpassword123'
        }
      }
    end

    it 'updates password successfully with valid password' do
      subject
      expect(response).to have_http_status(:ok)
      expect(user1.reload.valid_password?('newpassword123')).to be(true)
    end

    it 'updates password successfully with password only (no confirmation)' do
      patch password_admin_office_user_path(office, user1), params: { user: { password: 'onlypassword123' } }
      expect(response).to have_http_status(:ok)
      expect(user1.reload.valid_password?('onlypassword123')).to be(true)
    end

    it 'returns error with too short password' do
      password_params[:user][:password] = 'short'
      password_params[:user][:password_confirmation] = 'short'
      subject
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns error when password and confirmation do not match' do
      password_params[:user][:password_confirmation] = 'different123'
      subject
      expect(response).to have_http_status(:bad_request)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in user1
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
