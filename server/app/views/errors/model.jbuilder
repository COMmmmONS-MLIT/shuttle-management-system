# frozen_string_literal: true

json.keys @model.errors.map(&:attribute).uniq

json.messages do
  @model.errors.map(&:attribute).uniq.each do |key|
    json.set! key, @model.errors.full_messages_for(key)
  end
end

json.full_messages @model.errors.full_messages.uniq
