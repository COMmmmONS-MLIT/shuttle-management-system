# frozen_string_literal: true

class TourismDistanceRouteOptimizer
  def initialize(visiting, office)
    @visiting = visiting
    @office = office
    @departure_bookmark = visiting.departure_bookmark || office.find_bookmark
  end

  def optimize
    customers = @visiting.customers.to_a
    return if customers.empty?

    ordered_vps = @visiting.type == 'pick_up' ? build_pick_up_route(customers) : build_drop_off_route(customers)

    save_route(ordered_vps)
  end

  private

  # 迎え便のルート構築: base_points(遠い順) → points(近い順)
  def build_pick_up_route(customers)
    base_bookmarks = fetch_bookmarks(customers.map(&:base_point_id))

    # base_pointsを出発地点から遠い順に並べる（乗車地点）
    ordered_base_points = order_by_farthest(@departure_bookmark, base_bookmarks)
    last_base_point = ordered_base_points.last || @departure_bookmark

    # 最後のbase_pointからpointsを近い順に並べる（降車地点）
    point_bookmarks = fetch_bookmarks(customers.map(&:point_id))
    ordered_points = order_by_nearest(last_base_point, point_bookmarks)

    # VP用のデータを構築: base_points(乗車) → points(降車)の順
    build_vp_data(ordered_base_points, ordered_points, 'pick_up')
  end

  # 送り便のルート構築: points(遠い順) → base_points(近い順)
  def build_drop_off_route(customers)
    base_bookmarks = fetch_bookmarks(customers.map(&:base_point_id))

    # 出発地点から一番近いbase_pointを起点とする
    starting_base_point = find_nearest(@departure_bookmark, base_bookmarks)

    # 起点から遠い順にpointsを並べる（乗車地点）
    point_bookmarks = fetch_bookmarks(customers.map(&:point_id))
    ordered_points = order_by_farthest(starting_base_point, point_bookmarks)
    last_point = ordered_points.last || starting_base_point

    # 最後のpointから近い順にbase_pointsを並べる（降車地点）
    ordered_base_points = order_by_nearest(last_point, base_bookmarks)

    # VP用のデータを構築: points(乗車) → base_points(降車)の順
    build_vp_data(ordered_points, ordered_base_points, 'drop_off')
  end

  def fetch_bookmarks(point_ids)
    point_ids.compact.uniq.filter_map { |id| Area::Bookmark.find_by(bid: id) }
  end

  def build_vp_data(first_group, second_group, soge_type)
    vps = []
    order = 1

    first_group.each do |bookmark|
      vps << { point_id: bookmark.bid, soge_type:, order: }
      order += 1
    end

    second_group.each do |bookmark|
      vps << { point_id: bookmark.bid, soge_type:, order: }
      order += 1
    end

    vps
  end

  def find_nearest(start_point, bookmarks)
    return nil if bookmarks.empty?

    bookmarks.min_by do |bookmark|
      haversine_distance(start_point, bookmark)
    end
  end

  # 起点からの距離で近い順にソート（単純距離順）
  def order_by_nearest(start_point, bookmarks)
    return [] if bookmarks.empty?

    bookmarks.sort_by do |bookmark|
      haversine_distance(start_point, bookmark)
    end
  end

  # 起点からの距離で遠い順にソート（単純距離順）
  def order_by_farthest(start_point, bookmarks)
    return [] if bookmarks.empty?

    bookmarks.sort_by do |bookmark|
      -haversine_distance(start_point, bookmark)
    end
  end

  def haversine_distance(point_a, point_b)
    DistanceRouteOptimizer.haversine_distance(
      point_a.lat.to_f, point_a.lng.to_f,
      point_b.lat.to_f, point_b.lng.to_f
    )
  end

  def save_route(ordered_vps)
    form = TourismVisitingsRouteAssignmentForm.new(@office, @visiting)
    form.register_customers_and_points(ordered_vps, @visiting.customers.pluck(:id))

    # arrival VPが最後になるよう確認
    @visiting.reload
    ensure_arrival_vp_last

    @visiting.for_points_calculate_times
  end

  def ensure_arrival_vp_last
    arrival_vp = @visiting.base_points.find_by(arrival: true)
    return unless arrival_vp

    max_order = @visiting.base_points.maximum(:order)
    arrival_vp.update!(order: max_order + 1) if arrival_vp.order != max_order
  end
end
