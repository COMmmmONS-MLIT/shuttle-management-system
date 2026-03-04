# frozen_string_literal: true

json.warnings @warnings do |warning|
  json.number warning[:number]
  json.text warning[:text]
  json.customer_id warning[:customer_id]
  json.soge_type warning[:soge_type]
end
