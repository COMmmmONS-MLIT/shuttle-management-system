# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class VisitingsCustomersController < ApplicationController
  include BookmarkOptions
  include Searchable
  before_action :set_visiting_customer,
                only: %i[destroy remove_from_visiting update_requested_customer suggested_visiting_customers]

  def index
    search = search_params.dup

    ransack_params = build_ransack_params(search)

    @visitings_customers = VisitingsCustomer.ransack(ransack_params)
                                            .result.includes(:customer)

    @visitings_customers_pairs = @visitings_customers.group_by { |v| [v.customer_id, v.date] }.map do |_, records|
      pick_up = records.find { |r| r.soge_type == 'pick_up' }
      drop_off = records.find { |r| r.soge_type == 'drop_off' }
      next if pick_up.blank? || drop_off.blank?

      VisitingsCustomersPair.new(pick_up:, drop_off:)
    end

    @visitings_customers_pairs.compact!

    @visitings_customers_pairs.reject! { |pair| pair.pick_up.is_requesting && pair.drop_off.is_requesting }

    @visitings_customers_pairs.sort_by! { |pair| order_context_for_pair(search[:order], pair) }

    @visitings_customers_pairs.reverse! if search[:order].include?('desc')

    @requested_visitings_customers = @visitings_customers.where(is_requested: true)

    return unless search[:is_absent] == 'true'

    @visitings_customers_pairs.select!(&:is_absent)
  end

  def create
    form = VisitingsCustomerRegistrationForm.new(visitings_customer_params)
    if form.valid?
      form.save
      rendering_message_after_create(VisitingsCustomer.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def bulk_create
    form = VisitingsCustomerBulkRegistrationForm.new(visitings_customer_bulk_create_params)
    if form.valid?
      form.save
      model_name = current_office.tourism? ? '送迎予約' : VisitingsCustomer.model_name.human
      rendering_message_after_create(model_name)
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = VisitingsCustomerUpdateForm.new(visitings_customer_params)

    if form.valid?
      form.save
      render json: { messages: ['更新しました'] }, status: :ok
    else
      render_model_errors(model: form)
    end
  end

  def destroy
    pair_soge_type = @visiting_customer.soge_type == 'pick_up' ? 'drop_off' : 'pick_up'
    pair_visiting_customer = VisitingsCustomer.find_by(
      customer_id: @visiting_customer.customer_id,
      date: @visiting_customer.date,
      soge_type: pair_soge_type
    )

    if (@visiting_customer.visiting_id.present? ||
        pair_visiting_customer&.visiting_id.present?) && params[:force] != 'true'

      visiting_ids = [@visiting_customer.visiting_id, pair_visiting_customer&.visiting_id].compact.uniq
      visitings = Visiting.where(id: visiting_ids).includes(:customers)

      render json: {
        visitings: visitings.map do |visiting|
          remaining_customers = visiting.customers.reject do |vc|
            vc.customer_id == @visiting_customer.customer_id
          end

          {
            id: visiting.id,
            customers: remaining_customers.map do |vc|
              {
                id: vc.id
              }
            end
          }
        end
      }, status: :conflict
      return
    end

    VisitingsCustomer.transaction do
      visiting_ids = [@visiting_customer.visiting_id, pair_visiting_customer&.visiting_id].compact.uniq
      visitings = Visiting.where(id: visiting_ids).includes(:customers)

      @visiting_customer.destroy!
      pair_visiting_customer&.destroy!

      visitings.each do |visiting|
        route_points = visiting.customers_and_points.map do |point|
          {
            id: point.id,
            order: point.order,
            point_type: point.class.name
          }
        end
        form = VisitingsRouteAssignmentForm.new(Current.office, visiting)
        form.register_customers_and_points(route_points) if form.valid?
        next unless Visiting.exists?(visiting.id)

        visiting.reload
        visiting.calculate_times(Current.office, 0, visiting.departure_time)
        visiting.update!(is_optimized_route: false)
      end
    end

    render json: { messages: ['送迎データを削除しました'] }, status: :ok
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: ['削除に失敗しました'] }, status: :unprocessable_entity
  end

  def remove_from_visiting
    unless @visiting_customer
      render json: { errors: ['指定された送迎データが見つかりません'] }, status: :not_found
      return
    end

    visiting_id = @visiting_customer.visiting_id

    @visiting_customer.update!(visiting_id: nil)
    @visiting_customer.update_requested_source

    if visiting_id && VisitingsCustomer.where(visiting_id:).empty?
      visiting = Visiting.find_by(id: visiting_id)
      visiting&.destroy!
    end

    render json: { messages: ['便から削除しました'] }, status: :ok
  end

  def search_customers
    name = params[:name]
    return render json: { customers: [] }, status: :ok if name.blank?

    customers = Customer.where(contract_status: %w[契約 体験])
                        .where('name LIKE ? OR name_kana LIKE ? OR cd LIKE ?', "%#{name}%", "%#{name}%", "%#{name}%")
                        .order(:name_kana)

    @customer_options = customers.map do |customer|
      {
        label: customer.name,
        value: customer.cd
      }
    end

    render json: { customers: @customer_options }
  end

  def point_options
    render_point_options(include_office: true)
  end

  def accept_office_options
    @accept_offices = current_office.accept_offices

    @accept_office_options = @accept_offices.map do |accept_office|
      { label: accept_office.name, value: accept_office.id }
    end

    render json: { accept_office_options: @accept_office_options }
  end

  def soge_type_options
    visitings_customer_id = params[:visitings_customer_id]

    pick_up_vc = VisitingsCustomer.find(visitings_customer_id)

    drop_off_vc = VisitingsCustomer.find_by(
      date: pick_up_vc.date,
      customer_id: pick_up_vc.customer_id,
      soge_type: :drop_off
    )

    pick_up_available = pick_up_vc.can_request?
    drop_off_available = drop_off_vc.can_request?

    soge_type_options = []
    soge_type_options << { label: '迎え', value: 'pick_up' } if pick_up_available
    soge_type_options << { label: '送り', value: 'drop_off' } if drop_off_available
    soge_type_options << { label: '両方', value: 'both' } if pick_up_available && drop_off_available

    render json: { soge_type_options: }
  end

  def request_visitings_customer
    form = ::VisitingsCustomerRequestForm.new(
      params[:visitings_customer_ids],
      params[:accept_office_id],
      params[:soge_type]
    )
    if form.valid?
      count = form.save
      rendering_message_after_create("#{count}件の送迎リクエスト")
    else
      render_model_errors(model: form)
    end
  end

  def update_requested_customer
    if @visiting_customer.update(update_requested_customer_params)
      render json: { messages: ['更新しました'] }, status: :ok
    else
      render_model_errors(model: @visiting_customer)
    end
  end

  def suggested_visiting_customers
    base = VisitingsCustomer.except_self_or_absent
                            .where(date: @visiting_customer.date, soge_type: @visiting_customer.soge_type)
                            .where.not(id: @visiting_customer.id)

    base_time = @visiting_customer.schedule_time
    start_time = (base_time - 15.minutes).utc.strftime('%H:%M:%S')
    end_time = (base_time + 15.minutes).utc.strftime('%H:%M:%S')

    suggested = if start_time < end_time
                  # 通常ケース: 範囲内
                  base.where('schedule_time BETWEEN ? AND ?', start_time, end_time)
                else
                  # 日付をまたぐケース: 23:45 ~ 00:15 など
                  base.where('schedule_time >= ? OR schedule_time <= ?', start_time, end_time)
                end

    @result = suggested.sort_by { VisitingsCustomer.distance_between(_1, @visiting_customer) }
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
      :is_absent,
      :order,
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
      :id,
      :customer_cd,
      :date,
      :departure_time,
      :arrival_time,
      :start_time,
      :soge_type,
      :self_pick_up,
      :self_drop_off,
      :is_absent,
      :absence_reason,
      :visiting_id,
      :pick_up_base_point_id,
      :drop_off_base_point_id,
      :pick_up_point_id,
      :drop_off_point_id,
      :pick_up_request,
      :drop_off_request
    )
  end

  def visitings_customer_bulk_create_params
    params.require(:visitings_customer_bulk_create).permit(
      :customer_cd,
      :start_date,
      :end_date
    )
  end

  def update_requested_customer_params
    params.require(:requested_visitings_customer).permit(
      :schedule_time
    )
  end
end
# rubocop:enable Metrics/ClassLength
