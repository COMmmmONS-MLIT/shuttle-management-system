# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Customers::MergedatasController' do
  let!(:office) { create(:office) }
  let!(:customer) do
    Current.office = office
    create(:customer, office:)
  end
  let!(:user) { create(:user, office:, role: :customer, customer:) }
  let!(:search_date) { Date.current }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:mergedata1) do
    Current.office = office
    create(:mergedata,
           日付: search_date,
           事業所cd: office.cd,
           利用者番号: customer.cd,
           carId: 1,
           出発時間: '08:00',
           送迎区分: '1',
           便順: 1)
  end

  let!(:mergedata2) do
    Current.office = office
    create(:mergedata,
           日付: search_date,
           事業所cd: office.cd,
           利用者番号: customer.cd,
           carId: 2,
           出発時間: '09:00',
           送迎区分: '2',
           便順: 1)
  end

  let!(:bindatad1) do
    Current.office = office
    create(:bindatad,
           日付: search_date,
           事業所cd: office.cd,
           利用者番号: customer.cd,
           carId: 1,
           出発時間: '08:00',
           送迎区分: '1')
  end

  let!(:bindatad2) do
    Current.office = office
    create(:bindatad,
           日付: search_date,
           事業所cd: office.cd,
           利用者番号: customer.cd,
           carId: 2,
           出発時間: '09:00',
           送迎区分: '2')
  end

  describe 'GET /customers/mergedatas' do
    subject { get customers_mergedatas_path, params: }

    let(:params) do
      {
        search_params: { date: search_date }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns mergedatas data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['mergedatas']).to be_present
      expect(json['mergedatas'].size).to eq(2)

      # 最初のmergedataの確認
      first_mergedata = json['mergedatas'].find { |m| m['car_id'] == 1 }
      expect(first_mergedata).to be_present
      expect(first_mergedata['customer_cd']).to eq(customer.cd)
      expect(first_mergedata['office_cd']).to eq(office.cd)
      expect(first_mergedata['date']).to eq(search_date.strftime('%Y-%m-%d'))
      expect(first_mergedata['soge_type']).to eq('1')
    end

    it 'filters by date' do
      params[:search_params][:date] = Date.tomorrow
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['mergedatas']).to be_empty
    end

    it 'filters by customer cd' do
      # 別の顧客のデータを作成
      Current.office = office
      other_customer = create(:customer, office:)
      create(:mergedata,
             日付: search_date,
             事業所cd: office.cd,
             利用者番号: other_customer.cd,
             carId: 3,
             出発時間: '10:00',
             送迎区分: '1',
             便順: 1)

      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['mergedatas'].size).to eq(2)
      expect(json['mergedatas'].all? { |m| m['customer_cd'] == customer.cd }).to be true
    end
  end

  describe 'when customer is not found' do
    subject { get customers_mergedatas_path, params: { search_params: { date: search_date } } }

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

  describe 'when no mergedatas found' do
    subject { get customers_mergedatas_path, params: }

    let(:params) do
      {
        search_params: { date: Date.tomorrow }
      }
    end

    it 'returns empty array' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['mergedatas']).to be_empty
    end
  end
end
