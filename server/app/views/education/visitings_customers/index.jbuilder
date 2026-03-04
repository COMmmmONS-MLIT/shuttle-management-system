# frozen_string_literal: true

json.visitings_customers @visitings_customers do |vc|
  json.partial!('visitings_customers/visitings_customer_basic', vc:)

  json.addresses_options vc.customer.bookmarks do |bookmark|
    json.value bookmark.bid
    json.label bookmark.address_label
  end
end
