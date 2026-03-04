# frozen_string_literal: true

json.cars @cars do |car|
  json.extract! car, :id, :name, :number, :max_seat, :max_wc_seat, :stopped, :point_id
  json.car_pattern_name car.car_pattern.name
end

json.partial! 'shared/pagination', collection: @cars
