# frozen_string_literal: true

class DataUploadsController < ApplicationController
  def create
    target_date = params[:date] || Date.current.to_s

    unless valid_date_format?(target_date)
      render_validation_error(:date, '日付はyyyy-mm-dd形式で入力してください')
      return
    end

    uploader = DataUploader.new(current_office.id, target_date)
    uploader.upload_data
    render json: { messages: ['データアップロードが完了しました'] }, status: :ok
  rescue StandardError => e
    Rails.logger.error "Data upload failed: #{e.message}"
    render_base_error('データアップロードに失敗しました')
  end

  private

  def valid_date_format?(date_string)
    return false if date_string.blank?

    return false unless date_string.match?(/^\d{4}-\d{2}-\d{2}$/)

    Date.parse(date_string)
    true
  rescue Date::Error
    false
  end
end
