# frozen_string_literal: true

class PostCodesController < ApplicationController
  def show
    post_code = Area::PostCode.find_by(postcode: params[:id])

    if post_code.present?
      render json: { address: post_code.city_name }
    else
      render json: { error: '住所が見つかりません' }, status: :not_found
    end
  end
end
