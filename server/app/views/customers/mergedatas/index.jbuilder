# frozen_string_literal: true

json.mergedatas @mergedatas do |mergedata|
  json.date mergedata.日付
  json.scheduled_time mergedata.予定時間&.in_time_zone('UTC')&.strftime('%H:%M')
  json.customer_cd mergedata.利用者番号
  json.soge_type mergedata.送迎区分
  json.office_cd mergedata.事業所cd
  json.car_number mergedata.車両番号
  json.car_id mergedata.carId
  json.lat1 mergedata.lat1
  json.lng1 mergedata.lng1
  json.lat3 mergedata.lat3
  json.lng3 mergedata.lng3

  # バッチロードされたbindatadデータを取得
  bindatad_key = [
    mergedata.日付,
    mergedata.事業所cd,
    mergedata.利用者番号,
    mergedata.carId,
    mergedata.出発時間,
    mergedata.送迎区分
  ]
  bindatad = @bindatad_lookup[bindatad_key]

  if bindatad
    json.bindatad do
      json.boarding_time bindatad.乗車時刻&.in_time_zone('UTC')&.strftime('%H:%M')
      json.alighting_time bindatad.降車時刻&.in_time_zone('UTC')&.strftime('%H:%M')
      json.update_time_c bindatad.updatetimec&.in_time_zone('UTC')&.strftime('%H:%M')
      json.update_time_u bindatad.updatetimeu&.in_time_zone('UTC')&.strftime('%H:%M')
    end
  else
    json.bindatad nil
  end
end
