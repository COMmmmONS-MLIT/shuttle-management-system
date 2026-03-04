# frozen_string_literal: true

# lib/tasks/import_post_codes.rake

namespace :import do
  task post_codes: :environment do
    require 'csv'
    require 'activerecord-import'

    file_path = Rails.root.join('db/area/seeds/post_codes.csv')

    unless File.exist?(file_path)
      exit 1
    end

    Area::PostCode.delete_all

    post_codes = []

    CSV.foreach(file_path, headers: false) do |row|
      postcode, city_name = row.map(&:strip)

      post_codes << Area::PostCode.new(
        postcode:,
        city_name:
      )
    end

    Area::PostCode.import(post_codes)
  end
end
