# frozen_string_literal: true

class VisitingsCustomerUpdateForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :id
  attribute :customer_cd
  attribute :date
  attribute :departure_time
  attribute :arrival_time
  attribute :start_time
  attribute :self_pick_up
  attribute :self_drop_off
  attribute :is_absent
  attribute :absence_reason
  attribute :pick_up_base_point_id
  attribute :drop_off_base_point_id
  attribute :pick_up_point_id
  attribute :drop_off_point_id
  attribute :pick_up_request
  attribute :drop_off_request

  validates :id, :customer_cd, :date, :departure_time, :arrival_time, :start_time, presence: true
  validate :validate_customer_cd
  validate :validate_pick_up_exists
  validate :validate_drop_off_exists
  validate :validate_time_range

  def initialize(params)
    super
    @office = Current.office
    @customer = Customer.find_by(cd: customer_cd)
  end

  def save
    return false unless valid?

    VisitingsCustomer.transaction do
      p_point_change = pick_up_point_id != pick_up.point_id || pick_up_base_point_id != pick_up.base_point_id
      d_point_change = drop_off_point_id != drop_off.point_id || drop_off_base_point_id != drop_off.base_point_id
      pick_up_visiting_id = pick_up.visiting_id
      drop_off_visiting_id = drop_off.visiting_id
      pick_up.update!(
        visiting_id: is_absent || self_pick_up ? nil : pick_up_visiting_id,
        customer_id: @customer.id,
        date:,
        schedule_time: departure_time,
        start_time:,
        is_self: self_pick_up,
        point_id: pick_up_point_id,
        base_point_id: pick_up_base_point_id,
        is_absent:,
        absence_reason:,
        request: pick_up_request
      )

      drop_off.update!(
        visiting_id: is_absent || self_drop_off ? nil : drop_off_visiting_id,
        customer_id: @customer.id,
        date:,
        schedule_time: arrival_time,
        is_self: self_drop_off,
        point_id: drop_off_point_id,
        base_point_id: drop_off_base_point_id,
        is_absent:,
        absence_reason:,
        request: drop_off_request
      )

      if pick_up_visiting_id.present? && (self_pick_up || is_absent || p_point_change)
        update_visiting(pick_up_visiting_id)
      end
      if drop_off_visiting_id.present? && (self_drop_off || is_absent || d_point_change)
        update_visiting(drop_off_visiting_id)
      end
    end
  end

  private

  def update_visiting(visiting_id)
    visiting = Visiting.find(visiting_id)
    route_points = visiting.customers_and_points.map do |point|
      {
        id: point.id,
        order: point.order,
        point_type: point.class.name
      }
    end
    form = VisitingsRouteAssignmentForm.new(Current.office, visiting)
    form.register_customers_and_points(route_points) if form.valid?

    return unless Visiting.exists?(visiting_id)

    visiting.reload
    visiting.calculate_times(Current.office, 0, visiting.departure_time)
    visiting.update!(is_optimized_route: false)
  end

  def pick_up
    @pick_up ||= VisitingsCustomer.find_by(id:, soge_type: :pick_up)
  end

  def drop_off
    return nil unless pick_up

    @drop_off ||= VisitingsCustomer.find_by(
      customer_id: pick_up.customer_id,
      date: pick_up.date,
      soge_type: :drop_off
    )
  end

  def validate_customer_cd
    return if customer_cd.blank?

    customer = Customer.find_by(cd: customer_cd)
    return if customer.present?

    errors.add(:customer_cd, '指定されたcustomer_cdが存在しません')
  end

  def validate_pick_up_exists
    errors.add(:id, 'に該当する送迎データ（迎え）が存在しません') unless pick_up
  end

  def validate_drop_off_exists
    errors.add(:base, '該当する送迎データ（送り）が存在しません') unless drop_off
  end

  def validate_time_range
    return if departure_time.blank? || arrival_time.blank? || start_time.blank?

    if departure_time > arrival_time
      errors.add('visitings_customer.departure_time', I18n.t('errors.messages.departure_time_before_arrival_time'))
    end

    if start_time > arrival_time
      errors.add('visitings_customer.start_time', I18n.t('errors.messages.start_time_before_arrival_time'))
    end

    return unless departure_time > start_time

    errors.add('visitings_customer.departure_time', I18n.t('errors.messages.departure_time_before_start_time'))
  end
end
