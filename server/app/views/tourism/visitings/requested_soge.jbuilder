# frozen_string_literal: true

json.visitings_groups @visitings_groups do |visiting_group|
  json.array! visiting_group do |visiting|
    if visiting[:id].present?
      json.partial!('visitings/visiting_index_basic', visiting:)
      json.driver_name visiting.shared_driver_name
      json.tenjo_name visiting.shared_tenjo_name
      json.route_points visiting.base_points.order(:order) do |point|
        json.id point.id
        json.visiting_id point.visiting_id
        json.display_name point.bookmark.address_label
        json.order point.order
        json.actual_time point.formatted_actual_time
        json.soge_type point.soge_type
        json.point_type 'VisitingsPoint'
        json.point_id point.bookmark&.bid
        json.address point.bookmark&.address
        json.address_label point.bookmark&.address_label
        json.arrival point.arrival
        json.dnd_id "vp-#{point.id}"
        customers = point.visitings_customers
        note = customers.map do |customer|
          "#{customer.customer.name}　#{customer.passenger_count}人　#{customer.customer.phone_number}"
        end.join("\n")
        json.note note

        json.customers do
          json.array! customers do |customer|
            json.id customer.id
            json.display_name customer.customer.name
            json.passenger_count customer.passenger_count
            json.soge_type customer.soge_type
            json.dnd_id "vc-#{customer.id}"
          end
        end
      end
      json.customers visiting.route_points do |point|
        json.id point[:id]
        json.visiting_id point[:visiting_id]
        json.display_name point[:display_name]
        json.order point[:order]
        json.actual_time point[:actual_time]
        json.soge_type point[:soge_type]
        json.point_type point[:point_type]
        json.point_id point[:id]
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
      json.car_id visiting[:car_id]
      json.bin_order visiting[:bin_order]
    end
  end
end

json.cars @car_names

json.partial! 'shared/warnings'
