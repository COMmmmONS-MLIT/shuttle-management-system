# frozen_string_literal: true

class CarLocationService
  def self.find_cars_with_locations(office:, car_id_param: nil, date_param: nil)
    new(office:, car_id_param:, date_param:).find_cars_with_locations
  end

  def initialize(office:, car_id_param: nil, date_param: nil)
    @office = office
    @car_id_param = car_id_param
    @date_param = date_param
  end

  def find_cars_with_locations
    target_date = parse_date(@date_param) if @date_param.present?
    office_code = @office&.cd

    # 車両の取得
    cars = filter_cars(office_code)

    # 位置情報を取得
    cars_with_locations = cars.map do |car|
      nowpos = find_nowpos(car.id, office_code, target_date)

      {
        car:,
        nowpos:
      }
    end

    # 位置情報がある車両のみをフィルタリング
    cars_with_locations.select { |item| item[:nowpos].present? }
  end

  def parse_date(date_str)
    return Date.current if date_str.blank?

    if date_str.match?(/^\d{8}$/) # YYYYMMDD形式
      Date.strptime(date_str, '%Y%m%d')
    elsif date_str.match?(/^\d{4}-\d{2}-\d{2}$/) # YYYY-MM-DD形式
      Date.parse(date_str)
    else
      raise ArgumentError, "Invalid date format: #{date_str}. Expected YYYYMMDD or YYYY-MM-DD format."
    end
  rescue Date::Error => e
    raise ArgumentError, "Invalid date: #{date_str}. #{e.message}"
  end

  private

  def filter_cars(_office_code)
    cars = Car.unscoped.order(:number)

    return cars if @car_id_param.blank?

    cars.where(id: @car_id_param)
  end

  def find_nowpos(car_id, _office_code, target_date)
    nowpos_query = Area::NowPos.where(id: car_id)
    nowpos_query = nowpos_query.where(日付: target_date) if target_date.present?

    nowpos_query.order(日付: :desc, 時間: :desc).first
  end
end
