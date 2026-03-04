# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'VisitingsCustomersController' do
  let!(:office) { create(:office) }
  let!(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:customer1) do
    create(:customer, office:, default_pick_up_point_id: bookmark1.bid,
                      default_drop_off_point_id: bookmark1.bid)
  end
  let!(:customer2) do
    create(:customer, office:, default_pick_up_point_id: bookmark2.bid,
                      default_drop_off_point_id: bookmark2.bid)
  end
  let!(:customer3) do
    create(:customer, office:, default_pick_up_point_id: bookmark3.bid,
                      default_drop_off_point_id: bookmark3.bid)
  end
  let!(:customer4) do
    create(:customer, office:, default_pick_up_point_id: bookmark4.bid,
                      default_drop_off_point_id: bookmark4.bid)
  end
  let!(:customer_use_case1) { create(:customer_use_case, customer: customer1, office:) }
  let!(:customer_use_case2) { create(:customer_use_case, customer: customer2, office:) }
  let!(:customer_use_case3) { create(:customer_use_case, customer: customer3, office:) }
  let!(:customer_use_case4) { create(:customer_use_case, customer: customer4, office:) }
  let!(:bookmark1) { create(:bookmark, office_code: office.cd) }
  let!(:bookmark2) { create(:bookmark, office_code: office.cd) }
  let!(:bookmark3) { create(:bookmark, office_code: office.cd) }
  let!(:bookmark4) { create(:bookmark, office_code: office.cd) }
  let!(:p_bookmark1) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark1.bid, customer_cd: customer1.cd, point: 'A')
  end
  let!(:p_bookmark2) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark2.bid, customer_cd: customer2.cd, point: 'A')
  end
  let!(:p_bookmark3) do
    create(:p_bookmark, office_code: office.cd, bookmark_id: bookmark3.bid, customer_cd: customer3.cd, point: 'A')
  end
  let!(:visiting_customer1) do
    create(:visitings_customer, customer: customer1, order: 1, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: nil, start_time: '09:30', point_id: bookmark1.bid)
  end
  let!(:visiting_customer2) do
    create(:visitings_customer, customer: customer2, order: 2, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: nil, start_time: '09:30', point_id: bookmark2.bid)
  end
  let!(:visiting_customer3) do
    create(:visitings_customer, customer: customer3, order: 3, soge_type: 'pick_up', schedule_time: '09:00',
                                actual_time: nil, start_time: '09:30', point_id: bookmark3.bid, is_absent: true,
                                absence_reason: '病気')
  end
  let!(:visiting_customer4) do
    create(:visitings_customer, customer: customer1, order: 1, soge_type: 'drop_off', schedule_time: '14:00',
                                actual_time: nil, start_time: nil, point_id: bookmark1.bid)
  end
  let!(:visiting_customer5) do
    create(:visitings_customer, customer: customer2, order: 2, soge_type: 'drop_off', schedule_time: '14:00',
                                actual_time: nil, start_time: nil, point_id: bookmark2.bid)
  end
  let!(:visiting_customer6) do
    create(:visitings_customer, customer: customer3, order: 3, soge_type: 'drop_off', schedule_time: '14:00',
                                actual_time: nil, start_time: nil, point_id: bookmark3.bid)
  end

  before do
    bookmark1.update(reference_id: customer1.cd)
    bookmark2.update(reference_id: customer2.cd)
    bookmark3.update(reference_id: customer3.cd)
  end

  describe 'GET /visitings_customers' do
    subject { get visitings_customers_path, params: }

    let(:params) do
      {
        search_params: {
          date: Date.current,
          customer_cd_or_kana: nil,
          is_absent: false,
          order: 'pick_up_time_asc'
        }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns visitings customers data' do
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers'][0]['id']).to eq(visiting_customer1.id)
      expect(json['visitings_customers'][0]['date']).to eq(visiting_customer1.date.strftime('%Y/%m/%d'))
      expect(json['visitings_customers'][0]['customer_cd']).to eq(customer1.cd)
      expect(json['visitings_customers'][0]['customer_name']).to eq(customer1.name)
      expect(json['visitings_customers'][0]['customer_kana']).to eq(customer1.name_kana)
      expect(json['visitings_customers'][0]['departure_time']).to eq(visiting_customer1.formatted_schedule_time)
      expect(json['visitings_customers'][0]['arrival_time']).to eq(visiting_customer4.formatted_schedule_time)
      expect(json['visitings_customers'][0]['start_time']).to eq(visiting_customer1.formatted_start_time)
      expect(json['visitings_customers'][0]['pick_up_point_id']).to eq(bookmark1.bid)
      expect(json['visitings_customers'][0]['drop_off_point_id']).to eq(bookmark1.bid)
      expect(json['visitings_customers'][0]['is_absent']).to eq(visiting_customer1.is_absent)
      expect(json['visitings_customers'][0]['absence_reason']).to eq(visiting_customer1.absence_reason)
      expect(json['visitings_customers'][0]['self_pick_up']).to eq(visiting_customer1.is_self || false)
      expect(json['visitings_customers'][0]['self_drop_off']).to eq(visiting_customer4.is_self || false)
      expect(json['visitings_customers'][0]['addresses_options']).to eq([{ 'value' => bookmark1.bid,
                                                                           'label' => bookmark1.address_label }])
      expect(json['visitings_customers'][1]['id']).to eq(visiting_customer2.id)
      expect(json['visitings_customers'][2]['id']).to eq(visiting_customer3.id)
    end

    it 'filters by customer_cd_or_kana' do
      params[:search_params][:customer_cd_or_kana] = customer1.cd
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers'].size).to eq(1)
    end

    it 'filters by absence status' do
      params[:search_params][:is_absent] = true
      subject

      json = response.parsed_body.with_indifferent_access
      expect(json['visitings_customers'].size).to eq(1)
      expect(json['visitings_customers'][0]['id']).to eq(visiting_customer3.id)
    end
  end

  describe 'POST /visitings_customers' do
    subject { post visitings_customers_path, params: }

    let(:params) do
      {
        visitings_customer: {
          customer_cd: customer4.cd,
          date: Date.current,
          departure_time: '09:00',
          arrival_time: '17:00',
          start_time: '09:30',
          self_pick_up: false,
          self_drop_off: false,
          is_absent: false,
          absence_reason: '',
          passenger_count: 2
        }
      }
    end

    it 'creates a new visitings customer successfully' do
      expect do
        subject
        Current.office = office
      end.to change(VisitingsCustomer, :count).by(2)
      expect(response).to have_http_status(:ok)
    end

    it 'returns error with invalid params' do
      params[:visitings_customer][:customer_cd] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'POST /visitings_customers/bulk_create' do
    subject { post bulk_create_visitings_customers_path, params: }

    let(:params) do
      {
        visitings_customer_bulk_create: {
          customer_cd: customer1.cd,
          start_date: '2025/01/01',
          end_date: '2025/02/01',
          passenger_count: 2
        }
      }
    end

    it 'creates visitings customers in bulk successfully' do
      expect do
        subject
        Current.office = office
      end.to change(VisitingsCustomer, :count).by(8)
      expect(response).to have_http_status(:ok)
    end

    it 'creates all customers in successfully' do
      params[:visitings_customer_bulk_create][:customer_cd] = ''
      expect do
        subject
        Current.office = office
      end.to change(VisitingsCustomer, :count).by(32)

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'PUT /visitings_customers/:id' do
    subject { put visitings_customer_path(visiting_customer1), params: }

    let(:params) do
      {
        visitings_customer: {
          id: visiting_customer1.id,
          customer_cd: customer1.cd,
          date: Date.current,
          departure_time: '10:00',
          arrival_time: '18:00',
          start_time: '10:30',
          self_pick_up: false,
          self_drop_off: false,
          is_absent: true,
          absence_reason: '病気'
        }
      }
    end

    it 'updates visitings customer successfully' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns error with invalid params' do
      params[:visitings_customer][:customer_cd] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'GET /visitings_customers/point_options' do
    it 'returns http success' do
      get point_options_visitings_customers_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /visitings_customers/:id' do
    subject { delete visitings_customer_path(target_visiting_customer), params: }

    let(:params) { {} }
    let!(:target_visiting_customer) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'pick_up',
                                  schedule_time: '09:00', visiting_id: nil,
                                  point_id: bookmark4.bid)
    end
    let!(:pair_visiting_customer) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'drop_off',
                                  schedule_time: '14:00', visiting_id: nil,
                                  point_id: bookmark4.bid, date: target_visiting_customer.date)
    end

    context 'when visiting_id is not set' do
      it 'returns http success' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it '正常にVisitingsCustomerを削除する' do
        expect do
          subject
          Current.office = office
        end.to change(VisitingsCustomer, :count).by(-2)
        expect(VisitingsCustomer).not_to exist(target_visiting_customer.id)
      end

      it 'ペアのVisitingsCustomer（pick_up/drop_off）も削除する' do
        expect do
          subject
          Current.office = office
        end.to change(VisitingsCustomer, :count).by(-2)
        expect(VisitingsCustomer).not_to exist(pair_visiting_customer.id)
      end

      it '削除完了メッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['messages']).to include('送迎データを削除しました')
      end
    end

    context 'when visiting_id is set' do
      let!(:visiting) { create(:visiting, office:, date: target_visiting_customer.date) }
      let!(:other_customer_vc) do
        create(:visitings_customer, customer: customer1, order: 2, soge_type: 'pick_up',
                                    schedule_time: '09:30', visiting_id: visiting.id,
                                    point_id: bookmark1.bid, date: target_visiting_customer.date)
      end

      before do
        target_visiting_customer.update!(visiting_id: visiting.id)
      end

      context 'when force is not true' do
        it 'HTTP 409を返す' do
          subject
          expect(response).to have_http_status(:conflict)
        end

        it '削除せずに関連する訪問情報を返す' do
          expect do
            subject
            Current.office = office
          end.not_to change(VisitingsCustomer, :count)
        end

        it '残るcustomersの情報を返す' do
          subject
          json = response.parsed_body.with_indifferent_access
          expect(json['visitings']).to be_present
          expect(json['visitings'][0]['id']).to eq(visiting.id)
          expect(json['visitings'][0]['customers']).to be_an(Array)
          # customer4が削除されるので、残るのはother_customer_vcのみ
          remaining_customer_ids = json['visitings'][0]['customers'].pluck('id')
          expect(remaining_customer_ids).to include(other_customer_vc.id)
          expect(remaining_customer_ids).not_to include(target_visiting_customer.id)
        end
      end

      context 'when force is true' do
        let(:params) { { force: 'true' } }

        before do
          allow_any_instance_of(Visiting).to receive(:calculate_times).and_return(true)
        end

        it 'returns http success' do
          subject
          expect(response).to have_http_status(:ok)
        end

        it '強制削除する' do
          expect do
            subject
            Current.office = office
          end.to change(VisitingsCustomer, :count).by(-2)
          expect(VisitingsCustomer).not_to exist(target_visiting_customer.id)
          expect(VisitingsCustomer).not_to exist(pair_visiting_customer.id)
        end

        it '削除完了メッセージを返す' do
          subject
          json = response.parsed_body.with_indifferent_access
          expect(json['messages']).to include('送迎データを削除しました')
        end
      end
    end

    context 'when only pair visiting_customer has visiting_id' do
      let!(:visiting) { create(:visiting, office:, date: pair_visiting_customer.date) }

      before do
        pair_visiting_customer.update!(visiting_id: visiting.id)
      end

      context 'when force is not true' do
        it 'HTTP 409を返す' do
          subject
          expect(response).to have_http_status(:conflict)
        end
      end

      context 'when force is true' do
        let(:params) { { force: 'true' } }

        it '強制削除する' do
          expect do
            subject
            Current.office = office
          end.to change(VisitingsCustomer, :count).by(-2)
        end
      end
    end
  end

  describe 'DELETE /visitings_customers/:id/remove_from_visiting' do
    let!(:visiting) { create(:visiting, office:, date: Date.current) }
    let!(:target_visiting_customer) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'pick_up',
                                  schedule_time: '09:00', visiting_id: visiting.id,
                                  point_id: bookmark4.bid)
    end

    context 'when ID does not exist' do
      it 'HTTP 404を返す' do
        delete remove_from_visiting_visitings_customer_path(99_999)
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when visiting has other customers' do
      subject { delete remove_from_visiting_visitings_customer_path(target_visiting_customer) }

      let!(:other_visiting_customer) do
        create(:visitings_customer, customer: customer1, order: 2, soge_type: 'pick_up',
                                    schedule_time: '09:30', visiting_id: visiting.id,
                                    point_id: bookmark1.bid, date: target_visiting_customer.date)
      end

      it 'returns http success' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'visiting_idをnilに更新する' do
        subject
        target_visiting_customer.reload
        expect(target_visiting_customer.visiting_id).to be_nil
      end

      it 'update_requested_sourceが呼ばれる' do
        expect_any_instance_of(VisitingsCustomer).to receive(:update_requested_source)
        subject
      end

      it '便自体は削除しない' do
        expect do
          subject
          Current.office = office
        end.not_to change(Visiting, :count)
        expect(Visiting).to exist(visiting.id)
      end

      it '削除メッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['messages']).to include('便から削除しました')
      end
    end

    context 'when visiting has no other customers' do
      subject { delete remove_from_visiting_visitings_customer_path(target_visiting_customer) }

      it 'returns http success' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'visiting_idをnilに更新する' do
        subject
        Current.office = office
        expect(VisitingsCustomer.find(target_visiting_customer.id).visiting_id).to be_nil
      end

      it '便自体を削除する' do
        expect do
          subject
          Current.office = office
        end.to change(Visiting, :count).by(-1)
        expect(Visiting).not_to exist(visiting.id)
      end

      it '削除メッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['messages']).to include('便から削除しました')
      end
    end
  end

  describe 'GET /visitings_customers/search_customers' do
    subject { get search_customers_visitings_customers_path, params: }

    let!(:contract_customer) do
      create(:customer, office:, name: '契約太郎', name_kana: 'ケイヤクタロウ',
                        cd: 'C001', contract_status: '契約')
    end
    let!(:trial_customer) do
      create(:customer, office:, name: '体験花子', name_kana: 'タイケンハナコ',
                        cd: 'C002', contract_status: '体験')
    end
    let!(:invalid_customer) do
      create(:customer, office:, name: '停止三郎', name_kana: 'テイシシブロウ',
                        cd: 'C003', contract_status: '停止')
    end

    context 'when searching by name parameter' do
      let(:params) { { name: '契約' } }

      it '正常にHTTP 200を返す' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it '名前で検索できる' do
        subject
        json = response.parsed_body.with_indifferent_access
        customer_values = json['customers'].pluck('value')
        expect(customer_values).to include(contract_customer.cd)
        expect(customer_values).not_to include(invalid_customer.cd)
      end
    end

    context 'when searching by name_kana' do
      let(:params) { { name: 'タイケン' } }

      it 'かなで検索できる' do
        subject
        json = response.parsed_body.with_indifferent_access
        customer_values = json['customers'].pluck('value')
        expect(customer_values).to include(trial_customer.cd)
      end
    end

    context 'when searching by cd' do
      let(:params) { { name: 'C001' } }

      it '顧客コードで検索できる' do
        subject
        json = response.parsed_body.with_indifferent_access
        customer_values = json['customers'].pluck('value')
        expect(customer_values).to include(contract_customer.cd)
      end
    end

    context 'when filtering by contract status' do
      let(:params) { { name: '郎' } }

      it '契約・体験の顧客のみ返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        customer_values = json['customers'].pluck('value')
        expect(customer_values).to include(contract_customer.cd)
        expect(customer_values).not_to include(invalid_customer.cd)
      end
    end

    context 'when name is empty' do
      let(:params) { { name: '' } }

      it '空配列を返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['customers']).to eq([])
      end
    end
  end

  describe 'GET /visitings_customers/accept_office_options' do
    subject { get accept_office_options_visitings_customers_path }

    let!(:accept_office1) { create(:office, name: '受託事業所1') }
    let!(:accept_office2) { create(:office, name: '受託事業所2') }
    let!(:other_office) { create(:office, name: 'その他の事業所') }

    before do
      # 現在のofficeが受託可能な事業所を設定
      allow_any_instance_of(Office).to receive(:accept_offices).and_return([accept_office1, accept_office2])
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '受託可能な事業所の一覧を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['accept_office_options'].size).to eq(2)
    end

    it 'label（事業所名）とvalue（事業所ID）を含む' do
      subject
      json = response.parsed_body.with_indifferent_access

      first_option = json['accept_office_options'][0]
      expect(first_option['label']).to eq(accept_office1.name)
      expect(first_option['value']).to eq(accept_office1.id)

      second_option = json['accept_office_options'][1]
      expect(second_option['label']).to eq(accept_office2.name)
      expect(second_option['value']).to eq(accept_office2.id)
    end
  end

  describe 'POST /visitings_customers/soge_type_options' do
    subject { post soge_type_options_visitings_customers_path, params: }

    let(:params) { { visitings_customer_id: pick_up_vc.id } }
    let!(:pick_up_vc) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'pick_up',
                                  schedule_time: '09:00', point_id: bookmark4.bid,
                                  visiting: nil, is_requesting: false, is_self: false, is_absent: false)
    end
    let!(:drop_off_vc) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'drop_off',
                                  schedule_time: '14:00', point_id: bookmark4.bid,
                                  date: pick_up_vc.date, visiting: nil, is_requesting: false,
                                  is_self: false, is_absent: false)
    end

    context 'when both are available' do
      it '正常にHTTP 200を返す' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'visitings_customer_idに基づいて選択可能なsoge_typeを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['soge_type_options']).to be_present
      end

      it '両方利用可能な場合は「両方」オプションも返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        values = json['soge_type_options'].pluck('value')
        labels = json['soge_type_options'].pluck('label')

        expect(values).to include('pick_up', 'drop_off', 'both')
        expect(labels).to include('迎え', '送り', '両方')
      end
    end

    context 'when is_self is true' do
      before do
        drop_off_vc.update!(is_self: true)
      end

      it 'is_selfがtrueの場合は除外' do
        subject
        json = response.parsed_body.with_indifferent_access
        values = json['soge_type_options'].pluck('value')

        expect(values).to include('pick_up')
        expect(values).not_to include('drop_off')
        expect(values).not_to include('both')
      end
    end

    context 'when is_absent is true' do
      before do
        pick_up_vc.update!(is_absent: true)
      end

      it 'is_absentがtrueの場合は除外' do
        subject
        json = response.parsed_body.with_indifferent_access
        values = json['soge_type_options'].pluck('value')

        expect(values).not_to include('pick_up')
        expect(values).to include('drop_off')
        expect(values).not_to include('both')
      end
    end
  end

  describe 'POST /visitings_customers/request_visitings_customer' do
    subject { post request_visitings_customer_visitings_customers_path, params: }

    let!(:accept_office) { create(:office, name: '受託事業所') }
    let!(:target_vc1) do
      create(:visitings_customer, customer: customer1, order: 1, soge_type: 'pick_up',
                                  schedule_time: '09:00', point_id: bookmark1.bid)
    end
    let!(:target_vc2) do
      create(:visitings_customer, customer: customer2, order: 2, soge_type: 'pick_up',
                                  schedule_time: '09:30', point_id: bookmark2.bid)
    end

    let(:params) do
      {
        visitings_customer_ids: [target_vc1.id, target_vc2.id],
        accept_office_id: accept_office.id,
        soge_type: 'pick_up'
      }
    end

    context 'with valid parameters' do
      before do
        allow_any_instance_of(VisitingsCustomerRequestForm).to receive_messages(valid?: true, save: 2)
      end

      it '正常にHTTP 200を返す' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'visitings_customer_ids, accept_office_id, soge_typeパラメータを処理する' do
        form_instance = instance_spy(VisitingsCustomerRequestForm, valid?: true, save: 2)
        allow(VisitingsCustomerRequestForm).to receive(:new)
          .with([target_vc1.id.to_s, target_vc2.id.to_s], accept_office.id.to_s, 'pick_up')
          .and_return(form_instance)
        subject
        expect(VisitingsCustomerRequestForm).to have_received(:new)
          .with([target_vc1.id.to_s, target_vc2.id.to_s], accept_office.id.to_s, 'pick_up')
      end

      it '作成完了メッセージを返す' do
        subject
        json = response.parsed_body.with_indifferent_access
        expect(json['messages']).to include('2件の送迎リクエスト を作成しました')
      end
    end

    context 'with invalid parameters' do
      before do
        form = instance_double(VisitingsCustomerRequestForm)
        allow(VisitingsCustomerRequestForm).to receive(:new).and_return(form)

        errors = instance_double(ActiveModel::Errors)
        error_object = instance_double(ActiveModel::Error, attribute: :base)
        allow(errors).to receive(:map).and_yield(error_object).and_return([:base])
        allow(errors).to receive(:full_messages).and_return(['エラーが発生しました'])
        allow(errors).to receive(:full_messages_for).with(:base).and_return(['エラーが発生しました'])
        allow(form).to receive_messages(valid?: false, save: false, errors:)
      end

      it '不正なパラメータの場合はエラー' do
        subject
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe 'PUT /visitings_customers/:id/update_requested_customer' do
    subject { put update_requested_customer_visitings_customer_path(target_vc), params: }

    let!(:target_vc) do
      create(:visitings_customer, customer: customer4, order: 1, soge_type: 'pick_up',
                                  schedule_time: '09:00', point_id: bookmark4.bid,
                                  is_requested: true)
    end

    let(:params) do
      {
        requested_visitings_customer: {
          schedule_time: '10:00'
        }
      }
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'schedule_timeを更新できる' do
      subject
      target_vc.reload
      expect(target_vc.schedule_time.strftime('%H:%M')).to eq('10:00')
    end

    it '更新完了メッセージを返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      expect(json['messages']).to include('更新しました')
    end
  end

  describe 'GET /visitings_customers/:id/suggested_visiting_customers' do
    subject { get suggested_visiting_customers_visitings_customer_path(target_vc) }

    let!(:car_restriction) { create(:car_restriction, name: '制約なし') }

    before do
      # target_vc (bookmark4) を基準点として設定
      bookmark4.update(car_restriction:, lat: 35.658034, lng: 139.701636)

      # nearby_customer1は少し遠い（約1km）
      bookmark1.update(car_restriction:, lat: 35.668034, lng: 139.701636)

      # nearby_customer2は近い（約500m）
      bookmark2.update(car_restriction:, lat: 35.663034, lng: 139.701636)

      # far_time_customerはもっと遠い（約2km）
      bookmark3.update(car_restriction:, lat: 35.678034, lng: 139.701636)
    end

    let!(:target_vc) do
      create(:visitings_customer, customer: customer4, visiting: nil, office:, order: 1,
                                  soge_type: 'pick_up', schedule_time: '09:00',
                                  point_id: bookmark4.bid, base_point_id: bookmark4.bid,
                                  date: Date.current, is_self: false, is_absent: false)
    end

    let!(:nearby_customer1) do
      create(:visitings_customer, customer: customer1, visiting: nil, office:, order: 2,
                                  soge_type: 'pick_up', schedule_time: '09:10',
                                  point_id: bookmark1.bid, base_point_id: bookmark1.bid,
                                  date: Date.current, is_self: false, is_absent: false)
    end

    let!(:nearby_customer2) do
      create(:visitings_customer, customer: customer2, visiting: nil, office:, order: 3,
                                  soge_type: 'pick_up', schedule_time: '09:05',
                                  point_id: bookmark2.bid, base_point_id: bookmark2.bid,
                                  date: Date.current, is_self: false, is_absent: false)
    end

    let!(:far_time_customer) do
      create(:visitings_customer, customer: customer3, visiting: nil, office:, order: 4,
                                  soge_type: 'pick_up', schedule_time: '10:00',
                                  point_id: bookmark3.bid, base_point_id: bookmark3.bid,
                                  date: Date.current, is_self: false, is_absent: false)
    end

    let!(:different_soge_customer) do
      create(:visitings_customer, customer: customer1, visiting: nil, office:, order: 5,
                                  soge_type: 'drop_off', schedule_time: '09:05',
                                  point_id: bookmark1.bid, base_point_id: bookmark1.bid,
                                  date: Date.current, is_self: false, is_absent: false)
    end

    before do
      bookmark3.update(car_restriction:, distance: 300)
    end

    it '正常にHTTP 200を返す' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it '同じ日付・soge_typeの顧客を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      result_ids = json['customers'].pluck('id')

      expect(result_ids).to include(nearby_customer1.id, nearby_customer2.id)
      expect(result_ids).not_to include(different_soge_customer.id)
    end

    it 'schedule_timeが±15分以内の顧客を返す' do
      subject
      json = response.parsed_body.with_indifferent_access
      result_ids = json['customers'].pluck('id')

      expect(result_ids).to include(nearby_customer1.id, nearby_customer2.id)
      expect(result_ids).not_to include(far_time_customer.id)
    end

    it '距離順でソートされる' do
      subject
      json = response.parsed_body.with_indifferent_access

      distances = json['customers'].pluck('distance')
      expect(distances).to eq(distances.sort)
    end

    it '自身は除外される' do
      subject
      json = response.parsed_body.with_indifferent_access
      result_ids = json['customers'].pluck('id')

      expect(result_ids).not_to include(target_vc.id)
    end
  end
end
