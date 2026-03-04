# frozen_string_literal: true

json.visitings_groups @visitings_groups do |visiting_group|
  json.array! visiting_group do |visiting|
    if visiting[:id].present?
      json.id visiting.id
      json.bin_order visiting.bin_order
      json.car_name visiting.shared_car_name
      json.driver_name visiting.shared_driver_name
      json.tenjo_name visiting.shared_tenjo_name
      json.departure_time visiting.formatted_departure_time
      json.arrival_time visiting.formatted_arrival_time
      json.user_count visiting.total_customers
      json.wc_user_count visiting.total_wc_customers
      json.cargo_volume visiting.total_cargo_volume
      json.first_address visiting.customers.first.bookmark.address
      json.type visiting.type
      json.route_points visiting.route_points do |point|
        json.id point[:id]
        json.visiting_id point[:visiting_id]
        json.display_name point[:display_name]
        json.order point[:order]
        json.actual_time point[:actual_time]
        json.soge_type point[:soge_type]
        json.point_type point[:point_type]
        json.address_id point[:bookmark]&.bid
        json.address point[:bookmark]&.address
        json.address_label point[:bookmark]&.address_label
        json.wc point[:customer]&.wc if point[:point_type] == 'VisitingsCustomer'
        json.passenger_count point[:passenger_count] if point[:point_type] == 'VisitingsCustomer'
        json.note point[:note] if point[:point_type] == 'VisitingsCustomer'
        json.customer_id point[:customer_id] if point[:point_type] == 'VisitingsCustomer'
        json.arrival point[:arrival] if point[:point_type] == 'VisitingsPoint'
        json.dnd_id point[:dnd_id]
      end
    else
      json.id nil
      json.car_name visiting[:car_name]
      json.bin_order visiting[:bin_order]
    end
  end
end

json.cars @car_names

json.partial! 'shared/warnings'
