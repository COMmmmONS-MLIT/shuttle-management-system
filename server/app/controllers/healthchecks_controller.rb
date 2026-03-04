# frozen_string_literal: true

class HealthchecksController < ActionController::API
  def show
    Office.first
    head :ok
  rescue StandardError
    head :internal_server_error
  end
end
