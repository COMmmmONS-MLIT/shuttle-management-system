# frozen_string_literal: true

json.id visiting.id
json.date visiting.date
json.car_id visiting.car_id
json.car_name visiting.car&.name
json.max_seat visiting.car&.max_seat
json.max_wc_seat visiting.car&.max_wc_seat
json.bin_order visiting.bin_order
json.user_count visiting.total_customers
json.driver_name visiting.driver&.name
json.tenjo_name visiting.tenjo&.name
json.departure_time visiting.formatted_departure_time
json.arrival_time visiting.formatted_arrival_time
json.customers_count visiting.customers.count
json.departure_point_id visiting.departure_point_id
json.arrival_point_id visiting.arrival_point_id
json.staff_name visiting.driver&.name
