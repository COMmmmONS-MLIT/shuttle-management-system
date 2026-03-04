# frozen_string_literal: true

class Admin::AuthController < Admin::ApplicationController
  def index
    render json: { user: current_admin,
                   role: current_admin.class.name,
                   category: 'admin' },
           status: :ok
  end
end
