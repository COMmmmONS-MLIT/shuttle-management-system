# frozen_string_literal: true

FactoryBot.define do
  factory :bindatad, class: 'Area::Bindatad' do
    sequence(:日付) { |n| Date.current + n.days }
    sequence(:事業所cd) { |n| "OFFICE#{n.to_s.rjust(3, '0')}" }
    sequence(:利用者番号) { |n| "CUST#{n.to_s.rjust(3, '0')}" }
    sequence(:送迎区分) { |n| ((n % 2) + 1).to_s } # 1: 乗車, 2: 降車
    sequence(:carId) { |n| n }
    sequence(:出発時間) { |n| (Time.current + n.hours).strftime('%H:%M:%S') }
    sequence(:乗車時刻) { |n| (Time.current + n.hours + 5.minutes).strftime('%H:%M:%S') }
    sequence(:降車時刻) { |n| (Time.current + n.hours + 1.hour).strftime('%H:%M:%S') }
    sequence(:carStatus) { |n| "STATUS#{n}" }
    sequence(:updatetimec) { |n| (Time.current + n.hours).strftime('%H:%M:%S') }
    sequence(:userStatus) { |n| "USER#{n}" }
    sequence(:updatetimeu) { |n| (Time.current + n.hours).strftime('%H:%M:%S') }
    sequence(:乗車人数) { |n| (n % 5) + 1 }
  end
end
