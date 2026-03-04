# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class CustomerRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :customer
  attribute :use_cases
  attribute :addresses

  validate :validate_customer
  validate :validate_customer_cd_unique
  validate :validate_use_cases
  validate :validate_addresses

  def create
    @office = Current.office
    bookmark_order = bookmark_orders(customer)
    image = customer.delete(:image)
    ActiveRecord::Base.transaction do
      customer[:default_pick_up_point_id] = (customer[:default_pick_up_point_id] || @office.find_bookmark.bid)
      customer[:default_drop_off_point_id] = (customer[:default_drop_off_point_id] || @office.find_bookmark.bid)
      @customer = Customer.create!(customer)
      bookmarks_with_order = addresses.map do |address|
        order = address.delete(:order)
        bookmark = register_bookmark_with_p_bookmark(address, order, bookmark_order[0], bookmark_order[1])
        {
          bookmark:,
          order:
        }
      end
      use_cases.each do |use_case|
        register_use_case(use_case, bookmarks_with_order)
      end

      register_p_bookmark_for_office

      if image.present?
        CustomerImage.create!(
          customer_id: @customer.id,
          image:
        )
      end
    end
  end

  def update
    @office = Current.office
    @customer = Customer.find(customer[:id])
    image = customer.delete(:image)
    customer.delete(:id)
    bookmark_order = bookmark_orders(customer)
    ActiveRecord::Base.transaction do
      @customer.update!(customer)
      remove_bookmark_and_p_bookmark(addresses)
      remove_use_cases

      bookmarks_with_order = addresses.map do |address|
        order = address.delete(:order)
        if address[:bid].present?
          target_bookmark = Area::Bookmark.find_by(bid: address[:bid])
          target_p_bookmark = Area::PBookmark.find_by(office_code: @office.cd, bookmark_id: target_bookmark.bid,
                                                      customer_cd: @customer.cd)
          bookmark = updater_bookmark_with_p_bookmark(target_bookmark, address, target_p_bookmark, order,
                                                      bookmark_order[0], bookmark_order[1])
        else
          bookmark = register_bookmark_with_p_bookmark(address, order, bookmark_order[0], bookmark_order[1])
        end
        {
          bookmark:,
          order:
        }
      end
      use_cases.each do |use_case|
        register_use_case(use_case, bookmarks_with_order)
      end

      @customer.image.destroy if @customer.image.present?
      if image.present?
        CustomerImage.create!(
          customer_id: @customer.id,
          image:
        )
      end
    end
  end

  private

  def bookmark_orders(customer)
    pick_up_order = customer[:default_pick_up_point_order]
    drop_off_order = customer[:default_drop_off_point_order]
    customer.delete(:default_pick_up_point_order)
    customer.delete(:default_drop_off_point_order)
    [pick_up_order, drop_off_order]
  end

  def remove_bookmark_and_p_bookmark(addresses)
    remove_ids = @customer.bookmarks.map(&:bid) - addresses.pluck(:bid)
    Area::Bookmark.where(bid: remove_ids).destroy_all
    Area::PBookmark.where(office_code: @office.cd, bookmark_id: remove_ids, customer_cd: @customer.cd).destroy_all
  end

  def register_bookmark_with_p_bookmark(address, order, pick_up_order, drop_off_order)
    address[:office_code] = @office.cd
    address[:reference_id] = @customer.cd
    bookmark = Area::Bookmark.create!(address)
    Area::PBookmark.create!(
      office_code: @office.cd,
      bookmark_id: bookmark.bid,
      customer_cd: @customer.cd,
      point: p_bookmark_point(order),
      created_date: Date.current
    )
    @customer.update(default_pick_up_point_id: bookmark.bid) if order == pick_up_order
    @customer.update(default_drop_off_point_id: bookmark.bid) if order == drop_off_order
    bookmark
  end

  # rubocop:disable Metrics/ParameterLists
  def updater_bookmark_with_p_bookmark(target_bookmark, address, target_p_bookmark, order, pick_up_order,
                                       drop_off_order)
    address[:office_code] = @office.cd
    address[:reference_id] = @customer.cd
    target_bookmark.update!(address)
    target_p_bookmark.update!(
      point: p_bookmark_point(order),
      created_date: Date.current
    )
    @customer.update(default_pick_up_point_id: target_bookmark.bid) if order == pick_up_order
    @customer.update(default_drop_off_point_id: target_bookmark.bid) if order == drop_off_order
    target_bookmark
  end
  # rubocop:enable Metrics/ParameterLists

  def register_use_case(use_case, bookmarks_with_order)
    use_case[:customer_id] = @customer.id
    if use_case[:active]
      use_case[:drop_off_point_id] = bookmarks_with_order.find do |bookmark|
                                       bookmark[:order] == use_case[:drop_off_point_order]
                                     end[:bookmark].bid
      use_case[:pick_up_point_id] = bookmarks_with_order.find do |bookmark|
                                      bookmark[:order] == use_case[:pick_up_point_order]
                                    end[:bookmark].bid
      use_case[:pick_up_base_point_id] = (use_case[:pick_up_base_point_id] || @office.find_bookmark.bid)
      use_case[:drop_off_base_point_id] = (use_case[:drop_off_base_point_id] || @office.find_bookmark.bid)
    end
    use_case.delete(:drop_off_point_order)
    use_case.delete(:pick_up_point_order)
    CustomerUseCase.create!(use_case)
  end

  def remove_use_cases
    @customer.use_cases.destroy_all
  end

  def register_p_bookmark_for_office
    bookmark = @office.find_bookmark
    Area::PBookmark.create!(
      office_code: @office.cd,
      bookmark_id: bookmark.bid,
      customer_cd: @customer.cd,
      point: 'B',
      created_date: Date.current
    )
  end

  def p_bookmark_point(index)
    case index
    when 1
      'A'
    when 2
      'C'
    when 3
      'D'
    when 4
      'E'
    when 5
      'F'
    end
  end

  def validate_customer
    validate_customer_presence_welfare if Current.office.welfare?
    validate_customer_presence_education if Current.office.education?
    validate_customer_times
  end

  def validate_customer_presence_welfare
    return if Current.office.education?

    errors.add('customer.cd', I18n.t('errors.messages.blank')) if customer[:cd].blank?
    errors.add('customer.name', I18n.t('errors.messages.blank')) if customer[:name].blank?
    errors.add('customer.name_kana', I18n.t('errors.messages.blank')) if customer[:name_kana].blank?
    errors.add('customer.contract_status', I18n.t('errors.messages.no_select')) if customer[:contract_status].blank?
    errors.add('customer.departure_time', I18n.t('errors.messages.blank')) if customer[:departure_time].blank?
    errors.add('customer.arrival_time', I18n.t('errors.messages.blank')) if customer[:arrival_time].blank?
    errors.add('customer.start_time', I18n.t('errors.messages.blank')) if customer[:start_time].blank?

    if customer[:default_pick_up_point_order].blank?
      errors.add('customer.default_pick_up_point_id',
                 I18n.t('errors.messages.no_select'))
    end
    return if customer[:default_drop_off_point_order].present?

    errors.add('customer.default_drop_off_point_id',
               I18n.t('errors.messages.no_select'))
  end

  def validate_customer_presence_education
    return if Current.office.welfare?

    errors.add('customer.cd', I18n.t('errors.messages.blank')) if customer[:cd].blank?
    errors.add('customer.name', I18n.t('errors.messages.blank')) if customer[:name].blank?
    errors.add('customer.name_kana', I18n.t('errors.messages.blank')) if customer[:name_kana].blank?
    errors.add('customer.phone_number', I18n.t('errors.messages.blank')) if customer[:phone_number].blank?
    errors.add('customer.departure_time', I18n.t('errors.messages.blank')) if customer[:departure_time].blank?
    errors.add('customer.arrival_time', I18n.t('errors.messages.blank')) if customer[:arrival_time].blank?

    if customer[:default_pick_up_point_order].blank?
      errors.add('customer.default_pick_up_point_id',
                 I18n.t('errors.messages.no_select'))
    end
    return if customer[:default_drop_off_point_order].present?

    errors.add('customer.default_drop_off_point_id',
               I18n.t('errors.messages.no_select'))
  end

  def validate_customer_times
    return if Current.office.tourism? || Current.office.education?

    errors.add('customer.arrival_time', 'が終了時間より後になっています') if customer[:departure_time] > customer[:arrival_time]
    errors.add('customer.start_time', 'が開始時間より後になっています') if customer[:departure_time] > customer[:start_time]
    errors.add('customer.start_time', 'が終了時間より後になっています') if customer[:start_time] > customer[:arrival_time]
  end

  def validate_customer_cd_unique
    return if customer[:cd].blank? || customer[:id].present?

    return unless Customer.where(cd: customer[:cd]).where.not(id: customer[:id]).exists?

    errors.add('customer.cd', I18n.t('errors.messages.unique'))
  end

  def validate_use_cases
    use_cases.each.with_index do |use_case, index|
      validate_use_case(use_case, index) if use_case[:active]
    end
  end

  def validate_use_case(use_case, index)
    if use_case[:pick_up_point_order].blank? || use_case[:pick_up_point_order] <= 0
      errors.add("use_cases[#{index}].pick_up_point_order",
                 I18n.t('errors.messages.no_select'))
    end
    if use_case[:drop_off_point_order].blank? || use_case[:drop_off_point_order] <= 0
      errors.add("use_cases[#{index}].drop_off_point_order",
                 I18n.t('errors.messages.no_select'))
    end
    if use_case[:departure_time].blank?
      errors.add("use_cases[#{index}].departure_time",
                 I18n.t('errors.messages.blank'))
    end
    errors.add("use_cases[#{index}].arrival_time", I18n.t('errors.messages.blank')) if use_case[:arrival_time].blank?

    validate_use_case_tourism(use_case, index)
  end

  def validate_use_case_tourism(use_case, index)
    return if Current.office.tourism? || Current.office.education?

    errors.add("use_cases[#{index}].start_time", I18n.t('errors.messages.blank')) if use_case[:start_time].blank?
    if use_case[:departure_time] > use_case[:arrival_time]
      errors.add("use_cases[#{index}].arrival_time",
                 'が終了時間より後になっています')
    end
    if use_case[:departure_time] > use_case[:start_time]
      errors.add("use_cases[#{index}].departure_time",
                 'が開始時間より後になっています')
    end
    errors.add("use_cases[#{index}].start_time", 'が終了時間より後になっています') if use_case[:start_time] > use_case[:arrival_time]
  end

  def validate_addresses
    addresses.each.with_index do |address, index|
      validate_address(address, index)
    end
  end

  def validate_address(address, index)
    errors.add("addresses[#{index}].postal_code", I18n.t('errors.messages.blank')) if address[:postal_code].blank?
    if address[:postal_code].length != 7
      errors.add("addresses[#{index}].postal_code",
                 I18n.t('errors.messages.invalid'))
    end
    errors.add("addresses[#{index}].address", I18n.t('errors.messages.blank')) if address[:address].blank?
    errors.add("addresses[#{index}].address_label", I18n.t('errors.messages.blank')) if address[:address_label].blank?
    errors.add("addresses[#{index}].lat", I18n.t('errors.messages.blank')) if address[:lat].blank?
    errors.add("addresses[#{index}].lng", I18n.t('errors.messages.blank')) if address[:lng].blank?
    return if address[:car_restriction_id].present?

    errors.add("addresses[#{index}].car_restriction_id",
               I18n.t('errors.messages.no_select'))
  end
end
# rubocop:enable Metrics/ClassLength
