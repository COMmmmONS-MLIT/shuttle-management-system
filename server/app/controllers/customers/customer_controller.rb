# frozen_string_literal: true

class Customers::CustomerController < Customers::ApplicationController
  before_action :set_customer, only: %i[show create_request_notification]

  def show; end

  def create_request_notification
    form = CustomerRequestForm.new(request_params)
    if form.valid?
      form.save
      render json: { messages: '送迎リクエストを送信しました' }, status: :ok
    else
      render_model_errors(model: form)
    end
  end

  private

  def set_customer
    @customer = current_user.customer
    render json: { messages: ['Customer not found'] }, status: :not_found if @customer.nil?
  end

  def request_params
    params.permit(:customer_id, :address_label, :departure_time, :date)
  end
end
