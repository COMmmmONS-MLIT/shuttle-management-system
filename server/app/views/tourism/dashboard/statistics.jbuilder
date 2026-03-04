# frozen_string_literal: true

json.statistics do
  json.total_customers @total_customers
  json.total_pickup_customers @total_pickup_customers
  json.total_dropoff_customers @total_dropoff_customers
  json.accept_office_request_counts @accept_office_request_counts do |office_data|
    json.office_id office_data[:office_id]
    json.office_name office_data[:office_name]
    json.request_count office_data[:request_count]
  end
end
