# frozen_string_literal: true

json.drivers @drivers do |driver|
  json.id driver.id
  json.name driver.name
  json.cd driver.cd
  json.driver_type driver.driver_type
  json.can_driver driver.can_driver
  json.can_helper driver.can_helper
end

json.cars @cars do |car|
  json.id car.id
  json.name car.name
  json.number car.number
  json.max_seat car.max_seat
  json.max_wc_seat car.max_wc_seat
  json.car_pattern_name car.car_pattern&.name
end

json.schedules @schedules do |schedule|
  json.id schedule[:id]
  json.driver_id schedule[:driver_id]
  json.car_id schedule[:car_id]
  json.car_name schedule[:car_name]
  json.driver_name schedule[:driver_name]
  json.start_time schedule[:start_time]
  json.duration schedule[:duration]
  json.type schedule[:type]
  json.customers schedule[:customers] do |customer|
    json.id customer[:id]
    json.soge_type customer[:soge_type]
    json.name customer[:name]
    json.address customer[:address]
    json.schedule_time customer[:schedule_time]
    json.start_time customer[:start_time]
    json.wc customer[:wc]
    json.walker customer[:walker]
    json.car_restriction customer[:car_restriction_name]
  end
end
