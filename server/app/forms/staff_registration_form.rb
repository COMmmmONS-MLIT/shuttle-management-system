# frozen_string_literal: true

class StaffRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :id
  attribute :cd
  attribute :name
  attribute :name_kana
  attribute :category
  attribute :can_driver
  attribute :can_helper
  attribute :driver_type
  attribute :mail
  attribute :tel
  attribute :can_driving_cars
  attribute :is_stopped

  validates :can_driver, :can_helper, inclusion: { in: [true, false] }
  validate :mandatory_attributes_presence
  validate :validate_can_driving_cars

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      # 職員登録
      staff = Staff.create!(
        cd:,
        name:,
        name_kana:,
        category:,
        can_driver:,
        can_helper:,
        driver_type:,
        mail:,
        tel:
      )
      register_can_driving_cars(staff)
    end
  end

  def update(staff)
    return false unless valid?

    ActiveRecord::Base.transaction do
      # 職員更新
      staff.update!(
        name:,
        name_kana:,
        category:,
        can_driver:,
        can_helper:,
        driver_type:,
        mail:,
        tel:,
        is_stopped:
      )
      staff.can_driving_cars.destroy_all
      register_can_driving_cars(staff)
    end
  end

  private

  def mandatory_attributes_presence
    errors.add('staff.cd', I18n.t('errors.messages.blank')) if cd.blank?
    errors.add('staff.name', I18n.t('errors.messages.blank')) if name.blank?
    errors.add('staff.name_kana', I18n.t('errors.messages.blank')) if name_kana.blank?
  end

  def validate_can_driving_cars
    return unless can_driver

    if can_driving_cars.blank? || !can_driving_cars.is_a?(Array)
      errors.add('staff.can_driving_cars', I18n.t('errors.messages.no_select'))
    end

    can_driving_cars.each do |car|
      pattern = car['car_pattern'] || car[:car_pattern]
      if pattern.blank? || pattern['id'].blank? || pattern['name'].blank?
        errors.add('staff.can_driving_cars', I18n.t('errors.messages.no_select'))
      end
    end
  end

  def register_can_driving_cars(staff)
    return unless can_driver || can_driving_cars.present? || can_driving_cars.is_a?(Array)

    can_driving_cars.each do |car|
      pattern = car['car_pattern']
      next if pattern.blank? || pattern['id'].blank?

      CanDrivingCar.create!(
        car_pattern_id: pattern['id'],
        office_id: Current.office.id,
        driver_id: staff.id
      )
    end
  end
end
