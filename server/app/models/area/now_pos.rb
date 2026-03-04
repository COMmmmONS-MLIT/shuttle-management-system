# frozen_string_literal: true

# == Schema Information
#
# Table name: NowPos
#
#  id                            :bigint           not null, primary key
#  Posx                          :decimal(9, 6)
#  Posy                          :decimal(9, 6)
#  battery(端末のバッテリー残量) :integer
#  rest(休憩中かどうか)          :string(1)
#  status                        :string(20)
#  事業所cd                      :string(10)
#  出発時間                      :time             not null
#  日付                          :date
#  時間                          :time
#  運転手                        :string(30)
#
# Indexes
#
#  index_date    (日付)
#  index_office  (事業所cd)
#
module Area
  class NowPos < ApplicationRecord
    self.table_name = 'NowPos'
    self.primary_key = :id

    alias_attribute :date, :日付
    alias_attribute :time, :時間
    alias_attribute :driver, :運転手
    alias_attribute :lat, :Posx
    alias_attribute :lng, :Posy
    alias_attribute :rest, :rest
    alias_attribute :battery, :battery
    alias_attribute :departure_time, :出発時間
    alias_attribute :office_code, :事業所cd
    alias_attribute :status, :status

    scope :by_date, ->(date) { where(日付: date) }
    scope :by_office, ->(office_code) { where(事業所cd: office_code) }
    scope :by_car_id, ->(car_id) { where(id: car_id) }
    scope :latest, -> { order(時間: :desc) }
  end
end
