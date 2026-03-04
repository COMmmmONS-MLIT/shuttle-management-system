# frozen_string_literal: true

# == Schema Information
#
# Table name: p_bookmark
#
#  bid(利用者住所のid)     :integer        not null
#  passengerId(利用者番号) :string(12)       not null, primary key
#  事業所cd                :string(4)        not null, primary key
#  地点(A,B,C,D...)        :string(2)        not null, primary key
#  登録日                  :date             not null
#
FactoryBot.define do
  factory :p_bookmark, class: 'Area::PBookmark' do
    created_date { Date.current }
  end
end
