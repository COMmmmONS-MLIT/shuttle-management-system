# frozen_string_literal: true

class CarPatternsController < ApplicationController
  def index
    @car_patterns = CarPattern.all
  end
end
