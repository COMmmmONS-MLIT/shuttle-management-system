# frozen_string_literal: true

class EducationVisitingsCustomerRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :customer_cd
  attribute :date
  attribute :soge_type
  attribute :schedule_time
  attribute :point_id
  attribute :base_point_id
  attribute :skip_visitings_customer_exists_validation, default: false

  validates :customer_cd, :date, :soge_type, :schedule_time, presence: true
  validate :validate_customer_cd
  validate :validate_visitings_customer_exists

  def create
    customer = Customer.find_by(cd: customer_cd)

    point_id = if soge_type == 'pick_up'
                 customer.default_pick_up_point_id
               else
                 customer.default_drop_off_point_id
               end
    VisitingsCustomer.transaction do
      visitings_customer_attributes = {
        customer_id: customer.id,
        date:,
        soge_type:,
        schedule_time:,
        point_id:,
        base_point_id:
      }
      VisitingsCustomer.find_or_create_by!(
        customer_id: customer.id,
        date:,
        soge_type:
      ) do |vc|
        vc.assign_attributes(visitings_customer_attributes)
      end
    end
  end

  def update(visitings_customer)
    VisitingsCustomer.transaction do
      visitings_customer_attributes = {
        date:,
        soge_type:,
        schedule_time:,
        point_id:,
        base_point_id:
      }
      visitings_customer.update!(visitings_customer_attributes)

      visiting = visitings_customer.visiting
      if visiting.present?
        route_points = visiting.customers_and_points.map do |point|
          {
            id: point.id,
            order: point.order,
            point_type: point.class.name
          }
        end
        form = VisitingsRouteAssignmentForm.new(Current.office, visiting)
        form.register_customers_and_points(route_points) if form.valid?
        if Visiting.exists?(visiting.id)
          visiting = Visiting.find(visiting.id)
          visiting.calculate_times(Current.office, 0, visiting.departure_time)
          visiting.update!(is_optimized_route: false)
        end
      end
    end
  end

  private

  def validate_customer_cd
    return if customer_cd.blank?

    customer = Customer.find_by(cd: customer_cd)
    return if customer.present?

    errors.add(:customer_cd, I18n.t('errors.messages.invalid_customer_cd'))
  end

  def validate_visitings_customer_exists
    return if customer_cd.blank? || date.blank?
    return if skip_visitings_customer_exists_validation

    customer = Customer.find_by(cd: customer_cd)
    return if customer.blank?

    vc = VisitingsCustomer.find_by(customer_id: customer.id, date:, soge_type:)
    errors.add(:date, "#{date.to_date.strftime('%Y/%m/%d')}にはすでに送迎予定があります") if vc.present?
  end
end
