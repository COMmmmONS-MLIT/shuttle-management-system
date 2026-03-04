# frozen_string_literal: true

# connection_poolの内容をもとにDB接続のメソッドを作成しているため、ハージョンアップ時に注意が必要
# 対応している箇所
# rails/activerecord/lib/active_record/connection_handling.rb
# rails/activerecord/lib/active_record/connection_adapters/abstract/connection_handler.rb

module DatabaseConnecter
  extend ActiveSupport::Concern

  included do
    before_action :database_connection
    after_action :database_disconnect
  end

  def database_connection
    return unless current_user

    office_db_name = current_user.office.office_database.name
    area_db_name = current_user.office.area_database.name
    set_current_database(office_db_name, area_db_name)

    establish_connection(office_db_name)
    establish_connection(area_db_name)
  end

  # 処理終了時に接続を切断する
  def database_disconnect
    OfficeRecordBase.remove_connection
    AreaRecordBase.remove_connection
  end

  private

  def set_current_database(office_db, area_db)
    OfficeRecordBase.connection_specification_name = office_db
    AreaRecordBase.connection_specification_name = area_db
  end

  def establish_connection(db_name)
    db_config = ActiveRecord::Base.configurations.resolve(database_config(db_name))
    pool_config = ActiveRecord::ConnectionAdapters::PoolConfig.new(determine_owner_name(db_name), db_config, role,
                                                                   shard)
    pool_manager = find_or_create_pool_manager(pool_config.connection_name)
    pool_manager.set_pool_config(role, shard, pool_config)

    payload = {
      connection_name: pool_config.connection_name,
      role:,
      shard:,
      config: db_config.configuration_hash
    }

    ActiveSupport::Notifications.instrumenter.instrument('!connection.active_record', payload) do
      pool_config.pool
    end
  end

  # poolに必要なconnection_classにはいる文字を作成(本来は、ActiveRecord::Base等を利用するため、name属性が必要になるため)
  def determine_owner_name(name)
    ActiveRecord::ConnectionAdapters::ConnectionHandler::StringConnectionName.new(name)
  end

  def database_config(name)
    {
      **Rails.configuration.database_configuration['default'],
      database: name
    }
  end

  # active_recordで接続先のDBは、モデルのconnection_specification_nameが
  # ActiveRecord::ConnectionAdapters::ConnectionHandlerの@connection_name_to_pool_managerの中で一致するconnection_poolとなる
  # そのため、接続情報がある場合は、その接続情報に対応するconnection_poolを取得する
  # その接続情報がない場合は、新しくconnection_poolを作成して取得する
  def find_or_create_pool_manager(connection_name)
    ActiveRecord::Base.connection_handler.instance_variable_get(:@connection_name_to_pool_manager)[connection_name] ||=
      ActiveRecord::ConnectionAdapters::PoolManager.new
  end

  def role
    :writing
  end

  def shard
    :default
  end
end
