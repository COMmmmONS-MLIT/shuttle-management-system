# frozen_string_literal: true

category = current_office.category
json.requested_customers @requested_customers do |rc|
  json.office_name rc.office.name
  json.date rc.date.strftime('%Y/%m/%d')
  json.extract! rc, :id, :cd, :name, :name_kana, :wc, :walker,
                :walker_size, :need_helper, :soge_type
  point_address = rc.bookmark.address
  base_point_address = rc.base_point.address
  departure_point_address = nil
  arrival_point_address = nil
  case category
  when 'tourism'
    departure_point_address = rc.pick_up? ? base_point_address : point_address
    arrival_point_address = rc.pick_up? ? point_address : base_point_address

  else
    departure_point_address = rc.pick_up? ? point_address : base_point_address
    arrival_point_address = rc.pick_up? ? base_point_address : point_address
  end
  json.address point_address
  json.base_point_address base_point_address
  json.departure_address departure_point_address
  json.arrival_address arrival_point_address
  json.start_time rc.formatted_start_time
  json.schedule_time rc.formatted_schedule_time
end

json.allowed_requested_customers @allowed_requested_customers do |rc|
  json.office_name rc.office.name
  json.date rc.date.strftime('%Y/%m/%d')
  json.extract! rc, :id, :cd, :name, :name_kana, :wc, :walker,
                :walker_size, :need_helper, :soge_type, :is_cancellation_requested
  point_address = rc.bookmark.address
  base_point_address = rc.base_point.address
  departure_point_address = nil
  arrival_point_address = nil
  case category
  when 'tourism'
    departure_point_address = rc.pick_up? ? base_point_address : point_address
    arrival_point_address = rc.pick_up? ? point_address : base_point_address

  else
    departure_point_address = rc.pick_up? ? point_address : base_point_address
    arrival_point_address = rc.pick_up? ? base_point_address : point_address
  end
  json.address point_address
  json.base_point_address base_point_address
  json.departure_address departure_point_address
  json.arrival_address arrival_point_address
  json.start_time rc.formatted_start_time
  json.schedule_time rc.formatted_schedule_time
  json.allowed true
end

json.requesting_customers @requesting_customers do |rc|
  json.office_name rc.office.name
  json.date rc.date.strftime('%Y/%m/%d')
  json.extract! rc, :id, :cd, :name, :name_kana, :wc, :walker,
                :walker_size, :need_helper, :soge_type, :allowing_office_id, :is_cancellation_requested
  point_address = rc.bookmark.address
  base_point_address = rc.base_point.address
  departure_point_address = nil
  arrival_point_address = nil
  case category
  when 'tourism'
    departure_point_address = rc.pick_up? ? base_point_address : point_address
    arrival_point_address = rc.pick_up? ? point_address : base_point_address
    departure_time_formatted = rc.pick_up? ? rc.formatted_point_time : rc.formatted_actual_time
    arrival_time_formatted = rc.pick_up? ? rc.formatted_actual_time : rc.formatted_point_time
  else
    departure_point_address = rc.pick_up? ? point_address : base_point_address
    arrival_point_address = rc.pick_up? ? base_point_address : point_address
    departure_time_formatted = rc.pick_up? ? rc.formatted_actual_time : rc.formatted_point_time
    arrival_time_formatted = rc.pick_up? ? rc.formatted_point_time : rc.formatted_actual_time
  end
  json.address point_address
  json.base_point_address base_point_address
  json.departure_address departure_point_address
  json.arrival_address arrival_point_address
  json.start_time rc.formatted_start_time
  json.schedule_time rc.formatted_schedule_time
  json.departure_time departure_time_formatted || '未定'
  json.arrival_time arrival_time_formatted || '未定'
end
