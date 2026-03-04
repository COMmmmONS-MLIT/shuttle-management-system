# frozen_string_literal: true

module BookmarkOptions
  extend ActiveSupport::Concern

  private

  def render_point_options(include_office: false, bookmarks: nil)
    accept_office_cds = current_office.accept_offices.pluck(:cd)
    current_office_bookmarks = Area::Bookmark.where(office_code: current_office.cd, reference_id: ['', 'A001'],
                                                    is_invalid: 0)
    accept_office_public_bookmarks = Area::Bookmark.where(office_code: accept_office_cds,
                                                          reference_id: '',
                                                          is_invalid: 0, is_public: 1)
    bookmarks ||= current_office_bookmarks.or(accept_office_public_bookmarks)

    options = bookmarks.map do |bookmark|
      opt = { label: bookmark.address_label, value: bookmark.bid }
      opt[:is_office] = (bookmark.reference_id == 'A001') if include_office
      opt
    end

    render json: { point_options: options }
  end

  def tourism_point_options
    accept_office_cds = current_office.accept_offices.pluck(:cd)
    current_office_bookmarks = Area::Bookmark.where(office_code: current_office.cd, reference_id: '', is_invalid: 0)
    accept_office_public_bookmarks = Area::Bookmark.where(office_code: accept_office_cds,
                                                          reference_id: '',
                                                          is_invalid: 0, is_public: 1)

    bookmarks = current_office_bookmarks.or(accept_office_public_bookmarks)

    options = bookmarks.map do |bookmark|
      { label: bookmark.address_label, value: bookmark.bid }
    end

    render json: { point_options: options }
  end
end
