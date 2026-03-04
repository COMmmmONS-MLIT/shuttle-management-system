# frozen_string_literal: true

# == Schema Information
#
# Table name: car_restrictions_car_patterns
#
#  id                                  :integer          not null, primary key
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  car_pattern_id(車両パターンID (FK)) :integer          not null
#  car_restriction_id(車両制限ID (FK)) :integer          not null
#  office_id(事業所ID (FK))            :integer          not null
#
# Indexes
#
#  index_car_restrictions_car_patterns_on_car_pattern_id      (car_pattern_id)
#  index_car_restrictions_car_patterns_on_car_restriction_id  (car_restriction_id)
#  index_car_restrictions_car_patterns_on_office_id           (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (car_pattern_id => car_patterns.id)
#  fk_rails_...  (office_id => offices.id)
#
FactoryBot.define do
  factory :car_restrictions_car_pattern do
    car_pattern
    car_restriction
  end
end
