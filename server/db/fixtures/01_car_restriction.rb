# frozen_string_literal: true

car_restrictions = [{ id: 0, name: '車両制限なし' }, { id: 1, name: '軽のみ' }, { id: 2, name: '軽の助手席' }, { id: 3, name: '軽のゲート不可' }, { id: 4, name: 'ゲートのみ' }, { id: 5, name: 'ハイエース不可' }, { id: 6, name: '軽かゲート' }, { id: 7, name: '軽車両' }]

car_restrictions.each do |car_restriction|
  CarRestriction.seed(
    {
      id: car_restriction[:id],
      name: car_restriction[:name]
    }
  )
end

