# frozen_string_literal: true

class Customers::ApplicationController < BaseController
  before_action :authenticate_customer!

  def authenticate_customer!
    return if user_signed_in? && current_user.customer?

    render json: { messages: ['unauthorized'] }, status: :unauthorized
  end
end
