# frozen_string_literal: true

# == Schema Information
#
# Table name: car_pattern_wc_numbers
#
#  id                                  :integer          not null, primary key
#  cargo_volume(積載量)                :integer
#  normal_seat(通常座席数)             :integer
#  wc_seat(WC席数)                     :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  car_pattern_id(車両パターンID (FK)) :integer          not null
#  office_id(事業所ID (FK))            :integer          not null
#
# Indexes
#
#  index_car_pattern_wc_numbers_on_car_pattern_id  (car_pattern_id)
#  index_car_pattern_wc_numbers_on_office_id       (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (car_pattern_id => car_patterns.id)
#  fk_rails_...  (office_id => offices.id)
#
FactoryBot.define do
  factory :car_pattern_wc_number do
    car_pattern
    cargo_volume { rand(100..1000) }
    normal_seat { rand(10..50) }
    wc_seat { rand(1..5) }
  end
end
