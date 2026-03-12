# frozen_string_literal: true

class PointsController < ApplicationController
  include Searchable
  before_action :set_bookmark, only: %i[show update]

  def index
    accept_office_cds = current_office.accept_offices.pluck(:cd)
    current_office_bookmarks = Area::Bookmark.where(office_code: current_office.cd)
    accept_office_bookmarks = Area::Bookmark.where(office_code: accept_office_cds, is_invalid: 0, is_public: 1)

    bookmarks = if current_office.tourism?
                  current_office_bookmarks.or(accept_office_bookmarks)
                else
                  current_office_bookmarks
                end
    @bookmarks = Area::Bookmark.where(reference_id: ['', 'A001'])
                               .merge(bookmarks)
                               .includes(:car_restriction)
                               .ransack(
                                 address_label_cont: search_params[:address_label],
                                 address_cont: search_params[:address],
                                 car_restriction_id_eq: search_params[:car_restriction_id]
                               ).result
                               .order(order_context(search_params[:order], {}, nil))
                               .page(search_params[:page])
                               .per(search_params[:per])
  end

  def show; end

  def create
    @bookmark = Area::Bookmark.new(bookmark_params)
    @bookmark.office_code = current_office.cd
    @bookmark.reference_id = ''

    if @bookmark.save
      rendering_message_after_create('地点')
    else
      render_model_errors(model: @bookmark)
    end
  end

  def update
    if @bookmark.update(bookmark_params)
      rendering_message_after_update('地点')
    else
      render_model_errors(model: @bookmark)
    end
  end

  private

  def set_bookmark
    @bookmark = Area::Bookmark.find_by(bid: params[:id])
    raise ActiveRecord::RecordNotFound if @bookmark.nil?
  end

  def search_params
    params.require(:search_params).permit(
      :address_label,
      :address,
      :car_restriction_id,
      :page,
      :per,
      :order
    )
  end

  def bookmark_params
    params.require(:point).permit(
      :address_label, :address, :postal_code, :room_name,
      :phone_number, :lat, :lng, :wait_time, :car_restriction_id,
      :is_invalid, :is_public
    )
  end
end
