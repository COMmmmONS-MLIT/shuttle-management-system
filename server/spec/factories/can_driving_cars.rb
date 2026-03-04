# frozen_string_literal: true

# == Schema Information
#
# Table name: can_driving_cars
#
#  id                                  :integer          not null, primary key
#  created_at(作成日時と更新日時)      :datetime         not null
#  updated_at(作成日時と更新日時)      :datetime         not null
#  car_pattern_id(車両パターンID (FK)) :integer          not null
#  driver_id(運転者ID (FK))            :integer          not null
#  office_id(事業所ID (FK))            :integer          not null
#
# Indexes
#
#  index_can_driving_cars_on_car_pattern_id  (car_pattern_id)
#  index_can_driving_cars_on_driver_id       (driver_id)
#  index_can_driving_cars_on_office_id       (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (car_pattern_id => car_patterns.id)
#  fk_rails_...  (driver_id => staffs.id)
#  fk_rails_...  (office_id => offices.id)
#
FactoryBot.define do
  factory :can_driving_car do
    car_pattern
    driver factory: %i[staff]
  end
end
