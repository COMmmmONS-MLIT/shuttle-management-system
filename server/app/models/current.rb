# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :office

  def reset
    self.office = nil
  end
end
