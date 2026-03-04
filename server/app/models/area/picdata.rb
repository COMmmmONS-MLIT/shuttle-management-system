# frozen_string_literal: true

# == Schema Information
#
# Table name: picdata
#
#  FileAge              :datetime
#  imgdat               :text(16777215)
#  メモ                 :string(100)
#  事業所CD             :string(4)        not null, primary key
#  利用者番号           :string(20)       not null, primary key
#  地点(利用者住所の地点):string(2)        not null, primary key
#  番号                 :integer          default(1), not null, primary key
#
module Area
  class Picdata < ApplicationRecord
    # self.table_name = 'picdata'
    # self.primary_key = %i[利用者番号 地点 番号]

    # alias_attribute :office_code, :事業所CD
    # alias_attribute :bookmark_id, :利用者番号
    # alias_attribute :point, :地点
    # alias_attribute :number, :番号
    # alias_attribute :memo, :メモ
    # alias_attribute :file_age, :FileAge

    # validates :office_code, presence: true, length: { maximum: 4 }
    # validates :bookmark_id, presence: true, length: { maximum: 11 }
    # validates :point, length: { maximum: 2 }
    # validates :number, presence: true, numericality: { only_integer: true }
    # validates :memo, length: { maximum: 100 }, allow_blank: true

    # belongs_to :bookmark, foreign_key: :利用者番号, inverse_of: :picdatas
  end
end
