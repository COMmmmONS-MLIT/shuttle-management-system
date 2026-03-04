# frozen_string_literal: true

class Tourism::VisitingsCustomersController < Tourism::ApplicationController
  include BookmarkOptions
  include Searchable
  before_action :set_visiting_customer, only: %i[destroy update]

  # 依頼していないもののみ表示
  def index
    search = search_params.dup

    ransack_params = build_ransack_params(search)

    @visitings_customers = VisitingsCustomer.where(is_requesting: false).ransack(ransack_params)
                                            .result.joins(:customer).includes(:customer, :bookmark)
                                            .order(order_context_sql(search[:order]))
  end

  def create
    form = TourismVisitingsCustomerRegisterForm.new(visitings_customer_params)
    if form.create
      rendering_message_after_create('送迎予約')
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = TourismVisitingsCustomerRegisterForm.new(visitings_customer_params)
    if form.update(@visiting_customer)
      rendering_message_after_update('送迎予約')
    else
      render_model_errors(model: form)
    end
  end

  # Metrics/CyclomaticComplexity
  def destroy
    if @visiting_customer.visiting_id.present? && params[:force] != 'true'
      visiting = Visiting.find(@visiting_customer.visiting_id)
      remaining_customers = visiting.customers.reject do |vc|
        vc.id == @visiting_customer.id
      end

      render json: {
        visitings: [{
          id: visiting.id,
          customers: remaining_customers.map do |vc|
            {
              id: vc.id
            }
          end
        }]
      }, status: :conflict
      return
    end

    ActiveRecord::Base.transaction do
      visiting_id = @visiting_customer.visiting_id
      customer = @visiting_customer.customer
      @visiting_customer.destroy!
      customer.destroy!

      if visiting_id.present?
        visiting = Visiting.find_by(id: visiting_id)
        route_points = visiting.base_points.map do |point|
          {
            id: point.id,
            order: point.order,
            point_type: point.class.name,
            soge_type: point.soge_type
          }
        end
        customer_ids = visiting.customers.pluck(:id)

        form = TourismVisitingsRouteAssignmentForm.new(current_office, visiting)
        form.register_customers_and_points(route_points, customer_ids) if form.valid?

        if Visiting.exists?(visiting_id)
          visiting.for_points_calculate_times(0)
          visiting.update!(is_optimized_route: false)
        end
      end
    end

    render json: { messages: ['送迎予約を削除しました'] }, status: :ok
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: ['削除に失敗しました'] }, status: :unprocessable_entity
  end

  def point_options
    tourism_point_options
  end

  def accept_office_options
    @accept_offices = current_office.accept_offices

    @accept_office_options = @accept_offices.map do |accept_office|
      { label: accept_office.name, value: accept_office.id }
    end

    render json: { accept_office_options: @accept_office_options }
  end

  def request_visitings_customer
    form = ::VisitingsCustomerRequestForm.new(params[:visitings_customer_ids], params[:accept_office_id])
    if form.valid?
      count = form.save
      rendering_message_after_create("#{count}件の送迎リクエスト")
    else
      render_model_errors(model: form)
    end
  end

  private

  def set_visiting_customer
    @visiting_customer = VisitingsCustomer.find(params[:id])
  end

  def search_params
    params.require(:search_params).permit(
      :start_date,
      :end_date,
      :customer_cd_or_kana,
      :order,
      :is_absent,
      :per,
      :page
    )
  end

  def build_ransack_params(search)
    {
      customer_cd_or_customer_name_kana_cont: search[:customer_cd_or_kana],
      date_gteq: search[:start_date]&.to_date,
      date_lteq: search[:end_date]&.to_date
    }.compact
  end

  def visitings_customer_params
    params.require(:visitings_customer).permit(
      :name,
      :name_kana,
      :phone_number,
      :passenger_count,
      :date,
      :soge_type,
      :schedule_time,
      :point_id,
      :base_point_id,
      :passenger_count,
      :note
    )
  end
end
