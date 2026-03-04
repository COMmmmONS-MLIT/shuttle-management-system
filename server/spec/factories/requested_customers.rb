# frozen_string_literal: true

# == Schema Information
#
# Table name: requested_customers
#
#  id                                                       :integer          not null, primary key
#  actual_time(実時間)                                      :time
#  cd(利用者番号)                                           :string(255)      not null
#  common_note(共通備考)                                    :text(65535)
#  date(日付)                                               :date
#  drop_off_note(送り申し送り)                              :text(65535)
#  is_cancellation_requested(受託後キャンセル要求フラグ)    :boolean          default(FALSE)
#  name(氏名)                                               :string(255)      not null
#  name_kana(氏名カナ)                                      :string(255)
#  need_helper(添乗員)                                      :boolean
#  note(備考)                                               :text(65535)
#  passenger_count(乗車人数)                                :integer          default(1)
#  phone_number(電話番号)                                   :string(255)
#  pick_up_note(迎え申し送り)                               :text(65535)
#  point_time(ポイント時間(迎え: 降車時間, 送り: 乗車時間)) :time
#  schedule_time(予定時間)                                  :time
#  soge_type(送迎区分)                                      :integer
#  start_time(サービス開始時間)                             :time
#  walker(歩行器利用)                                       :boolean
#  walker_size(歩行器サイズ)                                :decimal(2, 1)
#  wc(WC利用 (車椅子))                                      :boolean
#  created_at                                               :datetime         not null
#  updated_at                                               :datetime         not null
#  allowing_office_id(許可先事業所ID)                       :integer
#  base_point_id(送り場所基点)                              :integer
#  office_id(事業所ID)                                      :integer          not null
#  point_id(送り場所ID (FK))                                :integer
#  source_id(利用者ID)                                      :integer          not null
#  source_vc_id(委託VCID)                                   :integer          not null
#
# Indexes
#
#  index_requested_customers_on_base_point_id  (base_point_id)
#  index_requested_customers_on_office_id      (office_id)
#  index_requested_customers_on_point_id       (point_id)
#
# Foreign Keys
#
#  fk_rails_...  (base_point_id => bookmark.bid)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (point_id => bookmark.bid)
#
FactoryBot.define do
  factory :requested_customer do
    sequence(:cd) { |n| "RC#{n.to_s.rjust(4, '0')}" }
    sequence(:name) { |n| "リクエスト顧客#{n}" }
    sequence(:name_kana) { |n| "リクエストコキャク#{n}" }
    date { Date.current }
    schedule_time { '09:00' }
    soge_type { :pick_up }
    wc { false }
    walker { false }
    walker_size { 0 }
    need_helper { false }
    is_cancellation_requested { false }
    source_id { 1 }
    source_vc_id { 1 }

    office

    # point_idとbase_point_idは必須だが、テスト側で指定する
  end
end
