# frozen_string_literal: true

# == Schema Information
#
# Table name: visiting_alerts
#
#  alert_name       :string(23)       default(""), not null
#  alert_type       :bigint           default("ok"), not null
#  date             :date
#  max_seat         :integer
#  total_passengers :decimal(41, )    default(0), not null
#  car_id           :integer
#  office_id        :integer          default(0), not null
#  visiting_id      :integer          default(0), not null, primary key
#
class VisitingAlert < ApplicationRecord
  include MultiOfficeScoped

  self.primary_key = :visiting_id

  belongs_to :office
  belongs_to :car
  belongs_to :visiting, optional: true

  enum alert_type: {
    ok: 0,
    capacity_over: 1,
    start_time_late: 2,
    driver_schedule_overlap: 3,
    pickup_order_wrong: 4,
    dropoff_order_wrong: 5,
    wc_capacity_over: 6,
    helper_required: 7,
    customer_ng_combination: 8
  }

  scope :has_alerts, -> { where.not(alert_type: :ok) }

  def self.filter_capacity_over(alerts)
    visiting_ids_with_order_wrong = alerts
                                    .select { |a| %w[pickup_order_wrong dropoff_order_wrong].include?(a.alert_type) }
                                    .map(&:visiting_id)
                                    .uniq

    visiting_ids_with_wc_over = alerts
                                .select { |a| a.alert_type == 'wc_capacity_over' }
                                .map(&:visiting_id)
                                .uniq

    alerts.reject do |alert|
      (%w[capacity_over wc_capacity_over].include?(alert.alert_type) &&
        visiting_ids_with_order_wrong.include?(alert.visiting_id)) ||
        (alert.alert_type == 'capacity_over' &&
          visiting_ids_with_wc_over.include?(alert.visiting_id))
    end
  end

  def alert_messages
    case alert_type
    when 'capacity_over'
      capacity_over_message
    when 'start_time_late'
      start_time_late_message
    when 'driver_schedule_overlap'
      driver_schedule_overlap_message
    when 'pickup_order_wrong'
      pickup_order_wrong_message
    when 'dropoff_order_wrong'
      dropoff_order_wrong_message
    when 'wc_capacity_over'
      wc_capacity_over_message
    when 'helper_required'
      helper_required_message
    when 'customer_ng_combination'
      customer_ng_combination_message
    end
  end

  private

  def capacity_over_message
    wc_count = visiting&.max_passenger_view&.max_wc_passengers || 0
    nomal_seat_count = car.nomal_seat_count(wc_count)
    ["【#{car&.name}】通常座席定員オーバーです。定員: #{nomal_seat_count}人（車椅子利用者#{wc_count}人の場合）"]
  end

  def start_time_late_message
    late_customers =
      visiting.customers.includes(:customer).select do |vc|
        next false if vc.start_time.blank?
        next false unless vc.pick_up? # 迎えのみ対象

        # 対応するVPを取得
        vp = visiting.base_points.find { |bp| bp.point_id == vc.base_point_id && bp.soge_type == vc.soge_type }

        vc_start = vc.start_time.strftime('%H:%M')
        base_point_time = if vp.blank? || vp.actual_time.blank?
                            visiting.arrival_time.strftime('%H:%M')
                          else
                            vp.actual_time.strftime('%H:%M')
                          end

        vc_start < base_point_time
      end

    late_customers.map do |vc|
      "【#{car&.name}】利用者（#{vc.customer.name}）さんの開始時間よりも車の到着が遅れています"
    end
  end

  def driver_schedule_overlap_message
    ["【#{car&.name}】運転手のスケジュールが他の便と重複しています"]
  end

  def pickup_order_wrong_message
    wrong_order_data = fetch_pickup_wrong_order_data
    wrong_order_data.map do |data|
      "【#{car&.name}】利用者（#{data.first}）さんの迎え順番を確認してください。" \
        "#{data.first}さんを迎えに行った後に、#{data.last}に送る必要があります。"
    end
  end

  def dropoff_order_wrong_message
    wrong_order_data = fetch_dropoff_wrong_order_data
    wrong_order_data.map do |data|
      "【#{car&.name}】利用者（#{data.first}）さんの送り順番を確認してください。" \
        "#{data.last}に迎えに行った後に、#{data.first}さんを送る必要があります。"
    end
  end

  def wc_capacity_over_message
    wc_count = visiting&.max_passenger_view&.max_wc_passengers || 0
    max_wc_seat = car&.max_wc_seat || 0
    ["【#{car&.name}】車椅子定員オーバーです。最大車椅子数: #{max_wc_seat}個、車椅子利用者: #{wc_count}人"]
  end

  def helper_required_message
    need_helper_customers = visiting&.customers
                                    &.joins(:customer)
                                    &.where(customers: { need_helper: true })
                                    &.includes(:customer) || []
    need_helper_customers.map do |vc|
      "【#{car&.name}】利用者（#{vc.customer.name}）さんに添乗員が必要ですが、添乗員が配置されていません"
    end
  end

  def customer_ng_combination_message
    ng_combinations = fetch_customer_ng_combinations
    ng_combinations.map do |data|
      "【#{car&.name}】利用者（#{data[:customer_a_name]}）さんと（#{data[:customer_b_name]}）さんは同乗できません"
    end
  end

  # rubocop:disable Layout/LineLength
  def fetch_pickup_wrong_order_data
    visiting&.customers
            &.joins(:customer)
            &.joins('JOIN visitings_points vp ON vp.visiting_id = visitings_customers.visiting_id')
            &.joins('JOIN bookmark b ON b.bid = vp.point_id')
            &.where('visitings_customers.soge_type = ? AND vp.point_id = visitings_customers.base_point_id AND vp.arrival = ? AND visitings_customers.order > vp.order',
                    1, false)
            &.pluck('customers.name', Arel.sql('b.住所ラベル'))
  end

  def fetch_dropoff_wrong_order_data
    visiting&.customers
            &.joins(:customer)
            &.joins('JOIN visitings_points vp ON vp.visiting_id = visitings_customers.visiting_id')
            &.joins('JOIN bookmark b ON b.bid = vp.point_id')
            &.where('visitings_customers.soge_type = ? AND vp.point_id = visitings_customers.base_point_id AND vp.arrival = ? AND vp.order > visitings_customers.order',
                    2, false)
            &.pluck('customers.name', Arel.sql('b.住所ラベル'))
  end

  def fetch_customer_ng_combinations
    return [] unless visiting

    customer_ids = visiting.customers.pluck(:customer_id).uniq
    return [] if customer_ids.size < 2

    CustomerNg.where('(customer_a_id IN (?) AND customer_b_id IN (?))', customer_ids, customer_ids)
              .includes(:customer_a, :customer_b)
              .map do |ng|
      {
        customer_a_name: ng.customer_a.name,
        customer_b_name: ng.customer_b.name
      }
    end
  end
  # rubocop:enable Layout/LineLength
end
