# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'NotificationsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }
  let(:admin) { create(:admin) }

  describe 'GET /notifications' do
    subject { get notifications_path }

    context 'when authenticated as a user' do
      before do
        sign_in user
        Current.office = office
        cookies[:tenant_cd] = office.tenant_cd
      end

      let!(:notification1) { create(:notification, office:, message: '通知1', created_at: 3.days.ago) }
      let!(:notification2) { create(:notification, office:, message: '通知2', created_at: 2.days.ago) }
      let!(:notification3) { create(:notification, office:, message: '通知3', created_at: 1.day.ago) }

      it 'returns http success' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'returns notifications list' do
        subject
        json = response.parsed_body
        expect(json['notifications'].size).to eq(3)
        expect(json['notifications'][0]['id']).to eq(notification3.id)
        expect(json['notifications'][0]['message']).to eq(notification3.message)
        expect(json['notifications'][1]['id']).to eq(notification2.id)
        expect(json['notifications'][2]['id']).to eq(notification1.id)
      end

      it 'returns notifications sorted by created_at descending' do
        subject
        json = response.parsed_body
        notifications = json['notifications']
        expect(notifications[0]['id']).to eq(notification3.id)
        expect(notifications[1]['id']).to eq(notification2.id)
        expect(notifications[2]['id']).to eq(notification1.id)
      end
    end

    context 'when authenticated as an admin' do
      before do
        sign_in admin
        Current.office = office
        cookies[:tenant_cd] = office.tenant_cd
      end

      let!(:notification1) { create(:notification, office:, message: '通知1') }
      let!(:notification2) { create(:notification, office:, message: '通知2') }

      it 'returns empty array' do
        subject
        json = response.parsed_body
        expect(json).to eq([])
      end
    end
  end

  describe 'PUT /notifications/:id/read' do
    context 'when authenticated as a user' do
      subject { put read_notification_path(notification) }

      let!(:notification) do
        Current.office = office
        create(:notification, office:, read_at: nil)
      end

      before do
        sign_in user
        Current.office = office
        cookies[:tenant_cd] = office.tenant_cd
      end

      it 'returns http success' do
        subject
        expect(response).to have_http_status(:ok)
      end

      it 'updates read_at to current time' do
        freeze_time = Time.zone.parse('2026-01-25 12:00:00')
        travel_to freeze_time do
          expect(notification.read_at).to be_nil
          subject
          notification.reload
          expect(notification.read_at).to be_within(1.second).of(freeze_time)
        end
      end

      it 'returns confirmation message' do
        subject
        json = response.parsed_body
        expect(json['message']).to eq('通知を確認しました')
      end
    end
  end
end
