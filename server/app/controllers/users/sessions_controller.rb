# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    include ActionController::MimeResponds

    private

    def respond_with(_resource, _opts = {})
      role = current_user.role.camelize
      response_data = {
        messages: ['ログインに成功しました'],
        user: current_user,
        role:
      }
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
  end
end
