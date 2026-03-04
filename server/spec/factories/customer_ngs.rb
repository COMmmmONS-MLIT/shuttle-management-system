# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_ngs
#
#  id                             :integer          not null, primary key
#  reason(NG理由)                 :string(255)
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  customer_a_id(利用者A ID (FK)) :integer          not null
#  customer_b_id(利用者B ID (FK)) :integer          not null
#  office_id(事業所ID (FK))       :integer          not null
#
# Indexes
#
#  index_customer_ngs_on_customer_a_id  (customer_a_id)
#  index_customer_ngs_on_customer_b_id  (customer_b_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_a_id => customers.id)
#  fk_rails_...  (customer_b_id => customers.id)
#
FactoryBot.define do
  factory :customer_ng do
    customer_a factory: %i[customer]
    customer_b factory: %i[customer]
    reason { 'テストNG理由' }
  end
end
