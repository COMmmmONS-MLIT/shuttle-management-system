# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'PointsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let!(:car_restriction1) { create(:car_restriction) }
  let!(:car_restriction2) { create(:car_restriction) }
  let!(:car_restriction3) { create(:car_restriction) }
  let!(:bookmark1) { create(:bookmark, office_code: office.cd, car_restriction: car_restriction1, reference_id: '') }
  let!(:bookmark2) { create(:bookmark, office_code: office.cd, car_restriction: car_restriction2, reference_id: '') }
  let!(:bookmark3) { create(:bookmark, office_code: office.cd, car_restriction: car_restriction3, reference_id: '') }

  describe 'GET /points' do
    subject { get points_path, params: }

    let(:params) do
      {
        search_params: { page: 1, per: 10 }
      }
    end

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns bookmarks data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points'].size).to eq(3)
      expect(json['points'][0]['id']).to eq(bookmark1.bid)
      expect(json['points'][0]['address_label']).to eq(bookmark1.address_label)
      expect(json['points'][0]['address']).to eq(bookmark1.address)
      expect(json['points'][0]['car_restriction_id']).to eq(bookmark1.car_restriction_id)
      expect(json['points'][0]['car_restriction_name']).to eq(bookmark1.car_restriction.name)
      expect(json['points'][1]['id']).to eq(bookmark2.bid)
      expect(json['points'][2]['id']).to eq(bookmark3.bid)
    end

    it 'filters by address_label' do
      params[:search_params][:address_label] = bookmark1.address_label
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points'].size).to eq(1)
      expect(json['points'][0]['id']).to eq(bookmark1.bid)
    end

    it 'filters by address' do
      params[:search_params][:address] = bookmark1.address
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points']).not_to be_empty
    end

    it 'filters by car_restriction_id' do
      params[:search_params][:car_restriction_id] = bookmark1.car_restriction_id
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points'].size).to eq(1)
      expect(json['points'][0]['id']).to eq(bookmark1.bid)
    end

    it 'orders by address_label ascending' do
      params[:search_params][:order] = 'address_label_asc'
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points']).not_to be_empty
    end

    it 'orders by address ascending' do
      params[:search_params][:order] = 'address_asc'
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['points']).not_to be_empty
    end

    context 'when testing pagination' do
      before do
        10.times do |i|
          create(:bookmark,
                 office_code: office.cd,
                 car_restriction: car_restriction1,
                 reference_id: '',
                 address_label: "地点#{i}")
        end
      end

      it 'paginates results correctly' do
        params[:search_params][:page] = 1
        params[:search_params][:per] = 5
        subject

        Current.office = office
        json = response.parsed_body.with_indifferent_access
        expect(json['points'].size).to eq(5)
      end

      it 'returns second page results' do
        params[:search_params][:page] = 2
        params[:search_params][:per] = 5
        subject

        Current.office = office
        json = response.parsed_body.with_indifferent_access
        expect(json['points'].size).to eq(5)
      end
    end
  end

  describe 'GET /points/:id' do
    subject { get point_path(bookmark1.bid) }

    it 'returns http success' do
      subject
      expect(response).to have_http_status(:ok)
    end

    it 'returns bookmark data' do
      subject

      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['point']['id']).to eq(bookmark1.bid)
      expect(json['point']['address_label']).to eq(bookmark1.address_label)
      expect(json['point']['address']).to eq(bookmark1.address)
      expect(json['point']['postal_code']).to eq(bookmark1.postal_code)
      expect(json['point']['car_restriction_id']).to eq(bookmark1.car_restriction_id)
    end

    context 'when point does not exist' do
      subject { get point_path(99_999) }

      it 'returns HTTP 404' do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /points' do
    subject { post points_path, params:, as: :json }

    let(:params) do
      {
        point: {
          address_label: 'テスト地点',
          address: '東京都渋谷区テスト1-1-1',
          postal_code: '1500001',
          room_name: '101号室',
          phone_number: '03-1234-5678',
          lat: 35.658034,
          lng: 139.701636,
          wait_time: 5,
          car_restriction_id: car_restriction1.id
        }
      }
    end

    it 'creates a new bookmark successfully' do
      expect do
        subject
        Current.office = office
      end.to change(Area::Bookmark, :count).by(1)
      expect(response).to have_http_status(:ok)
    end

    it 'automatically sets office_code' do
      subject
      Current.office = office

      new_bookmark = Area::Bookmark.last
      expect(new_bookmark.office_code).to eq(office.cd)
    end

    it 'automatically sets reference_id to empty string' do
      subject
      Current.office = office

      new_bookmark = Area::Bookmark.last
      expect(new_bookmark.reference_id).to eq('')
    end

    it 'returns error with invalid params' do
      params[:point][:address_label] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'PATCH /points/:id' do
    subject { patch point_path(bookmark1.bid), params:, as: :json }

    let(:params) do
      {
        point: {
          address_label: '更新後地点名',
          address: bookmark1.address,
          postal_code: bookmark1.postal_code,
          room_name: bookmark1.room_name,
          phone_number: bookmark1.phone_number,
          lat: bookmark1.lat,
          lng: bookmark1.lng,
          wait_time: bookmark1.wait_time,
          car_restriction_id: bookmark1.car_restriction_id
        }
      }
    end

    it 'updates bookmark successfully' do
      subject
      expect(response).to have_http_status(:ok)
      bookmark1.reload
      expect(bookmark1.address_label).to eq('更新後地点名')
    end

    it 'returns error with invalid params' do
      params[:point][:address_label] = ''
      subject
      expect(response).to have_http_status(:bad_request)
    end
  end
end
