# frozen_string_literal: true

class Tourism::ApplicationController < ApplicationController
  before_action :ensure_tourism_office

  private

  def ensure_tourism_office
    return if current_office.tourism?

    render json: { error: 'Tourism office access required' }, status: :forbidden
  end
end
