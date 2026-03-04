# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class VisitingsController < ApplicationController
  include BookmarkOptions
  before_action :set_visiting,
                only: %i[show update_time can_driving_staff update_staffs update_point]
  def index
    @visitings = Visiting.left_outer_joins(:customers)
                         .where(date: visitings_search_params[:date], is_shared: false)
                         .where.not(visitings_customers: { id: nil })
                         .includes(
                           :car,
                           :driver,
                           :tenjo,
                           customers: [{ customer: :image }, :bookmark, :base_point],
                           base_points: :bookmark
                         )
    @cars = Car.not_stopped.order(:id)
    max_order_number = @visitings.map(&:bin_order).max || 0
    @visitings_groups = (max_order_number + 3).times.map do |i|
      i += 1
      @cars.map do |car|
        @visitings.find do |visiting|
          visiting.bin_order == i && visiting.car_id == car.id
        end || { car_id: car.id, bin_order: i }
      end
    end

    @requesting_customers = current_office.requesting_customers
                                          .where(date: visitings_search_params[:date])
                                          .order(:date, :schedule_time)

    @alerts = VisitingAlert.has_alerts
                           .includes(:car, visiting: :customers)
                           .where(visiting_id: @visitings.pluck(:id))

    @alerts = VisitingAlert.filter_capacity_over(@alerts)

    @warnings = Visiting.generate_warnings_for_visitings(@visitings)

    @can_share_data = current_office.request_offices.present?
  end

  def requested_soge
    @visitings = Visiting.left_outer_joins(:customers)
                         .where(date: visitings_search_params[:date], is_shared: true)
                         .where.not(visitings_customers: { id: nil })
    max_order_number = @visitings.map(&:bin_order).max || 0
    @car_names = @visitings.pluck(:shared_car_name).uniq
    @visitings_groups = max_order_number.times.map do |i|
      i += 1
      @car_names.map do |car_name|
        @visitings.find do |visiting|
          visiting.bin_order == i && visiting.shared_car_name == car_name
        end || { car_name:, bin_order: i }
      end
    end

    @warnings = Visiting.generate_warnings_for_visitings(@visitings)
  end

  def share_to_office
    date = params[:date]
    visiting_ids = (params[:visiting_ids] || []).map(&:to_i)

    shared_office_ids = []
    ActiveRecord::Base.transaction do
      shared_office_ids = VisitingShareService.share_visitings(date, visiting_ids)
    end

    shared_office_names = Office.where(id: shared_office_ids).map(&:name).join(',')
    return if shared_office_ids.blank?

    render json: { message: "#{shared_office_names}に送迎を共有しました" }, status: :ok
  end

  def show; end

  def update_time
    # 1. VC/VPの登録（orderのみ）
    form = VisitingsRouteAssignmentForm.new(current_office, @visiting, params[:adjustment_time])
    if form.valid?
      form.register_customers_and_points(params[:route_points])

      if VisitingsCustomer.where(visiting_id: @visiting.id).present?
        # 2. 時間計算
        @visiting.reload
        @visiting.update!(is_optimized_route: false)
        departure_time = if params[:departure_time].present?
                           Time.zone.parse(params[:departure_time])
                         else
                           @visiting.departure_time
                         end
        @visiting.calculate_times(current_office, params[:adjustment_time], departure_time)
      end

      rendering_message_after_update(Visiting.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def car_index
    @cars = Car.all
  end

  def visitings_customer_index
    visitings_customers = VisitingsCustomer.where(date: visitings_customer_search_params[:date], is_requesting: false)
                                           .includes(:customer, :bookmark, customer: %i[requested_source image])
    @visitings_customers_except_self = visitings_customers.except_self_or_absent
                                                          .joins(:customer)

    if current_office.category == 'tourism'
      @visitings_customers_except_self = @visitings_customers_except_self.order(:schedule_time)
    end

    grouped = @visitings_customers_except_self.group_by(&:origin_office_id)
    mapped = grouped.map do |office_id, vcs|
      { office_id:, office_name: vcs.first.origin_office_name, visitings_customers: vcs }
    end
    @visitings_customers_except_self = mapped.sort_by { |group| group[:office_id] == current_office.id ? 0 : 1 }

    @visitings_customers_self = visitings_customers.where(is_self: true).group_by(&:customer_id).map do |_, vc|
      customer_name = vc.first.customer.name
      pick_up = vc.find { |v| v.soge_type == 'pick_up' }
      drop_off = vc.find { |v| v.soge_type == 'drop_off' }
      {
        customer_name:,
        self_pick_up: pick_up&.is_self || false,
        self_drop_off: drop_off&.is_self || false
      }
    end

    @visitings_customers_absent = visitings_customers
                                  .where(is_absent: true)
                                  .group_by { |v| [v.customer_id, v.date] }
                                  .map do |_, records|
      pick_up = records.find { |r| r.soge_type == 'pick_up' }
      {
        customer_name: pick_up.customer.name,
        absence_reason: pick_up.absence_reason
      }
    end
  end

  def new_data
    @visiting = Visiting.find_or_initialize_by(new_data_params)
    if @visiting.new_record?
      @visiting.save
      @visiting.base_points.create(point_id: @visiting.arrival_point_id, date: @visiting.date, arrival: true)
    end

    if params[:customers].present?
      # 1. VC/VPの登録（orderのみ）
      form = VisitingsRouteAssignmentForm.new(current_office, @visiting)
      if form.valid?
        form.register_customers_and_points(params[:customers])

        # 2. 時間計算
        @visiting.reload
        @visiting.calculate_times(current_office)
      end
    end

    render json: { id: @visiting.id }
  end

  def distance_route
    @visiting = Visiting.includes(
      customers: %i[bookmark customer],
      base_points: :bookmark,
      departure_bookmark: [],
      arrival_bookmark: []
    ).find(params[:id])

    waypoints = @visiting.prepare_waypoints
    departure_latlng = "#{@visiting.departure_bookmark.lat},#{@visiting.departure_bookmark.lng}"
    @distance_route = DistanceRouteOptimizer.sort_by_distance(departure_latlng, waypoints, current_office.category,
                                                              @visiting)

    save_distance_route
  end

  def can_driving_staff
    overlapping_ids = Visiting.overlapping_schedules(@visiting.date, @visiting.departure_time, @visiting.arrival_time)
                              .pluck(:driver_id, :tenjo_id)
                              .flatten
                              .compact
                              .uniq

    active_staffs = Staff.where(is_stopped: false)
    @can_driver = active_staffs.where(can_driver: true)
                               .where.not(id: overlapping_ids)
                               .joins(:can_driving_cars)
                               .where(can_driving_cars: { car_pattern_id: @visiting.car.car_pattern_id })
                               .to_a

    @can_driver.unshift(@visiting.driver) if @visiting.driver.present?
    @can_driver.uniq!

    @can_tenjo = active_staffs.where(can_helper: true).where.not(id: overlapping_ids).to_a
    @can_tenjo.unshift(@visiting.tenjo) if @visiting.tenjo.present?
    @can_tenjo.uniq!
  end

  def update_staffs
    if @visiting.update(staffs_update_params)
      rendering_message_after_update(Visiting.model_name.human)
    else
      render_model_errors(model: @visiting)
    end
  end

  def route
    # set_visitingで既に@visitingが設定されているが、関連を事前ロードするために再ロード
    @visiting = Visiting.includes(
      customers: %i[bookmark customer],
      base_points: :bookmark
    ).find(params[:id])
    departure_point = create_departure_point
    arrival_point = create_arrival_point
    waypoints = prepare_route_waypoints
    @route_points = [departure_point] + waypoints + [arrival_point]
  end

  def remove_all_customers
    visiting = Visiting.find_by(id: params[:id])

    unless visiting
      render json: { errors: ['指定された便が見つかりません'] }, status: :not_found
      return
    end

    visiting.customers.map(&:update_requested_source_nil_time)
    visiting.destroy!

    render json: { messages: ['便を削除しました'] }, status: :ok
  end

  def replicate
    service = VisitingReplicationService.new(
      target_date: replicate_params[:target_date],
      weeks_ago: replicate_params[:weeks_ago]
    )

    # 既存データのチェック
    existing_check = service.check_existing_data
    if existing_check[:has_existing]
      render json: { message: existing_check[:message] }, status: :conflict
      return
    end

    # 複製実行
    result = service.replicate
    if result[:success]
      render json: {
        message: result[:message],
        replicated_count: result[:replicated_count]
      }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :not_found
    end
  end

  def replicate_with_overwrite
    service = VisitingReplicationService.new(
      target_date: replicate_params[:target_date],
      weeks_ago: replicate_params[:weeks_ago]
    )

    result = service.replicate_with_overwrite
    if result[:success]
      render json: {
        message: result[:message],
        replicated_count: result[:replicated_count]
      }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :not_found
    end
  end

  def point_options
    render_point_options
  end

  def update_point
    if @visiting.update(bookmark_update_params)
      @visiting.reload
      @visiting.base_points.find_by(arrival: true).update(point_id: @visiting.arrival_point_id)
      rendering_message_after_update(Visiting.model_name.human)
    else
      render_model_errors(model: @visiting)
    end
  end

  private

  def set_visiting
    @visiting = Visiting.find(params[:id])
  end

  def visitings_search_params
    params.require(:visiting_search).permit(:date)
  end

  def visitings_customer_search_params
    params.require(:visiting_customer_search).permit(:date)
  end

  def new_data_params
    permitted = params.require(:new_data).permit(:date, :car_id, :bin_order)

    point_id = if permitted[:car_id].present?
                 car = Car.find(permitted[:car_id])
                 car.point_id || current_office.find_bookmark.bid
               else
                 current_office.find_bookmark.bid
               end

    permitted.merge(
      departure_point_id: point_id,
      arrival_point_id: point_id
    )
  end

  def staffs_update_params
    params.require(:staffs_update).permit(:driver_id, :tenjo_id)
  end

  def replicate_params
    if params[:replicate].present?
      params.require(:replicate).permit(:target_date, :weeks_ago)
    else
      params.permit(:target_date, :weeks_ago)
    end
  end

  def save_distance_route
    customer_updates = []
    point_updates = []

    @distance_route.each_with_index do |waypoint, index|
      order = index + 1
      (waypoint[:point_type] == 'VisitingsCustomer' ? customer_updates : point_updates) << { id: waypoint[:id],
                                                                                             order: }
    end

    [[customer_updates, VisitingsCustomer], [point_updates, VisitingsPoint]].each do |updates, model|
      updates.each do |u|
        model.find(u[:id]).update!(order: u[:order])
      end
    end

    @visiting.update!(is_optimized_route: true)
    @visiting.reload

    @visiting.calculate_times(current_office, 0, @visiting.departure_time)
  end

  def create_departure_point
    departure_bookmark = @visiting.departure_bookmark || current_office.find_bookmark
    {
      lat: departure_bookmark.lat.to_f,
      lng: departure_bookmark.lng.to_f,
      comment: "#{@visiting.formatted_departure_time} 出発",
      kinds: 'office',
      bookmark_id: departure_bookmark.bid
    }
  end

  def create_arrival_point
    arrival_bookmark = @visiting.arrival_bookmark || current_office.find_bookmark
    {
      lat: arrival_bookmark.lat.to_f,
      lng: arrival_bookmark.lng.to_f,
      comment: "#{@visiting.formatted_arrival_time} 到着",
      kinds: 'office',
      bookmark_id: arrival_bookmark.bid
    }
  end

  def prepare_route_waypoints
    @visiting.customers_and_points.map do |item|
      if item.instance_of?(VisitingsCustomer)
        vc_bookmark = item.bookmark
        {
          lat: vc_bookmark.lat.to_f,
          lng: vc_bookmark.lng.to_f,
          comment: "#{item.formatted_actual_time} #{item.customer.name}",
          kinds: 'user',
          bookmark_id: vc_bookmark.bid
        }
      elsif item.instance_of?(VisitingsPoint)
        vp_bookmark = item.bookmark
        {
          lat: vp_bookmark.lat.to_f,
          lng: vp_bookmark.lng.to_f,
          comment: "#{item.formatted_actual_time} #{vp_bookmark.address_label}",
          kinds: 'point',
          bookmark_id: vp_bookmark.bid
        }
      end
    end.compact
  end

  def bookmark_update_params
    params.require(:point_update).permit(:departure_point_id, :arrival_point_id)
  end
end
# rubocop:enable Metrics/ClassLength
