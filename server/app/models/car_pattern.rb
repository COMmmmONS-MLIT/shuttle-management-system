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
class CarPattern < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :office
  has_many :car_pattern_wc_numbers, dependent: :destroy
  has_many :cars, dependent: :nullify
  has_many :car_restrictions_car_patterns, dependent: :destroy
  has_many :car_restrictions, through: :car_restrictions_car_patterns

  enum car_type: {
    micro_van: 0,
    normal: 1,
    minivan: 2,
    small_car: 3
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[name]
  end
end
