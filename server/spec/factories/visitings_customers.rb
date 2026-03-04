# frozen_string_literal: true

# == Schema Information
#
# Table name: visitings_customers
#
#  id                                 :integer          not null, primary key
#  absence_reason(お休み理由)         :text(65535)
#  actual_time(実迎時間)              :time
#  arrival_time(到着時間)             :time
#  date(日付)                         :date
#  is_absent(お休み)                  :boolean          default(FALSE)
#  is_requested(リクエストされた送迎) :boolean
#  is_self(自来自退)                  :boolean
#  note(備考)                         :text(65535)
#  order(順番)                        :integer
#  passenger_count(乗車人数)          :integer          default(0)
#  request(送迎リクエスト)            :boolean
#  schedule_time(予定時間)            :time
#  soge_type(送迎種別 1:迎え 2:送り)  :integer
#  start_time(開始時間)               :time
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#  base_point_id(迎え場所基点ID)      :integer
#  customer_id(利用者ID (FK))         :integer          not null
#  office_id(事業所ID (FK))           :integer          not null
#  point_id(迎え場所ID (FK))          :integer
#  visiting_id(送迎ID (FK))           :integer
#
# Indexes
#
#  index_visitings_customers_on_base_point_id  (base_point_id)
#  index_visitings_customers_on_customer_id    (customer_id)
#  index_visitings_customers_on_office_id      (office_id)
#  index_visitings_customers_on_visiting_id    (visiting_id)
#
# Foreign Keys
#
#  fk_rails_...  (base_point_id => bookmark.bid)
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (visiting_id => visitings.id)
#
FactoryBot.define do
  factory :visitings_customer do
    customer
    visiting
    date { Date.current }
    order { rand(1..10) }
    soge_type { :pick_up }
    schedule_time { '08:00' }
    actual_time { '08:05' }
    start_time { '08:10' }
    request { true }
    passenger_count { 1 }
  end
end
