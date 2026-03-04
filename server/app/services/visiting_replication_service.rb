# frozen_string_literal: true

class VisitingReplicationService
  attr_reader :target_date, :weeks_ago, :source_date, :errors

  def initialize(target_date:, weeks_ago:)
    @target_date = Date.parse(target_date)
    @weeks_ago = weeks_ago.to_i
    @source_date = @target_date - (@weeks_ago * 7)
    @errors = []
  end

  def replicate
    return validation_error if validation_failed?

    source_visitings = fetch_source_visitings
    return source_not_found_error if source_visitings.empty?

    execute_replication(source_visitings)
  end

  def replicate_with_overwrite
    return validation_error if validation_failed?

    delete_existing_data
    source_visitings = fetch_source_visitings
    return source_not_found_error if source_visitings.empty?

    execute_replication(source_visitings)
  end

  def check_existing_data
    existing_visitings = Visiting.where(date: @target_date)
    return { has_existing: false } unless existing_visitings.exists?

    {
      has_existing: true,
      message: "指定された日付（#{@target_date.strftime('%Y/%m/%d')}）に既にデータが存在します。上書きしますか？"
    }
  end

  private

  def validation_failed?
    @target_date.nil? || @weeks_ago <= 0
  end

  def validation_error
    @errors << '無効なパラメータです'
    { success: false, errors: @errors }
  end

  def delete_existing_data
    VisitingsCustomer.where(date: @target_date).update(visiting_id: nil)
    VisitingsPoint.where(date: @target_date).destroy_all
    Visiting.where(date: @target_date).destroy_all
  end

  def fetch_source_visitings
    Visiting.includes(:customers, :base_points).where(date: @source_date)
  end

  def source_not_found_error
    @errors << "#{@weeks_ago}週間前（#{@source_date.strftime('%Y/%m/%d')}）のデータが見つかりません"
    { success: false, errors: @errors }
  end

  def execute_replication(source_visitings)
    replicate_visitings_data(source_visitings)
    {
      success: true,
      message: "#{@weeks_ago}週間前のデータを#{@target_date.strftime('%Y/%m/%d')}に複製しました",
      replicated_count: source_visitings.count
    }
  rescue StandardError => e
    Rails.logger.error "複製処理中にエラーが発生しました: #{e.message}"
    @errors << '複製処理中にエラーが発生しました'
    { success: false, errors: @errors }
  end

  # rubocop:disable Metrics/MethodLength
  def replicate_visitings_data(source_visitings)
    ActiveRecord::Base.transaction do
      source_visitings.each do |source_visiting|
        new_visiting = Visiting.create!(
          office_id: source_visiting.office_id,
          date: @target_date,
          car_id: source_visiting.car_id,
          bin_order: source_visiting.bin_order,
          driver_id: source_visiting.driver_id,
          tenjo_id: source_visiting.tenjo_id,
          departure_time: source_visiting.departure_time,
          arrival_time: source_visiting.arrival_time,
          departure_point_id: source_visiting.departure_point_id,
          arrival_point_id: source_visiting.arrival_point_id,
          source_visiting_id: source_visiting.source_visiting_id,
          source_office_id: source_visiting.source_office_id,
          is_shared: source_visiting.is_shared,
          shared_car_name: source_visiting.shared_car_name,
          shared_driver_name: source_visiting.shared_driver_name,
          shared_tenjo_name: source_visiting.shared_tenjo_name
        )

        replicated_customer_ids = []

        source_visiting.customers.except_self_or_absent.each do |source_customer|
          existing_customer = VisitingsCustomer.except_self_or_absent.find_by(
            date: @target_date,
            customer_id: source_customer.customer_id,
            soge_type: source_customer.soge_type
          )

          next unless existing_customer

          existing_customer.update!(
            visiting_id: new_visiting.id,
            actual_time: source_customer.actual_time,
            order: source_customer.order
          )

          replicated_customer_ids << existing_customer.customer_id
        end

        source_visiting.base_points.each do |source_point|
          if source_point.arrival?
            VisitingsPoint.create!(
              office_id: source_point.office_id,
              visiting_id: new_visiting.id,
              point_id: source_point.point_id,
              date: @target_date,
              actual_time: source_point.actual_time,
              arrival: source_point.arrival,
              order: source_point.order,
              soge_type: source_point.soge_type,
              note: source_point.note
            )
            next
          end

          corresponding_customer = source_visiting.customers.except_self_or_absent.find do |customer|
            customer.base_point_id == source_point.point_id &&
              replicated_customer_ids.include?(customer.customer_id)
          end

          next unless corresponding_customer

          VisitingsPoint.create!(
            office_id: source_point.office_id,
            visiting_id: new_visiting.id,
            point_id: source_point.point_id,
            date: @target_date,
            actual_time: source_point.actual_time,
            arrival: source_point.arrival,
            order: source_point.order,
            soge_type: source_point.soge_type,
            note: source_point.note
          )
        end
      end
    end
  end
  # rubocop:enable Metrics/MethodLength
end
