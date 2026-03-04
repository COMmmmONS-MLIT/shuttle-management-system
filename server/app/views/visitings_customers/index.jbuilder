# frozen_string_literal: true

json.visitings_customers @visitings_customers_pairs do |pair|
  json.id pair.id
  json.date pair.date_str
  json.customer_id pair.customer.id
  json.customer_cd pair.customer.cd
  json.customer_name pair.customer.name
  json.customer_kana pair.customer.name_kana
  json.customer_stopped_at pair.customer.stopped_at
  json.departure_time pair.pick_up_time_str
  json.arrival_time pair.drop_off_time_str
  json.start_time pair.start_time_str
  json.pick_up_point_id pair.pick_up_point.bid
  json.drop_off_point_id pair.drop_off_point.bid
  json.pick_up_base_point_id pair.pick_up_base_point_id
  json.drop_off_base_point_id pair.drop_off_base_point_id
  json.image pair.image
  json.is_absent pair.is_absent
  json.absence_reason pair.absence_reason
  json.self_pick_up pair.self_pick_up?
  json.self_drop_off pair.self_drop_off?
  json.pick_up_request pair.pick_up_request
  json.drop_off_request pair.drop_off_request
  json.is_requested pair.requested?
  json.is_requesting pair.requesting?
  json.can_request pair.can_request?
  json.addresses_options pair.customer.bookmarks do |bookmark|
    json.value bookmark.bid
    json.label bookmark.address_label
  end
end

json.requested_visitings_customers @requested_visitings_customers do |rvc|
  customer = rvc.customer
  office_name = rvc.customer.requested_source&.office&.name || Current.office.name
  json.id rvc.id
  json.date rvc.date.strftime('%Y/%m/%d')
  json.customer_id customer.id
  json.customer_cd customer.cd
  json.customer_name customer.name
  json.customer_kana customer.name_kana
  json.schedule_time rvc.formatted_schedule_time
  json.start_time rvc.formatted_start_time
  json.soge_type rvc.soge_type
  json.note rvc.note
  json.address rvc.bookmark.address
  json.wc customer.wc
  json.office_name office_name
  json.point_name rvc.bookmark.address_label
  json.base_point_name rvc.base_point.address_label
end
