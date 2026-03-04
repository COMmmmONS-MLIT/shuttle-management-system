# frozen_string_literal: true

# == Schema Information
#
# Table name: staffs
#
#  id                             :integer          not null, primary key
#  can_driver(運転可能フラグ)     :boolean
#  can_helper(添乗可能フラグ)     :boolean
#  category(カテゴリ (enum))      :integer
#  cd(職員番号)                   :string(255)      not null
#  driver_type(運転手区分 (enum)) :integer
#  is_stopped(停止)               :boolean          default(FALSE)
#  mail(メールアドレス)           :string(255)
#  name(氏名)                     :string(255)      not null
#  name_kana(氏名カナ)            :string(255)
#  tel(電話番号)                  :string(255)
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  office_id(事業所ID (FK))       :integer          not null
#
# Indexes
#
#  index_staffs_on_office_id  (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (office_id => offices.id)
#
class Staff < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :office
  has_many :can_driving_cars, foreign_key: :driver_id, dependent: :destroy, inverse_of: :driver
  has_many :visitings, foreign_key: :driver_id, dependent: :nullify, inverse_of: :driver
  enum category: { '介護': 1, '看護': 2, '相談員': 3, '訓練士': 4, 'ドライバー': 5, '経理': 6, 'その他': 7 }
  enum driver_type: { '介護職員': 1, '専属ドライバー': 2, '応援': 3, '退職': 4, '送迎から除外': 5 }

  validates :office, presence: true
  validates :name, presence: true, length: { maximum: 20 }
  validates :cd, uniqueness: { scope: :office_id }, if: -> { cd.present? }
  validates :id, uniqueness: true, if: -> { id.present? && new_record? }

  def self.ransackable_attributes(_auth_object = nil)
    %w[can_driver can_helper category driver_type cd name name_kana office_id updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[can_driving_cars office visitings]
  end
end
