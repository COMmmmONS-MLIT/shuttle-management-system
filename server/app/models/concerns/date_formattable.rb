# frozen_string_literal: true

module DateFormattable
  extend ActiveSupport::Concern

  class_methods do
    def date_formatted_attributes(*attributes)
      attributes.each do |attr|
        define_method("formatted_#{attr}") do
          public_send(attr)&.strftime('%Y/%m/%d')
        end
      end
    end
  end
end
