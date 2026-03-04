# frozen_string_literal: true

class Tourism::DashboardController < Tourism::ApplicationController
  def statistics
    date = params[:date] || Date.current
    vcs = VisitingsCustomer.joins(:customer)
                           .where(date:, customers: { contract_status: %i[契約 体験] })

    @total_customers = vcs.map(&:passenger_count).sum
    @total_pickup_customers = vcs.where(soge_type: :pick_up).map(&:passenger_count).sum
    @total_dropoff_customers = vcs.where(soge_type: :drop_off).map(&:passenger_count).sum

    @accept_office_request_counts = current_office.accept_offices.map do |accept_office|
      {
        office_id: accept_office.id,
        office_name: accept_office.name,
        request_count: accept_office.requested_customers.where(date:).sum(:passenger_count)
      }
    end
  end
end
