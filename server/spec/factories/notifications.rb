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
FactoryBot.define do
  factory :notification do
    message { 'テスト通知メッセージ' }
    category { :request }
    read_at { nil }
    metadata { nil }
  end
end
