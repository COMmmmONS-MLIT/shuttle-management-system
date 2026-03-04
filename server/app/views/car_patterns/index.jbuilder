# frozen_string_literal: true

json.car_patterns @car_patterns do |car_pattern|
  json.extract! car_pattern, :id, :name
  json.restriction_ids car_pattern.car_restriction_ids

  json.wc_numbers car_pattern.car_pattern_wc_numbers do |wc_number|
    json.extract! wc_number, :id, :cargo_volume, :normal_seat, :wc_seat
  end

  json.restrictions car_pattern.car_restrictions do |restriction|
    json.extract! restriction, :id, :name
  end
end
