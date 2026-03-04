# frozen_string_literal: true

json.cars @cars_with_locations do |item|
  car = item[:car]
  nowpos = item[:nowpos]

  json.id car.id

  # nowposが存在する場合のみ位置情報を出力
  if nowpos.present?
    json.lat nowpos.lat.to_f
    json.lng nowpos.lng.to_f

    # updated_at: 日付と時間を組み合わせてISO 8601形式で返す
    if nowpos.日付.present? && nowpos.時間.present?
      datetime = "#{nowpos.日付} #{nowpos.時間.in_time_zone('UTC').strftime('%H:%M:%S')}"
      json.updated_at datetime
    else
      json.updated_at nil
    end

    json.active nowpos.status || 'operating'
  else
    json.lat nil
    json.lng nil
    json.updated_at nil
    json.active 'operating'
  end

  json.car_name car.name
  json.car_number car.number
end

json.total_count @cars_with_locations.count
json.operating_count(@cars_with_locations.count do |item|
  item[:nowpos].status == 'operating' || item[:nowpos].status.blank?
end)
json.break_count(@cars_with_locations.count { |item| item[:nowpos].status == 'break' })
json.stopped_count(@cars_with_locations.count { |item| item[:nowpos].status == 'stopped' })

# 最後の更新時刻を取得
last_updated_times = @cars_with_locations.map do |item|
  nowpos = item[:nowpos]
  Time.zone.parse("#{nowpos.日付} #{nowpos.時間}") if nowpos.日付.present? && nowpos.時間.present?
end.compact

json.last_updated last_updated_times.max&.iso8601
