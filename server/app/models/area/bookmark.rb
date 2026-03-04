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
#
module Area
  class Bookmark < ApplicationRecord
    self.table_name = 'bookmark'
    self.primary_key = :bid

    alias_attribute :office_code, :事業所cd
    alias_attribute :postal_code, :郵便番号
    alias_attribute :address_label, :住所ラベル
    alias_attribute :address, :住所
    alias_attribute :room_name, :号室名
    alias_attribute :phone_number, :電話番号
    alias_attribute :phone_memo, :電話メモ
    alias_attribute :lat, :lat
    alias_attribute :lng, :lng
    alias_attribute :parking_lat, :停車lat
    alias_attribute :parking_lng, :停車lng
    alias_attribute :wait_time, :待ち時間
    alias_attribute :distance, :距離
    alias_attribute :time, :時間
    alias_attribute :car_restriction_id, :車両制限
    alias_attribute :acceptance_rate, :許容率
    alias_attribute :remarks, :備考
    alias_attribute :reference_id, :参考id # 事業所のbookmarkの場合A001、利用者の場合customer_cdが入る
    alias_attribute :category, :カテゴリ
    alias_attribute :is_invalid, :無効
    alias_attribute :is_public, :landmark

    belongs_to :office, foreign_key: :事業所cd, primary_key: :cd, inverse_of: :bookmarks
    belongs_to :car_restriction, foreign_key: :車両制限, primary_key: :id, inverse_of: false

    has_many :visitings_customers, class_name: 'VisitingsCustomer', foreign_key: :point_id, primary_key: :bid,
                                   inverse_of: :bookmark, dependent: :nullify
    has_many :visitings_points, class_name: 'VisitingsPoint', foreign_key: :point_id, primary_key: :bid,
                                inverse_of: :bookmark, dependent: :nullify

    has_many :departure_visitings, class_name: 'Visiting', foreign_key: :departure_point_id, primary_key: :bid,
                                   inverse_of: :departure_bookmark, dependent: :nullify

    has_many :arrival_visitings, class_name: 'Visiting', foreign_key: :arrival_point_id, primary_key: :bid,
                                 inverse_of: :arrival_bookmark, dependent: :nullify

    validates :address_label, presence: true, length: { maximum: 40 }
    validates :address, presence: true, length: { maximum: 120 }
    validates :postal_code, presence: true
    validates :room_name, length: { maximum: 40 }
    validates :phone_number, length: { maximum: 13 }
    validates :lat, presence: true
    validates :lng, presence: true
    validates :car_restriction_id, presence: true

    scope :point_options, -> { where(reference_id: ['', 'A001']) }

    def self.ransackable_attributes(_auth_object = nil)
      %w[address address_label car_restriction_id]
    end
  end
end
