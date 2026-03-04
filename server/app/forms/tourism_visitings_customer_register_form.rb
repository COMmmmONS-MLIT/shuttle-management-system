# frozen_string_literal: true

class TourismVisitingsCustomerRegisterForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :name
  attribute :name_kana
  attribute :phone_number
  attribute :passenger_count
  attribute :date
  attribute :soge_type
  attribute :schedule_time
  attribute :base_point_id
  attribute :point_id
  attribute :note

  validates :name, presence: true
  validates :name_kana, presence: true
  validates :phone_number, presence: true
  validates :passenger_count, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :soge_type, presence: true
  validates :schedule_time, presence: true
  validates :base_point_id, presence: true

  def create
    return false unless valid?

    ActiveRecord::Base.transaction do
      new_customer_data = {
        cd: 0o0000, # 一時的に0000とする
        name:,
        name_kana:,
        phone_number:,
        contract_status: 2,
        departure_time: '00:00',
        arrival_time: '00:00',
        start_time: '00:00'
      }
      customer = Customer.create!(new_customer_data)

      # customerのidを取得してcdを更新
      customer.update!(cd: customer.id.to_s)

      point_id = Current.office.find_bookmark.bid
      new_visitings_customer_data = {
        soge_type:,
        date:,
        customer_id: customer.id,
        schedule_time:,
        start_time: '00:00',
        point_id:,
        base_point_id:,
        is_self: false,
        passenger_count:,
        note:
      }
      VisitingsCustomer.find_or_create_by!(
        customer_id: customer.id,
        date:,
        soge_type:
      ) do |vc|
        vc.assign_attributes(new_visitings_customer_data)
      end
    end
  end

  def update(visitings_customer)
    return false unless valid?

    ActiveRecord::Base.transaction do
      update_customer_data = {
        cd: 0o0000, # 一時的に0000とする
        name:,
        name_kana:,
        phone_number:,
        contract_status: 2,
        departure_time: '00:00',
        arrival_time: '00:00',
        start_time: '00:00'
      }
      visitings_customer.customer.update!(update_customer_data)

      new_visitings_customer_data = {
        soge_type:,
        date:,
        schedule_time:,
        start_time: '00:00',
        point_id:,
        base_point_id:,
        is_self: false,
        passenger_count:,
        note:
      }
      visitings_customer.update!(new_visitings_customer_data)
    end
  end
end
