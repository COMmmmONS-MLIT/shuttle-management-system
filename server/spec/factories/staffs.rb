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
FactoryBot.define do
  factory :staff do
    sequence(:cd) { |n| "STAFF#{n.to_s.rjust(3, '0')}" }
    sequence(:name) { |n| "職員#{n}" }
    sequence(:name_kana) { |n| "ショクイン#{n}" }
    category { :介護 }
    driver_type { :介護職員 }
    can_driver { true }
    can_helper { true }
    tel { '03-1234-5678' }
    mail { 'staff@example.com' }
  end
end
