# frozen_string_literal: true

class CarsController < ApplicationController
  include BookmarkOptions
  include Searchable
  before_action :set_car, only: %i[show update]

  def index
    @cars = Car.ransack(
      number_cont: search_params[:number],
      name_cont: search_params[:name],
      car_pattern_name_cont: search_params[:car_pattern_name]
    ).result
               .order(order_context(search_params[:order], {}, nil))
               .page(search_params[:page])
               .per(search_params[:per])
  end

  def show; end

  def locations
    @cars_with_locations = CarLocationService.new(
      office: current_office,
      car_id_param: params[:id],
      date_param: params[:date]
    ).find_cars_with_locations
  rescue ArgumentError => e
    render json: { messages: [e.message] }, status: :bad_request
  end

  def create
    form = CarRegistrationForm.new(car_params)
    if form.valid?
      form.save
      rendering_message_after_create(Car.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def update
    form = CarRegistrationForm.new(car_params)
    if form.valid?
      form.update(@car)
      rendering_message_after_update(Car.model_name.human)
    else
      render_model_errors(model: form)
    end
  end

  def point_options
    office_cds = current_office.request_offices.pluck(:cd) + [current_office.cd]

    bookmarks = Area::Bookmark.where(office_code: office_cds)
                              .where(reference_id: ['A001'])

    render_point_options(bookmarks:)
  end

  private

  def set_car
    @car = Car.find(params[:id])
  end

  def car_params
    params.require(:car).permit(
      :id,
      :name,
      :number,
      :stopped,
      :max_seat,
      :max_wc_seat,
      :point_id,
      pattern: [
        :id,
        :name,
        :car_type,
        { restriction_ids: [] },
        { wc_numbers: %i[id wc_seat normal_seat cargo_volume] }
      ]
    )
  end

  def search_params
    params.require(:search_params).permit(
      :id,
      :name,
      :number,
      :car_pattern_name,
      :page,
      :per,
      :order
    )
  end
end
