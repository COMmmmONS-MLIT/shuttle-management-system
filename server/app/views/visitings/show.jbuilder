# frozen_string_literal: true

json.visiting do
  json.partial! 'visitings/visiting_basic', visiting: @visiting
  json.route_points @visiting.route_points do |point|
    json.id point[:id]
    json.visiting_id point[:visiting_id]
    json.display_name point[:display_name]
    json.actual_time point[:actual_time]
    json.soge_type point[:soge_type]
    json.point_type point[:point_type]
    json.address point[:address]
    json.car_restriction point[:car_restriction]
    json.walker_size point[:walker_size]
    json.wc point[:wc] if point[:point_type] == 'VisitingsCustomer'
    json.passenger_count point[:passenger_count] if point[:point_type] == 'VisitingsCustomer'
    json.note point[:note] if point[:point_type] == 'VisitingsCustomer'
    json.schedule_time point[:schedule_time]
    json.wait_time point[:wait_time]
    json.image point[:image]
    ride_time = if @visiting.arrival_time && point[:actual_time_raw]
                  arrival = @visiting.arrival_time
                  actual = point[:actual_time_raw]
                  # 時刻部分のみを秒に変換して比較（日付の影響を排除）
                  arrival_seconds = (((arrival.hour * 60) + arrival.min) * 60) + arrival.sec
                  actual_seconds = (((actual.hour * 60) + actual.min) * 60) + actual.sec
                  ((arrival_seconds - actual_seconds) / 60).abs
                end
    json.ride_time ride_time if point[:point_type] == 'VisitingsCustomer'
    json.need_helper point[:need_helper] if point[:point_type] == 'VisitingsCustomer'
    json.order point[:order]
    json.arrival point[:arrival]
    json.dnd_id point[:dnd_id]
  end
end
