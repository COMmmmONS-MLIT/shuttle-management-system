# frozen_string_literal: true

class ApplicationController < BaseController
  before_action :authenticate_user_or_admin!

  def authenticate_user_or_admin!
    return if user_signed_in? || admin_signed_in?

    render json: { messages: ['unauthorized'] }, status: :unauthorized
  end
end
