# frozen_string_literal: true

json.admins @admins do |admin|
  json.extract! admin, :id, :email
end
