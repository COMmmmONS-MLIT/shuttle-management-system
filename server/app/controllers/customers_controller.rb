# frozen_string_literal: true

class CustomersController < ApplicationController
  include BookmarkOptions
  include Searchable
  before_action :set_customer, only: %i[show update customer_bookmarks_options]

  def index
    days = get_selected_days(search_params)

    @customers = search_customers(days)
  end

  def show; end

  def create
    form = CustomerRegistrationForm.new(customer_params)
    if form.valid?
      form.create
      rendering_message_after_create(Customer.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = CustomerRegistrationForm.new(customer_params)
    if form.valid?
      form.update
      rendering_message_after_update(Customer.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def office_latlng; end

  def point_options
    render_point_options(include_office: true)
  end

  def customer_bookmarks_options
    @bookmarks = @customer.bookmarks

    @customer_bookmarks = @bookmarks.map do |bookmark|
      {
        label: bookmark.address_label,
        value: bookmark.bid
      }
    end

    render json: { customer_bookmarks: @customer_bookmarks }
  end

  private

  def set_customer
    @customer = Customer.find_by(id: params[:id])
  end

  def search_customers(days)
    Customer.includes(:image)
            .joins(:use_cases)
            .then { |q| filter_by_days(q, days) }
            .then { |q| filter_by_stopped_at(q) }
            .ransack(ransack_params)
            .result
            .distinct
            .order(order_context(search_params[:order], {}, { name_kana: :asc }))
            .page(search_params[:page])
            .per(search_params[:per])
  end

  def filter_by_days(query, days)
    if days.present?
      query.merge(CustomerUseCase.where(day_of_week: days, active: true))
    else
      query
    end
  end

  def filter_by_stopped_at(query)
    case search_params[:stopped_at]
    when 'present'
      query.where.not(stopped_at: nil)
    when 'blank'
      query.where(stopped_at: nil)
    else
      query
    end
  end

  def ransack_params
    {
      cd_or_name_kana_cont: search_params[:customer_id_or_kana],
      contract_status_eq: search_params[:contract_status]
    }
  end

  def get_selected_days(params)
    %w[sunday monday tuesday wednesday thursday friday saturday].select { |d| params[d].to_s == 'true' }.presence
  end

  # rubocop:disable Metrics/MethodLength
  def search_params
    params.require(:search_params).permit(
      :contract_status,
      :customer_id_or_kana,
      :page,
      :per,
      :order,
      :sunday,
      :monday,
      :tuesday,
      :wednesday,
      :thursday,
      :friday,
      :saturday,
      :stopped_at
    )
  end

  def customer_params
    params.require(:customer_params).permit(
      customer: %i[
        id
        cd
        name
        name_kana
        contract_status
        wc
        walker_size
        walker
        need_helper
        seat_assignment
        default_pick_up_point_order
        default_drop_off_point_order
        departure_time
        arrival_time
        start_time
        self_pick_up
        self_drop_off
        common_note
        walking_note
        pick_up_note
        drop_off_note
        stopped_at
        stopped_reason
        image
        phone_number
        contract_start_date
      ],
      use_cases: %i[
        id
        customer_id
        day_of_week
        departure_time
        pick_up_point_order
        pick_up_base_point_id
        drop_off_base_point_id
        start_time
        arrival_time
        drop_off_point_order
        self_pick_up
        self_drop_off
        active
        pick_up_request
        drop_off_request
      ],
      addresses: %i[
        bid
        order
        address_label
        postal_code
        address
        room_name
        phone_number
        lat
        lng
        parking_lat
        parking_lng
        distance
        time
        wait_time
        acceptance_rate
        car_restriction_id
      ]
    )
  end
  # rubocop:enable Metrics/MethodLength
end
