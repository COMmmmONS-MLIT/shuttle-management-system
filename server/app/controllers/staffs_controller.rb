# frozen_string_literal: true

class StaffsController < ApplicationController
  include Searchable
  before_action :set_staff, only: %i[show update]

  def index
    @staffs = Staff.ransack(
      cd_or_name_kana_cont: search_params[:cd_or_kana],
      can_driver_eq: search_params[:can_driver],
      can_helper_eq: search_params[:can_helper]
    ).result
                   .order(order_context(search_params[:order]))
                   .page(search_params[:page])
                   .per(search_params[:per])
  end

  def show; end

  def create
    form = StaffRegistrationForm.new(staff_params)
    if form.valid?
      form.save
      rendering_message_after_create(Staff.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = StaffRegistrationForm.new(staff_params)
    if form.valid?
      form.update(@staff)
      rendering_message_after_update(Staff.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  private

  def set_staff
    @staff = Staff.find(params[:id])
  end

  def search_params
    params.require(:search_params).permit(
      :cd_or_kana,
      :can_driver,
      :can_helper,
      :page,
      :per,
      :order
    )
  end

  def staff_params
    params.require(:staff).permit(
      :cd,
      :name,
      :name_kana,
      :category,
      :can_driver,
      :can_helper,
      :driver_type,
      :tel,
      :mail,
      :is_stopped,
      can_driving_cars: [
        { car_pattern: %i[id name] }
      ]
    )
  end
end
