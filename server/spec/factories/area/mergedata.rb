# frozen_string_literal: true

# == Schema Information
#
# Table name: mergedata
#
#  G人数                                                                        :integer          default(0)
#  carId                                                                        :integer          not null, primary key
#  gate                                                                         :integer          default(0)
#  gate定員                                                                     :integer          default(0)
#  lat1(乗車地点)                                                               :decimal(9, 6)
#  lat2(誘導経路の登録があれば表示)                                             :decimal(9, 6)
#  lat3(降車地点)                                                               :decimal(9, 6)
#  lng1                                                                         :decimal(9, 6)
#  lng2                                                                         :decimal(9, 6)
#  lng3                                                                         :decimal(9, 6)
#  waittime                                                                     :integer          default(0)
#  フリガナ                                                                     :string(80)       not null
#  乗車(乗車場所を示すID)                                                       :string(12)       not null
#  乗車人数                                                                     :integer
#  乗車住所                                                                     :string(120)
#  乗車名                                                                       :string(40)
#  予到着時間                                                                   :time
#  予定時間                                                                     :time
#  事業所cd                                                                     :string(10)       not null, primary key
#  休                                                                           :integer
#  休理由                                                                       :string(100)
#  便順                                                                         :integer
#  出発時間                                                                     :time             not null, primary key
#  利用者名                                                                     :string(80)       not null
#  利用者番号                                                                   :string(20)       not null, primary key
#  変更時間(デマンドが入った時の増加コスト分遅くなるので予定時間＋増加コストの時間):time
#  定員                                                                         :integer
#  日付                                                                         :date             not null, primary key
#  歩行                                                                         :string(60)
#  歩行器                                                                       :decimal(2, 1)
#  注意事項(迎_申送り,送_申送り,注意事項,備考)                                  :string(200)
#  自車区分                                                                     :string(1)
#  表示順                                                                       :integer          default(0)
#  設定時刻(基本の送迎時刻)                                                     :time
#  車両制限                                                                     :integer          default(0)
#  車両区分(添乗がある時)                                                       :integer          default(0)
#  車両呼称                                                                     :string(20)
#  車両番号                                                                     :string(6)
#  軽作業ID(買物実績 軽作業ID=44)                                               :string(6)        default("0"), not null
#  送迎区分                                                                     :string(1)        not null, primary key
#  運転手                                                                       :string(20)
#  開始時刻(サービス開始時刻)                                                   :time
#  降車(降車場所を示すID)                                                       :string(12)       not null
#  降車住所                                                                     :string(120)
#  降車名                                                                       :string(40)
#
FactoryBot.define do
  factory :mergedata, class: 'Area::Mergedata' do
    sequence(:日付) { |n| Date.current + n.days }
    sequence(:事業所cd) { |n| "OFFICE#{n.to_s.rjust(3, '0')}" }
    sequence(:利用者番号) { |n| "CUST#{n.to_s.rjust(3, '0')}" }
    sequence(:送迎区分) { |n| ((n % 2) + 1).to_s } # 1: 乗車, 2: 降車
    sequence(:carId) { |n| n }
    sequence(:出発時間) { |n| (Time.current + n.hours).strftime('%H:%M:%S') }
    sequence(:利用者名) { |n| "利用者#{n}" }
    sequence(:フリガナ) { |n| "リヨウシャ#{n}" }
    sequence(:乗車) { |n| "PICKUP#{n.to_s.rjust(3, '0')}" }
    sequence(:降車) { |n| "DROPOFF#{n.to_s.rjust(3, '0')}" }
    sequence(:乗車住所) { |n| "東京都渋谷区テスト#{n}-1-1" }
    sequence(:降車住所) { |n| "東京都新宿区テスト#{n}-2-2" }
    sequence(:乗車名) { |n| "乗車地点#{n}" }
    sequence(:降車名) { |n| "降車地点#{n}" }
    lat1 { 35.658034 }
    lng1 { 139.701636 }
    lat2 { 35.658034 }
    lng2 { 139.701636 }
    lat3 { 35.658034 }
    lng3 { 139.701636 }
    sequence(:乗車人数) { |n| (n % 5) + 1 }
    sequence(:定員) { |_n| 10 }
    sequence(:車両番号) { |n| "CAR#{n.to_s.rjust(3, '0')}" }
    sequence(:車両呼称) { |n| "車両#{n}" }
    sequence(:運転手) { |n| "運転手#{n}" }
    sequence(:注意事項) { |n| "注意事項#{n}" }
    sequence(:歩行器) { |n| (n % 3).to_f }
    sequence(:車両制限) { |n| n % 2 }
    sequence(:gate) { |n| n % 2 }
    sequence(:gate定員) { |_n| 5 }
    sequence(:waittime) { |n| n * 5 }
    sequence(:G人数) { |n| n % 3 }
    sequence(:軽作業ID) { |n| n.to_s.rjust(6, '0') }
    sequence(:予到着時間) { |n| (Time.current + n.hours + 30.minutes).strftime('%H:%M:%S') }
    sequence(:予定時間) { |n| (Time.current + n.hours + 1.hour).strftime('%H:%M:%S') }
    sequence(:設定時刻) { |n| (Time.current + n.hours).strftime('%H:%M:%S') }
    sequence(:開始時刻) { |n| (Time.current + n.hours + 10.minutes).strftime('%H:%M:%S') }
    sequence(:休) { |n| n % 2 }
    sequence(:休理由) { |n| "休理由#{n}" }
    sequence(:歩行) { |n| "歩行注意#{n}" }
  end
end
