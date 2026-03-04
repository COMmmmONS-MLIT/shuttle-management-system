# frozen_string_literal: true

module TimeFormattable
  extend ActiveSupport::Concern

  class_methods do
    def time_formatted_attributes(*attributes)
      attributes.each do |attr|
        define_method("formatted_#{attr}") do
          public_send(attr)&.strftime('%H:%M')
        end
      end
    end
  end
end
