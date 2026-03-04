# frozen_string_literal: true

class Admin::OfficesController < Admin::ApplicationController
  include Searchable
  before_action :set_office, only: %i[show update set_tenant_cd]

  def index
    @offices = Office.all
  end

  def show; end

  def create
    form = OfficeRegistrationForm.new(office_params)
    if form.valid?
      form.save
      rendering_message_after_create(Office.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = OfficeRegistrationForm.new(office_params)
    if form.valid?
      form.update(@office)
      rendering_message_after_update(Office.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def set_tenant_cd
    cookies[:tenant_cd] = {
      value: @office.tenant_cd,
      secure: Rails.env.production? || Rails.env.staging?,
      httponly: true,
      same_site: :strict
    }
    render json: { message: 'Tenant CD set successfully' }
  end

  private

  def set_office
    @office = Office.find(params[:id])
  end

  def search_params
    params.require(:search_params).permit(
      :id,
      :name,
      :address,
      :page,
      :per,
      :order
    )
  end

  def office_params
    params.require(:office).permit(
      :cd,
      :tenant_cd,
      :name,
      :name_kana,
      :postcode,
      :address,
      :tel,
      :fax,
      :mail,
      :contact_person_name,
      :contact_person_kana,
      :lat,
      :lng,
      :is_active,
      :category,
      :only_schedule_create,
      accept_office_ids: []
    )
  end
end
