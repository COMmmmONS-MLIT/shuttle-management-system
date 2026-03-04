# frozen_string_literal: true

json.staffs @staffs do |staff|
  json.extract! staff, :id, :cd, :name, :name_kana, :category, :can_driver, :can_helper, :driver_type, :office_id,
                :is_stopped
end

json.partial! 'shared/pagination', collection: @staffs
