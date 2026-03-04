# frozen_string_literal: true

# == Schema Information
#
# Table name: cars
#
#  id                                  :integer          not null, primary key
#  max_seat(最大座席数)                :integer
#  max_wc_seat(最大車椅子席数)         :integer
#  name(車両名)                        :string(255)      not null
#  number(車両番号)                    :string(255)      not null
#  stopped(停止フラグ)                 :boolean          default(FALSE)
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  car_pattern_id(車両パターンID (FK)) :integer
#  office_id(事業所ID (FK))            :integer          not null
#
# Indexes
#
#  index_cars_on_car_pattern_id  (car_pattern_id)
#  index_cars_on_office_id       (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (car_pattern_id => car_patterns.id)
#  fk_rails_...  (office_id => offices.id)
#

FactoryBot.define do
  factory :car do
    sequence(:name) { |n| "車両#{n}" }
    sequence(:number) { |n| "CAR#{n.to_s.rjust(3, '0')}" }
    max_seat { rand(10..50) }
    max_wc_seat { rand(1..5) }
    car_pattern
  end
end
