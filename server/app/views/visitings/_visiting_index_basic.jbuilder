# frozen_string_literal: true

json.id visiting.id
json.car_id visiting.car_id
json.bin_order visiting.bin_order
json.departure_time visiting.formatted_departure_time
json.arrival_time visiting.formatted_arrival_time
json.is_optimized_route visiting.is_optimized_route
json.user_count visiting.total_customers
json.wc_user_count visiting.total_wc_customers
json.cargo_volume visiting.total_cargo_volume
json.driver_name visiting.driver&.name
json.tenjo_name visiting.tenjo&.name
json.first_address visiting.customers.first.bookmark.address
json.type visiting.type
json.car_name visiting.car&.name
json.staff_name visiting.driver&.name
