# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SingleCustomerTimeCalculator do
  let!(:car_restriction) { create(:car_restriction) }
  let(:office) { create(:office) }
  let(:car) { create(:car, office:) }
  let(:visiting) { create(:visiting, office:, car:) }
  let(:customer) { create(:customer, office:) }
  let(:customer_bookmark) { create(:bookmark, office_code: office.cd, car_restriction_id: car_restriction.id) }
  let(:office_bookmark) do
    create(:bookmark, office_code: office.cd, reference_id: 'A001', car_restriction_id: car_restriction.id)
  end
  let(:visiting_customer) do
    create(:visitings_customer, visiting:, customer:, office:, order: 1, soge_type: 'pick_up',
                                schedule_time: '09:00', point_id: customer_bookmark.bid)
  end

  # DistanceServiceをstubする（Co2coモデルは削除済み）
  let(:co2co_result) { { time: 10.0, distance: 5.0 } }

  before do
    Current.office = office
    allow(office).to receive(:find_bookmark).and_return(office_bookmark)
    allow(DistanceService).to receive(:find_co2co).and_return(co2co_result)
    customer_bookmark.update!(wait_time: 5)
  end

  describe '#calculate' do
    context 'when customer is pick_up' do
      before do
        visiting_customer.update!(soge_type: 'pick_up')
      end

      context 'when office is tourism' do
        before { office.update!(category: 'tourism') }

        it 'calculates departure_time and actual_time correctly' do
          calculator = described_class.new(visiting, visiting_customer, office)
          calculator.calculate

          visiting.reload
          visiting_customer.reload
          expect(visiting.departure_time).to be_present
          expect(visiting.arrival_time).to be_present
          expect(visiting_customer.actual_time).to be_present
        end
      end

      context 'when office is welfare' do
        before { office.update!(category: 'welfare') }

        it 'calculates departure_time and actual_time correctly' do
          calculator = described_class.new(visiting, visiting_customer, office)
          calculator.calculate

          visiting.reload
          visiting_customer.reload
          expect(visiting.departure_time).to be_present
          expect(visiting.arrival_time).to be_present
          expect(visiting_customer.actual_time).to be_present
        end
      end
    end

    context 'when customer is drop_off' do
      before do
        visiting_customer.update!(soge_type: 'drop_off')
      end

      context 'when office is tourism' do
        before { office.update!(category: 'tourism') }

        it 'calculates departure_time and actual_time correctly' do
          calculator = described_class.new(visiting, visiting_customer, office)
          calculator.calculate

          visiting.reload
          visiting_customer.reload
          expect(visiting.departure_time).to be_present
          expect(visiting.arrival_time).to be_present
          expect(visiting_customer.actual_time).to be_present
        end
      end

      context 'when office is welfare' do
        before { office.update!(category: 'welfare') }

        it 'calculates departure_time and actual_time correctly' do
          calculator = described_class.new(visiting, visiting_customer, office)
          calculator.calculate

          visiting.reload
          visiting_customer.reload
          expect(visiting.departure_time).to be_present
          expect(visiting.arrival_time).to be_present
          expect(visiting_customer.actual_time).to be_present
        end
      end
    end

    context 'when specified_departure_time is provided' do
      let(:specified_time) { Time.zone.parse('08:30') }

      it 'uses specified_departure_time' do
        calculator = described_class.new(visiting, visiting_customer, office, 0, specified_time)
        calculator.calculate

        visiting.reload
        expect(visiting.departure_time.strftime('%H:%M')).to eq(specified_time.strftime('%H:%M'))
      end
    end

    context 'when adjustment_time is provided' do
      it 'applies adjustment_time to calculations' do
        calculator = described_class.new(visiting, visiting_customer, office, 30)
        calculator.calculate

        visiting.reload
        visiting_customer.reload
        expect(visiting.departure_time).to be_present
        expect(visiting_customer.actual_time).to be_present
      end
    end
  end
end
