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
class CarRestriction < ApplicationRecord
  has_many :car_restrictions_car_patterns, dependent: :destroy
  has_many :car_patterns, through: :car_restrictions_car_patterns
end
