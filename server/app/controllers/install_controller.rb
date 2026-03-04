# frozen_string_literal: true

class InstallController < BaseController
  # 初回セットアップ用のため認証なし（ApplicationController を継承していない）
  def index
    @admin_exists = Admin.exists?
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
