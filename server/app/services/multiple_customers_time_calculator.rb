# frozen_string_literal: true

class MultipleCustomersTimeCalculator
  def initialize(visiting, customers_and_points, office, adjustment_time = 0, specified_departure_time = nil)
    @visiting = visiting
    @customers_and_points = customers_and_points
    @office = office
    @adjustment_time = adjustment_time
    @specified_departure_time = specified_departure_time
  end

  def calculate
    set_first_item_time
    calculate_route_times
  end

  private

  # 最初の要素の actual_time と便の出発時間の設定
  # （元の Visiting#calculate_route_times + #update_first_visiting / #update_first_visiting_for_vp 冒頭ロジック）
  def set_first_item_time
    first_item = @customers_and_points.first

    if first_item.instance_of?(VisitingsCustomer)
      update_first_visiting(first_item, first_item.bookmark)
    elsif first_item.instance_of?(VisitingsPoint)
      # VPが最初の場合、対応するVCを見つけて時間設定
      first_customer = @customers_and_points.find { |item| item.instance_of?(VisitingsCustomer) }
      update_first_visiting_for_vp(first_item, first_customer) if first_customer
    end
  end

  # 複数人の場合の時間計算（元の Visiting#calculate_route_times と同等）
  def calculate_route_times
    @customers_and_points.each_cons(2).with_index(1) do |(a, b), i|
      bookmark_a = a.bookmark
      bookmark_b = b.bookmark

      co2co = DistanceService.find_co2co(bookmark_a, bookmark_b)

      if a.instance_of?(VisitingsCustomer) && a.drop_off? && b.instance_of?(VisitingsCustomer) && b.pick_up?
        arrival_time = a.actual_time + ceil_co2co_time(co2co) + (bookmark_a.wait_time * 60)
        actual_time = [arrival_time.strftime('%H:%M'), b.schedule_time.strftime('%H:%M')].max
      else
        actual_time = a.actual_time + ceil_co2co_time(co2co) + (bookmark_a.wait_time * 60)
      end

      b.update!(actual_time:)

      calculate_final_arrival_time(b) if i == @customers_and_points.length - 1
    end
  end

  def calculate_final_arrival_time(last_item)
    arrival_bookmark = @visiting.arrival_bookmark || @office.find_bookmark
    co2co = DistanceService.find_co2co(last_item.bookmark, arrival_bookmark)
    arrival_time = last_item.actual_time + ceil_co2co_time(co2co)
    @visiting.update!(arrival_time:)
  end

  # 元の Visiting#update_first_visiting
  def update_first_visiting(visiting_customer, customer_bookmark)
    departure_bookmark = @visiting.departure_bookmark || @office.find_bookmark
    arrival_bookmark = @visiting.arrival_bookmark || @office.find_bookmark

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
    elsif visiting_customer.pick_up?
      calculate_times_for_pick_up(visiting_customer, departure_bookmark, customer_bookmark)
    else
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

  # 元の Visiting#update_first_visiting_for_vp
  def update_first_visiting_for_vp(first_vp, first_customer)
    departure_bookmark = @visiting.departure_bookmark || @office.find_bookmark

    if @specified_departure_time.present?
      departure_time = @specified_departure_time
      co2co = DistanceService.find_co2co(departure_bookmark, first_vp.bookmark)
      vp_actual_time = departure_time + ceil_co2co_time(co2co)
    else
      departure_time = first_customer.schedule_time + (@adjustment_time || 0).minutes
      co2co = DistanceService.find_co2co(departure_bookmark, first_vp.bookmark)
      vp_actual_time = first_customer.schedule_time + ceil_co2co_time(co2co) + (@adjustment_time || 0).minutes
    end

    @visiting.update!(departure_time:)
    first_vp.update!(actual_time: vp_actual_time)
  end

  def ceil_co2co_time(co2co)
    return 0 if co2co[:distance].zero?

    ((co2co[:time] * 60).to_f / 300).ceil * 300
  end
end
