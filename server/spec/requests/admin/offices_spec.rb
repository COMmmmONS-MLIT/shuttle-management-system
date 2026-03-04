# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Offices' do
  let(:admin) { create(:admin) }

  describe 'GET #index' do
    subject { get admin_offices_path }

    before do
      sign_in admin
    end

    let!(:office1) { create(:office) }
    let!(:office2) { create(:office) }
    let!(:office3) { create(:office) }

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns all offices' do
      subject
      json = response.parsed_body
      expect(json['offices'].length).to eq(3)
      expect(json['offices'][0]['id']).to eq(office1.id)
      expect(json['offices'][0]['name']).to eq(office1.name)
      expect(json['offices'][0]['address']).to eq(office1.address)
      expect(json['offices'][0]['updated_at']).to eq(office1.updated_at.strftime('%Y/%m/%d'))
      expect(json['offices'][0]['created_at']).to eq(office1.created_at.strftime('%Y/%m/%d'))
      expect(json['offices'][0]['user_count']).to eq(office1.users.size)
      expect(json['offices'][1]['id']).to eq(office2.id)
      expect(json['offices'][2]['id']).to eq(office3.id)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in create(:user, office: office1)
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET #show' do
    subject { get admin_office_path(office) }

    before do
      sign_in admin
    end

    let(:office) { create(:office) }

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns the office' do
      subject
      json = response.parsed_body
      expect(json['office']['cd']).to eq(office.cd)
      expect(json['office']['tenant_cd']).to eq(office.tenant_cd)
      expect(json['office']['name']).to eq(office.name)
      expect(json['office']['name_kana']).to eq(office.name_kana)
      expect(json['office']['postcode']).to eq(office.postcode)
      expect(json['office']['address']).to eq(office.address)
      expect(json['office']['tel']).to eq(office.tel)
      expect(json['office']['fax']).to eq(office.fax)
      expect(json['office']['mail']).to eq(office.mail)
      expect(json['office']['contact_person_name']).to eq(office.contact_person_name)
      expect(json['office']['contact_person_kana']).to eq(office.contact_person_kana)
      expect(json['office']['updated_at']).to eq(office.updated_at.strftime('%Y/%m/%d'))
      expect(json['office']['lat']).to eq(office.lat.to_f)
      expect(json['office']['lng']).to eq(office.lng.to_f)
    end

    it 'cannot access sign_in user' do
      sign_out admin
      sign_in create(:user, office:)
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST #create' do
    subject { post admin_offices_path, params: }

    before do
      sign_in admin
    end

    let!(:office2) { create(:office) }

    let!(:params) do
      {
        office: {
          cd: "T#{rand(1000..9999)}",
          tenant_cd: "TN#{rand(1000..9999)}",
          name: 'テスト事業所',
          name_kana: 'テストシゲキジョウ',
          postcode: '1234567',
          address: '東京都渋谷区テスト1-1-1',
          tel: '09012345678',
          fax: '09012345678',
          mail: 'test@example.com',
          contact_person_name: 'テスト管理者',
          contact_person_kana: 'テストカンリシャ',
          lat: 35.658034,
          lng: 139.701636,
          is_active: true,
          accept_office_ids: [office2.id],
          only_schedule_create: false
        }
      }
    end

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'creates a new office' do
      expect { subject }.to change(Office, :count).by(1)
    end

    it 'creates new office with correct attributes' do
      subject

      office = Office.last
      expect(office.cd).to eq(params[:office][:cd])
      expect(office.tenant_cd).to eq(params[:office][:tenant_cd])
      expect(office.name).to eq(params[:office][:name])
      expect(office.name_kana).to eq(params[:office][:name_kana])
      expect(office.postcode).to eq(params[:office][:postcode])
      expect(office.address).to eq(params[:office][:address])
      expect(office.tel).to eq(params[:office][:tel])
      expect(office.fax).to eq(params[:office][:fax])
      expect(office.mail).to eq(params[:office][:mail])
      expect(office.contact_person_name).to eq(params[:office][:contact_person_name])
      expect(office.contact_person_kana).to eq(params[:office][:contact_person_kana])
      expect(office.lat).to eq(params[:office][:lat])
      expect(office.lng).to eq(params[:office][:lng])
      expect(office.is_active).to eq(params[:office][:is_active])
    end

    it 'returns error with invalid params' do
      post admin_offices_path, params: { office: { name: '' } }
      expect(response).to have_http_status(:bad_request)
    end

    it 'cannot access with regular user' do
      sign_out admin
      sign_in create(:user, office: create(:office))
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH #update' do
    subject { patch admin_office_path(office), params: }

    let(:office) { create(:office) }
    let(:office2) { create(:office) }

    let(:params) do
      {
        office: {
          cd: office.cd,
          tenant_cd: office.tenant_cd,
          name: '更新後事業所名',
          name_kana: office.name_kana,
          postcode: office.postcode,
          address: office.address,
          tel: office.tel,
          fax: office.fax,
          mail: office.mail,
          contact_person_name: office.contact_person_name,
          contact_person_kana: office.contact_person_kana,
          lat: office.lat,
          lng: office.lng,
          is_active: office.is_active,
          accept_office_ids: [office2.id],
          only_schedule_create: office.only_schedule_create
        }
      }
    end

    before do
      sign_in admin
    end

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'updates the office' do
      subject
      office.reload
      expect(office.name).to eq('更新後事業所名')
    end

    it 'returns error with invalid params' do
      patch admin_office_path(office), params: { office: { name: '' } }
      expect(response).to have_http_status(:bad_request)
    end

    it 'cannot access with regular user' do
      sign_out admin
      sign_in create(:user, office:)
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT #set_tenant_cd' do
    subject { put set_tenant_cd_admin_office_path(office) }

    let(:office) { create(:office) }

    before do
      sign_in admin
    end

    it 'returns a success response' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'sets tenant_cd in cookies' do
      subject
      expect(cookies[:tenant_cd]).to eq(office.tenant_cd)
      json = response.parsed_body
      expect(json['message']).to eq('Tenant CD set successfully')
    end

    it 'cannot access with regular user' do
      sign_out admin
      sign_in create(:user, office:)
      subject
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
