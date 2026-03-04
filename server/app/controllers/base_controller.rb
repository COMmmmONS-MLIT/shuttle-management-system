# frozen_string_literal: true

class BaseController < ActionController::API
  include AbstractController::Translation
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  # protect_from_forgery with: :exception

  before_action :set_current_office_for_user
  before_action :set_current_office_for_admin

  after_action :set_csrf_cookie
  after_action :set_tenant_cookie

  helper_method :current_office

  rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid # validate errorの共通ハンドリング
  rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found # RecordNotFoundの共通ハンドリング

  def handle_record_invalid(error)
    render_model_errors(model: error.record)
  end

  def render_model_errors(model:, options: {})
    @model = model
    render 'errors/model', status: options[:status] || :bad_request
  end

  def render_record_not_found(error)
    render json: { messages: [error.message] }, status: :not_found
  end

  def rendering_message_after_create(model)
    messages = [t('controllers.api.success.created', model:)]
    render json: { messages: }, status: :ok
  end

  def rendering_message_after_update(model)
    messages = [t('controllers.api.success.updated', model:)]
    render json: { messages: }, status: :ok
  end

  def rendering_message_after_destroy(model)
    messages = [t('controllers.api.success.deleted', model:)]
    render json: { messages: }, status: :ok
  end

  def render_validation_error(field, message, status: :bad_request)
    render json: {
      keys: [field.to_s],
      messages: { field => [message] },
      full_messages: [message]
    }, status:
  end

  def render_base_error(message, status: :unprocessable_entity)
    render json: {
      keys: ['base'],
      messages: { base: [message] },
      full_messages: [message]
    }, status:
  end

  private

  def set_csrf_cookie
    cookies['XSRF-TOKEN'] = {
      value: form_authenticity_token,
      secure: Rails.env.production? || Rails.env.staging?,
      httponly: false,
      same_site: :strict,
      domain: :all,
      tld_length: 2
    }
  end

  def set_current_office_for_user
    return unless user_signed_in?

    tenant_cd = cookies[:tenant_cd]

    # テナントが一致しない場合はユーザーのテナントを使用
    # いずれは、複数のテナントと紐づく想定なため、cookieを利用して管理している
    tenant_cd = current_user.office.tenant_cd if current_user.office.tenant_cd != tenant_cd

    office = Office.find_by(tenant_cd:)

    Current.office = office
  end

  def set_current_office_for_admin
    return unless admin_signed_in?

    tenant_cd = cookies[:tenant_cd]
    Current.office = Office.find_by(tenant_cd:)
  end

  def set_tenant_cookie
    if user_signed_in? || admin_signed_in?
      tenant_cd = admin_signed_in? ? cookies[:tenant_cd] : current_user.office.tenant_cd

      cookies[:tenant_cd] = {
        value: tenant_cd,
        httponly: false,
        secure: Rails.env.production?,
        same_site: :strict,
        path: '/'
      }

    else
      cookies.delete(:tenant_cd, path: '/')
    end
  end

  def current_office
    Current.office
  end
end
