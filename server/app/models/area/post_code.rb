# frozen_string_literal: true

# == Schema Information
#
# Table name: post_codes
#
#  id                      :bigint           not null, primary key
#  city_code(市町村コード) :decimal(3, )
#  city_name(市区町村名)   :string(100)      not null
#  postcode(郵便番号)      :string(7)        not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
module Area
  class PostCode < ApplicationRecord
  end
end
