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
class CarPatternWcNumber < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :office
  belongs_to :car_pattern
end
