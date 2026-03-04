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
#  注意事項(迎_申送り,送_申送り,注意事項,備考)                                  :string(100)
#  自車区分                                                                     :string(1)
#  表示順                                                                       :integer          default(0)
#  設定時刻(基本の送迎時刻)                                                     :time
#  車両制限                                                                     :integer          default(0)
#  車両区分(添乗がある時)                                                       :integer          default(0)
#  車両呼称                                                                     :string(20)
#  車両番号                                                                     :string(4)
#  軽作業ID(買物実績 軽作業ID=44)                                               :string(6)        default("0"), not null
#  送迎区分                                                                     :string(1)        not null, primary key
#  運転手                                                                       :string(20)
#  開始時刻(サービス開始時刻)                                                   :time
#  降車(降車場所を示すID)                                                       :string(12)       not null
#  降車住所                                                                     :string(120)
#  降車名                                                                       :string(40)
#
class Area::Mergedata < ApplicationRecord
  self.table_name = 'mergedata'

  def find_bindatad
    Area::Bindatad.find_by(
      日付:,
      事業所cd:,
      利用者番号:,
      carId:,
      出発時間:,
      送迎区分:
    )
  end
end
