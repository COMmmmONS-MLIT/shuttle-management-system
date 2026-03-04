# frozen_string_literal: true

# == Schema Information
#
# Table name: bookmark
#
#  bid                                                                            :integer          not null, primary key
#  landmark(0:偽 1:真)                                                            :integer          default(0)
#  lat(この住所に対して)                                                          :decimal(9, 6)    default(0.0)
#  lng                                                                            :decimal(9, 6)    default(0.0)
#  カテゴリ(0:未分類 1:診察 2:買い物 3:娯楽 4:移動 5:日常生活 6:デイサービス 10:自宅):integer          default(0)
#  事業所cd                                                                       :string(4)        not null
#  住所(送迎タブの送迎住所から)                                                   :string(120)
#  住所ラベル(登録地点の名称)                                                     :string(40)
#  停車lat(車両の停車指定がある場合)                                              :decimal(9, 6)    default(0.0)
#  停車lng                                                                        :decimal(9, 6)    default(0.0)
#  備考(地点ごと)                                                                 :string(100)
#  参考id(利用者番号の覚書)                                                       :string(12)
#  号室名(マンション名等)                                                         :string(40)
#  待ち時間                                                                       :integer          default(0)
#  時間                                                                           :integer
#  無効(0:偽 1:真)                                                                :integer          default(0)
#  許容率(乗車時間の許容率 0 で無ければ利用者の許容率より優先される)              :decimal(3, )     default(0)
#  距離                                                                           :decimal(4, 1)    default(0.0)
#  車両制限(地点ごとの車両制限)                                                   :integer
#  郵便番号(ハイフン無し)                                                         :string(7)
#  電話メモ                                                                       :string(100)
#  電話番号(地点ごとの連絡先)                                                     :string(13)
#
# Indexes
#
#  index_id  (事業所cd,参考id)

FactoryBot.define do
  factory :bookmark, class: 'Area::Bookmark' do
    sequence(:bid) { |n| n }
    office_code { 'OFFICE001' }
    sequence(:address_label) { |n| "地点#{n}" }
    address { '東京都渋谷区テスト1-1-1' }
    postal_code { '1500001' }
    room_name { '101号室' }
    phone_number { '03-1234-5678' }
    phone_memo { '連絡先メモ' }
    lat { 35.658034 }
    lng { 139.701636 }
    parking_lat { 35.658034 }
    parking_lng { 139.701636 }
    wait_time { 5 }
    distance { 1.5 }
    time { 10 }
    car_restriction_id { 1 }
    acceptance_rate { 0.0 }
    remarks { '備考' }
    reference_id { 'A001' }
    category { 0 }
    is_invalid { 0 }
    landmark { 0 }
  end
end
