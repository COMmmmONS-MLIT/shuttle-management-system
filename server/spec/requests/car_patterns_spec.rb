# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CarPatternsController' do
  let!(:office) { create(:office) }
  let(:user) { create(:user, office:) }

  before do
    sign_in user
    Current.office = office
    cookies[:tenant_cd] = office.tenant_cd
  end

  let(:car_pattern1) { create(:car_pattern, office:) }
  let(:car_pattern2) { create(:car_pattern, office:) }
  let(:car_pattern3) { create(:car_pattern, office:) }
  let(:car_pattern4) { create(:car_pattern, office:) }
  let(:car_pattern5) { create(:car_pattern, office:) }
  let!(:car_restrictions_car_pattern1) do
    create(:car_restrictions_car_pattern, office:, car_pattern: car_pattern1, car_restriction: CarRestriction.first)
  end
  let!(:car_restrictions_car_pattern2) do
    create(:car_restrictions_car_pattern, office:, car_pattern: car_pattern2, car_restriction: CarRestriction.second)
  end
  let!(:car_restrictions_car_pattern3) do
    create(:car_restrictions_car_pattern, office:, car_pattern: car_pattern3, car_restriction: CarRestriction.third)
  end
  let!(:car_restrictions_car_pattern4) do
    create(:car_restrictions_car_pattern, office:, car_pattern: car_pattern4, car_restriction: CarRestriction.fourth)
  end
  let!(:car_restrictions_car_pattern5) do
    create(:car_restrictions_car_pattern, office:, car_pattern: car_pattern5, car_restriction: CarRestriction.fifth)
  end
  let!(:car_pattern_wc_number1) do
    create(:car_pattern_wc_number, normal_seat: 8, wc_seat: 0, office:, car_pattern: car_pattern1)
  end
  let!(:car_pattern_wc_number2) do
    create(:car_pattern_wc_number, normal_seat: 7, wc_seat: 1, office:, car_pattern: car_pattern1)
  end
  let!(:car_pattern_wc_number3) do
    create(:car_pattern_wc_number, normal_seat: 6, wc_seat: 0, office:, car_pattern: car_pattern2)
  end
  let!(:car_pattern_wc_number4) do
    create(:car_pattern_wc_number, normal_seat: 5, wc_seat: 0, office:, car_pattern: car_pattern3)
  end
  let!(:car_pattern_wc_number5) do
    create(:car_pattern_wc_number, normal_seat: 4, wc_seat: 0, office:, car_pattern: car_pattern4)
  end
  let!(:car_pattern_wc_number6) do
    create(:car_pattern_wc_number, normal_seat: 3, wc_seat: 0, office:, car_pattern: car_pattern5)
  end

  describe 'GET /car_patterns' do
    it 'returns http success' do
      get car_patterns_path
      expect(response).to have_http_status(:ok)
    end

    it 'returns the correct number of car patterns' do
      get car_patterns_path
      # リクエスト後、Current.officeがnilになるため、Current.officeを再設定
      Current.office = office
      json = response.parsed_body.with_indifferent_access
      expect(json['car_patterns'].size).to eq(5)
      expect(json['car_patterns'][0]['id']).to eq(car_pattern1.id)
      expect(json['car_patterns'][0]['name']).to eq(car_pattern1.name)
      expect(json['car_patterns'][0]['restriction_ids']).to eq(car_pattern1.car_restriction_ids)
      expect(json['car_patterns'][0]['wc_numbers'].size).to eq(car_pattern1.car_pattern_wc_numbers.size)
      expect(json['car_patterns'][0]['wc_numbers'][0]['id']).to eq(car_pattern_wc_number1.id)
      expect(json['car_patterns'][0]['wc_numbers'][0]['cargo_volume']).to eq(car_pattern_wc_number1.cargo_volume)
      expect(json['car_patterns'][0]['wc_numbers'][0]['normal_seat']).to eq(car_pattern_wc_number1.normal_seat)
      expect(json['car_patterns'][0]['wc_numbers'][0]['wc_seat']).to eq(car_pattern_wc_number1.wc_seat)
      expect(json['car_patterns'][0]['wc_numbers'][1]['id']).to eq(car_pattern_wc_number2.id)
      expect(json['car_patterns'][0]['wc_numbers'][1]['cargo_volume']).to eq(car_pattern_wc_number2.cargo_volume)
      expect(json['car_patterns'][0]['wc_numbers'][1]['normal_seat']).to eq(car_pattern_wc_number2.normal_seat)
      expect(json['car_patterns'][0]['wc_numbers'][1]['wc_seat']).to eq(car_pattern_wc_number2.wc_seat)
      expect(json['car_patterns'][1]['id']).to eq(car_pattern2.id)
      expect(json['car_patterns'][2]['id']).to eq(car_pattern3.id)
      expect(json['car_patterns'][3]['id']).to eq(car_pattern4.id)
      expect(json['car_patterns'][4]['id']).to eq(car_pattern5.id)
    end
  end
end
