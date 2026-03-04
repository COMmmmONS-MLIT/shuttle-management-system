# frozen_string_literal: true

class VisitingsCustomerRequestForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :visitings_customer_ids

  def initialize(visitings_customer_ids, accept_office_id, soge_type = nil)
    @office = Current.office
    @visitings_customer_ids = visitings_customer_ids
    @accept_office_id = accept_office_id
    @soge_type = soge_type
    @count = 0
  end

  def save
    ActiveRecord::Base.transaction do
      if @office.category == 'welfare'
        process_welfare_visitings_customers
      else
        process_tourism_visitings_customers
      end
    end
    @count
  end

  private

  def process_welfare_visitings_customers
    @visitings_customer_ids.each do |visitings_customer_id|
      initial_vc = VisitingsCustomer.find(visitings_customer_id)
      next unless initial_vc

      pick_up_vc = VisitingsCustomer.find_by(
        date: initial_vc.date,
        customer_id: initial_vc.customer_id,
        soge_type: :pick_up
      )
      drop_off_vc = VisitingsCustomer.find_by(
        date: initial_vc.date,
        customer_id: initial_vc.customer_id,
        soge_type: :drop_off
      )

      insert_requested_customer(pick_up_vc) if should_process_pick_up? && pick_up_vc.present? && pick_up_vc.can_request?
      if should_process_drop_off? && drop_off_vc.present? && drop_off_vc.can_request?
        insert_requested_customer(drop_off_vc)
      end
    end
  end

  def should_process_pick_up?
    @soge_type == 'pick_up' || @soge_type == 'both'
  end

  def should_process_drop_off?
    @soge_type == 'drop_off' || @soge_type == 'both'
  end

  def process_tourism_visitings_customers
    @visitings_customer_ids.each do |visitings_customer_id|
      visitings_customer = VisitingsCustomer.find(visitings_customer_id)
      next unless visitings_customer.can_request?

      insert_requested_customer(visitings_customer)
    end
  end

  def insert_requested_customer(visitings_customer)
    new_data = {
      office_id: @office.id,
      source_id: visitings_customer.customer.id,
      source_vc_id: visitings_customer.id,
      date: visitings_customer.date,
      soge_type: visitings_customer.soge_type,
      cd: visitings_customer.customer.cd,
      name: visitings_customer.customer.name,
      name_kana: visitings_customer.customer.name_kana,
      phone_number: visitings_customer.customer.phone_number,
      start_time: visitings_customer.start_time,
      schedule_time: visitings_customer.schedule_time,
      point_id: visitings_customer.point_id,
      base_point_id: visitings_customer.base_point_id,
      passenger_count: visitings_customer.passenger_count,
      need_helper: visitings_customer.customer.need_helper,
      walker: visitings_customer.customer.walker,
      walker_size: visitings_customer.customer.walker_size,
      wc: visitings_customer.customer.wc,
      note: visitings_customer.note
    }

    customer = RequestedCustomer.find_by(source_id: visitings_customer.customer.id, date: visitings_customer.date,
                                         soge_type: visitings_customer.soge_type)

    return if customer.present?

    customer = RequestedCustomer.create!(new_data)
    OfficeRequestedCustomer.find_or_create_by!(office_id: @accept_office_id, requested_customer_id: customer.id)
    visitings_customer.update!(is_requesting: true)
    create_notification!(visitings_customer.customer.name, visitings_customer.soge_type)

    @count += 1
  end

  def create_notification!(customer_name, soge_type)
    soge_type_label = soge_type == 'pick_up' ? '迎え' : '送り'
    Notification.create!(
      office_id: @accept_office_id,
      message: "【#{@office.name}】から、#{customer_name}様（#{soge_type_label}）の送迎リクエストがありました",
      category: :request
    )
  end
end
