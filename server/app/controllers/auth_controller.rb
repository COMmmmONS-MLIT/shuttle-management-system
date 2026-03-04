# frozen_string_literal: true

class AuthController < ApplicationController
  def index
    user = current_user || current_admin
    role = get_role(user)
    response_data = { user:, role: }
    unless role == 'Customer'
      can_request = current_office.request_relationships.present?
      response_data.merge!(
        category: current_office.category,
        office_name: current_office.name,
        only_schedule_create: current_office.only_schedule_create,
        can_request:
      )
    end
    render json: response_data, status: :ok
  end

  private

  def get_role(user)
    case user.class.name
    when 'User'
      user.role.camelize
    when 'Admin'
      'Admin'
    end
  end
end
