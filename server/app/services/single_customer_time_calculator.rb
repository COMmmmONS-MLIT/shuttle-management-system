# frozen_string_literal: true

class SingleCustomerTimeCalculator
  def initialize(visiting, visiting_customer, office, adjustment_time = 0, specified_departure_time = nil)
    @visiting = visiting
    @visiting_customer = visiting_customer
    @office = office
    @adjustment_time = adjustment_time
    @specified_departure_time = specified_departure_time
  end

  def calculate
    customer_bookmark = @visiting_customer.bookmark

    update_first_visiting(@visiting_customer, customer_bookmark)

    arrival_bookmark = @visiting.arrival_bookmark || @office.find_bookmark
    co2co_back = DistanceService.find_co2co(customer_bookmark, arrival_bookmark)

    arrival_time = @visiting_customer.actual_time + ceil_co2co_time(co2co_back)

    @visiting.update!(arrival_time:)
  end

  private

  # 元の Visiting#update_first_visiting と同等のロジック（単一要素ケース）
  def update_first_visiting(visiting_customer, customer_bookmark)
    departure_bookmark = @visiting.departure_bookmark || @office.find_bookmark
    arrival_bookmark = @visiting.arrival_bookmark || @office.find_bookmark

    # VisitingsPointの場合は処理をスキップ
    return if visiting_customer.instance_of?(VisitingsPoint)

    departure_time, actual_time = calculate_first_visiting_times(
      visiting_customer, customer_bookmark, departure_bookmark, arrival_bookmark
    )

    @visiting.update!(departure_time:)
    visiting_customer.update!(actual_time:, visiting_id: @visiting.id)
  end

  def calculate_first_visiting_times(visiting_customer, customer_bookmark, departure_bookmark, arrival_bookmark)
    if @specified_departure_time.present?
      calculate_times_with_specified_departure(departure_bookmark, customer_bookmark)
    elsif visiting_customer.pick_up? # 1人目の利用者が迎えの場合
      calculate_times_for_pick_up(visiting_customer, departure_bookmark, customer_bookmark)
    else # 1人目の利用者が送りの場合
      calculate_times_for_drop_off(visiting_customer, customer_bookmark, arrival_bookmark)
    end
  end

  def calculate_times_with_specified_departure(departure_bookmark, customer_bookmark)
    departure_time = @specified_departure_time
    co2co = DistanceService.find_co2co(departure_bookmark, customer_bookmark)
    travel_time = ceil_co2co_time(co2co)
    actual_time = departure_time + travel_time
    [departure_time, actual_time]
  end

  def calculate_times_for_pick_up(visiting_customer, departure_bookmark, customer_bookmark)
    co2co = DistanceService.find_co2co(departure_bookmark, customer_bookmark)
    travel_time = ceil_co2co_time(co2co)
    adjustment = (@adjustment_time || 0).minutes

    if @office.tourism?
      departure_time = visiting_customer.schedule_time + adjustment
      actual_time = visiting_customer.schedule_time + travel_time + adjustment
    else
      departure_time = visiting_customer.schedule_time - travel_time + adjustment
      actual_time = visiting_customer.schedule_time + adjustment
    end
    [departure_time, actual_time]
  end

  def calculate_times_for_drop_off(visiting_customer, customer_bookmark, arrival_bookmark)
    co2co = DistanceService.find_co2co(customer_bookmark, arrival_bookmark)
    travel_time = ceil_co2co_time(co2co)
    adjustment = (@adjustment_time || 0).minutes

    if @office.tourism?
      departure_time = visiting_customer.schedule_time - travel_time + adjustment
      actual_time = visiting_customer.schedule_time + adjustment
    else
      departure_time = visiting_customer.schedule_time + adjustment
      actual_time = visiting_customer.schedule_time + travel_time + adjustment
    end
    [departure_time, actual_time]
  end

  def ceil_co2co_time(co2co)
    return 0 if co2co[:distance].zero?

    ((co2co[:time] * 60).to_f / 300).ceil * 300
  end
end
