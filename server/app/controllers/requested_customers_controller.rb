# frozen_string_literal: true

class RequestedCustomersController < ApplicationController
  before_action :set_requested_customer, only: %i[cancel_request_after_approval approve_cancellation]

  def index
    dates = build_date_range

    @requested_customers = current_office.requested_customers
                                         .is_not_allowed
                                         .where(date: dates)
                                         .order(:date, :schedule_time)
    @allowed_requested_customers =
      current_office.requested_customers.where(allowing_office_id: current_office.id, date: dates).order(
        :date, :schedule_time
      )

    @requesting_customers = current_office.requesting_customers.where(date: dates).order(:date, :schedule_time)
  end

  def update_allowed
    requested_customer_ids = params[:requested_customer_ids].compact
    form = AllowRequestedCustomerForm.new(requested_customer_ids)
    count = requested_customer_ids.length
    if form.save
      render json: { message: "#{count}件の委託を承認しました" }
    else
      render_model_errors(model: form)
    end
  end

  def cancel
    customer_ids = params[:customer_ids]
    requested_customers = current_office.requesting_customers.where(id: customer_ids)
    count = requested_customers.count
    after_approval_count = 0

    ActiveRecord::Base.transaction do
      requested_customers.each do |requested_customer|
        if requested_customer.allowing_office_id.present?
          cancel_request(requested_customer)
          after_approval_count += 1
        else
          VisitingsCustomer.find_by(
            customer_id: requested_customer.source_id,
            date: requested_customer.date,
            soge_type: requested_customer.soge_type
          ).update!(is_requesting: false)

          target_office = requested_customer.request_target_offices.first
          source_name = requested_customer.name
          soge_type_label = requested_customer.pick_up? ? '迎え' : '送り'
          requested_customer.office_requested_customers.map(&:destroy!)
          requested_customer.destroy!

          Notification.create(
            message: "【#{current_office.name}】から、#{source_name}様（#{soge_type_label}）の送迎リクエストが取消されました",
            category: :cancel,
            office_id: target_office.id
          )
        end
      end
    end

    message = if after_approval_count.positive?
                "#{count}件のリクエストを取消しました。(内#{after_approval_count}件のキャンセルリクエストを送信しました)"
              else
                "#{count}件のリクエストを取消しました"
              end
    render json: { message: }
  rescue ActiveRecord::RecordNotDestroyed
    render json: { error: 'リクエストの取消しが失敗しました' }, status: :unprocessable_entity
  end

  def cancel_request_after_approval
    cancel_request(@requested_customer)
    render json: { message: 'キャンセルリクエストを送信しました' }
  rescue StandardError
    render json: { error: 'キャンセルリクエストの送信に失敗しました' }, status: :unprocessable_entity
  end

  def approve_cancellation
    service = RequestedCustomerCancellationService.new(@requested_customer, current_office)
    service.approve_cancellation

    render json: { message: 'キャンセルリクエストを承認しました' }
  rescue StandardError
    render json: { error: 'キャンセルリクエストの承認に失敗しました' }, status: :unprocessable_entity
  end

  def reject_approve
    requested_customer_id = params[:requested_customer_id]
    requested_customer = RequestedCustomer.find(requested_customer_id)

    ActiveRecord::Base.transaction do
      source_vc = VisitingsCustomer.unscoped.find_by(id: requested_customer.source_vc_id)
      source_vc&.update!(is_requesting: false)

      requested_customer.office_requested_customers.map(&:destroy!)

      soge_type_label = requested_customer.pick_up? ? '迎え' : '送り'
      date_label = requested_customer.date.strftime('%m/%d')
      customer_name = requested_customer.name
      source_office_id = requested_customer.office_id

      requested_customer.destroy!

      Notification.unscoped.create!(
        message: "【#{current_office.name}】に、#{customer_name}様(#{date_label}・#{soge_type_label})の送迎リクエストが却下されました",
        category: :rejected,
        office_id: source_office_id,
        metadata: { requested_customer_id: }
      )
    end

    render json: { message: 'リクエストを却下しました' }
  rescue StandardError
    render json: { error: 'リクエストの却下に失敗しました' }, status: :unprocessable_entity
  end

  private

  def set_requested_customer
    case action_name
    when 'cancel_request_after_approval'
      @requested_customer = current_office.requesting_customers
                                          .where.not(allowing_office_id: nil)
                                          .find(params[:id])
    when 'approve_cancellation'
      @requested_customer = current_office.allowing_requested_customers
                                          .find(params[:id])
    end
  end

  def build_date_range
    if params[:start_date].present? && params[:end_date].present?
      [params[:start_date].to_date..params[:end_date].to_date]
    elsif params[:date].present?
      if params[:only_one_day] == 'true'
        [params[:date].to_date]
      else
        [params[:date].to_date...(params[:date].to_date + 1.month)]
      end
    else
      [Time.zone.today...(Time.zone.today + 1.month)]
    end
  end

  def cancel_request(requested_customer)
    ActiveRecord::Base.transaction do
      requested_customer.update!(is_cancellation_requested: true)

      soge_type_label = requested_customer.pick_up? ? '迎え' : '送り'
      date_label = requested_customer.date.strftime('%m/%d')
      message = "【#{current_office.name}】から、" \
                "#{requested_customer.name}様(#{date_label}・#{soge_type_label})のキャンセルリクエストがありました"
      Notification.create!(
        message:,
        category: :cancel_request_after_approval,
        office_id: requested_customer.allowing_office_id,
        metadata: { requested_customer_id: requested_customer.id, customer_name: requested_customer.name,
                    soge_type: requested_customer.soge_type, date: requested_customer.date.strftime('%Y/%m/%d') }
      )
    end
  end
end
