# frozen_string_literal: true

class Tourism::VisitingsController < VisitingsController
  def distance_route
    @visiting = Visiting.includes(
      customers: %i[bookmark customer],
      base_points: :bookmark,
      departure_bookmark: [],
      arrival_bookmark: []
    ).find(params[:id])

    TourismDistanceRouteOptimizer.new(@visiting, current_office).optimize
  end

  def update_time
    # 1. VPの登録（orderのみ）
    form = TourismVisitingsRouteAssignmentForm.new(current_office, @visiting)

    if form.valid?
      form.register_customers_and_points(params[:route_points], params[:customer_ids])

      if VisitingsCustomer.where(visiting_id: @visiting.id).present?
        # 2. 時間計算
        @visiting.reload
        @visiting.for_points_calculate_times(params[:adjustment_time])
      end

      rendering_message_after_update(Visiting.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def new_data
    @visiting = Visiting.find_or_initialize_by(new_data_params)
    if @visiting.new_record?
      @visiting.save
      @visiting.base_points.create(point_id: @visiting.arrival_point_id, date: @visiting.date, arrival: true)
    end

    if params[:customer_ids].present?
      # 1. VC/VPの登録（orderのみ）
      form = TourismVisitingsRouteAssignmentForm.new(current_office, @visiting)
      if form.valid?
        form.register_customers_and_points([], params[:customer_ids])

        # 2. 時間計算
        @visiting.reload
        @visiting.for_points_calculate_times
      end
    end

    render json: { id: @visiting.id }
  end
end
