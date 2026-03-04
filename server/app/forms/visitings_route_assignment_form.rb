# frozen_string_literal: true

class VisitingsRouteAssignmentForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  def initialize(office, visiting, adjustment_time = 0)
    @office = office
    @visiting = visiting
    @adjustment_time = adjustment_time || 0
    @departure_point_id = @visiting.departure_bookmark&.bid || office.find_bookmark.bid
    @arrival_point_id = @visiting.arrival_bookmark&.bid || office.find_bookmark.bid
    @arrival_vp = @visiting.base_points.find_or_create_by(arrival: true, date: @visiting.date)
  end

  validate :validate_office
  validate :validate_visiting

  def register_customers_and_points(visiting_assignments)
    # ActionController::Parametersを配列に変換
    visiting_assignments = visiting_assignments.to_a if visiting_assignments.is_a?(ActionController::Parameters)
    ActiveRecord::Base.transaction do
      # 既存のVCを一旦解除
      @visiting.customers.each do |vc|
        vc.update!(visiting_id: nil)
      end

      # visiting_assignmentsの調整
      adjustment_visiting_assignments = adjust_visiting_assignments(visiting_assignments)
      if adjustment_visiting_assignments.count.zero?
        @visiting.update!(departure_time: nil, arrival_time: nil)
      elsif adjustment_visiting_assignments.count == 1
        va = adjustment_visiting_assignments[0]
        visiting_customer = VisitingsCustomer.find(va[:id])
        visiting_customer.update!(order: 1, visiting_id: @visiting.id)
        @arrival_vp.update!(order: 2, point_id: @arrival_point_id)
      else
        # 複数人の場合の処理
        adjustment_visiting_assignments.each.with_index(1) do |va, i|
          if va[:point_type].nil? || va[:point_type] == 'VisitingsCustomer'
            vc = VisitingsCustomer.find(va[:id])
            vc.update!(order: i, visiting_id: @visiting.id)
          elsif va[:point_type] == 'VisitingsPoint'
            if va[:id].present?
              vp = VisitingsPoint.find(va[:id])
              vp.update!(order: i)
            else
              vp = VisitingsPoint.new(order: i, point_id: va[:point_id], visiting_id: @visiting.id,
                                      date: @visiting.date, soge_type: va[:soge_type])
              vp.save!
            end
          end
          @arrival_vp.update!(order: i + 1, point_id: @arrival_point_id) if adjustment_visiting_assignments.count == i
        end
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

  # 全てのVPのnoteを更新（同じpoint_id + soge_typeを持つ利用者の名前）
  def update_all_vp_notes
    @visiting.base_points.each do |vp|
      if vp.point_id == @arrival_point_id
        # 到着地点VPは全利用者の名前を設定
        all_customer_names = @visiting.customers.map(&:customer).map(&:name).join(',')
        soge_type = @visiting.customers.map(&:soge_type).join(',').include?('drop_off') ? 'drop_off' : 'pick_up'
        vp.update!(note: all_customer_names, soge_type:)
      else
        # VPのsoge_typeと同じsoge_typeの利用者のみを対象
        customers_for_point = @visiting.customers.select do |vc|
          vc.base_point_id == vp.point_id && vc.soge_type == vp.soge_type
        end
        customer_names = customers_for_point.map(&:customer).map(&:name).join(',')
        vp.update!(note: customer_names)
        # soge_typeは作成時に設定済みなので更新不要
      end
    end
  end

  # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Style/MultilineBlockChain
  def adjust_visiting_assignments(visiting_assignments)
    visiting_assignments.reject! do |item|
      item[:point_type] == 'VisitingsPoint' && item[:id].present? &&
        (VisitingsPoint.find(item[:id]).arrival? ||
        VisitingsPoint.find(item[:id]).point_id == @arrival_point_id)
    end

    visiting_assignments.sort_by! { |item| item[:order] }

    # 現在のVPのpoint_id + soge_type を取得（到着地点VPは除外）
    current_vp_point_soge_types = @visiting.base_points.where.not(arrival: true).map do |vp|
      { point_id: vp.point_id, soge_type: vp.soge_type }
    end

    visitings_customers_of_argument = visiting_assignments.select do |item|
      item[:point_type].nil? || item[:point_type] == 'VisitingsCustomer'
    end
    visitings_customers = visitings_customers_of_argument.map { |vc| VisitingsCustomer.find(vc[:id]) }

    # VCのbase_point_id + soge_type の組み合わせを取得
    # 送り（drop_off）: 出発地点と比較 → 一致すれば除外
    # 迎え（pick_up）: 到着地点と比較 → 一致すれば除外
    vc_base_point_soge_types = visitings_customers.map do |vc|
      { point_id: vc.base_point_id, soge_type: vc.soge_type }
    end.compact.uniq { |h| [h[:point_id], h[:soge_type]] }.reject do |h|
      (h[:soge_type] == 'drop_off' && h[:point_id] == @departure_point_id) ||
        (h[:soge_type] == 'pick_up' && h[:point_id] == @arrival_point_id)
    end

    # 追加が必要なVPを特定（point_id + soge_type の組み合わせで比較）
    vp_to_add = vc_base_point_soge_types.reject do |vc_pst|
      current_vp_point_soge_types.any? do |vp_pst|
        vp_pst[:point_id] == vc_pst[:point_id] && vp_pst[:soge_type] == vc_pst[:soge_type]
      end
    end

    # 削除が必要なVPを特定（point_id + soge_type の組み合わせで比較）
    vp_to_remove = current_vp_point_soge_types.reject do |vp_pst|
      vc_base_point_soge_types.any? do |vc_pst|
        vc_pst[:point_id] == vp_pst[:point_id] && vc_pst[:soge_type] == vp_pst[:soge_type]
      end
    end

    # VPを削除（事業所VPは除外）
    vp_to_remove.each do |pst|
      @visiting.base_points.where(point_id: pst[:point_id], soge_type: pst[:soge_type])
               .where.not(arrival: true).find_each do |vp|
        vp.destroy!
        visiting_assignments.reject! do |item|
          item[:point_type] == 'VisitingsPoint' && item[:id].present? && item[:id] == vp.id
        end
      end
    end

    # VPをassignmentに追加（soge_typeごとに別々のVPを追加）
    vp_to_add.each do |pst|
      if pst[:soge_type] == 'pick_up'
        # 迎え用VP：末尾に追加（迎え利用者の後に経由地点に行く）
        visiting_assignments.push({
                                    id: nil,
                                    point_type: 'VisitingsPoint',
                                    point_id: pst[:point_id],
                                    soge_type: pst[:soge_type]
                                  })
      else
        # 送り用VP：先頭に追加（経由地点から送り利用者を送る）
        visiting_assignments.unshift({
                                       id: nil,
                                       point_type: 'VisitingsPoint',
                                       point_id: pst[:point_id],
                                       soge_type: pst[:soge_type]
                                     })
      end
    end

    visiting_assignments
  end
  # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Style/MultilineBlockChain

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
