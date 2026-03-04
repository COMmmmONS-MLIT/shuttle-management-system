# frozen_string_literal: true

class VisitingsCustomerBulkRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :customer_cd
  attribute :start_date
  attribute :end_date
  attribute :pick_up_base_point_id
  attribute :drop_off_base_point_id

  validates :start_date, :end_date, presence: true
  validate :mandatory_attributes_presence
  validate :validate_customer_cd
  validate :validate_date_range
  validate :validate_stopped_at_for_specific_customer

  def initialize(attributes = {})
    super
    @office = Current.office
  end

  # rubocop:disable Metrics/MethodLength
  def save
    # 指定されたcustomer_cdが存在しない場合は全てのcustomerを対象とする
    @customers = if customer_cd.present?
                   [Customer.find_by(cd: customer_cd)]
                 else
                   Customer.where(contract_status: %w[契約 体験])
                 end

    return if @customers.blank?

    s_date = Date.parse(start_date)
    e_date = Date.parse(end_date)
    VisitingsCustomer.transaction do
      @customers.each do |customer|
        customer.active_days_of_week.each do |day_of_week|
          target_dates = (s_date..e_date).select do |date|
            date.public_send("#{day_of_week}?")
          end

          # stopped_atのチェック処理
          target_dates = target_dates.select { |date| date < customer.stopped_at } if customer.stopped_at.present?

          target_dates.each do |date|
            use_case = customer.use_case_for_day_of_week(day_of_week)
            next unless use_case

            visitings_customers = VisitingsCustomer.where(date:, customer_id: customer.id)

            if @office.education?
              unless use_case.self_pick_up || visitings_customers.find_by(soge_type: :pick_up).present?

                pick_up_form = EducationVisitingsCustomerRegistrationForm.new(
                  customer_cd: customer.cd,
                  date:,
                  soge_type: :pick_up,
                  schedule_time: use_case.departure_time,
                  point_id: use_case.pick_up_point_id,
                  base_point_id: use_case.pick_up_base_point_id,
                  skip_visitings_customer_exists_validation: true
                )
                pick_up_form.create
              end

              unless use_case.self_drop_off || visitings_customers.find_by(soge_type: :drop_off).present?
                drop_off_form = EducationVisitingsCustomerRegistrationForm.new(
                  customer_cd: customer.cd,
                  date:,
                  soge_type: :drop_off,
                  schedule_time: use_case.arrival_time,
                  point_id: use_case.drop_off_point_id,
                  base_point_id: use_case.drop_off_base_point_id,
                  skip_visitings_customer_exists_validation: true
                )
                drop_off_form.create
              end
            else
              next if visitings_customers.present?

              form = VisitingsCustomerRegistrationForm.new(
                customer_cd: customer.cd,
                date:,
                departure_time: use_case.departure_time,
                arrival_time: use_case.arrival_time,
                start_time: use_case.start_time,
                self_pick_up: use_case.self_pick_up,
                self_drop_off: use_case.self_drop_off,
                is_absent: false,
                pick_up_point_id: use_case.pick_up_point_id,
                drop_off_point_id: use_case.drop_off_point_id,
                pick_up_base_point_id: use_case.pick_up_base_point_id || @office.find_bookmark.bid,
                drop_off_base_point_id: use_case.drop_off_base_point_id || @office.find_bookmark.bid,
                skip_visitings_customer_exists_validation: true
              )
              form.save
            end
          end
        end
      end
    end
  end
  # rubocop:enable Metrics/MethodLength

  private

  def mandatory_attributes_presence
    errors.add('visitings_customer.start_date', I18n.t('errors.messages.blank')) if start_date.blank?
    errors.add('visitings_customer.end_date', I18n.t('errors.messages.blank')) if end_date.blank?
  end

  def validate_customer_cd
    return if customer_cd.blank?

    customer = Customer.find_by(cd: customer_cd)
    return if customer.present?

    errors.add('visitings_customer.cd', I18n.t('errors.messages.invalid_customer_cd'))
  end

  def validate_date_range
    return if start_date.blank? || end_date.blank?

    s_date = Date.parse(start_date)
    e_date = Date.parse(end_date)
    return unless s_date > e_date

    errors.add('visitings_customer.start_date', I18n.t('errors.messages.start_date_before_end_date'))
  end

  def validate_stopped_at_for_specific_customer
    return if customer_cd.blank?

    customer = Customer.find_by(cd: customer_cd)
    return if customer&.stopped_at.blank?

    e_date = Date.parse(end_date)

    # start_dateからend_dateの期間にstopped_at以降の日付が含まれるかチェック
    return unless e_date >= customer.stopped_at

    errors.add('visitings_customer.cd',
               I18n.t('errors.messages.customer_stopped_after_end_date',
                      stopped_at: customer.stopped_at.strftime('%Y年%m月%d日')))
  end
end
