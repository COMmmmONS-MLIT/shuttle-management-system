# frozen_string_literal: true

class AllowRequestedCustomerForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  def initialize(requested_customer_ids)
    @requested_customer_ids = requested_customer_ids
    @office = Current.office
  end

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      @requested_customer_ids.each do |requested_customer_id|
        requested_customer = RequestedCustomer.find(requested_customer_id)
        next unless requested_customer

        process_requested_customer(requested_customer)
      end
    end
  end

  private

  def process_requested_customer(requested_customer)
    @office.office_requested_customers.find_by(requested_customer_id: requested_customer.id).update!(allowed: true)
    requested_customer.update!(allowing_office_id: @office.id)

    create_visitings_customer(requested_customer)
  end

  def create_visitings_customer(requested_customer)
    office = requested_customer.office
    cd = "#{office.name}-#{requested_customer.cd}"
    customer = Customer.create!(
      cd:,
      name: requested_customer.name,
      name_kana: requested_customer.name_kana,
      phone_number: requested_customer.phone_number,
      wc: requested_customer.wc,
      walker_size: requested_customer.walker_size,
      walker: requested_customer.walker,
      contract_status: 4, # 他事業所
      need_helper: requested_customer.need_helper,
      departure_time: '00:00',
      arrival_time: '00:00',
      start_time: '00:00',
      self_pick_up: false,
      self_drop_off: false,
      seat_assignment: 1,
      common_note: requested_customer.common_note,
      pick_up_note: requested_customer.pick_up_note,
      drop_off_note: requested_customer.drop_off_note,
      requested_customer_id: requested_customer.id
    )

    VisitingsCustomer.create!(
      soge_type: requested_customer.soge_type,
      date: requested_customer.date,
      customer_id: customer.id,
      schedule_time: requested_customer.schedule_time,
      start_time: requested_customer.start_time,
      point_id: requested_customer.point_id,
      base_point_id: requested_customer.base_point_id,
      is_self: false,
      is_requested: true,
      passenger_count: requested_customer.passenger_count,
      note: requested_customer.note
    )

    create_notification!(requested_customer, customer.name)
  end

  def create_notification!(requested_customer, customer_name)
    soge_type_label = requested_customer.pick_up? ? '迎え' : '送り'
    Notification.create!(
      office_id: requested_customer.office_id,
      message: "【#{@office.name}】から、#{customer_name}様（#{soge_type_label}）の送迎リクエストが許可されました",
      category: :allow
    )
  end
end
