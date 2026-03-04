# frozen_string_literal: true

class NotificationsController < ApplicationController
  before_action :return_if_admin_user
  before_action :set_notification, only: [:read]
  def index
    @notifications = Notification.order(created_at: :desc)
  end

  def read
    @notification.update(read_at: Time.zone.now)
    render json: { message: '通知を確認しました' }
  end

  private

  def return_if_admin_user
    render json: [] and return if admin_signed_in?
  end

  def set_notification
    @notification = Notification.find(params[:id])
  end
end
