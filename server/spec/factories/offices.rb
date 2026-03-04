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
FactoryBot.define do
  factory :office do
    sequence(:cd) { |n| "OFFICE#{n.to_s.rjust(3, '0')}" }
    sequence(:name) { |n| "事業所#{n}" }
    sequence(:name_kana) { |n| "ジギョウショ#{n}" }
    sequence(:tenant_cd) { |n| "TENANT#{n.to_s.rjust(3, '0')}" }
    address { '東京都渋谷区テスト1-1-1' }
    postcode { '1500001' }
    tel { '03-1234-5678' }
    fax { '03-1234-5679' }
    mail { 'test@example.com' }
    contact_person_name { '担当者' }
    contact_person_kana { 'タントウシャ' }
    lat { 35.658034 }
    lng { 139.701636 }
    is_active { true }
  end
end
