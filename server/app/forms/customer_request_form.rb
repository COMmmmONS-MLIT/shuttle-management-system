# frozen_string_literal: true

class CustomerRequestForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :customer_id
  attribute :address_label
  attribute :departure_time
  attribute :date

  validates :customer_id, :address_label, :departure_time, :date, presence: true
  validate :validate_visitings_customer
  validate :validate_past_date

  def save
    customer = Customer.find(customer_id)
    date_text = date.to_date.strftime('%Y/%m/%d')
    message = "#{customer.name}様から#{date_text}に送迎リクエストがあります" \
              "（#{address_label}に#{departure_time}）"
    Notification.create!(
      office: Current.office,
      category: :request,
      message:
    )
  end

  private

  def validate_visitings_customer
    vc = VisitingsCustomer.find_by(customer_id:, date:)
    errors.add(:all, "#{date.to_date.strftime('%Y/%m/%d')}にはすでに送迎予定があります") if vc.present?
  end

  def validate_past_date
    errors.add(:all, '今日以降の日付を指定してください') if date.to_date < Time.zone.today
  end
end
