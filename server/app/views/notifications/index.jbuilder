# frozen_string_literal: true

json.notifications @notifications do |notification|
  json.extract! notification, :id, :message, :category, :metadata
  json.created_at notification.formatted_created_at
  json.read_at notification.formatted_read_at if notification.read_at.present?
end

json.unread_notifications @notifications.where(read_at: nil) do |notification|
  json.extract! notification, :id, :message, :category, :metadata
  json.created_at notification.formatted_created_at
  json.read_at notification.formatted_read_at if notification.read_at.present?
end
