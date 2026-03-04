# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CustomerNgsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:customer1) { create(:customer, office:) }
  let!(:customer2) { create(:customer, office:) }
  let!(:customer3) { create(:customer, office:) }
  let!(:customer4) { create(:customer, office:) }
  let!(:customer_ng1) { create(:customer_ng, office:, customer_a: customer1, customer_b: customer2) }
  let!(:customer_ng2) { create(:customer_ng, office:, customer_a: customer1, customer_b: customer3, reason: '喧嘩') }
  let!(:customer_ng3) { create(:customer_ng, office:, customer_a: customer2, customer_b: customer3) }

  describe 'GET /customer_ngs' do
    subject { get customer_ngs_path, params: }

    let(:params) do
      {
        search_params: { page: 1, per: 10 }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer_ngs data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_ngs'].size).to eq(3)
      expect(json['customer_ngs'][0]['id']).to eq(customer_ng1.id)
      expect(json['customer_ngs'][0]['customer_a_id']).to eq(customer1.id)
      expect(json['customer_ngs'][0]['customer_b_id']).to eq(customer2.id)
      expect(json['customer_ngs'][0]['reason']).to eq(customer_ng1.reason)
    end

    it 'filters by customer_a name' do
      params[:search_params][:customer_a_cd_or_name] = customer1.name_kana
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_ngs'].size).to eq(2)
      expect(json['customer_ngs'].pluck('id')).to contain_exactly(customer_ng1.id, customer_ng2.id)
    end

    it 'filters by customer_b name' do
      params[:search_params][:customer_b_cd_or_name] = customer3.name_kana
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_ngs'].size).to eq(2)
      expect(json['customer_ngs'].pluck('id')).to contain_exactly(customer_ng2.id, customer_ng3.id)
    end

    it 'filters by both customer names' do
      params[:search_params][:customer_a_cd_or_name] = customer1.name_kana
      params[:search_params][:customer_b_cd_or_name] = customer2.name_kana
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_ngs'].size).to eq(1)
      expect(json['customer_ngs'][0]['id']).to eq(customer_ng1.id)
    end
  end

  describe 'GET /customer_ngs/customer_options' do
    subject { get customer_options_customer_ngs_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer options data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['customer_options']).to be_present
      expect(json['customer_options'].size).to eq(4)
      expect(json['customer_options'][0]['label']).to eq(customer1.name)
      expect(json['customer_options'][0]['value']).to eq(customer1.id)
    end
  end

  describe 'POST /customer_ngs' do
    subject { post customer_ngs_path, params:, as: :json }

    let(:params) do
      {
        customer_ng: {
          customer_a_id: customer1.id,
          customer_b_id: customer4.id,
          reason: '新規NG理由'
        }
      }
    end

    it 'creates a new customer_ng successfully' do
      expect do
        subject
        Current.office = office
      end.to change(CustomerNg, :count).by(1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns error with invalid params' do
      params[:customer_ng][:customer_a_id] = nil
      subject
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns error with duplicate customer combination' do
      params[:customer_ng][:customer_a_id] = customer1.id
      params[:customer_ng][:customer_b_id] = customer2.id
      subject
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns error with same customer for both a and b' do
      params[:customer_ng][:customer_a_id] = customer1.id
      params[:customer_ng][:customer_b_id] = customer1.id
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /customer_ngs/:id' do
    subject { patch customer_ng_path(customer_ng1), params:, as: :json }

    let(:params) do
      {
        customer_ng: {
          customer_a_id: customer1.id,
          customer_b_id: customer2.id,
          reason: '更新後NG理由'
        }
      }
    end

    it 'updates customer_ng successfully' do
      subject
      expect(response).to have_http_status(:ok)
      customer_ng1.reload
      expect(customer_ng1.reason).to eq('更新後NG理由')
    end
  end

  describe 'DELETE /customer_ngs/:id' do
    subject { delete customer_ng_path(customer_ng1) }

    it 'deletes customer_ng successfully' do
      expect do
        subject
        Current.office = office
      end.to change(CustomerNg, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end
