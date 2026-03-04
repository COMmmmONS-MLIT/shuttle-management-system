# frozen_string_literal: true

class CarRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :id
  attribute :name
  attribute :number
  attribute :stopped
  attribute :max_seat
  attribute :max_wc_seat
  attribute :pattern
  attribute :point_id

  validate :mandatory_attributes_presence
  validate :validate_car_pattern

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      car_pattern = register_car_pattern

      # 車両登録
      Car.create!(
        name:,
        number:,
        max_seat:,
        max_wc_seat:,
        car_pattern_id: car_pattern.id,
        stopped:,
        point_id:
      )
    end

    true
  end

  def update(car)
    return false unless valid?

    ActiveRecord::Base.transaction do
      car_pattern = register_car_pattern

      # 車両更新
      car.update!(
        name:,
        number:,
        max_seat:,
        max_wc_seat:,
        car_pattern_id: car_pattern.id,
        stopped:,
        point_id:
      )
    end

    true
  end

  private

  def mandatory_attributes_presence
    errors.add('car.name', I18n.t('errors.messages.blank')) if name.blank?
    errors.add('car.number', I18n.t('errors.messages.blank')) if number.blank?
    errors.add('car.max_seat', I18n.t('errors.messages.blank')) if max_seat.blank?
    errors.add('car.max_wc_seat', I18n.t('errors.messages.blank')) if max_wc_seat.blank?
  end

  def validate_car_pattern
    if pattern.blank?
      errors.add('car.pattern', I18n.t('errors.messages.no_select'))
      return
    end

    errors.add('car.pattern_name', I18n.t('errors.messages.blank')) if pattern[:name].blank?

    errors.add('car.restriction_ids', I18n.t('errors.messages.no_select')) if pattern[:restriction_ids].blank?

    if pattern[:wc_numbers].blank? || !pattern[:wc_numbers].is_a?(Array) || pattern[:wc_numbers].empty?
      errors.add('car.wc_numbers', I18n.t('errors.messages.no_select'))
      return
    end

    pattern[:wc_numbers].each_with_index do |wc, _i|
      wc = wc.with_indifferent_access
      if wc[:wc_seat].nil? || wc[:normal_seat].nil? || wc[:cargo_volume].nil?
        errors.add('car.wc_numbers', I18n.t('errors.messages.no_select'))
      end
    end
  end

  def register_car_pattern
    car_pattern = if pattern[:id].present? && pattern[:id].to_i.positive?
                    CarPattern.find(pattern[:id])
                  else
                    CarPattern.find_or_create_by!(
                      name: pattern[:name],
                      car_type: pattern[:car_type]
                    )
                  end

    # 車両制限を更新
    car_pattern.update!(car_restriction_ids: pattern[:restriction_ids], car_type: pattern[:car_type])

    # CarPatternWcNumber 削除
    car_pattern.car_pattern_wc_numbers.destroy_all

    # CarPatternWcNumber 再登録
    (pattern[:wc_numbers] || []).each do |wc|
      car_pattern.car_pattern_wc_numbers.create!(
        normal_seat: wc[:normal_seat],
        wc_seat: wc[:wc_seat],
        cargo_volume: wc[:cargo_volume]
      )
    end

    car_pattern
  end
end
