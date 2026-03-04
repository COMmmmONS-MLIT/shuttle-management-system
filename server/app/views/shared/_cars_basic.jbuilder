# frozen_string_literal: true

json.cars @cars do |car|
  json.extract! car, :id, :name, :number, :max_seat, :max_wc_seat
end
