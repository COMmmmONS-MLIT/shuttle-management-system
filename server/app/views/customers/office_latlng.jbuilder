# frozen_string_literal: true

json.office_latlng do
  bookmark = current_office.find_bookmark
  if bookmark.present?
    json.lat bookmark.lat
    json.lng bookmark.lng
  else
    json.lat nil
    json.lng nil
  end
end
