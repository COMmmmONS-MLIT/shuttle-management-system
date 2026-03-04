# frozen_string_literal: true

json.customer_ngs @customer_ngs do |customer_ng|
  json.extract! customer_ng, :id, :customer_a_id, :customer_b_id, :reason, :created_at, :updated_at
  json.customer_a do
    json.extract! customer_ng.customer_a, :id, :name, :name_kana
    json.image customer_ng.customer_a.image.image if customer_ng.customer_a.image.present?
  end
  json.customer_b do
    json.extract! customer_ng.customer_b, :id, :name, :name_kana
    json.image customer_ng.customer_b.image.image if customer_ng.customer_b.image.present?
  end
end

json.total_pages @customer_ngs.total_pages if @customer_ngs.respond_to?(:total_pages)
json.current_page @customer_ngs.current_page if @customer_ngs.respond_to?(:current_page)
json.count @customer_ngs.total_count
