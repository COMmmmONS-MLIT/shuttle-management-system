# frozen_string_literal: true

class UsersController < ApplicationController
  def create
    customer = Customer.find(user_params[:customer_id])

    return render_record_not_found(ActiveRecord::RecordNotFound.new('Customer not found')) unless customer

    begin
      @user = UserRegistrationService.create_or_update(
        customer:,
        user_id: user_params[:user_id],
        email: user_params[:email],
        password: user_params[:password]
      )
      rendering_message_after_create(User.model_name.human)
    rescue ArgumentError => e
      render_base_error(e.message, status: :bad_request)
    end
  end

  private

  def user_params
    params.permit(:user_id, :email, :password, :customer_id)
  end
end
