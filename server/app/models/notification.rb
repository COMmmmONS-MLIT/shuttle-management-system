# frozen_string_literal: true

# == Schema Information
#
# Table name: notifications
#
#  id                        :integer          not null, primary key
#  category(カテゴリ (enum)) :integer
#  message(メッセージ)       :string(255)      not null
#  read_at(確認した時間)     :datetime
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  office_id(事業所ID (FK))  :integer          not null
#
# Indexes
#
#  index_notifications_on_office_id  (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (office_id => offices.id)
#
class Notification < ApplicationRecord
  include MultiOfficeScoped
  include DateFormattable
  date_formatted_attributes :created_at, :updated_at, :read_at

  belongs_to :office

  enum category: {
    request: 1,
    allow: 2,
    cancel: 3,
    share: 4,
    cancel_request_after_approval: 5,
    cancel_after_approval: 6,
    rejected: 7
  }

  validates :message, presence: true
end
