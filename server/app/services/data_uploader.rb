# frozen_string_literal: true

class DataUploader
  def initialize(office_id, target_date)
    @office_id = office_id
    @target_date = target_date.to_date
    @office = Office.find(@office_id)
  end

  def upload_data
    ActiveRecord::Base.transaction do
      # Current設定
      Current.office = @office

      # 指定日でVCを持っていないvisitingを削除
      delete_visitings_without_customers

      # 指定日のデータを削除
      delete_existing_data

      # 新しいデータをINSERT
      insert_new_data
    end
  end

  private

  def delete_visitings_without_customers
    # 指定日でvisitings_customerが紐づいていないvisitingを取得
    visitings_without_customers = Visiting.where(date: @target_date, office_id: @office_id)
                                          .left_outer_joins(:customers)
                                          .where(visitings_customers: { id: nil })

    count = visitings_without_customers.count
    return if count.zero?

    # 関連するvisitings_pointsも削除
    visiting_ids = visitings_without_customers.pluck(:id)
    VisitingsPoint.where(visiting_id: visiting_ids).find_each(&:destroy!)

    # visitingを削除
    visitings_without_customers.find_each(&:destroy!)

    Rails.logger.info "Deleted #{count} visitings without customers for date: #{@target_date}, office_id: #{@office_id}"
  end

  def delete_existing_data
    delete_sql = "DELETE FROM mergedata WHERE 日付 = '#{@target_date}' AND 事業所cd = '#{@office.cd}'"
    ActiveRecord::Base.connection.execute(delete_sql)
    Rails.logger.info "Deleted existing data for date: #{@target_date}, office: #{@office.cd}"
  end

  def insert_new_data
    select_sql = load_sql_query

    # SELECT結果を取得
    results = ActiveRecord::Base.connection.exec_query(select_sql)

    if results.any?
      # INSERT文を構築
      insert_sql = build_insert_sql(results)

      # INSERTを実行
      ActiveRecord::Base.connection.execute(insert_sql)
      Rails.logger.info "Inserted #{results.count} records into mergedata"
    end

    # 結果を返す
    process_results(results)
  end

  def build_insert_sql(results)
    columns = %w[
      日付 事業所cd 車両番号 carId 便順 表示順 乗車人数
      出発時間 予到着時間 予定時間 利用者番号 利用者名 フリガナ
      乗車 送迎区分 設定時刻 開始時刻 乗車住所 降車 降車住所
      lat1 lng1 lat2 lng2 lat3 lng3 注意事項 車両制限
      gate 歩行器 休 休理由 歩行 乗車名 降車名
      軽作業ID 車両呼称 定員 gate定員 G人数 waittime
      運転手 車両区分 変更時間 自車区分
    ]

    values_list = results.map do |row|
      values = [
        "'#{row['date']}'",
        "'#{@office.cd}'",
        "'#{row['number']&.slice(0, 4)}'",
        row['car_id'],
        row['bin_order'],
        row['order'] || 0,
        row['passenger_count'] || 0,
        format_time_for_insert(row['departure_time'], 'departure_time'),
        format_time_for_insert(row['arrival_time'], 'arrival_time'),
        format_time_for_insert(row['actual_time'], 'actual_time'),
        format_customer_cd_for_insert(row['cd'], row['customer_id']), # customer.cd as 利用者番号（NULLや空文字列の場合はcustomer_idを使用）
        "'#{escape_sql(row['name'])}'",
        "'#{escape_sql(row['name_kana'])}'",
        "'#{row['pickup_point_bid']}'", # customer_bookmark.bid
        "'#{row['soge_type']}'",
        format_time_for_insert(row['schedule_time'], 'schedule_time'),
        format_time_for_insert(row['start_time'], 'start_time'),
        "'#{escape_sql(row['pickup_address'])}'",
        "'#{row['office_point_bid']}'", # office_bookmark.bid
        "'#{escape_sql(row['dropoff_address'])}'",
        row['pickup_lat'] || 0,
        row['pickup_lng'] || 0,
        row['pickup_stop_lat'] || 0,
        row['pickup_stop_lng'] || 0,
        row['office_lat'] || 0,
        row['office_lng'] || 0,
        "'#{escape_sql(row['注意事項'])}'",
        row['pickup_car_restriction'] || 0,
        row['wc'] || 0,
        row['walker_size'] || 0,
        row['is_absent'] || 0,
        row['absence_reason'] ? "'#{escape_sql(row['absence_reason'])}'" : 'NULL',
        row['walker'] || 0,
        "'#{escape_sql(row['pickup_address_label'])}'",
        "'#{escape_sql(row['dropoff_address_label'])}'",
        "'0'", # 軽作業ID
        "'#{escape_sql(row['car_pattern_name'])}'",
        row['max_seat'] || 0,
        row['max_wc_seat'] || 0,
        row['wheelchair_count'] || 0,
        row['wait_time'] || 0,
        row['staff_name'] ? "'#{escape_sql(row['staff_name'])}'" : 'NULL',
        0, # 車両区分
        'NULL', # 変更時間
        row['is_self'] || 0
      ]
      "(#{values.join(', ')})"
    end

    "INSERT INTO mergedata (#{columns.join(', ')}) VALUES #{values_list.join(', ')}"
  end

  def escape_sql(value)
    return '' if value.nil?

    value.to_s.gsub("'", "''")
  end

  def format_time(time_value)
    return nil if time_value.nil?

    result = Time.zone.parse(time_value.to_s).strftime('%H:%M:%S')
    result
  rescue StandardError => e
    nil
  end

  def format_time_for_insert(time_value, field_name)
    if time_value.nil?
      return 'NULL'
    end

    formatted = format_time(time_value)
    if formatted.nil?
      return 'NULL'
    end

    "'#{formatted}'"
  rescue StandardError => e
    'NULL'
  end

  def format_customer_cd_for_insert(cd, customer_id)
    # cdがNULL、空文字列、または'0'の場合、customer_idを使用して一意性を保つ
    cd_value = cd.to_s.strip
    if cd_value.empty? || cd_value == '0'
      "'#{customer_id}'"
    else
      "'#{escape_sql(cd_value)}'"
    end
  end

  def load_sql_query
    # tourism事業所の場合はupload_tourism.sqlを使用
    sql_file_path = if @office.tourism?
                      Rails.root.join('db/sql/upload_tourism.sql')
                    else
                      Rails.root.join('db/sql/upload.sql')
                    end
    query = File.read(sql_file_path)

    # プレースホルダーを実際の値に置換
    query.gsub('@date', "'#{@target_date}'")
         .gsub('@office_id', @office_id.to_s)
  end

  def process_results(results)
    # 結果をハッシュの配列として返す
    results.to_a.map do |row|
      {
        date: row['date'],
        office_id: row['office_id'],
        car_number: row['number'],
        car_id: row['car_id'],
        bin_order: row['bin_order'],
        order: row['order'],
        passenger_count: row['passenger_count'],
        departure_time: row['departure_time'],
        arrival_time: row['arrival_time'],
        actual_time: row['actual_time'],
        customer_id: row['customer_id'],
        customer_name: row['name'],
        customer_name_kana: row['name_kana'],
        pickup_point_id: row['pickup_point_bid'],
        soge_type: row['soge_type'],
        schedule_time: row['schedule_time'],
        start_time: row['start_time'],
        pickup_address: row['pickup_address'],
        office_point_id: row['office_point_bid'],
        office_address: row['dropoff_address'],
        pickup_lat: row['pickup_lat'],
        pickup_lng: row['pickup_lng'],
        pickup_stop_lat: row['pickup_stop_lat'],
        pickup_stop_lng: row['pickup_stop_lng'],
        office_lat: row['office_lat'],
        office_lng: row['office_lng'],
        notes: row['注意事項'],
        car_restriction: row['pickup_car_restriction'],
        wheelchair: row['wc'],
        walker_size: row['walker_size'],
        is_absent: row['is_absent'],
        absence_reason: row['absence_reason'],
        walker: row['walker'],
        pickup_address_label: row['pickup_address_label'],
        office_address_label: row['dropoff_address_label'],
        car_pattern_name: row['car_pattern_name'],
        max_seat: row['max_seat'],
        max_wc_seat: row['max_wc_seat'],
        wait_time: row['wait_time'],
        driver_name: row['staff_name'],
        wheelchair_count: row['wheelchair_count'],
        is_self: row['is_self']
      }
    end
  end
end
