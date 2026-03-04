# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:each, :google_maps_api) do
    mock_response = double(
      code: '200',
      body: {
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 5000 },
            duration_in_traffic: { value: 600 }
          }]
        }]
      }.to_json
    )

    allow(mock_response).to receive(:is_a?).with(Net::HTTPSuccess).and_return(true)

    allow_any_instance_of(Net::HTTP).to receive(:get).and_return(mock_response)
  end
end
