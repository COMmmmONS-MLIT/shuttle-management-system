# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                       :bigint           not null, primary key
#  email                    :string(255)      default(""), not null
#  encrypted_password       :string(255)      default(""), not null
#  is_active                :boolean          default(TRUE), not null
#  kana(カナ)               :string(255)      default("")
#  name(名前)               :string(255)      default(""), not null
#  remember_created_at      :datetime
#  reset_password_sent_at   :datetime
#  reset_password_token     :string(255)
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  customer_id(利用者ID)    :integer
#  office_id                :bigint           not null
#
# Indexes
#
#  index_users_on_customer_id  (customer_id)
#  index_users_on_office_id    (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#
FactoryBot.define do
  factory :user do
    sequence(:email) { |i| "test#{i}@test.com" }
    name { 'テストユーザー' }
    kana { 'テストユーザー' }
    password { 'password' }
    password_confirmation { 'password' }
    is_active { true }
  end
end
