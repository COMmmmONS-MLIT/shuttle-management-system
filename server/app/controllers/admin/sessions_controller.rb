# frozen_string_literal: true

class Admin::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds

  private

  def respond_with(_resource, _opts = {})
    render json: { messages: ['ログインに成功しました'],
                   user: current_admin,
                   role: current_admin.class.name,
                   category: 'admin' },
           status: :ok
  end
end
