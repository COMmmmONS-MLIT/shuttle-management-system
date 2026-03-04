# frozen_string_literal: true

class DashboardController < ApplicationController
  def schedule
    date = params[:date] || Date.current

    @drivers = Staff.where(can_driver: true)
                    .where.not(driver_type: %w[退職 送迎から除外])
                    .order(:id)

    @cars = Car.not_stopped.order(:name)

    @schedules = get_schedules_for_date(date)
  end

  def statistics
    date = params[:date] || Date.current

    vcs = VisitingsCustomer.joins(:customer)
                           .where(date:, soge_type: :pick_up,
                                  customers: { contract_status: %w[契約 体験] })
    @total_customers = vcs.count
    @absent_customers = vcs.where(is_absent: true).count
  end

  private

  def get_schedules_for_date(date)
    visitings = get_visitings(date)

    visitings.map { |visiting| process_visiting(visiting) }.compact
  end

  def get_visitings(date)
    Visiting.where(date:)
            .includes(:driver, :car, customers: %i[customer bookmark])
            .order(:departure_time)
  end

  def process_visiting(visiting)
    return nil unless visiting.departure_time.present? && visiting.arrival_time.present?

    {
      id: visiting.id,
      driver_id: visiting.driver_id,
      car_id: visiting.car_id,
      car_name: visiting.car&.name,
      driver_name: visiting.driver&.name,
      start_time: calculate_start_time(visiting.departure_time),
      duration: calculate_duration(visiting.departure_time, visiting.arrival_time),
      type: visiting.type,
      customers: map_customers(visiting.customers)
    }
  end

  def map_customers(customers)
    customers.map do |visiting_customer|
      customer = visiting_customer.customer
      bookmark = visiting_customer.bookmark

      {
        id: visiting_customer.id,
        soge_type: visiting_customer.soge_type,
        name: customer.name,
        address: bookmark&.address,
        schedule_time: visiting_customer.formatted_schedule_time,
        start_time: visiting_customer.formatted_start_time,
        wc: customer.wc,
        walker: customer.walker,
        car_restriction_name: customer.car_restriction_name
      }
    end
  end

  def calculate_start_time(departure_time)
    return 0 unless departure_time

    hour = departure_time.hour
    minute = departure_time.min
    hour + (minute.to_f / 60)
  end

  def calculate_duration(start_time, end_time)
    return 0 unless start_time && end_time

    start_minutes = (start_time.hour * 60) + start_time.min
    end_minutes = (end_time.hour * 60) + end_time.min

    end_minutes += 24 * 60 if end_minutes < start_minutes

    (end_minutes - start_minutes).to_f / 60
  end
end
