# frozen_string_literal: true

json.office do
  json.extract! @office, :cd, :tenant_cd, :name, :name_kana, :postcode, :address,
                :tel, :fax, :mail, :contact_person_name, :contact_person_kana,
                :is_active, :category, :only_schedule_create
  json.updated_at @office.updated_at.strftime('%Y/%m/%d')
  json.lat @office.lat.to_f
  json.lng @office.lng.to_f
  json.accept_office_ids @office.accept_office_ids
end
