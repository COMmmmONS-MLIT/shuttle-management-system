# frozen_string_literal: true

# == Schema Information
#
# Table name: visiting_max_passengers
#
#  has_capacity_violation      :integer
#  has_wc_capacity_violation   :integer
#  max_passengers              :decimal(41, )
#  max_wc_passengers           :decimal(41, )
#  office_id(事業所ID (FK))    :integer          not null
#  visiting_id                 :integer          primary key
#
class VisitingMaxPassenger < ApplicationRecord
  include MultiOfficeScoped

  self.primary_key = :visiting_id

  belongs_to :visiting
  belongs_to :office

  # VIEWなので読み取り専用
  def readonly?
    true
  end
end
