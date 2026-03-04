# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Tourism::VisitingsCustomersController' do
  let!(:office) { create(:office, category: 'tourism') }
  let!(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:car_restriction) { create(:car_restriction) }
  let!(:bookmark) { create(:bookmark, office_code: office.cd, car_restriction:, reference_id: 'A001') }

  describe 'GET /tourism/visitings_customers' do
    subject { get tourism_visitings_customers_path, params: }

    let(:params) do
      {
        search_params: {
          start_date: Date.current,
          end_date: Date.current,
          customer_cd_or_kana: nil,
          order: 'schedule_time_asc',
          is_absent: false,
          per: 10,
          page: 1
        }
      }
    end

    let!(:customer) { create(:customer, office:) }
    let!(:visitings_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             date: Date.current,
             schedule_time: '09:00',
             point_id: bookmark.bid,
             soge_type: 'pick_up',
             is_requesting: false)
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings customers data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers']).to be_present
      expect(json['visitings_customers'].size).to eq(1)
    end

    context 'when filtering by customer_cd_or_kana' do
      it 'returns filtered results' do
        params[:search_params][:customer_cd_or_kana] = customer.cd
        subject

        json = response.parsed_body.with_indifferent_access
        expect(json['visitings_customers'].size).to eq(1)
      end
    end
  end

  describe 'POST /tourism/visitings_customers' do
    subject { post tourism_visitings_customers_path, params:, as: :json }

    let(:params) do
      {
        visitings_customer: {
          name: '観光太郎',
          name_kana: 'カンコウタロウ',
          phone_number: '090-1234-5678',
          passenger_count: 2,
          date: Date.current,
          soge_type: 'pick_up',
          schedule_time: '09:00',
          point_id: bookmark.bid,
          base_point_id: bookmark.bid,
          note: 'テストメモ'
        }
      }
    end

    before do
      allow_any_instance_of(TourismVisitingsCustomerRegisterForm).to receive(:create).and_return(true)
    end

    it 'creates a new visitings customer successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages'].first).to match(/送迎予約.*を作成しました/)
    end
  end

  describe 'PUT /tourism/visitings_customers/:id' do
    subject { put tourism_visitings_customer_path(visiting_customer), params:, as: :json }

    let!(:customer) { create(:customer, office:) }
    let!(:visiting_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             date: Date.current,
             schedule_time: '09:00',
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    let(:params) do
      {
        visitings_customer: {
          name: '観光次郎',
          name_kana: 'カンコウジロウ',
          phone_number: '090-9876-5432',
          passenger_count: 3,
          date: Date.current,
          soge_type: 'pick_up',
          schedule_time: '10:00',
          point_id: bookmark.bid,
          base_point_id: bookmark.bid,
          note: '更新メモ'
        }
      }
    end

    before do
      allow_any_instance_of(TourismVisitingsCustomerRegisterForm).to receive(:update).and_return(true)
    end

    it 'updates visitings customer successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages'].first).to match(/送迎予約.*を更新しました/)
    end
  end

  describe 'DELETE /tourism/visitings_customers/:id' do
    subject { delete tourism_visitings_customer_path(visiting_customer), params: }

    let!(:customer) { create(:customer, office:) }
    let!(:visiting_customer) do
      create(:visitings_customer,
             office:,
             customer:,
             date: Date.current,
             schedule_time: '09:00',
             point_id: bookmark.bid,
             soge_type: 'pick_up',
             visiting_id: nil)
    end

    let(:params) { {} }

    it 'deletes visitings customer successfully' do
      expect do
        subject
        Current.office = office
      end.to change(VisitingsCustomer, :count).by(-1)
                                              .and change(Customer, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('送迎予約を削除しました')
    end

    context 'when visiting_id is present and force is not true' do
      let!(:car) { create(:car, office:) }
      let!(:visiting) do
        create(:visiting,
               office:,
               car:,
               date: Date.current,
               departure_point_id: bookmark.bid,
               arrival_point_id: bookmark.bid)
      end

      before do
        visiting_customer.update!(visiting_id: visiting.id)
      end

      it 'returns conflict status' do
        subject
        expect(response).to have_http_status(:conflict)
        json = response.parsed_body.with_indifferent_access
        expect(json['visitings']).to be_present
      end
    end

    context 'when force is true' do
      let!(:car) { create(:car, office:) }
      let!(:visiting) do
        create(:visiting,
               office:,
               car:,
               date: Date.current,
               departure_point_id: bookmark.bid,
               arrival_point_id: bookmark.bid)
      end

      let(:params) { { force: 'true' } }

      before do
        visiting_customer.update!(visiting_id: visiting.id)
      end

      it 'deletes visitings customer successfully' do
        expect do
          subject
          Current.office = office
        end.to change(VisitingsCustomer, :count).by(-1)
                                                .and change(Customer, :count).by(-1)
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe 'GET /tourism/visitings_customers/point_options' do
    subject { get point_options_tourism_visitings_customers_path }

    before do
      allow_any_instance_of(Tourism::VisitingsCustomersController).to receive(:tourism_point_options).and_call_original
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns point options' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json).to have_key('point_options')
    end
  end

  describe 'GET /tourism/visitings_customers/accept_office_options' do
    subject { get accept_office_options_tourism_visitings_customers_path }

    let!(:accept_office) { create(:office, name: '受託事業所') }

    before do
      allow_any_instance_of(Office).to receive(:accept_offices).and_return([accept_office])
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns accept office options' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['accept_office_options']).to be_present
      expect(json['accept_office_options'].size).to eq(1)
      expect(json['accept_office_options'][0]['label']).to eq('受託事業所')
      expect(json['accept_office_options'][0]['value']).to eq(accept_office.id)
    end
  end

  describe 'POST /tourism/visitings_customers/request_visitings_customer' do
    subject { post request_visitings_customer_tourism_visitings_customers_path, params:, as: :json }

    let!(:accept_office) { create(:office, name: '受託事業所') }
    let!(:customer) { create(:customer, office:) }
    let!(:visiting_customer1) do
      create(:visitings_customer,
             office:,
             customer:,
             date: Date.current,
             schedule_time: '09:00',
             point_id: bookmark.bid,
             soge_type: 'pick_up')
    end

    let(:params) do
      {
        visitings_customer_ids: [visiting_customer1.id],
        accept_office_id: accept_office.id
      }
    end

    before do
      form_mock = double('VisitingsCustomerRequestForm', valid?: true, save: 1)
      allow(VisitingsCustomerRequestForm).to receive(:new).and_return(form_mock)
    end

    it 'creates visitings customer request successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns success message with count' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('1件の送迎リクエスト を作成しました')
    end
  end
end
