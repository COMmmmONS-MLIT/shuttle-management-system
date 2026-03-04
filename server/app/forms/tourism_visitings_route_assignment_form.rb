# frozen_string_literal: true

class TourismVisitingsRouteAssignmentForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  def initialize(office, visiting)
    @office = office
    @visiting = visiting
    @departure_point_id = @visiting.departure_bookmark&.bid || office.find_bookmark.bid
    @arrival_point_id = @visiting.arrival_bookmark&.bid || office.find_bookmark.bid
    @arrival_vp = @visiting.base_points.find_or_create_by(arrival: true, date: @visiting.date)
  end

  validate :validate_office
  validate :validate_visiting

  def register_customers_and_points(visitings_points, visitings_customer_ids)
    ActiveRecord::Base.transaction do
      # vcをvisitingに割り当て
      @visiting.customers.each do |vc|
        vc.update!(visiting_id: nil)
      end

      VisitingsCustomer.where(id: visitings_customer_ids).find_each do |vc|
        vc.update!(visiting_id: @visiting.id, order: 0)
      end

      # vpを削除
      @visiting.base_points.where.not(id: @arrival_vp.id).find_each(&:destroy!)

      # visiting_assignmentsの調整
      points = adjust_visitings_points(visitings_points)
      points.each.with_index(1) do |vp, i|
        @visiting.base_points.create!(order: i, point_id: vp[:point_id], visiting_id: @visiting.id,
                                      date: @visiting.date, soge_type: vp[:soge_type])
        @arrival_vp.update!(order: i + 1, point_id: @arrival_point_id) if points.count == i
      end

      # 利用者がいない場合は送迎を削除
      @visiting.reload
      if @visiting.customers.count.zero?
        @visiting.destroy!
      else
        update_all_vp_notes
      end
    end
  end

  # 全てのVPのnoteを更新（同じpoint_idを持つ利用者の名前）
  def update_all_vp_notes
    # 各point_idごとに利用者をグループ化
    customers_by_point_id = @visiting.customers.group_by(&:base_point_id)

    # 全てのVPを更新
    @visiting.base_points.each do |vp|
      if vp.point_id == @arrival_point_id
        all_customer_names = @visiting.customers.map(&:customer).map(&:name).join(',')
        vp.update!(note: all_customer_names)
      else
        customers_for_point = customers_by_point_id[vp.point_id] || []
        customer_names = customers_for_point.map(&:customer).map(&:name).join(',')
        vp.update!(note: customer_names)
      end
    end
  end

  def adjust_visitings_points(visitings_points)
    @visiting.reload
    # 1. vcに必要なbookmarkを取得
    visitings_customers = @visiting.customers
    vc_points = visitings_customers.map { |vc| { point_id: vc.point_id, soge_type: vc.soge_type } }.compact.uniq

    # 2. vcに登録されているbase_pointも追加
    visitings_customers.each do |vc|
      if vc.soge_type == 'pick_up'
        next if vc.base_point_id.blank? || vc.base_point_id == @arrival_point_id

        vc_points.unshift({ point_id: vc.base_point_id, soge_type: vc.soge_type })
      else
        next if vc.base_point_id.blank? || vc.base_point_id == @departure_point_id

        vc_points.push({ point_id: vc.base_point_id, soge_type: vc.soge_type })
      end
    end

    vc_points.uniq!

    # 3. paramsで取得したvp
    vp_points = visitings_points.map { |vp| { point_id: vp[:point_id], soge_type: vp[:soge_type] } }.compact.uniq

    # 4. 削除対象のvpを特定
    vp_to_remove = vp_points - vc_points

    # 5. 追加対象のvpを特定
    vp_to_add = vc_points - vp_points
    # 6. vpを削除
    vp_to_remove.each do |point|
      visitings_points.reject! do |vp|
        vp[:point_id] == point[:point_id] && vp[:soge_type] == point[:soge_type]
      end
    end

    # 7. vpを追加
    vp_to_add.each do |point|
      order = visitings_points.count + 1
      visitings_points.push({ id: nil, point_id: point[:point_id], soge_type: point[:soge_type], order: })
    end

    visitings_points.sort_by { |vp| vp[:order] }
  end

  private

  def validate_office
    return if @office.present?

    errors.add(:office, 'は必須です')
  end

  def validate_visiting
    return if @visiting.present?

    errors.add(:visiting, 'は必須です')
  end
end
