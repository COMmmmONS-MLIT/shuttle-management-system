# frozen_string_literal: true

class CustomerNgsController < ApplicationController
  before_action :set_customer_ng, only: %i[update destroy]

  def index
    @customer_ngs = CustomerNg.ransack(
      customer_a_name_kana_or_customer_a_cd_cont: search_params[:customer_a_cd_or_name],
      customer_b_name_kana_or_customer_b_cd_cont: search_params[:customer_b_cd_or_name]
    ).result
                              .includes(:customer_a, :customer_b)
                              .order(search_params[:order])
                              .page(search_params[:page])
                              .per(search_params[:per])
  end

  def customer_options
    @customers = Customer.where.not(contract_status: :他事業所)
    @customers_options = @customers.map { |customer| { label: customer.name, value: customer.id } }

    render json: {
      customer_options: @customers_options
    }
  end

  def create
    @customer_ng = CustomerNg.new(customer_ng_params)

    if @customer_ng.save
      rendering_message_after_create('乗り合わせ')
    else
      render_model_errors(model: @customer_ng)
    end
  end

  def update
    if @customer_ng.update(customer_ng_params)
      rendering_message_after_update('乗り合わせ')
    else
      render_model_errors(model: @customer_ng)
    end
  end

  def destroy
    @customer_ng.destroy
    rendering_message_after_destroy('乗り合わせ')
  end

  private

  def set_customer_ng
    @customer_ng = CustomerNg.find(params[:id])
  end

  def customer_ng_params
    params.require(:customer_ng).permit(:customer_a_id, :customer_b_id, :reason)
  end

  def search_params
    params.require(:search_params).permit(:customer_a_cd_or_name, :customer_b_cd_or_name, :order, :page, :per)
  end
end
