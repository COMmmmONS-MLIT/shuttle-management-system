# frozen_string_literal: true

json.visitings_groups @visitings_groups do |visiting_group|
  json.array! visiting_group do |visiting|
    if visiting[:id].present?
      json.partial!('visitings/visiting_index_basic', visiting:)
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
            json.remarks customer.note
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

json.requesting_customers @requesting_customers do |rc|
  json.id rc.id
  json.name rc.name
  json.soge_type rc.soge_type
  json.schedule_time rc.formatted_schedule_time
  json.departure_time (rc.pick_up? ? rc.formatted_point_time : rc.formatted_actual_time) || '未定'
  json.arrival_time (rc.pick_up? ? rc.formatted_actual_time : rc.formatted_point_time) || '未定'
end

json.partial! 'shared/cars_basic'

json.alerts @alerts do |alert|
  if alert.office.tourism? && (alert.alert_type == 'start_time_late' ||
                               alert.alert_type == 'pickup_order_wrong' ||
                               alert.alert_type == 'dropoff_order_wrong')
    next
  end

  json.id alert.visiting_id
  json.alert_type alert.alert_type
  json.messages alert.alert_messages
  json.car_id alert.car_id
  json.max_seat alert.max_seat
  json.total_passengers alert.total_passengers
  json.visiting_id alert.id
end

json.partial! 'shared/warnings'

json.can_share_data @can_share_data
