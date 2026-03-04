# frozen_string_literal: true

json.visiting do
  json.departure_time @visiting.formatted_departure_time
  json.arrival_time @visiting.formatted_arrival_time
  json.customers do
    json.array! @visiting.customers do |vc|
      json.id vc.id
      json.actual_time vc.formatted_actual_time
    end
  end
end
