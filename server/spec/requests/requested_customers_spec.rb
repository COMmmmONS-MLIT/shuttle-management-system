# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'RequestedCustomersController' do
  let!(:office) { create(:office) }
  let!(:request_office) { create(:office) }
  let!(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:bookmark) { create(:bookmark, office_code: office.cd) }
  let!(:base_bookmark) { create(:bookmark, office_code: office.cd) }

  describe 'GET /requested_customers' do
    subject { get requested_customers_path, params: }

    let(:params) { {} }

    # 未承認リクエスト
    let!(:requested_customer) do
      create(:requested_customer,
             office: request_office,
             allowing_office_id: nil,
             date: Date.current,
             schedule_time: '09:00',
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer1) do
      create(:office_requested_customer,
             office:,
             requested_customer:)
    end

    # 承認済みリクエスト
    let!(:allowed_requested_customer) do
      create(:requested_customer,
             office: request_office,
             allowing_office_id: office.id,
             date: Date.current,
             schedule_time: '10:00',
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer2) do
      create(:office_requested_customer,
             office:,
             requested_customer: allowed_requested_customer)
    end

    # 自事業所からのリクエスト
    let!(:requesting_customer) do
      create(:requested_customer,
             office:,
             allowing_office_id: nil,
             date: Date.current,
             schedule_time: '11:00',
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer3) do
      create(:office_requested_customer,
             office: request_office,
             requested_customer: requesting_customer)
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'requested_customers（未承認リクエスト）を返す' do
      subject
      json = response.parsed_body.with_indifferent_access

      expect(json['requested_customers']).to be_present
      result_ids = json['requested_customers'].pluck('id')
      expect(result_ids).to include(requested_customer.id)
    end

    it 'allowed_requested_customers（承認済みリクエスト）を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['allowed_requested_customers']).to be_present
      result_ids = json['allowed_requested_customers'].pluck('id')
      expect(result_ids).to include(allowed_requested_customer.id)
    end

    it 'requesting_customers（自事業所からのリクエスト）を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['requesting_customers']).to be_present
      result_ids = json['requesting_customers'].pluck('id')
      expect(result_ids).to include(requesting_customer.id)
    end

    context 'when filtering by date parameter' do
      let(:params) { { date: Date.current.to_s } }

      it 'dateパラメータでフィルタできる' do
        future_customer = create(:requested_customer,
                                 office: request_office,
                                 date: Date.current + 2.months,
                                 point_id: bookmark.bid,
                                 base_point_id: base_bookmark.bid)

        create(:office_requested_customer,
               office:,
               requested_customer: future_customer)

        subject
        json = response.parsed_body.with_indifferent_access
        result_ids = json['requested_customers'].pluck('id')

        expect(result_ids).to include(requested_customer.id)
        expect(result_ids).not_to include(future_customer.id)
      end
    end

    context 'when filtering by start_date and end_date' do
      let(:params) { { start_date: Date.current.to_s, end_date: (Date.current + 7.days).to_s } }

      it 'start_date/end_dateパラメータでフィルタできる' do
        future_customer = create(:requested_customer,
                                 office: request_office,
                                 date: Date.current + 1.month,
                                 point_id: bookmark.bid,
                                 base_point_id: base_bookmark.bid)

        create(:office_requested_customer,
               office:,
               requested_customer: future_customer)

        subject
        json = response.parsed_body.with_indifferent_access
        result_ids = json['requested_customers'].pluck('id')

        expect(result_ids).to include(requested_customer.id)
        expect(result_ids).not_to include(future_customer.id)
      end
    end

    context 'when only_one_day is true' do
      let(:params) { { date: Date.current.to_s, only_one_day: 'true' } }

      it 'only_one_day=trueの場合は1日のみ' do
        tomorrow_customer = create(:requested_customer,
                                   office: request_office,
                                   date: Date.current + 1.day,
                                   point_id: bookmark.bid,
                                   base_point_id: base_bookmark.bid)

        create(:office_requested_customer,
               office:,
               requested_customer: tomorrow_customer)

        subject
        json = response.parsed_body.with_indifferent_access
        result_ids = json['requested_customers'].pluck('id')

        expect(result_ids).to include(requested_customer.id)
        expect(result_ids).not_to include(tomorrow_customer.id)
      end
    end
  end

  describe 'POST /requested_customers/update_allowed' do
    subject { post update_allowed_requested_customers_path, params: }

    let!(:requested_customer1) do
      create(:requested_customer,
             office: request_office,
             allowing_office_id: nil,
             date: Date.current,
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer1) do
      create(:office_requested_customer,
             office:,
             requested_customer: requested_customer1)
    end

    let!(:requested_customer2) do
      create(:requested_customer,
             office: request_office,
             allowing_office_id: nil,
             date: Date.current,
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer2) do
      create(:office_requested_customer,
             office:,
             requested_customer: requested_customer2)
    end

    let(:params) do
      {
        requested_customer_ids: [requested_customer1.id, requested_customer2.id]
      }
    end

    context 'with valid parameters' do
      before do
        allow_any_instance_of(AllowRequestedCustomerForm).to receive(:save).and_return(true)
      end

      it '正常にHTTP 200を返す' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it '指定されたリクエストを承認する' do
        expect_any_instance_of(AllowRequestedCustomerForm).to receive(:save)
        subject
      end

      it '承認件数を含むメッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['message']).to eq('2件の委託を承認しました')
      end
    end

    context 'with invalid parameters' do
      let(:params) { { requested_customer_ids: [99_999] } }

      before do
        form = instance_double(AllowRequestedCustomerForm)
        allow(AllowRequestedCustomerForm).to receive(:new).and_return(form)

        errors = instance_double(ActiveModel::Errors)
        error_object = instance_double(ActiveModel::Error, attribute: :base)
        allow(errors).to receive(:map).and_yield(error_object).and_return([:base])
        allow(errors).to receive(:full_messages).and_return(['不正なIDです'])
        allow(errors).to receive(:full_messages_for).with(:base).and_return(['不正なIDです'])
        allow(form).to receive_messages(save: false, errors:)
      end

      it '不正なIDの場合はエラー' do
        subject
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe 'POST /requested_customers/cancel' do
    subject { post cancel_requested_customers_path, params: }

    let!(:customer) { create(:customer, office:) }
    let!(:visitings_customer) do
      create(:visitings_customer,
             customer:,
             office:,
             date: Date.current,
             soge_type: 'pick_up',
             is_requesting: true,
             point_id: bookmark.bid)
    end

    let!(:requesting_customer) do
      create(:requested_customer,
             office:,
             source_id: customer.id,
             source_vc_id: visitings_customer.id,
             date: Date.current,
             soge_type: 'pick_up',
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer) do
      create(:office_requested_customer,
             office: request_office,
             requested_customer: requesting_customer)
    end

    let(:params) do
      {
        customer_ids: [requesting_customer.id]
      }
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '指定されたリクエストを取消する' do
      expect do
        subject
        Current.office = office
      end.to change(RequestedCustomer, :count).by(-1)
    end

    it '元のVisitingsCustomerのis_requestingをfalseに更新する' do
      subject
      visitings_customer.reload
      expect(visitings_customer.is_requesting).to be false
    end

    it '通知を作成する' do
      count_before = Notification.unscoped.count
      subject
      count_after = Notification.unscoped.count

      expect(count_after - count_before).to eq(1)

      Current.office = office
      notification = Notification.unscoped.last
      expect(notification.office_id).to eq(request_office.id)
    end

    it '取消件数を含むメッセージを返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['message']).to eq('1件のリクエストを取消しました')
    end
  end

  describe 'POST /requested_customers/:id/cancel_request_after_approval' do
    subject { post cancel_request_after_approval_requested_customer_path(requesting_customer) }

    let!(:requesting_customer) do
      create(:requested_customer,
             office:,
             allowing_office_id: request_office.id,
             date: Date.current,
             soge_type: 'pick_up',
             is_cancellation_requested: false,
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:office_requested_customer) do
      create(:office_requested_customer,
             office: request_office,
             requested_customer: requesting_customer)
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'is_cancellation_requestedをtrueに更新する' do
      subject
      requesting_customer.reload
      expect(requesting_customer.is_cancellation_requested).to be true
    end

    it '受託側に通知を作成する' do
      count_before = Notification.unscoped.count
      subject
      count_after = Notification.unscoped.count

      expect(count_after - count_before).to eq(1)

      Current.office = office
      notification = Notification.unscoped.last
      expect(notification.office_id).to eq(request_office.id)
      expect(notification.category).to eq('cancel_request_after_approval')
    end

    context 'when error occurs' do
      before do
        allow_any_instance_of(RequestedCustomer).to receive(:update!).and_raise(StandardError)
      end

      it 'エラー時はHTTP 422を返す' do
        subject
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST /requested_customers/:id/approve_cancellation' do
    subject { post approve_cancellation_requested_customer_path(allowed_requested_customer) }

    let!(:source_customer) { create(:customer, office: request_office) }
    let!(:source_visitings_customer) do
      create(:visitings_customer,
             customer: source_customer,
             office: request_office,
             date: Date.current,
             soge_type: 'pick_up',
             is_requesting: true,
             point_id: bookmark.bid)
    end

    let!(:allowed_requested_customer) do
      create(:requested_customer,
             office: request_office,
             allowing_office_id: office.id,
             source_id: source_customer.id,
             source_vc_id: source_visitings_customer.id,
             date: Date.current,
             soge_type: 'pick_up',
             is_cancellation_requested: true,
             point_id: bookmark.bid,
             base_point_id: base_bookmark.bid)
    end

    let!(:target_customer) do
      create(:customer,
             office:,
             requested_customer_id: allowed_requested_customer.id,
             default_pick_up_point_id: bookmark.bid,
             default_drop_off_point_id: bookmark.bid)
    end

    let!(:target_vc) do
      create(:visitings_customer,
             customer: target_customer,
             office:,
             date: Date.current,
             soge_type: 'pick_up',
             point_id: bookmark.bid)
    end

    let!(:office_requested_customer) do
      create(:office_requested_customer,
             office:,
             requested_customer: allowed_requested_customer)
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '元のVisitingsCustomerのis_requestingをfalseに更新する' do
      subject
      source_visitings_customer.reload
      expect(source_visitings_customer.is_requesting).to be false
    end

    it '受託側の顧客・VisitingsCustomerを削除する' do
      expect do
        subject
        Current.office = office
      end.to change(Customer, :count).by(-1)
                                     .and change(VisitingsCustomer, :count).by(-1)
    end

    it 'requested_customerを削除する' do
      expect do
        subject
        Current.office = office
      end.to change(RequestedCustomer, :count).by(-1)
    end

    it '委託側に通知を作成する' do
      expect do
        subject
      end.to change { Notification.unscoped.count }.by(1)

      notification = Notification.unscoped.last
      expect(notification.office_id).to eq(request_office.id)
      expect(notification.category).to eq('cancel_after_approval')
    end

    it '受託側Visitingの時間を再計算する' do
      visiting = create(:visiting, office:, date: Date.current)
      target_vc.update!(visiting_id: visiting.id)

      expect_any_instance_of(Visiting).to receive(:reload).at_least(:once).and_call_original
      subject
    end

    context 'when error occurs' do
      before do
        allow_any_instance_of(VisitingsCustomer).to receive(:update!).and_raise(StandardError)
      end

      it 'エラー時はHTTP 422を返す' do
        subject
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
