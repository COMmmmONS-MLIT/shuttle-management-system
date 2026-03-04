# frozen_string_literal: true

json.offices @offices do |office|
  json.extract! office, :id, :name, :address, :category
  json.updated_at office.updated_at.strftime('%Y/%m/%d')
  json.created_at office.created_at.strftime('%Y/%m/%d')
  json.user_count office.users.not_customer.size
end
