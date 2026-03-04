# frozen_string_literal: true

json.visitings_customers @visitings_customers do |vc|
  json.partial! 'visitings_customers/visitings_customer_basic', vc:
end
