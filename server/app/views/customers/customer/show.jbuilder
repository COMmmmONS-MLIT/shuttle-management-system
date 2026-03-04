# frozen_string_literal: true

bookmarks_with_order = @customer.bookmarks_with_order

json.customer do
  json.extract! @customer, :id, :cd, :name, :name_kana, :wc, :walker_size, :walker,
                :need_helper, :self_pick_up, :self_drop_off, :walking_note, :common_note,
                :pick_up_note, :drop_off_note, :stopped_at, :stopped_reason, :phone_number, :contract_start_date
  json.contract_status @customer.contract_status_before_type_cast
  json.seat_assignment @customer.seat_assignment_before_type_cast
  json.need_helper @customer.need_helper ? 1 : 0
  json.wc @customer.wc ? 1 : 0
  json.walker @customer.walker ? 1 : 0
  json.departure_time @customer.formatted_departure_time
  json.arrival_time @customer.formatted_arrival_time
  json.start_time @customer.formatted_start_time
  pick_up_bookmark = bookmarks_with_order.find { |b| b[:bookmark].bid == @customer.default_pick_up_point_id }
  json.default_pick_up_point_order pick_up_bookmark ? pick_up_bookmark[:order] : nil
  drop_off_bookmark = bookmarks_with_order.find { |b| b[:bookmark].bid == @customer.default_drop_off_point_id }
  json.default_drop_off_point_order drop_off_bookmark ? drop_off_bookmark[:order] : nil
  json.image @customer.image.image if @customer.image.present?
end

json.addresses bookmarks_with_order do |bwo|
  json.extract! bwo[:bookmark], :bid, :address_label, :postal_code, :address, :room_name,
                :phone_number, :lat, :lng, :parking_lat, :parking_lng,
                :distance, :time, :wait_time, :acceptance_rate, :car_restriction_id
  json.order bwo[:order]
end

json.use_cases @customer.use_cases do |use_case|
  json.extract! use_case, :id, :customer_id, :day_of_week,
                :self_pick_up, :self_drop_off, :active, :pick_up_base_point_id, :drop_off_base_point_id,
                :pick_up_request, :drop_off_request
  if use_case.pick_up_point_id.present?
    pick_up_bookmark = bookmarks_with_order.find { |b| b[:bookmark].bid == use_case.pick_up_point_id }
    json.pick_up_point_order pick_up_bookmark ? pick_up_bookmark[:order] : nil
  end
  if use_case.drop_off_point_id.present?
    drop_off_bookmark = bookmarks_with_order.find { |b| b[:bookmark].bid == use_case.drop_off_point_id }
    json.drop_off_point_order drop_off_bookmark ? drop_off_bookmark[:order] : nil
  end
  json.departure_time use_case.formatted_departure_time if use_case.formatted_departure_time.present?
  json.arrival_time use_case.formatted_arrival_time if use_case.formatted_arrival_time.present?
  json.start_time use_case.formatted_start_time if use_case.formatted_start_time.present?
end

json.image @customer.image.image if @customer.image.present?
