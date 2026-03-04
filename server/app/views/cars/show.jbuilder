# frozen_string_literal: true

json.car do
  json.extract! @car, :id, :name, :number, :stopped, :max_seat, :max_wc_seat, :point_id
end

json.car_pattern do
  json.extract! @car.car_pattern, :id, :name, :car_type
  json.restriction_ids @car.car_pattern.car_restriction_ids

  json.wc_numbers @car.car_pattern.car_pattern_wc_numbers do |wc_number|
    json.extract! wc_number, :id, :normal_seat, :wc_seat, :cargo_volume
  end
end
