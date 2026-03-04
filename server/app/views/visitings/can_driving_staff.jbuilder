# frozen_string_literal: true

json.can_driver @can_driver do |staff|
  json.id staff.id
  json.name staff.name
end

json.can_tenjo @can_tenjo do |staff|
  json.id staff.id
  json.name staff.name
end

json.selected_driver_id @visiting.driver_id
json.selected_tenjo_id @visiting.tenjo_id
