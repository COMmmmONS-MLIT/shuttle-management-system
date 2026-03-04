# frozen_string_literal: true

namespace :db do
  task apply: :environment do
    # 全てのスキーマを順番に適用
    %w[auth area office request].each do |schema_type|
      command = [
        'bundle', 'exec', 'ridgepole',
        '-c', 'config/database.yml',
        '-E', Rails.env,
        '-f', "db/#{schema_type}/schemafile",
        '--apply'
      ]

      system(*command)
    end

    system 'bundle exec annotate' if Rails.env.development?
  end
end
