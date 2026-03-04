# frozen_string_literal: true

# == Schema Information
#
# Table name: customers
#
#  id                                              :integer          not null, primary key
#  arrival_time(送り予定時間)                      :time
#  cd(利用者番号)                                  :string(255)      not null
#  common_note(共通備考)                           :text(65535)
#  contract_status(契約識別 (enum))                :integer
#  departure_time(迎え予定時間)                    :time
#  drop_off_note(送り申し送り)                     :text(65535)
#  name(氏名)                                      :string(255)      not null
#  name_kana(氏名カナ)                             :string(255)
#  need_helper(添乗員)                             :boolean
#  phone_number(電話番号)                          :string(255)
#  pick_up_note(迎え申し送り)                      :text(65535)
#  seat_assignment(座席指定(enum))                 :integer
#  self_drop_off(自退)                             :boolean
#  self_pick_up(自来)                              :boolean
#  start_time(サービス開始時間)                    :time
#  stopped_at(休止日)                              :date
#  stopped_reason(休止理由)                        :text(65535)
#  walker(歩行器利用)                              :boolean
#  walker_size(歩行器サイズ)                       :decimal(2, 1)
#  walking_note(歩行注意事項)                      :text(65535)
#  wc(WC利用 (車椅子))                             :boolean
#  created_at                                      :datetime         not null
#  updated_at                                      :datetime         not null
#  default_drop_off_point_id(デフォルト送り場所ID) :integer
#  default_pick_up_point_id(デフォルト迎え場所ID)  :integer
#  office_id(事業所ID)                             :integer          not null
#  requested_customer_id(リクエスト元データID)     :integer
#
# Indexes
#
#  index_customers_on_default_drop_off_point_id  (default_drop_off_point_id)
#  index_customers_on_default_pick_up_point_id   (default_pick_up_point_id)
#  index_customers_on_office_id                  (office_id)
#  index_customers_on_requested_customer_id      (requested_customer_id)
#
# Foreign Keys
#
#  fk_rails_...  (default_drop_off_point_id => bookmark.bid)
#  fk_rails_...  (default_pick_up_point_id => bookmark.bid)
#  fk_rails_...  (office_id => offices.id)
#
class Customer < ApplicationRecord
  include MultiOfficeScoped
  include TimeFormattable

  time_formatted_attributes :departure_time, :arrival_time, :start_time

  belongs_to :office, inverse_of: :customers
  has_one :user, class_name: 'User', inverse_of: :customer, dependent: :nullify
  has_many :use_cases, dependent: :destroy, class_name: 'CustomerUseCase'
  has_many :ngs, foreign_key: :customer_a_id, dependent: :destroy, class_name: 'CustomerNg', inverse_of: :customer_a
  has_one :image, dependent: :destroy, class_name: 'CustomerImage'
  belongs_to :default_pick_up_point, class_name: 'Area::Bookmark',
                                     primary_key: :bid, optional: true
  belongs_to :default_drop_off_point, class_name: 'Area::Bookmark',
                                      primary_key: :bid, optional: true
  belongs_to :requested_source, class_name: 'RequestedCustomer',
                                primary_key: :id, foreign_key: :requested_customer_id, optional: true,
                                inverse_of: false

  enum contract_status: { '契約': 1, '体験': 2, '停止': 3, '他事業所': 4 }
  enum seat_assignment: { '助手席': 1, '運転手の後ろ': 2 }

  validates :name, presence: true
  validates :name_kana, presence: true
  validates :departure_time, presence: true
  validates :arrival_time, presence: true

  def bookmarks
    Area::Bookmark.where(office_code: office.cd, reference_id: cd)
  end

  def bookmarks_with_order
    p_bookmarks = Area::PBookmark.where(office_code: office.cd, customer_cd: cd)
    bookmarks_with_order = bookmarks.map do |bookmark|
      p_bookmark = p_bookmarks.find { |p| p.bookmark_id == bookmark.bid }
      {
        order: point_order(p_bookmark.point),
        bookmark:
      }
    end

    bookmarks_with_order.sort_by do |bwo|
      bwo[:order]
    end

    bookmarks_with_order
  end

  def car_restriction_name
    car_restriction_names = bookmarks.map do |bookmark|
      bookmark.car_restriction.name
    end.uniq
    car_restriction_names.join(',')
  end

  def active_days_of_week
    use_cases.where(active: true).map(&:day_of_week)
  end

  def use_case_for_day_of_week(day_of_week)
    use_cases.find_by(day_of_week:, active: true)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[contract_status cd name_kana stopped_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[image ngs office use_cases]
  end

  def origin_office_id
    requested_source&.office_id || office_id
  end

  def origin_office_name
    Office.find(origin_office_id).name
  end

  def active?
    contract_status.in?(%w[契約 体験]) && (stopped_at.blank? || stopped_at > Time.zone.today)
  end

  private

  def point_order(point)
    lookup = {
      'A' => 1,
      'C' => 2,
      'D' => 3,
      'E' => 4,
      'F' => 5
    }
    lookup[point]
  end
end
