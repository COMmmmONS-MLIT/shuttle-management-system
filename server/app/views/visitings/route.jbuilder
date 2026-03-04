# frozen_string_literal: true

json.points @route_points do |point|
  json.position do
    json.lat point[:lat]
    json.lng point[:lng]
  end
  json.kinds point[:kinds]
  json.content point[:comment]
end

json.order(@route_points.pluck(:bookmark_id))

json.car_name @visiting.car.name
json.bin_order @visiting.bin_order
