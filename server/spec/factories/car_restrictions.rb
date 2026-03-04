# frozen_string_literal: true

# == Schema Information
#
# Table name: car_restrictions
#
#  id             :integer          not null, primary key
#  name(車両制限) :string(255)      not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
FactoryBot.define do
  factory :car_restriction do
    sequence(:name) { |n| "車両制限#{n}" }
  end
end
