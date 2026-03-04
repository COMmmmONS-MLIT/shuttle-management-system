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

class Car < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :office
  belongs_to :car_pattern
  belongs_to :point, class_name: 'Area::Bookmark', primary_key: :bid, optional: true, inverse_of: false

  validates :name, presence: true, length: { maximum: 20 }
  validates :number, presence: true, length: { maximum: 10 }

  scope :not_stopped, -> { where(stopped: false) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name number car_pattern_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    ['car_pattern']
  end

  def nomal_seat_count(wc_seat_count)
    return 0 if wc_seat_count.blank? || wc_seat_count > max_wc_seat

    car_pattern.car_pattern_wc_numbers.find { |cpwn| cpwn.wc_seat == wc_seat_count }.normal_seat
  end
end
