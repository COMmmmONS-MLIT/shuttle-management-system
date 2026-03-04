# frozen_string_literal: true

# == Schema Information
#
# Table name: visitings_points
#
#  id                                                     :integer          not null, primary key
#  actual_time(実迎時間)                                  :time
#  arrival(便の到着地点)                                  :boolean          default(FALSE), not null
#  date(日付)                                             :date
#  note(備考)                                             :text(65535)
#  order(順番)                                            :integer
#  soge_type(利用者の送迎区分 迎えのみ: 1, 送りを含む: 2) :integer
#  created_at                                             :datetime         not null
#  updated_at                                             :datetime         not null
#  office_id(事業所ID (FK))                               :integer          not null
#  point_id(場所ID (FK))                                  :integer
#  visiting_id(送迎ID (FK))                               :integer
#
# Indexes
#
#  index_visitings_points_on_office_id    (office_id)
#  index_visitings_points_on_visiting_id  (visiting_id)
#
# Foreign Keys
#
#  fk_rails_...  (office_id => offices.id)
#  fk_rails_...  (visiting_id => visitings.id)
#
class VisitingsPoint < ApplicationRecord
  include MultiOfficeScoped
  include TimeFormattable

  time_formatted_attributes :actual_time

  belongs_to :office
  belongs_to :visiting, optional: true, inverse_of: :base_points
  belongs_to :bookmark, class_name: 'Area::Bookmark', foreign_key: :point_id, primary_key: :bid, optional: true,
                        inverse_of: :visitings_points

  enum soge_type: { pick_up: 1, drop_off: 2 }

  def visitings_customers
    visiting.customers.where(point_id:, soge_type:)
  end
end
