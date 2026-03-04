# frozen_string_literal: true

class UserRegistrationService
  def self.create_or_update(customer:, user_id: nil, email: nil, password: nil)
    new(customer:, user_id:, email:, password:).create_or_update
  end

  def initialize(customer:, user_id: nil, email: nil, password: nil)
    @customer = customer
    @user_id = user_id
    @email = email
    @password = password
  end

  def create_or_update
    if @user_id.present?
      update_existing_user_by_id
    elsif @email.present?
      find_or_create_user_by_email
    else
      raise ArgumentError, 'user_id または email のいずれかが必要です'
    end
  end

  private

  def update_existing_user_by_id
    user = User.find_by(id: @user_id)
    raise ActiveRecord::RecordNotFound, 'User not found' unless user

    user.customer_id = @customer.id
    user.password = @password if @password.present?
    user.role = :customer
    user.office_id = @customer.office_id

    user.save!
    user
  end

  def find_or_create_user_by_email
    user = User.find_by(email: @email)

    if user
      update_existing_user(user)
    else
      create_new_user
    end
  end

  def update_existing_user(user)
    user.customer_id = @customer.id
    user.password = @password if @password.present?
    user.role = :customer

    user.save!
    user
  end

  def create_new_user
    User.create!(
      email: @email,
      password: @password,
      name: @customer.name,
      kana: @customer.name_kana,
      customer_id: @customer.id,
      office_id: @customer.office_id,
      role: :customer
    )
  end
end
