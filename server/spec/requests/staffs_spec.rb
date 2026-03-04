# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'StaffsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:staff1) { create(:staff, office:) }
  let!(:staff2) { create(:staff, office:) }
  let!(:staff3) { create(:staff, office:) }
  let!(:car_pattern1) { create(:car_pattern, office:) }
  let!(:car_pattern2) { create(:car_pattern, office:) }
  let!(:car_pattern3) { create(:car_pattern, office:) }

  describe 'GET /staffs' do
    subject { get staffs_path, params: }

    let(:params) do
      {
        search_params: { page: 1, per: 10 }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns staffs data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staffs'].size).to eq(3)
      expect(json['staffs'][0]['id']).to eq(staff1.id)
      expect(json['staffs'][0]['cd']).to eq(staff1.cd)
      expect(json['staffs'][0]['name']).to eq(staff1.name)
      expect(json['staffs'][0]['name_kana']).to eq(staff1.name_kana)
      expect(json['staffs'][1]['id']).to eq(staff2.id)
      expect(json['staffs'][2]['id']).to eq(staff3.id)
    end

    it 'filters by cd_or_kana' do
      params[:search_params][:cd_or_kana] = staff1.cd
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staffs'].size).to eq(1)
      expect(json['staffs'][0]['id']).to eq(staff1.id)
    end

    it 'filters by can_driver' do
      params[:search_params][:can_driver] = true
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staffs']).not_to be_empty
    end

    it 'filters by can_helper' do
      params[:search_params][:can_helper] = true
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staffs']).not_to be_empty
    end

    it 'orders by name_kana ascending' do
      params[:search_params][:order] = 'name_kana_asc'
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staffs']).not_to be_empty
    end
  end

  describe 'GET /staffs/:id' do
    subject { get staff_path(staff1) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns staff data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['staff']['id']).to eq(staff1.id)
      expect(json['staff']['cd']).to eq(staff1.cd)
      expect(json['staff']['name']).to eq(staff1.name)
      expect(json['staff']['name_kana']).to eq(staff1.name_kana)
      expect(json['staff']['category']).to eq(staff1.category)
    end
  end

  describe 'POST /staffs' do
    subject { post staffs_path, params:, as: :json }

    let(:params) do
      {
        staff: {
          cd: 'STAFF001',
          name: 'テストスタッフ',
          name_kana: 'テストスタッフ',
          can_driver: true,
          can_helper: true,
          driver_type: 1,
          tel: '09012345678',
          mail: 'test@example.com',
          is_stopped: false,
          can_driving_cars: [{ car_pattern: { id: car_pattern1.id, name: car_pattern1.name } }]
        }
      }
    end

    it 'creates a new staff successfully' do
      expect do
        subject
        Current.office = office
      end.to change(Staff, :count).by(1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns error with invalid params' do
      params[:staff][:name] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /staffs/:id' do
    subject { patch staff_path(staff1), params:, as: :json }

    let(:params) do
      {
        staff: {
          cd: staff1.cd,
          name: '更新後スタッフ名',
          name_kana: staff1.name_kana,
          category: staff1.category,
          can_driver: staff1.can_driver,
          can_helper: staff1.can_helper,
          driver_type: staff1.driver_type,
          tel: staff1.tel,
          mail: staff1.mail,
          is_stopped: staff1.is_stopped,
          can_driving_cars: [{ car_pattern: { id: car_pattern1.id, name: car_pattern1.name } }]
        }
      }
    end

    it 'updates staff successfully' do
      subject
      expect(response).to have_http_status(:ok)
      staff1.reload
      expect(staff1.name).to eq('更新後スタッフ名')
    end

    it 'returns error with invalid params' do
      params[:staff][:name] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end
end
