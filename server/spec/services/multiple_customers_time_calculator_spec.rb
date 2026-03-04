# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultipleCustomersTimeCalculator do
  let!(:car_restriction) { create(:car_restriction) }
  let(:office) { create(:office) }
  let!(:set_current_office) { Current.office = office }
  let(:car_pattern) { create(:car_pattern, office:) }
  let(:car) { create(:car, office:, car_pattern:) }
  let(:visiting) { create(:visiting, office:, car:) }
  let(:customer1) { create(:customer, office:) }
  let(:customer2) { create(:customer, office:) }
  let(:bookmark1) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
  let(:bookmark2) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
  let(:office_bookmark) do
    create(:bookmark, office_code: office.cd, reference_id: 'A001', car_restriction_id: car_restriction.id)
  end

  # DistanceServiceをstubする（Co2coモデルは削除済み、ハッシュを返す）
  let(:co2co_result) { { time: 10.0, distance: 5.0 } }

  let!(:visiting_customer1) do
    create(:visitings_customer, visiting:, customer: customer1, office:, order: 1, soge_type: 'pick_up',
                                schedule_time: '09:00', point_id: bookmark1.bid)
  end
  let!(:visiting_customer2) do
    create(:visitings_customer, visiting:, customer: customer2, office:, order: 2, soge_type: 'pick_up',
                                schedule_time: '09:30', point_id: bookmark2.bid)
  end

  before do
    Current.office = office
    allow(office).to receive(:find_bookmark).and_return(office_bookmark)
    allow(DistanceService).to receive(:find_co2co).and_return(co2co_result)

    bookmark1.update!(wait_time: 5)
    bookmark2.update!(wait_time: 5)
  end

  describe '#calculate' do
    context 'when first item is VisitingsCustomer' do
      it 'calculates times for multiple customers' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office)
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

    context 'when first item is VisitingsPoint' do
      let!(:visiting_point) do
        VisitingsPoint.create!(
          visiting:,
          office:,
          point_id: bookmark1.bid,
          order: 1,
          soge_type: 'pick_up',
          date: visiting.date
        )
      end

      before do
        visiting_customer1.update!(order: 2)
        visiting_customer2.update!(order: 3)
      end

      it 'calculates times starting from VisitingsPoint' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office)
        calculator.calculate

        visiting.reload
        visiting_point.reload
        expect(visiting.departure_time).to be_present
        expect(visiting_point.actual_time).to be_present
      end
    end

    context 'when drop_off and pick_up are consecutive' do
      before do
        visiting_customer1.update!(soge_type: 'drop_off')
        visiting_customer2.update!(soge_type: 'pick_up')
      end

      it 'sets actual_time for the following pick_up customer' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office)
        calculator.calculate

        visiting_customer2.reload
        expect(visiting_customer2.actual_time).to be_present
      end
    end

    context 'when specified_departure_time is provided' do
      let(:specified_time) { Time.zone.parse('08:30') }

      it 'uses specified_departure_time as visiting departure_time' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office, 0, specified_time)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time.strftime('%H:%M')).to eq(specified_time.strftime('%H:%M'))
      end
    end

    context 'when adjustment_time is provided' do
      it 'applies adjustment_time to calculations (presence check only)' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office, 30)
        calculator.calculate

        visiting.reload
        visiting_customer1.reload
        expect(visiting.departure_time).to be_present
        expect(visiting_customer1.actual_time).to be_present
      end
    end

    context 'when office is tourism' do
      before do
        office.update!(category: 'tourism')
      end

      it 'calculates times correctly for tourism office' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time).to be_present
        expect(visiting.arrival_time).to be_present
      end
    end

    context 'when office is welfare' do
      before do
        office.update!(category: 'welfare')
      end

      it 'calculates times correctly for welfare office' do
        calculator = described_class.new(visiting, visiting.customers_and_points, office)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time).to be_present
        expect(visiting.arrival_time).to be_present
      end
    end
  end
end
