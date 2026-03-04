# frozen_string_literal: true

# == Schema Information
#
# Table name: customers
#
#  id                                              :integer          not null, primary key
#  arrival_time(送り予定時間)                      :time
#  cd(利用者番号)                                  :string(255)      not null
#  common_note(共通備考)                           :text(65535)
#  contract_status(契約識別 (enum))                :integer
#  departure_time(迎え予定時間)                    :time
#  drop_off_note(送り申し送り)                     :text(65535)
#  name(氏名)                                      :string(255)      not null
#  name_kana(氏名カナ)                             :string(255)
#  need_helper(添乗員)                             :boolean
#  phone_number(電話番号)                          :string(255)
#  pick_up_note(迎え申し送り)                      :text(65535)
#  seat_assignment(座席指定(enum))                 :integer
#  self_drop_off(自退)                             :boolean
#  self_pick_up(自来)                              :boolean
#  start_time(サービス開始時間)                    :time
#  stopped_at(休止日)                              :date
#  stopped_reason(休止理由)                        :text(65535)
#  walker(歩行器利用)                              :boolean
#  walker_size(歩行器サイズ)                       :decimal(2, 1)
#  walking_note(歩行注意事項)                      :text(65535)
#  wc(WC利用 (車椅子))                             :boolean
#  created_at                                      :datetime         not null
#  updated_at                                      :datetime         not null
#  default_drop_off_point_id(デフォルト送り場所ID) :integer
#  default_pick_up_point_id(デフォルト迎え場所ID)  :integer
#  office_id(事業所ID)                             :integer          not null
#  requested_customer_id(リクエスト元データID)     :integer
#
# Indexes
#
#  index_customers_on_default_drop_off_point_id  (default_drop_off_point_id)
#  index_customers_on_default_pick_up_point_id   (default_pick_up_point_id)
#  index_customers_on_office_id                  (office_id)
#  index_customers_on_requested_customer_id      (requested_customer_id)
#
# Foreign Keys
#
#  fk_rails_...  (default_drop_off_point_id => bookmark.bid)
#  fk_rails_...  (default_pick_up_point_id => bookmark.bid)
#  fk_rails_...  (office_id => offices.id)
#
FactoryBot.define do
  factory :customer do
    sequence(:cd) { |n| "CUST#{n.to_s.rjust(3, '0')}" }
    sequence(:name) { |n| "顧客#{n}" }
    sequence(:name_kana) { |n| "コキャク#{n}" }
    contract_status { :契約 }
    seat_assignment { :助手席 }
    departure_time { '08:00' }
    arrival_time { '18:00' }
    start_time { '08:30' }
    need_helper { false }
    self_pick_up { false }
    self_drop_off { false }
    walker { false }
    wc { false }
    walker_size { 0.0 }
  end
end
