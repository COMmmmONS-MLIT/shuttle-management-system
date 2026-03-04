# frozen_string_literal: true

# == Schema Information
#
# Table name: car_patterns
#
#  id                         :integer          not null, primary key
#  car_type(車両タイプ(enum)) :integer
#  name(パターン名)           :string(255)      not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  office_id(事業所ID (FK))   :integer          not null
#
# Indexes
#
#  index_car_patterns_on_office_id  (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (office_id => offices.id)
#

FactoryBot.define do
  factory :car_pattern do
    sequence(:name) { |n| "車両パターン#{n}" }
    car_type { :micro_van }
  end
end
