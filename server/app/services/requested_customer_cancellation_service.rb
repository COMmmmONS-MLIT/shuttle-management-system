# frozen_string_literal: true

class RequestedCustomerCancellationService
  def initialize(requested_customer, office)
    @requested_customer = requested_customer
    @office = office
  end

  def approve_cancellation
    ActiveRecord::Base.transaction do
      update_source_requesting_status
      target_visiting = delete_target_customer_and_vc
      delete_requested_customer
      recalculate_and_reshare_visiting(target_visiting)
      sync_mergedata_for_tourism
      create_cancellation_notification
    end
  end

  private

  def update_source_requesting_status
    source_vc = VisitingsCustomer.unscoped.find_by(id: @requested_customer.source_vc_id)
    source_vc&.update!(is_requesting: false)
  end

  def delete_target_customer_and_vc
    customer = Customer.find_by(requested_customer_id: @requested_customer.id)
    return nil unless customer

    target_vc = VisitingsCustomer.find_by(customer_id: customer.id)
    target_visiting = target_vc&.visiting
    target_vc&.destroy!
    customer.destroy!
    target_visiting
  end

  def delete_requested_customer
    @requested_customer.office_requested_customers.each(&:destroy!)
    @requested_customer.destroy!
  end

  def recalculate_and_reshare_visiting(target_visiting)
    return unless target_visiting

    target_visiting.reload
    target_visiting.date
    visiting_id = target_visiting.id

    is_already_shared = Visiting.unscoped.exists?(source_visiting_id: visiting_id, is_shared: true)

    if target_visiting.customers.count.positive?
      cleanup_unused_visiting_points(target_visiting)
      target_visiting.reload
      recalculate_visiting_times(target_visiting)
      VisitingShareService.reshare_visiting(visiting_id) if is_already_shared
    else
      target_visiting.base_points.find_each(&:destroy!)
      target_visiting.destroy!
      VisitingShareService.delete_shared_visiting_by_source(visiting_id) if is_already_shared
    end
  end

  def cleanup_unused_visiting_points(target_visiting)
    used_point_ids = if @office.tourism?
                       target_visiting.customers.pluck(:point_id, :base_point_id).flatten.compact.uniq
                     else
                       target_visiting.customers.pluck(:base_point_id).compact.uniq
                     end
    target_visiting.base_points.where(arrival: false)
                   .where.not(point_id: used_point_ids)
                   .find_each(&:destroy!)
  end

  def recalculate_visiting_times(target_visiting)
    if @office.tourism?
      target_visiting.for_points_calculate_times(0)
    else
      target_visiting.update!(is_optimized_route: false)
      target_visiting.calculate_times(@office, 0, target_visiting.departure_time)
    end
  end

  def sync_mergedata_for_tourism
    return unless @office.tourism?
    return unless Area::Mergedata.exists?(日付: @requested_customer.date, 事業所cd: @office.cd)

    uploader = DataUploader.new(@office.id, @requested_customer.date)
    uploader.upload_data
  end

  def create_cancellation_notification
    soge_type_label = @requested_customer.pick_up? ? '迎え' : '送り'
    date_label = @requested_customer.date.strftime('%m/%d')
    message = "【#{@office.name}】が、" \
              "#{@requested_customer.name}様(#{date_label}・#{soge_type_label})のキャンセルリクエストを承認しました"
    Notification.unscoped.create!(
      message:,
      category: :cancel_after_approval,
      office_id: @requested_customer.office_id,
      metadata: { requested_customer_id: @requested_customer.id }
    )
  end
end
