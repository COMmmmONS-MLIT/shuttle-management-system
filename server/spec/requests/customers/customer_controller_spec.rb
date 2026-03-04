# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Customers::CustomerController' do
  let!(:office) { create(:office) }
  let!(:customer) do
    Current.office = office
    create(:customer, office:)
  end
  let!(:user) { create(:user, office:, role: :customer, customer:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  describe 'GET /customers/customer' do
    subject { get customers_customer_path }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns customer data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['customer']).to be_present
      expect(json['customer']['id']).to eq(customer.id)
      expect(json['customer']['cd']).to eq(customer.cd)
      expect(json['customer']['name']).to eq(customer.name)
      expect(json['customer']['name_kana']).to eq(customer.name_kana)
    end
  end

  describe 'when customer is not found' do
    subject { get customers_customer_path }

    let!(:user_without_customer) { create(:user, office:, role: :customer) }

    before do
      sign_in user_without_customer
      Current.office = office
    end

    it 'returns not found status' do
      subject
      expect(response).to have_http_status(:not_found)
    end

    it 'returns error message' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('Customer not found')
    end
  end
end
