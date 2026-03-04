# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_images
#
#  id                    :integer          not null, primary key
#  image                 :text(16777215)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  customer_id(利用者ID) :integer          not null
#  office_id(事業所ID)   :integer          not null
#
# Indexes
#
#  index_customer_images_on_customer_id  (customer_id)
#  index_customer_images_on_office_id    (office_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#  fk_rails_...  (office_id => offices.id)
#
class CustomerImage < ApplicationRecord
  include MultiOfficeScoped

  belongs_to :customer
end
