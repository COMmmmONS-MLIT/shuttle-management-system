# frozen_string_literal: true

json.car_restrictions @car_restrictions do |restriction|
  json.extract! restriction, :id, :name
end
