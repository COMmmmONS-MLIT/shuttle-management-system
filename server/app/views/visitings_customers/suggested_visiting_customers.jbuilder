# frozen_string_literal: true

json.customers @result do |vc|
  json.extract! vc, :id, :date, :is_self, :passenger_count
  json.soge_type vc.soge_type
  json.name vc.customer.name
  json.cd vc.customer.cd
  json.wc vc.customer.wc
  json.distance vc.bookmark.distance
  json.address vc.bookmark.address
  json.remarks vc.bookmark.remarks
  json.schedule_time vc.formatted_schedule_time
  json.actual_time vc.formatted_actual_time
  json.start_time vc.formatted_start_time
  json.image vc.customer.image&.image
  json.selected vc.visiting_id.present?
  json.is_absent vc.is_absent
  json.car_restriction vc.bookmark.car_restriction.name
  json.pick_up_point_name vc.pick_up_point_name
  json.drop_off_point_name vc.drop_off_point_name
end
