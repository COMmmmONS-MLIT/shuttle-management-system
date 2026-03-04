# frozen_string_literal: true

class VisitingsCustomersPair
  attr_reader :pick_up, :drop_off

  def initialize(pick_up:, drop_off:)
    @pick_up = pick_up
    @drop_off = drop_off
  end

  delegate :id, to: :pick_up

  delegate :customer, to: :pick_up

  delegate :date, to: :pick_up

  def date_str
    date.strftime('%Y/%m/%d')
  end

  def pick_up_time
    pick_up.schedule_time
  end

  def drop_off_time
    drop_off.schedule_time
  end

  delegate :start_time, to: :pick_up

  def pick_up_time_str
    pick_up.formatted_schedule_time
  end

  def drop_off_time_str
    drop_off.formatted_schedule_time
  end

  def start_time_str
    pick_up.formatted_start_time
  end

  def pick_up_point
    pick_up&.bookmark
  end

  def drop_off_point
    drop_off&.bookmark
  end

  def pick_up_visiting
    Visiting.find_by(id: pick_up.visiting_id)
  end

  def drop_off_visiting
    Visiting.find_by(id: drop_off.visiting_id)
  end

  def image
    pick_up.customer.image&.image
  end

  delegate :is_absent, to: :pick_up

  delegate :absence_reason, to: :pick_up

  def self_pick_up?
    pick_up&.is_self == true
  end

  def self_drop_off?
    drop_off&.is_self == true
  end

  def pick_up_base_point_id
    pick_up&.base_point_id
  end

  def drop_off_base_point_id
    drop_off&.base_point_id
  end

  def pick_up_request
    pick_up&.request
  end

  def drop_off_request
    drop_off&.request
  end

  def requested?
    pick_up.is_requested || drop_off.is_requested
  end

  def requesting?
    pick_up.is_requesting || drop_off.is_requesting
  end

  def can_request?
    pick_up.can_request? || drop_off.can_request?
  end
end
