# frozen_string_literal: true

# == Schema Information
#
# Table name: offices
#
#  id                                    :integer          not null, primary key
#  address(事業所住所)                   :string(120)
#  category(officeカテゴリー(enum))      :integer          default("welfare")
#  cd(事業所コード)                      :string(10)
#  contact_person_kana(施設管理者名カナ) :string(120)
#  contact_person_name(施設管理者名)     :string(20)
#  fax(FAX番号)                          :string(255)
#  is_active                             :boolean          default(TRUE), not null
#  lat(この住所に対して)                 :decimal(9, 6)    default(0.0)
#  lng                                   :decimal(9, 6)    default(0.0)
#  mail(メールアドレス)                  :string(255)
#  name(事業所名)                        :string(255)      not null
#  name_kana(事業所名カナ)               :string(255)
#  only_schedule_create                  :boolean          default(FALSE), not null
#  postcode(郵便番号)                    :string(7)
#  tel(電話番号)                         :string(255)
#  tenant_cd(テナントコード)             :string(10)
#  created_at                            :datetime         not null
#  updated_at                            :datetime         not null
#
class Office < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :customers, dependent: :destroy, inverse_of: :office
  has_many :bookmarks, dependent: :destroy, class_name: 'Area::Bookmark', primary_key: :cd, foreign_key: '事業所cd',
                       inverse_of: :office
  has_many :request_relationships, class_name: 'OfficeRequestRelationship', foreign_key: 'request_office_id',
                                   dependent: :destroy, inverse_of: false
  has_many :accept_relationships, class_name: 'OfficeRequestRelationship', foreign_key: 'accept_office_id',
                                  dependent: :destroy, inverse_of: false
  has_many :request_offices, through: :accept_relationships, source: :request_office
  has_many :accept_offices, through: :request_relationships, source: :accept_office
  has_many :office_requested_customers, dependent: :destroy
  has_many :requested_customers, through: :office_requested_customers
  has_many :requesting_customers, class_name: 'RequestedCustomer', dependent: :destroy
  has_many :allowing_requested_customers, class_name: 'RequestedCustomer', foreign_key: 'allowing_office_id',
                                          dependent: :destroy, inverse_of: false

  enum category: { welfare: 1, tourism: 2, education: 3 }

  def self.ransackable_attributes(_auth_object = nil)
    %w[address id name name_kana tenant_cd postcode tel fax mail contact_person_name
       contact_person_kana lat lng is_active]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[users customers bookmarks]
  end

  def find_bookmark
    Area::Bookmark.find_by(office_code: cd, reference_id: 'A001')
  end
end
