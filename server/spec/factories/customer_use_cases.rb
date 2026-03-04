# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_use_cases
#
#  id                                   :integer          not null, primary key
#  active(有効)                         :boolean
#  arrival_time(到着時間)               :time
#  day_of_week(曜日 (enum))             :integer
#  departure_time(出発時間)             :time
#  drop_off_request(送りリクエスト)     :boolean
#  pick_up_request(迎えリクエス)        :boolean
#  self_drop_off(自退)                  :boolean
#  self_pick_up(自来)                   :boolean
#  start_time(開始時間)                 :time
#  created_at                           :datetime         not null
#  updated_at                           :datetime         not null
#  customer_id(利用者ID)                :integer          not null
#  drop_off_base_point_id(送り場所基点) :integer
#  drop_off_point_id(送り場所ID (FK))   :integer
#  office_id(事業所ID)                  :integer          not null
#  pick_up_base_point_id(迎え場所基点)  :integer
#  pick_up_point_id(迎え場所ID (FK))    :integer
#
# Indexes
#
#  index_customer_use_cases_on_customer_id             (customer_id)
#  index_customer_use_cases_on_drop_off_base_point_id  (drop_off_base_point_id)
#  index_customer_use_cases_on_drop_off_point_id       (drop_off_point_id)
#  index_customer_use_cases_on_office_id               (office_id)
#  index_customer_use_cases_on_pick_up_base_point_id   (pick_up_base_point_id)
#  index_customer_use_cases_on_pick_up_point_id        (pick_up_point_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (drop_off_base_point_id => bookmark.bid)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (pick_up_base_point_id => bookmark.bid)
#
FactoryBot.define do
  factory :customer_use_case do
    customer
    office
    day_of_week { :monday }
    departure_time { '08:00' }
    arrival_time { '18:00' }
    start_time { '08:30' }
    self_pick_up { false }
    self_drop_off { false }
    pick_up_request { false }
    drop_off_request { false }
    active { true }
  end
end
