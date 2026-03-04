# frozen_string_literal: true

# == Schema Information
#
# Table name: visitings_customers
#
#  id                                 :integer          not null, primary key
#  absence_reason(お休み理由)         :text(65535)
#  actual_time(実迎時間)              :time
#  arrival_time(到着時間)             :time
#  date(日付)                         :date
#  is_absent(お休み)                  :boolean          default(FALSE)
#  is_requested(リクエストされた送迎) :boolean
#  is_self(自来自退)                  :boolean
#  note(備考)                         :text(65535)
#  order(順番)                        :integer
#  passenger_count(乗車人数)          :integer          default(0)
#  request(送迎リクエスト)            :boolean
#  schedule_time(予定時間)            :time
#  soge_type(送迎種別 1:迎え 2:送り)  :integer
#  start_time(開始時間)               :time
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#  base_point_id(迎え場所基点ID)      :integer
#  customer_id(利用者ID (FK))         :integer          not null
#  office_id(事業所ID (FK))           :integer          not null
#  point_id(迎え場所ID (FK))          :integer
#  visiting_id(送迎ID (FK))           :integer
#
# Indexes
#
#  index_visitings_customers_on_base_point_id  (base_point_id)
#  index_visitings_customers_on_customer_id    (customer_id)
#  index_visitings_customers_on_office_id      (office_id)
#  index_visitings_customers_on_visiting_id    (visiting_id)
#
# Foreign Keys
#
#  fk_rails_...  (base_point_id => bookmark.bid)
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (visiting_id => visitings.id)
#
class VisitingsCustomer < ApplicationRecord
  include MultiOfficeScoped
  include TimeFormattable

  time_formatted_attributes :actual_time, :schedule_time, :start_time, :arrival_time

  belongs_to :office
  belongs_to :visiting, optional: true, inverse_of: :customers
  belongs_to :customer
  belongs_to :bookmark, class_name: 'Area::Bookmark', foreign_key: :point_id, primary_key: :bid, optional: true
  belongs_to :base_point, class_name: 'Area::Bookmark', primary_key: :bid, optional: true

  enum soge_type: { pick_up: 1, drop_off: 2 }

  scope :except_self_or_absent, lambda {
    where('(is_self = ? OR is_self IS NULL) AND (is_absent = ? OR is_absent IS NULL)', false, false)
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[actual_time created_at customer_id date id id_value office_id order point_id request
       schedule_time is_self soge_type start_time updated_at visiting_id is_absent]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[bookmark customer office visiting]
  end

  def update_requested_source_nil_time
    return if customer.requested_source.blank?

    customer.requested_source.update!(point_time: nil, actual_time: nil)
  end

  def update_requested_source
    return if customer.requested_source.blank?

    actual_time = nil
    point_time = nil
    if visiting.present?
      office_category = customer.office.category
      if office_category == 'tourism'
        vp = visiting.base_points.find_by(point_id:)
        actual_time = vp&.actual_time
        case soge_type
        when 'pick_up'
          point_time = visiting.departure_time
        when 'drop_off'
          point_time = visiting.arrival_time
        end
      else
        actual_time = self.actual_time
        vp = visiting.base_points.find_by(point_id: base_point_id)
        point_time = vp&.actual_time
      end
    end
    customer.requested_source.update!(point_time:, actual_time:)
  end

  def self.distance_between(vc_a, vc_b)
    DistanceRouteOptimizer.haversine_distance(vc_a.bookmark.lat, vc_a.bookmark.lng,
                                              vc_b.bookmark.lat, vc_b.bookmark.lng)
  end

  def pick_up_point_name
    if office.tourism?
      if soge_type == 'pick_up'
        base_point&.address_label
      else
        bookmark&.address_label
      end
    elsif soge_type == 'pick_up'
      bookmark&.address_label
    else
      base_point&.address_label
    end
  end

  def drop_off_point_name
    if office.tourism?
      if soge_type == 'pick_up'
        bookmark&.address_label
      else
        base_point&.address_label
      end
    elsif soge_type == 'pick_up'
      base_point&.address_label
    else
      bookmark&.address_label
    end
  end

  def can_request?
    requested_customer = RequestedCustomer.find_by(source_id: customer.id, date:,
                                                   soge_type:)

    visiting.blank? && !is_self? && !is_absent? && requested_customer.blank?
  end

  delegate :origin_office_id, :origin_office_name, to: :customer
end
