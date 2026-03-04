# frozen_string_literal: true

class Admin::AdminsController < Admin::ApplicationController
  def index
    @admins = Admin.all
  end

  def create
    @admin = Admin.new(admin_params)
    if @admin.save
      rendering_message_after_create(Admin.model_name.human)
    else
      render_model_errors(model: @admin)
    end
  end

  private

  def admin_params
    params.require(:admin).permit(
      :email,
      :password
    )
  end
end
