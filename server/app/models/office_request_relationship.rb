# frozen_string_literal: true

# == Schema Information
#
# Table name: office_request_relationships
#
#  id                                :integer          not null, primary key
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#  accept_office_id(依頼先事業所ID)  :integer          not null
#  request_office_id(依頼元事業所ID) :integer          not null
#
# Indexes
#
#  index_office_request_relationships_on_accept_office_id   (accept_office_id)
#  index_office_request_relationships_on_request_office_id  (request_office_id)
#
# Foreign Keys
#
#  fk_rails_...  (accept_office_id => offices.id)
#  fk_rails_...  (request_office_id => offices.id)
#
class OfficeRequestRelationship < ApplicationRecord
  belongs_to :request_office, class_name: 'Office'
  belongs_to :accept_office, class_name: 'Office'
end
