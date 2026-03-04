# frozen_string_literal: true

json.id vc.id
json.customer_cd vc.customer.cd
json.date vc.date.strftime('%Y/%m/%d')
json.customer_id vc.customer.id
json.name vc.customer.name
json.name_kana vc.customer.name_kana
json.phone_number vc.customer.phone_number
json.schedule_time vc.formatted_schedule_time
json.soge_type vc.soge_type
json.passenger_count vc.passenger_count
json.is_requested vc.is_requested
json.point_id vc.point_id
json.base_point_id vc.base_point_id
json.point_name vc.bookmark&.address_label
json.base_point_name vc.base_point&.address_label
customer = vc.customer.requested_source.presence || vc.customer
json.office_name customer.office.name
json.note vc.note
json.can_request vc.can_request?
