# frozen_string_literal: true

class Customers::MergedatasController < Customers::ApplicationController
  before_action :set_customer, only: %i[index]

  def index
    @mergedatas = Area::Mergedata.where(
      利用者番号: @customer.cd,
      日付: search_params[:date]
    )

    # N+1クエリを避けるためにbindatadをバッチロード
    @bindatad_lookup = load_bindatad_lookup(@mergedatas)
  end

  private

  def set_customer
    @customer = current_user.customer
    render json: { messages: ['Customer not found'] }, status: :not_found if @customer.nil?
  end

  def search_params
    params.require(:search_params).permit(:date)
  end

  def load_bindatad_lookup(mergedatas)
    return {} if mergedatas.empty?

    bindatads = fetch_bindatads_by_mergedatas(mergedatas)
    build_bindatad_lookup(bindatads)
  end

  def fetch_bindatads_by_mergedatas(mergedatas)
    query = nil
    mergedatas.each do |mergedata|
      condition = build_bindatad_condition(mergedata)
      query = query ? query.or(condition) : condition
    end
    query
  end

  def build_bindatad_condition(mergedata)
    Area::Bindatad.where(
      日付: mergedata.日付,
      事業所cd: mergedata.事業所cd,
      利用者番号: mergedata.利用者番号,
      carId: mergedata.carId,
      出発時間: mergedata.出発時間,
      送迎区分: mergedata.送迎区分
    )
  end

  def build_bindatad_lookup(bindatads)
    bindatads.index_by do |bindatad|
      [
        bindatad.日付,
        bindatad.事業所cd,
        bindatad.利用者番号,
        bindatad.carId,
        bindatad.出発時間,
        bindatad.送迎区分
      ]
    end
  end
end
