# frozen_string_literal: true

# == Schema Information
#
# Table name: visitings
#
#  id                                           :integer          not null, primary key
#  arrival_time(到着時間)                       :time
#  bin_order(便順)                              :integer
#  date(日付)                                   :date
#  departure_time(出発時間)                     :time
#  is_shared(共有された送迎か)                  :boolean          default(FALSE)
#  shared_car_name(共有された送迎の車両名)      :string(255)
#  shared_driver_name(共有された送迎の運転手名) :string(255)
#  shared_tenjo_name(共有された送迎の添乗員名)  :string(255)
#  created_at                                   :datetime         not null
#  updated_at                                   :datetime         not null
#  arrival_point_id(到着地点ID (FK))            :integer
#  car_id(車両ID (FK))                          :integer
#  departure_point_id(出発地点ID (FK))          :integer
#  driver_id(ドライバーID (FK))                 :integer
#  office_id(事業所ID (FK))                     :integer          not null
#  source_office_id(共有元の事業所ID (FK))      :integer
#  source_visiting_id(共有元のVisitingID)       :integer
#  tenjo_id(添乗者ID (FK))                      :integer
#
# Indexes
#
#  index_visitings_on_arrival_point_id    (arrival_point_id)
#  index_visitings_on_car_id              (car_id)
#  index_visitings_on_departure_point_id  (departure_point_id)
#  index_visitings_on_driver_id           (driver_id)
#  index_visitings_on_is_shared           (is_shared)
#  index_visitings_on_office_id           (office_id)
#  index_visitings_on_source_office_id    (source_office_id)
#  index_visitings_on_source_visiting_id  (source_visiting_id)
#  index_visitings_on_tenjo_id            (tenjo_id)
#
# Foreign Keys
#
#  fk_rails_...  (arrival_point_id => bookmark.bid)
#  fk_rails_...  (car_id => cars.id)
#  fk_rails_...  (departure_point_id => bookmark.bid)
#  fk_rails_...  (driver_id => staffs.id)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (source_office_id => offices.id)
#  fk_rails_...  (tenjo_id => staffs.id)
#
FactoryBot.define do
  factory :visiting do
    car
    driver factory: %i[staff]
    tenjo factory: %i[staff]
    date { Date.current }
    bin_order { rand(1..5) }
    departure_time { '08:00' }
    arrival_time { '18:00' }
  end
end
