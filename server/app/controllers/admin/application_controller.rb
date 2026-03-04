# frozen_string_literal: true

class Admin::ApplicationController < BaseController
  before_action :authenticate_admin!
end
