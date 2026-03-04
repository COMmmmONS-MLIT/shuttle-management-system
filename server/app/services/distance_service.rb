# frozen_string_literal: true

class DistanceService
  def self.find_co2co(bookmark_a, bookmark_b)
    distancematrix = get_distancematrix(bookmark_a.lat, bookmark_a.lng, bookmark_b.lat, bookmark_b.lng)
    { time: distancematrix[:duration], distance: distancematrix[:distance] }
  end

  def self.get_distancematrix(lat_a, lng_a, lat_b, lng_b)
    # 所得する時間は混雑していると考えられる朝8時を想定して計算する
    # departureTimeは現在移行の時間を指定しなくてはならないため、明日の8時とする
    tomorrow_morning = DateTime.now.beginning_of_day + 1.day + 8.hours
    unix_timestamp = tomorrow_morning.to_i
    uri = URI.parse('https://maps.googleapis.com/maps/api/distancematrix/json')
    params = {
      language: 'ja',
      origins: "#{lat_a},#{lng_a}",
      destinations: "#{lat_b},#{lng_b}",
      key: ENV.fetch('GOOGLE_MAP_API_KEY', nil),
      travelMode: 'DRIVING',
      departure_time: unix_timestamp
    }
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    uri.query = URI.encode_www_form(params)
    res = http.get(uri.request_uri)

    raise "Google Maps API request failed with status: #{res.code}" unless res.is_a?(Net::HTTPSuccess)

    data = JSON.parse(res.body)
    dis_km = data['rows'][0]['elements'][0]['distance']['value'] / 1000.0
    dur_m = data['rows'][0]['elements'][0]['duration_in_traffic']['value'] / 60.0
    distance = (dis_km * 10).round / 10.0
    duration = dur_m.round

    # 距離が0より大きく、時間が0分の場合、時間を1分に設定。距離は0.1kmに設定。
    duration = 1 if dis_km.positive? && duration.zero?

    distance = 0.1 if dis_km.positive? && distance.zero?

    { distance:, duration: }
  end
end
