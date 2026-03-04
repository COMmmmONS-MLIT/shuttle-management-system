# frozen_string_literal: true

json.users @users do |user|
  json.extract! user, :id, :name, :email, :is_active, :role
  json.role_text I18n.t("activerecord.enums.user.role.#{user.role}")
end
json.office_name @office.name
