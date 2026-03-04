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
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  belongs_to :office
  belongs_to :customer, optional: true, inverse_of: :user

  scope :not_customer, -> { where.not(role: :customer) }

  enum role: {
    staff: 1,
    staff_admin: 2,
    customer: 3
  }

  validates :name, :kana, :email, presence: true

  def active_for_authentication?
    return false unless super && is_active?
    return true if customer_id.blank?

    Customer.unscoped.find_by(id: customer_id)&.active? != false
  end

  def inactive_message
    is_active? ? super : :inactive_user
  end
end
