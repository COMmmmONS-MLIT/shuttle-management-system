# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VisitingTimeCalculator do
  let!(:car_restriction) { create(:car_restriction) }
  let(:office) { create(:office) }
  let(:car) { create(:car, office:) }
  let(:visiting) { create(:visiting, office:, car:) }
  let(:office_bookmark) do
    create(:bookmark, office_code: office.cd, reference_id: 'A001', car_restriction_id: car_restriction.id)
  end

  # DistanceService を外部APIに行かせないための stub
  # DistanceServiceをstubする（Co2coモデルは削除済み、ハッシュを返す）
  let(:co2co_result) { { time: 10.0, distance: 5.0 } }

  before do
    Current.office = office
    allow(office).to receive(:find_bookmark).and_return(office_bookmark)
    allow(DistanceService).to receive(:find_co2co).and_return(co2co_result)
  end

  describe '#calculate' do
    context 'when visiting has no customers' do
      it 'sets departure_time and arrival_time to nil' do
        calculator = described_class.new(visiting, office)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time).to be_nil
        expect(visiting.arrival_time).to be_nil
      end
    end

    context 'when visiting has one customer' do
      let(:customer) { create(:customer, office:) }
      let(:customer_bookmark) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let!(:visiting_customer) do
        create(:visitings_customer, visiting:, customer:, office:, order: 1, soge_type: 'pick_up',
                                    schedule_time: '09:00', point_id: customer_bookmark.bid)
      end

      before do
        customer_bookmark.update!(wait_time: 5)
      end

      it 'calculates times for single customer' do
        calculator = described_class.new(visiting, office)
        calculator.calculate

        visiting.reload
        visiting_customer.reload
        expect(visiting.departure_time).to be_present
        expect(visiting.arrival_time).to be_present
        expect(visiting_customer.actual_time).to be_present
      end
    end

    context 'when visiting has multiple customers' do
      let(:customer1) { create(:customer, office:) }
      let(:customer2) { create(:customer, office:) }
      let(:bookmark1) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let(:bookmark2) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let!(:visiting_customer1) do
        create(:visitings_customer, visiting:, customer: customer1, office:, order: 1, soge_type: 'pick_up',
                                    schedule_time: '09:00', point_id: bookmark1.bid)
      end
      let!(:visiting_customer2) do
        create(:visitings_customer, visiting:, customer: customer2, office:, order: 2, soge_type: 'pick_up',
                                    schedule_time: '09:30', point_id: bookmark2.bid)
      end

      before do
        bookmark1.update!(wait_time: 5)
        bookmark2.update!(wait_time: 5)
      end

      it 'calculates times for multiple customers' do
        calculator = described_class.new(visiting, office)
        calculator.calculate

        visiting.reload
        visiting_customer1.reload
        visiting_customer2.reload
        expect(visiting.departure_time).to be_present
        expect(visiting.arrival_time).to be_present
        expect(visiting_customer1.actual_time).to be_present
        expect(visiting_customer2.actual_time).to be_present
      end
    end

    context 'when adjustment_time is provided' do
      let(:customer) { create(:customer, office:) }
      let(:customer_bookmark) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let!(:visiting_customer) do
        create(:visitings_customer, visiting:, customer:, office:, order: 1, soge_type: 'pick_up',
                                    schedule_time: '09:00', point_id: customer_bookmark.bid)
      end

      before do
        customer_bookmark.update!(wait_time: 5)
      end

      it 'applies adjustment_time to calculations' do
        calculator = described_class.new(visiting, office, 30)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time).to be_present
      end
    end

    context 'when specified_departure_time is provided' do
      let(:customer) { create(:customer, office:) }
      let(:customer_bookmark) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let!(:visiting_customer) do
        create(:visitings_customer, visiting:, customer:, office:, order: 1, soge_type: 'pick_up',
                                    schedule_time: '09:00', point_id: customer_bookmark.bid)
      end
      let(:specified_time) { Time.zone.parse('08:30') }

      before do
        customer_bookmark.update!(wait_time: 5)
      end

      it 'uses specified_departure_time' do
        calculator = described_class.new(visiting, office, 0, specified_time)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time.strftime('%H:%M')).to eq(specified_time.strftime('%H:%M'))
      end
    end

    context 'when there are requested customers' do
      let(:customer) { create(:customer, office:) }
      let(:customer_bookmark) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
      let!(:visiting_customer) do
        create(:visitings_customer, visiting:, customer:, office:, order: 1, soge_type: 'pick_up',
                                    schedule_time: '09:00', point_id: customer_bookmark.bid, is_requested: true)
      end

      before do
        customer_bookmark.update!(wait_time: 5)
      end

      it 'calls update_requested_source for requested customers' do
        expect_any_instance_of(VisitingsCustomer).to receive(:update_requested_source).once

        calculator = described_class.new(visiting, office)
        calculator.calculate
      end
    end
  end
end
