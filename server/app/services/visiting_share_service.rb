# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class VisitingShareService
  def initialize(visiting)
    @visiting = visiting
    @accept_office = visiting.office
  end

  def self.reshare_visiting(visiting_id)
    visiting = Visiting.find_by(id: visiting_id)
    return unless visiting

    delete_shared_visiting_by_source(visiting_id)

    service = new(visiting)
    office_ids = service.share_to_office
    return if office_ids.blank?

    office_ids.uniq.each do |office_id|
      Notification.create!(
        message: "【#{Current.office.name}】から、#{visiting.date}の送迎が更新されました。",
        category: :share,
        office_id:
      )
    end
  end

  def self.delete_shared_visiting_by_source(source_visiting_id)
    shared_visitings = Visiting.unscoped.where(source_visiting_id:, is_shared: true)

    shared_visitings.find_each do |shared_visiting|
      VisitingsPoint.unscoped.where(visiting_id: shared_visiting.id).find_each(&:destroy!)
      VisitingsCustomer.unscoped.where(visiting_id: shared_visiting.id).find_each do |vc|
        vc.update!(visiting_id: nil)
      end
      shared_visiting.destroy!
    end
  end

  def self.share_visitings(date, visiting_ids)
    # 1. 対象日付の委託側のリクエスト便データを全削除
    delete_all_shared_visitings(date)

    # 2. 指定された便情報について作成
    shared_office_ids = []
    visiting_ids.each do |visiting_id|
      visiting = Visiting.find_by!(id: visiting_id, date:)

      service = new(visiting)
      ids = service.share_to_office
      shared_office_ids += ids if ids.present?
    end
    shared_office_ids.uniq.each do |office_id|
      Notification.create!(
        message: "【#{Current.office.name}】から、#{date}の送迎が共有されました。",
        category: :share,
        office_id:
      )
    end

    shared_office_ids
  end

  def self.delete_all_shared_visitings(date)
    current_office_id = Current.office.id
    source_visiting_ids = Visiting.where(date:).pluck(:id)

    # 共有された便を削除
    shared_visitings = Visiting.unscoped
                               .where(date:, is_shared: true,
                                      source_office_id: current_office_id,
                                      source_visiting_id: source_visiting_ids)

    shared_visitings.find_each do |shared_visiting|
      VisitingsPoint.unscoped.where(visiting_id: shared_visiting.id).find_each(&:destroy!)

      # VCの visiting_id を nil に更新（削除はしない）
      VisitingsCustomer.unscoped.where(visiting_id: shared_visiting.id).find_each do |vc|
        vc.update!(visiting_id: nil)
      end

      shared_visiting.destroy!
    end

    # 以前共有されたが今回は共有されなかった便の削除
    destroy_not_shared_visitings(date, source_visiting_ids, current_office_id)
  end

  def self.destroy_not_shared_visitings(date, source_visiting_ids, source_office_id)
    Visiting.unscoped
            .where(date:, is_shared: true, source_office_id:)
            .where.not(source_visiting_id: source_visiting_ids)
            .where.not(source_visiting_id: nil)
            .find_each do |shared_visiting|
      VisitingsPoint.unscoped.where(visiting_id: shared_visiting.id).find_each(&:destroy!)

      # VCの visiting_id を nil に更新（削除はしない）
      VisitingsCustomer.unscoped.where(visiting_id: shared_visiting.id).find_each do |vc|
        vc.update!(visiting_id: nil)
      end

      shared_visiting.destroy!
    end
  end

  def share_to_office
    # 共有先のオフィスIDを取得
    office_ids = VisitingsCustomer.where(visiting_id: @visiting.id, is_requested: true, date: @visiting.date)
                                  .joins('JOIN customers ON customers.id = visitings_customers.customer_id')
                                  .joins(
                                    'JOIN requested_customers ON ' \
                                    'requested_customers.id = customers.requested_customer_id'
                                  )
                                  .distinct
                                  .pluck('requested_customers.office_id')
                                  .compact

    return if office_ids.empty?

    office_ids.each do |office_id|
      create_shared_soge(office_id)
    end

    office_ids
  end

  private

  def create_shared_soge(office_id)
    visiting = create_shared_visiting(office_id)
    copy_base_points(visiting, office_id)
    create_customers(visiting, office_id)
  end

  def create_shared_visiting(office_id)
    # office_idのCurrent.officeコンテキストに切り替え
    original_office = Current.office
    car_name = @visiting.car.name

    driver_name = @visiting.driver&.name
    tenjo_name = @visiting.tenjo&.name
    Current.office = Office.find(office_id)

    begin
      Visiting.create!(
        source_visiting_id: @visiting.id,
        source_office_id: original_office.id,
        is_shared: true,
        shared_car_name: car_name,
        shared_driver_name: driver_name,
        shared_tenjo_name: tenjo_name,
        bin_order: @visiting.bin_order,
        date: @visiting.date,
        departure_time: @visiting.departure_time,
        arrival_time: @visiting.arrival_time,
        departure_point_id: @visiting.departure_point_id,
        arrival_point_id: @visiting.arrival_point_id,
        driver_id: @visiting.driver_id,
        tenjo_id: @visiting.tenjo_id
      )
    ensure
      Current.office = original_office
    end
  end

  def copy_base_points(visiting, office_id)
    VisitingsPoint.where(visiting_id: @visiting.id).find_each do |point|
      VisitingsPoint.unscoped.create!(
        office_id:,
        visiting_id: visiting.id,
        soge_type: point.soge_type,
        date: point.date,
        order: point.order,
        actual_time: point.actual_time,
        point_id: point.point_id,
        note: point.note,
        arrival: point.arrival
      )
    end
  end

  def create_customers(visiting, office_id)
    original_office = Current.office
    Current.office = Office.find(office_id)

    begin
      # 受託側の便のVCを取得
      VisitingsCustomer.unscoped.where(visiting_id: @visiting.id,
                                       date: @visiting.date).find_each do |vc|
        customer = Customer.unscoped.find_by(id: vc.customer_id)
        target_customer_id = find_or_create_target_customer_id(customer, office_id)

        next unless target_customer_id

        update_or_create_shared_vc(visiting, vc, target_customer_id)
      end
    ensure
      Current.office = original_office
    end
  end

  def find_or_create_target_customer_id(customer, office_id)
    customer_office_id = customer.requested_source&.office_id || customer.office_id

    if customer_office_id == office_id
      # 同じオフィスの場合は、そのオフィスの顧客IDを使用
      Customer.find_by(id: customer.requested_source.source_id)&.id
    else
      # 他のオフィスの場合は、マスクされた顧客を作成
      masked_cd = "OTHER_#{customer.id}"
      masked_customer = Customer.find_or_create_by!(
        cd: masked_cd,
        contract_status: :他事業所
      ) do |c|
        c.name = '****'
        c.name_kana = '****'
        c.departure_time = customer.departure_time
        c.arrival_time = customer.arrival_time
      end
      masked_customer.id
    end
  end

  def update_or_create_shared_vc(visiting, source_vc, target_customer_id)
    # 委託側の既存のリクエストVCを探す
    existing_vc = VisitingsCustomer.find_by(
      customer_id: target_customer_id,
      date: source_vc.date,
      soge_type: source_vc.soge_type,
      is_requesting: true
    )

    if existing_vc
      existing_vc.update!(
        visiting_id: visiting.id,
        actual_time: source_vc.actual_time,
        arrival_time: source_vc.arrival_time,
        order: source_vc.order
      )
      existing_vc
    else
      # VCが存在しない場合は新規作成
      VisitingsCustomer.create!(
        customer_id: target_customer_id,
        visiting_id: visiting.id,
        date: source_vc.date,
        soge_type: source_vc.soge_type,
        schedule_time: source_vc.schedule_time,
        actual_time: source_vc.actual_time,
        start_time: source_vc.start_time,
        arrival_time: source_vc.arrival_time,
        order: source_vc.order,
        point_id: source_vc.point_id,
        base_point_id: source_vc.base_point_id,
        passenger_count: source_vc.passenger_count,
        is_requested: false,
        is_requesting: true,
        is_self: source_vc.is_self,
        is_absent: source_vc.is_absent,
        absence_reason: source_vc.absence_reason,
        note: source_vc.note,
        request: source_vc.request
      )
    end
  end
end

# rubocop:enable Metrics/ClassLength
