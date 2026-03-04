# frozen_string_literal: true

json.staff do
  json.extract! @staff, :id, :cd, :name, :name_kana, :category, :can_driver, :can_helper, :driver_type, :mail, :tel,
                :updated_at, :office_id, :is_stopped
  json.can_driving_cars @staff.can_driving_cars.includes(:car_pattern) do |can_driving_car|
    json.car_pattern do
      json.extract! can_driving_car.car_pattern, :id, :name
    end
  end
end
