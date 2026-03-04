# frozen_string_literal: true

class CarRestrictionsController < ApplicationController
  def index
    @car_restrictions = CarRestriction.all
  end
end
