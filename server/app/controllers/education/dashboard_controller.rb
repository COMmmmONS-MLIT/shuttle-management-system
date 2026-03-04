# frozen_string_literal: true

class Education::DashboardController < Education::ApplicationController
  def statistics
    date = params[:date] || Date.current
    vcs = VisitingsCustomer.joins(:customer)
                           .where(date:)
                           .where.not(customers: { contract_status: Customer.contract_statuses['停止'] })

    @total_customers = vcs.count
    @total_pickup_customers = vcs.where(soge_type: :pick_up).count
    @total_dropoff_customers = vcs.where(soge_type: :drop_off).count
  end
end
