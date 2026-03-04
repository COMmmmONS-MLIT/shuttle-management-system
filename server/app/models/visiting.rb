# frozen_string_literal: true

# == Schema Information
#
# Table name: visitings
#
#  id                                           :integer          not null, primary key
#  arrival_time(到着時間)                       :time
#  bin_order(便順)                              :integer
#  date(日付)                                   :date
#  departure_time(出発時間)                     :time
#  is_shared(共有された送迎か)                  :boolean          default(FALSE)
#  shared_car_name(共有された送迎の車両名)      :string(255)
#  shared_driver_name(共有された送迎の運転手名) :string(255)
#  shared_tenjo_name(共有された送迎の添乗員名)  :string(255)
#  created_at                                   :datetime         not null
#  updated_at                                   :datetime         not null
#  arrival_point_id(到着地点ID (FK))            :integer
#  car_id(車両ID (FK))                          :integer
#  departure_point_id(出発地点ID (FK))          :integer
#  driver_id(ドライバーID (FK))                 :integer
#  office_id(事業所ID (FK))                     :integer          not null
#  source_office_id(共有元の事業所ID (FK))      :integer
#  source_visiting_id(共有元のVisitingID)       :integer
#  tenjo_id(添乗者ID (FK))                      :integer
#
# Indexes
#
#  index_visitings_on_arrival_point_id    (arrival_point_id)
#  index_visitings_on_car_id              (car_id)
#  index_visitings_on_departure_point_id  (departure_point_id)
#  index_visitings_on_driver_id           (driver_id)
#  index_visitings_on_is_shared           (is_shared)
#  index_visitings_on_office_id           (office_id)
#  index_visitings_on_source_office_id    (source_office_id)
#  index_visitings_on_source_visiting_id  (source_visiting_id)
#  index_visitings_on_tenjo_id            (tenjo_id)
#
# Foreign Keys
#
#  fk_rails_...  (arrival_point_id => bookmark.bid)
#  fk_rails_...  (car_id => cars.id)
#  fk_rails_...  (departure_point_id => bookmark.bid)
#  fk_rails_...  (driver_id => staffs.id)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (source_office_id => offices.id)
#  fk_rails_...  (tenjo_id => staffs.id)
#

# rubocop:disable Metrics/ClassLength
class Visiting < ApplicationRecord
  include MultiOfficeScoped
  include TimeFormattable

  time_formatted_attributes :departure_time, :arrival_time

  belongs_to :office
  belongs_to :car, optional: true
  belongs_to :driver, class_name: 'Staff', optional: true, inverse_of: :visitings
  belongs_to :tenjo, class_name: 'Staff', optional: true
  belongs_to :departure_bookmark, class_name: 'Area::Bookmark', foreign_key: :departure_point_id, primary_key: :bid,
                                  optional: true, inverse_of: :departure_visitings
  belongs_to :arrival_bookmark, class_name: 'Area::Bookmark', foreign_key: :arrival_point_id, primary_key: :bid,
                                optional: true, inverse_of: :arrival_visitings
  has_many :customers, -> { order(:order) }, class_name: 'VisitingsCustomer', dependent: :nullify, inverse_of: :visiting
  has_many :base_points, class_name: 'VisitingsPoint', dependent: :destroy, inverse_of: :visiting
  has_one :max_passenger_view, class_name: 'VisitingMaxPassenger', dependent: nil

  # validates :departure_time, :arrival_time, presence: true
  # validates :departure_time, comparison: { less_than_or_equal_to: :arrival_time }
  validates :bin_order, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :bin_order, :date, presence: true
  validates :car, presence: true, unless: :is_shared?
  validates :shared_car_name, presence: true, if: :is_shared?

  scope :overlapping_schedules, lambda { |date, departure_time, arrival_time, exclude_id: nil|
    start_hm = departure_time.strftime('%H:%M:%S')
    end_hm   = arrival_time.strftime('%H:%M:%S')

    db_departure = "TIME(CONVERT_TZ(departure_time, '+00:00', '+09:00'))"
    db_arrival   = "TIME(CONVERT_TZ(arrival_time, '+00:00', '+09:00'))"

    query = where(date:).where(
      "(TIME(?) <= #{db_departure} AND #{db_departure} <= TIME(?)) OR " \
      "(TIME(?) <= #{db_arrival} AND #{db_arrival} <= TIME(?)) OR " \
      "(#{db_departure} <= TIME(?) AND TIME(?) <= #{db_arrival}) OR " \
      "(TIME(?) <= #{db_departure} AND #{db_arrival} <= TIME(?))",
      start_hm, end_hm,
      start_hm, end_hm,
      start_hm, end_hm,
      start_hm, end_hm
    )

    query = query.where.not(id: exclude_id) if exclude_id.present?
    query
  }

  def total_customers
    customers.sum(:passenger_count)
  end

  def total_wc_customers
    customers.sum { |vc| vc.customer&.wc == true ? vc.passenger_count : 0 }
  end

  def total_cargo_volume
    customers.sum { |vc| vc.customer&.walker_size || 0 }
  end

  def type
    return 'pick_up' if customers.empty?

    soge_types = customers.pluck(:soge_type)

    if soge_types.all? { |type| type == 'pick_up' }
      'pick_up'
    elsif soge_types.all? { |type| type == 'drop_off' }
      'drop_off'
    else
      'mix'
    end
  end

  def sorted_customers(order_type = nil)
    case order_type
    when 'cd_asc'
      customers.joins(:customer).order('customers.customer_cd ASC')
    when 'cd_desc'
      customers.joins(:customer).order('customers.customer_cd DESC')
    when 'name_kana_asc'
      customers.joins(:customer).order('customers.name_kana ASC')
    when 'name_kana_desc'
      customers.joins(:customer).order('customers.name_kana DESC')
    when 'schedule_time_asc'
      customers.order(schedule_time: :asc)
    when 'schedule_time_desc'
      customers.order(schedule_time: :desc)
    else
      customers
    end
  end

  def route_points
    sorted_points = [customers, base_points].flatten.compact.sort_by(&:order)
    sorted_points.map do |point|
      {
        id: point.id,
        display_name: display_name(point),
        order: point.order,
        actual_time: point.formatted_actual_time,
        actual_time_raw: point.actual_time,
        bookmark: point.bookmark,
        visiting: point.visiting,
        visiting_id: point.visiting_id,
        point_type: point.class.name,
        address: point.bookmark&.address,
        car_restriction: point.bookmark&.car_restriction&.name,
        wait_time: point.bookmark&.wait_time,
        arrival: false,
        soge_type: point.soge_type
      }.merge(type_specific_data(point))
    end
  end

  def display_name(point)
    if point.instance_of?(::VisitingsPoint)
      if point.arrival
        point.bookmark.address_label
      elsif point.soge_type == 'pick_up'
        "降車：#{point.bookmark.address_label}"
      elsif point.soge_type == 'drop_off'
        "乗車：#{point.bookmark.address_label}"
      end
    elsif point.instance_of?(::VisitingsCustomer)
      point.customer.name
    else
      ''
    end
  end

  # VCとVPをorder順で取得
  def customers_and_points
    (customers + base_points).reject { |point| point.order.nil? || point.order.zero? }.sort_by(&:order)
  end

  def prepare_waypoints
    customers_and_points.map do |item|
      bookmark = item.bookmark
      {
        id: item.id,
        lat: bookmark.lat,
        lng: bookmark.lng,
        soge_type: item.soge_type,
        point_type: item.class.name,
        object: item,
        arrival: item.is_a?(VisitingsPoint) ? item.arrival : false
      }
    end
  end

  # 時間計算のメイン処理はサービスオブジェクトに委譲
  def calculate_times(office, adjustment_time = 0, departure_time = nil)
    VisitingTimeCalculator.new(self, office, adjustment_time, departure_time).calculate
  end

  def for_points_calculate_times(adjustment_time = 0)
    vps = base_points.sort_by(&:order)
    first_vp = vps.first
    vcs = customers.where(point_id: first_vp.point_id, soge_type: first_vp.soge_type)
    target_vc = vcs.max_by(&:formatted_schedule_time)
    target_bookmark = if target_vc.present?
                        target_vc.bookmark
                      else
                        first_vp.bookmark
                      end

    # 最初のVPがVCを持たない場合、一番早いVCのschedule_timeを取得
    first_schedule_time = if target_vc.present?
                            target_vc.schedule_time
                          else
                            customers.min_by(&:formatted_schedule_time).schedule_time
                          end

    departure_bookmark = self.departure_bookmark || office.find_bookmark
    arrival_bookmark   = self.arrival_bookmark   || office.find_bookmark

    co2co = find_co2co(departure_bookmark, target_bookmark)
    departure_time = first_schedule_time - ceil_co2co_time(co2co) + (adjustment_time || 0).minutes
    actual_time = first_schedule_time + (adjustment_time || 0).minutes
    update!(departure_time:)
    first_vp.update!(actual_time:)
    vcs.each do |vc|
      vc.update!(actual_time:)
    end

    vps.each_cons(2).with_index(1) do |(a, b), i|
      bookmark_a = a.bookmark
      bookmark_b = b.bookmark
      co2co = find_co2co(bookmark_a, bookmark_b)

      vcs = customers.where(point_id: b.point_id, soge_type: b.soge_type)
      target_vc = vcs.max_by(&:schedule_time)

      if a.drop_off? && b.pick_up?
        arrival_time = a.actual_time + ceil_co2co_time(co2co) + (bookmark_a.wait_time * 60)
        actual_time = [arrival_time.strftime('%H:%M'), target_vc.schedule_time.strftime('%H:%M')].max
      else
        actual_time = a.actual_time + ceil_co2co_time(co2co) + (bookmark_a.wait_time * 60)
      end

      b.update!(actual_time:)
      vcs.each do |vc|
        vc.update!(actual_time:)
      end

      if i == vps.length - 1
        co2co = find_co2co(b.bookmark, arrival_bookmark)
        arrival_time = b.actual_time + ceil_co2co_time(co2co)
        update!(arrival_time:)
      end
    end

    customers.where(is_requested: true).find_each(&:update_requested_source)
  end

  private

  def find_co2co(bookmark_a, bookmark_b)
    DistanceService.find_co2co(bookmark_a, bookmark_b)
  end

  def ceil_co2co_time(co2co)
    return 0 if co2co[:distance].zero?

    ((co2co[:time] * 60).to_f / 300).ceil * 300
  end

  def type_specific_data(point)
    if point.instance_of?(::VisitingsCustomer)
      {
        customer: point.customer,
        passenger_count: point.passenger_count,
        note: point.note,
        wc: point.customer&.wc,
        walker_size: point.customer&.walker_size,
        schedule_time: point.formatted_schedule_time,
        image: point.customer&.image&.image,
        need_helper: point.customer&.need_helper,
        customer_id: point.customer_id,
        dnd_id: "vc-#{point.id}"
      }
    elsif point.instance_of?(::VisitingsPoint)
      {
        soge_type: 'point',
        walker_size: '',
        arrival: point.arrival,
        dnd_id: "vp-#{point.id}"
      }
    else
      {}
    end
  end

  class << self
    # 複数の訪問データから警告情報を生成
    def generate_warnings_for_visitings(visitings)
      warnings_map = {}
      warning_counter = 1

      visitings.flat_map(&:customers).each do |customer|
        warning_key = "#{customer.customer_id}_#{customer.soge_type}"
        next if warnings_map[warning_key] || !notes_present?(customer)

        note_text = build_note_text(customer)
        next if note_text.blank?

        warnings_map[warning_key] = create_warning(warning_counter, note_text, customer)
        warning_counter += 1
      end

      warnings_map.values.sort_by { |w| w[:number] }
    end

    private

    # 顧客に注記があるかチェック
    def notes_present?(customer)
      customer.customer&.common_note.present? || soge_note_present?(customer)
    end

    # 送迎タイプに応じた注記の存在チェック
    def soge_note_present?(customer)
      case customer.soge_type
      when 'pick_up'
        customer.customer&.pick_up_note.present?
      when 'drop_off'
        customer.customer&.drop_off_note.present?
      else
        false
      end
    end

    # 警告オブジェクトの作成
    def create_warning(number, text, customer)
      {
        number:,
        text:,
        customer_id: customer.customer_id,
        soge_type: customer.soge_type
      }
    end

    # 顧客の注記テキストを構築
    def build_note_text(customer)
      notes = [
        customer.customer&.common_note,
        customer.soge_type == 'pick_up' ? customer.customer&.pick_up_note : customer.customer&.drop_off_note
      ]
      notes.compact_blank.join(' / ')
    end
  end
end
# rubocop:enable Metrics/ClassLength
