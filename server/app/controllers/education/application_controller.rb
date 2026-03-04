# frozen_string_literal: true

class Education::ApplicationController < ApplicationController
  before_action :ensure_education_office

  private

  def ensure_education_office
    return if current_office.education?

    render json: { error: 'Education office access required' }, status: :forbidden
  end
end
