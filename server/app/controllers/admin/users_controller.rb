# frozen_string_literal: true

class Admin::UsersController < Admin::ApplicationController
  before_action :set_office, only: %i[index create update update_password]
  before_action :set_user, only: %i[update update_password]

  def index
    @users = @office.users.not_customer
  end

  def create
    @user = User.new(user_params)
    @user.office_id = @office.id
    if @user.save
      rendering_message_after_create(User.model_name.human)
    else
      render_model_errors(model: @user)
    end
  end

  def update
    if @user.update(update_params)
      rendering_message_after_update(User.model_name.human)
    else
      render_model_errors(model: @user)
    end
  end

  def update_password
    if @user.update(password_params)
      rendering_message_after_update(User.model_name.human)
    else
      render_model_errors(model: @user)
    end
  end

  private

  def set_office
    @office = Office.find(params[:office_id])
  end

  def set_user
    @user = @office.users.find(params[:id])
  end

  def user_params
    params.require(:user).permit(
      :name,
      :kana,
      :email,
      :password,
      :is_active,
      :role
    )
  end

  def update_params
    params.require(:user).permit(
      :is_active,
      :role
    )
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end
end
