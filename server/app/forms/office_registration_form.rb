# frozen_string_literal: true

class OfficeRegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :cd
  attribute :tenant_cd
  attribute :name
  attribute :name_kana
  attribute :postcode
  attribute :address
  attribute :tel
  attribute :fax
  attribute :mail
  attribute :contact_person_name
  attribute :contact_person_kana
  attribute :lat, :float
  attribute :lng, :float
  attribute :is_active, :boolean
  attribute :category
  attribute :only_schedule_create
  attribute :accept_office_ids

  validates :cd, :tenant_cd, :name, :name_kana, presence: true
  validates :is_active, inclusion: { in: [true, false] }
  validate :validate_address

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      office = Office.create!(
        cd:,
        tenant_cd:,
        name:,
        name_kana:,
        postcode:,
        address:,
        tel:,
        fax:,
        mail:,
        contact_person_name:,
        contact_person_kana:,
        lat:,
        lng:,
        is_active:,
        category:,
        only_schedule_create:
      )
      create_office_request_relationships(office)
      create_bookmark(office) if office.persisted?
    end
    true
  end

  def update(office)
    return false unless valid?

    ActiveRecord::Base.transaction do
      office.update!(
        name:,
        name_kana:,
        postcode:,
        address:,
        tel:,
        fax:,
        mail:,
        contact_person_name:,
        contact_person_kana:,
        lat:,
        lng:,
        is_active:,
        category:,
        only_schedule_create:
      )
      create_office_request_relationships(office)

      bookmark = Area::Bookmark.find_by(office_code: office.cd, reference_id: 'A001')
      if bookmark
        # 差分を確認して更新
        bookmark.update!(bookmark_params) if bookmark.attributes.slice(*bookmark_params.keys) != bookmark_params
      else
        # データが無い場合は新規作成
        Area::Bookmark.create!(bookmark_params)
      end
    end
    true
  end

  private

  def validate_cd_uniqueness
    return unless Office.exists?(cd:)

    errors.add(:cd, I18n.t('errors.messages.taken'))
  end

  def validate_tenant_cd_uniqueness
    return unless Office.exists?(tenant_cd:)

    errors.add(:tenant_cd, I18n.t('errors.messages.taken'))
  end

  def validate_address
    errors.add(:postcode, I18n.t('errors.messages.blank')) if postcode.blank?

    errors.add(:address, I18n.t('errors.messages.blank')) if address.blank?

    errors.add(:lat, I18n.t('errors.messages.blank')) if lat.blank?

    errors.add(:lng, I18n.t('errors.messages.blank')) if lng.blank?
  end

  def create_bookmark(office)
    existing_bookmark = Area::Bookmark.find_by(office_code: office.cd, reference_id: 'A001')
    return if existing_bookmark

    Area::Bookmark.create!(bookmark_params)
  end

  def create_office_request_relationships(office)
    office.request_relationships.destroy_all
    return if accept_office_ids.blank?

    accept_office_ids.each do |accept_office_id|
      OfficeRequestRelationship.create!(request_office_id: office.id, accept_office_id:)
    end
  end

  def bookmark_params
    {
      office_code: cd,
      postal_code: postcode,
      address_label: name,
      address:,
      phone_number: tel,
      lat:,
      lng:,
      distance: 0,
      time: 0,
      car_restriction_id: CarRestriction.first.id,
      reference_id: 'A001',
      category: 10
    }
  end
end
