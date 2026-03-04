# frozen_string_literal: true

json.visiting do
  json.departure_time @visiting.formatted_departure_time
  json.arrival_time @visiting.formatted_arrival_time
  json.is_optimized_route @visiting.is_optimized_route
  json.route_points @visiting.route_points do |point|
    json.id point[:id]
    json.actual_time point[:actual_time]
  end
end
