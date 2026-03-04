# frozen_string_literal: true

# == Schema Information
#
# Table name: bindatad
#
#  carId       :integer          not null, primary key
#  carStatus   :string(20)
#  updatetimec :time
#  updatetimeu :time
#  userStatus  :string(20)
#  乗車人数    :integer          default(0), not null
#  乗車時刻    :time
#  事業所cd    :string(10)       not null, primary key
#  出発時間    :time             not null, primary key
#  利用者番号  :string(20)       not null, primary key
#  日付        :date             not null, primary key
#  送迎区分    :string(1)        not null, primary key
#  降車時刻    :time
#
class Area::Bindatad < ApplicationRecord
  self.table_name = 'bindatad'

  # 複合主キーを設定（Rails 7.1以降の正しい構文）
  self.primary_key = %w[日付 事業所cd 利用者番号 送迎区分 carId 出発時間]

  attribute :出発時間, :time
  attribute :乗車時刻, :time
  attribute :降車時刻, :time
  attribute :updatetimec, :string
  attribute :updatetimeu, :string

  validates :日付, presence: true
  validates :事業所cd, presence: true
  validates :利用者番号, presence: true
  validates :送迎区分, presence: true
  validates :carId, presence: true
  validates :出発時間, presence: true

  scope :by_car, ->(car_id) { where(carId: car_id) }
  scope :by_date, ->(date) { where(日付: date) }
  scope :pick_up, -> { where(送迎区分: '1') }  # 送迎区分が1の場合は乗車
  scope :drop_off, -> { where(送迎区分: '2') } # 送迎区分が2の場合は降車

  # 乗降状態を判定
  def boarding_status
    if 乗車時刻.present? && 降車時刻.present?
      'completed'
    elsif 乗車時刻.present?
      'on_board'
    else
      'scheduled'
    end
  end

  def find_mergedata
    Area::Mergedata.find_by(
      日付:,
      事業所cd:,
      利用者番号:,
      carId:,
      出発時間:,
      送迎区分:
    )
  end

  # 日本時間での時間表示メソッド
  def departure_time_jst
    return nil if 出発時間.blank?

    if 出発時間.is_a?(Time)
      # Timeオブジェクトの場合は日本時間に変換
      出発時間.in_time_zone('Tokyo')
    else
      # 文字列の場合はそのまま返す
      出発時間
    end
  end
end
