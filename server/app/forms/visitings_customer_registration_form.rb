# frozen_string_literal: true

class VisitingsCustomerRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :customer_cd
  attribute :date
  attribute :departure_time
  attribute :arrival_time
  attribute :start_time
  attribute :self_pick_up
  attribute :self_drop_off
  attribute :is_absent
  attribute :absence_reason
  attribute :pick_up_point_id
  attribute :drop_off_point_id
  attribute :pick_up_base_point_id
  attribute :drop_off_base_point_id
  attribute :pick_up_request
  attribute :drop_off_request
  attribute :skip_visitings_customer_exists_validation, default: false

  validates :customer_cd, :date, :departure_time, :arrival_time, :start_time, presence: true
  validate :validate_customer_cd
  validate :validate_visitings_customer_exists
  validate :validate_time_range
  validate :mandatory_attributes_presence

  # visiting_customerは迎えと送りの2レコードが存在する
  def save
    @customer = Customer.find_by(cd: customer_cd, contract_status: %w[契約 体験])
    @office = @customer.office

    VisitingsCustomer.transaction do
      pick_up_visitings_customer_attributes = {
        customer_id: @customer.id,
        date:,
        soge_type: :pick_up,
        schedule_time: departure_time,
        start_time:,
        is_self: self_pick_up,
        point_id: pick_up_point_id || @customer.default_pick_up_point_id,
        is_absent:,
        absence_reason:,
        base_point_id: pick_up_base_point_id || @office.find_bookmark.bid,
        request: pick_up_request
      }
      drop_off_visitings_customer_attributes = {
        customer_id: @customer.id,
        date:,
        soge_type: :drop_off,
        schedule_time: arrival_time,
        is_self: self_drop_off,
        point_id: drop_off_point_id || @customer.default_drop_off_point_id,
        is_absent:,
        absence_reason:,
        base_point_id: drop_off_base_point_id || @office.find_bookmark.bid,
        request: drop_off_request
      }
      VisitingsCustomer.find_or_create_by!(
        customer_id: @customer.id,
        date:,
        soge_type: :pick_up
      ) do |vc|
        vc.assign_attributes(pick_up_visitings_customer_attributes)
      end
      VisitingsCustomer.find_or_create_by!(
        customer_id: @customer.id,
        date:,
        soge_type: :drop_off
      ) do |vc|
        vc.assign_attributes(drop_off_visitings_customer_attributes)
      end
    end
  end

  private

  def mandatory_attributes_presence
    errors.add('visitings_customer.cd', I18n.t('errors.messages.blank')) if customer_cd.blank?
    errors.add('visitings_customer.date', I18n.t('errors.messages.blank')) if date.blank?
    errors.add('visitings_customer.departure_time', I18n.t('errors.messages.blank')) if departure_time.blank?
    errors.add('visitings_customer.arrival_time', I18n.t('errors.messages.blank')) if arrival_time.blank?
    errors.add('visitings_customer.start_time', I18n.t('errors.messages.blank')) if start_time.blank?
  end

  def validate_customer_cd
    return if customer_cd.blank?

    customer = Customer.find_by(cd: customer_cd)
    if customer.blank?
      errors.add('visitings_customer.cd', I18n.t('errors.messages.invalid_customer_cd'))
      return
    end

    return if customer.contract_status.in?(%w[契約 体験])

    errors.add('visitings_customer.cd', I18n.t('errors.messages.customer_contract_status_stopped'))
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

  def validate_visitings_customer_exists
    return if customer_cd.blank?
    return if skip_visitings_customer_exists_validation

    customer = Customer.find_by(cd: customer_cd)
    return if customer.blank?

    vc = VisitingsCustomer.find_by(customer_id: customer.id, date:)
    errors.add('visitings_customer.date', "#{date.to_date.strftime('%Y/%m/%d')}にはすでに送迎予定があります") if vc.present?
  end
end
