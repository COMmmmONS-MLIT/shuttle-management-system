# frozen_string_literal: true

json.customers @customers do |customer|
  json.extract! customer, :id, :cd, :name, :name_kana, :stopped_at, :walker_size, :wc, :contract_status, :walker,
                :phone_number, :contract_start_date
  json.car_restriction customer.car_restriction_name
  json.image customer.image.image if customer.image.present?
end

json.partial! 'shared/pagination', collection: @customers
