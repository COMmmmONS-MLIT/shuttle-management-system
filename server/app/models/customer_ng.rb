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
class CustomerNg < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :office
  belongs_to :customer_a, class_name: 'Customer'
  belongs_to :customer_b, class_name: 'Customer'

  validates :customer_a_id, presence: true
  validates :customer_b_id, presence: true
  validate :unique_customer_combination
  validate :customer_a_and_b_must_be_different

  def self.ransackable_attributes(_auth_object = nil)
    %w[created_at customer_a_id customer_b_id id id_value office_id reason updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[customer_a customer_b office]
  end

  private

  def customer_a_and_b_must_be_different
    return unless customer_a_id.present? && customer_b_id.present?

    return unless customer_a_id == customer_b_id

    errors.add(:base, '利用者Aと利用者Bは異なる必要があります')
  end

  def unique_customer_combination
    return unless office_id.present? && customer_a_id.present? && customer_b_id.present?

    existing_combination = CustomerNg.where(office_id:)
                                     .where(
                                       '(customer_a_id = ? AND customer_b_id = ?) OR ' \
                                       '(customer_a_id = ? AND customer_b_id = ?)',
                                       customer_a_id, customer_b_id, customer_b_id, customer_a_id
                                     )
                                     .where.not(id:)
                                     .exists?

    return unless existing_combination

    errors.add(:base, 'この利用者組み合わせは既に登録されています')
  end
end
