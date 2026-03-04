# frozen_string_literal: true

# officeに紐づくmodelに適用し、default_scopeとbefore_createでoffice_idを設定する
# current_officeが設定されていない場合はエラーを出す
module MultiOfficeScoped
  extend ActiveSupport::Concern

  included do
    default_scope do
      raise 'Current.office is not set in default_scope' if Current.office.blank?

      where(office_id: Current.office.id)
    end

    before_create do
      raise 'Current.office is not set in before_create' if Current.office.blank?

      self.office_id ||= Current.office.id
    end
  end
end
