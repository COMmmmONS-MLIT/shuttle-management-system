# frozen_string_literal: true

# == Schema Information
#
# Table name: office_requested_customers
#
#  id                                      :integer          not null, primary key
#  allowed(許可)                           :boolean
#  created_at                              :datetime         not null
#  updated_at                              :datetime         not null
#  office_id(事業所ID)                     :integer          not null
#  requested_customer_id(リクエスト利用者) :integer          not null
#
# Indexes
#
#  index_office_requested_customers_on_office_id              (office_id)
#  index_office_requested_customers_on_requested_customer_id  (requested_customer_id)
#
# Foreign Keys
#
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (requested_customer_id => requested_customers.id)
#
FactoryBot.define do
  factory :office_requested_customer do
    office
    requested_customer
  end
end
