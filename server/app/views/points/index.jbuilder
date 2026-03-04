# frozen_string_literal: true

json.points @bookmarks do |bookmark|
  json.partial!('points/point_basic', bookmark:)
end

json.partial! 'shared/pagination', collection: @bookmarks
