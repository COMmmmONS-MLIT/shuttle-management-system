# frozen_string_literal: true

module Searchable
  extend ActiveSupport::Concern

  private

  # ハッシュ形式（ActiveRecord#orderにそのまま渡す想定）
  def order_context(order_params, custom_mappings = {}, default_value = {})
    default_mappings = {
      'kana_asc' => { name_kana: :asc },
      'kana_desc' => { name_kana: :desc },
      'cd_asc' => { cd: :asc },
      'cd_desc' => { cd: :desc },
      'name_asc' => { name: :asc },
      'name_desc' => { name: :desc },
      'name_kana_asc' => { name_kana: :asc },
      'name_kana_desc' => { name_kana: :desc },
      'number_asc' => { number: :asc },
      'number_desc' => { number: :desc },
      'schedule_time_asc' => { schedule_time: :asc },
      'schedule_time_desc' => { schedule_time: :desc },
      'id_asc' => { id: :asc },
      'id_desc' => { id: :desc },
      'address_label_asc' => { address_label: :asc },
      'address_label_desc' => { address_label: :desc },
      'address_asc' => { address: :asc },
      'address_desc' => { address: :desc }
    }
    all_mappings = default_mappings.merge(custom_mappings)
    result = all_mappings[order_params]
    result.nil? ? default_value : result
  end

  # SQL文字列形式（joins含むときに使用）
  def order_context_sql(order_params, default_order = 'schedule_time ASC')
    mappings = {
      'name_kana_asc' => 'customers.name_kana ASC',
      'name_kana_desc' => 'customers.name_kana DESC',
      'schedule_time_asc' => 'schedule_time ASC',
      'schedule_time_desc' => 'schedule_time DESC'
    }
    mappings[order_params] || default_order
  end

  # pairオブジェクト用のソート（sort_byで使用）
  def order_context_for_pair(order_params, pair, custom_mappings = {})
    default_mappings = {
      'name_kana_asc' => ->(p) { p.customer.name_kana },
      'name_kana_desc' => ->(p) { p.customer.name_kana },
      'pick_up_time_asc' => ->(p) { p.pick_up_time_str },
      'pick_up_time_desc' => ->(p) { p.pick_up_time_str },
      'drop_off_time_asc' => ->(p) { p.drop_off_time_str },
      'drop_off_time_desc' => ->(p) { p.drop_off_time_str },
      'start_time_asc' => ->(p) { p.start_time_str },
      'start_time_desc' => ->(p) { p.start_time_str }
    }
    all_mappings = default_mappings.merge(custom_mappings)
    proc = all_mappings[order_params]
    proc&.call(pair)
  end
end
