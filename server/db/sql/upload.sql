with visiting_counts as (
  select 
    vc_count.visiting_id,
    count(*) as total_count,
    sum(case when cust.wc = 1 then 1 else 0 end) as wheelchair_count
  from visitings_customers vc_count
  left join customers cust on vc_count.customer_id = cust.id
  left join visitings v_count on vc_count.visiting_id = v_count.id
  left join cars car_count on v_count.car_id = car_count.id
  where vc_count.date = @date
    and car_count.number > ''
    and v_count.bin_order > ''
    and vc_count.is_absent = 0
    and vc_count.is_self = 0
    and ((cust.stopped_at is null) or (cust.stopped_at > @date))
    and (vc_count.request = 0 or vc_count.request is null)
  group by vc_count.visiting_id
)

-- visitings_customers data
select 
vc.date,
vc.office_id,
car.number,
visiting.car_id,
visiting.bin_order,
vc.order,
coalesce(vc.passenger_count, 0) as passenger_count,
visiting.departure_time as departure_time,
visiting.arrival_time as arrival_time,
vc.actual_time as actual_time,
vc.customer_id,
customer.cd,
customer.name,
customer.name_kana,
case when vc.soge_type = 2 then base_point_bookmark.bid else customer_bookmark.bid end as pickup_point_bid,
vc.soge_type,
vc.schedule_time as schedule_time,
vc.start_time as start_time,
case when vc.soge_type = 2 then concat(ifnull(base_point_bookmark.住所,''),ifnull(base_point_bookmark.号室名,'')) 
     else concat(ifnull(customer_bookmark.住所,''),ifnull(customer_bookmark.号室名,'')) end as pickup_address,
case when vc.soge_type = 2 then customer_bookmark.bid else base_point_bookmark.bid end as office_point_bid,
case when vc.soge_type = 2 then concat(ifnull(customer_bookmark.住所,''),ifnull(customer_bookmark.号室名,'')) 
     else concat(ifnull(base_point_bookmark.住所,''),ifnull(base_point_bookmark.号室名,'')) end as dropoff_address,
case when vc.soge_type = 2 then base_point_bookmark.lat else customer_bookmark.lat end as pickup_lat,
case when vc.soge_type = 2 then base_point_bookmark.lng else customer_bookmark.lng end as pickup_lng,
case when vc.soge_type = 2 then base_point_bookmark.停車lat else customer_bookmark.停車lat end as pickup_stop_lat,
case when vc.soge_type = 2 then base_point_bookmark.停車lng else customer_bookmark.停車lng end as pickup_stop_lng,
case when vc.soge_type = 2 then customer_bookmark.lat else base_point_bookmark.lat end as office_lat,
case when vc.soge_type = 2 then customer_bookmark.lng else base_point_bookmark.lng end as office_lng,
concat(
    if((vc.soge_type mod 2)>0,if(p_bookmark.地点<>'A',concat(customer_bookmark.住所ラベル,'への迎え '),'')
                            ,if(p_bookmark.地点<>'A',concat(customer_bookmark.住所ラベル,'への送り '),'')),
    ifnull(vc.note,''),
    ifnull(customer.common_note,''),
    ifnull(if((vc.soge_type mod 2)>0,customer.pick_up_note,customer.drop_off_note),'')) as 注意事項,
case when vc.soge_type = 2 then base_point_bookmark.車両制限 else customer_bookmark.車両制限 end as pickup_car_restriction,
customer.wc,
if(customer.walker = 0, 0.0, customer.walker_size),
vc.is_absent,
vc.absence_reason,
customer.walker,
case when vc.soge_type = 2 then base_point_bookmark.住所ラベル else customer_bookmark.住所ラベル end as pickup_address_label,
case when vc.soge_type = 2 then customer_bookmark.住所ラベル else base_point_bookmark.住所ラベル end as dropoff_address_label,
null as reserved1,
car_pattern.name as car_pattern_name,
car.max_seat,
car.max_wc_seat,
coalesce(customer.wc, 0) as wheelchair_count,
case when vc.soge_type = 2 then base_point_bookmark.待ち時間 else customer_bookmark.待ち時間 end as wait_time,
staff.name as staff_name,
null as reserved2, 
null as reserved3,
vc.is_self

from visitings_customers vc
left join offices office on vc.office_id=office.id
left join customers customer on vc.customer_id=customer.id
left join visitings visiting on vc.visiting_id=visiting.id
left join cars car on visiting.car_id=car.id
left join staffs staff on visiting.driver_id=staff.id
left join bookmark customer_bookmark on vc.point_id=customer_bookmark.bid
left join bookmark base_point_bookmark on vc.base_point_id=base_point_bookmark.bid
left join car_patterns car_pattern on car.car_pattern_id=car_pattern.id
left join p_bookmark p_bookmark on customer.cd=p_bookmark.passengerId and vc.point_id=p_bookmark.bid
left join visiting_counts counts on vc.visiting_id = counts.visiting_id
where vc.date = @date
and vc.office_id = @office_id
and car.number>''
and visiting.bin_order>''
and vc.is_absent=0
and vc.is_self=0
and ((customer.stopped_at is null)or(customer.stopped_at>@date))
and (vc.request=0 or vc.request is null)

UNION ALL

-- visitings_points data
select 
vp.date,
vp.office_id,
car.number,
visiting.car_id,
visiting.bin_order,
vp.order,
coalesce(counts.total_count, 0) as passenger_count,
visiting.departure_time as departure_time,
visiting.arrival_time as arrival_time,
vp.actual_time as actual_time,
"" as customer_id,
case 
  when vp_bookmark.事業所cd = office.cd and vp_bookmark.参考id = 'A001' 
  then concat(vp_bookmark.参考id, visiting.car_id, time_format(addtime(visiting.departure_time, '09:00:00'), '%H:%i'))
  else concat('T', vp_bookmark.bid)
end as cd,
vp_bookmark.住所ラベル as name,
vp_bookmark.住所ラベル as name_kana,
vp_bookmark.bid as pickup_point_bid,
vp.soge_type,
visiting.arrival_time as schedule_time,
visiting.departure_time as start_time,
concat(ifnull(vp_bookmark.住所,''),ifnull(vp_bookmark.号室名,'')) as pickup_address,
vp_bookmark.bid as office_point_bid,
concat(ifnull(vp_bookmark.住所,''),ifnull(vp_bookmark.号室名,'')) as dropoff_address,
vp_bookmark.lat as pickup_lat,
vp_bookmark.lng as pickup_lng,
0 as pickup_stop_lat,
0 as pickup_stop_lng,
vp_bookmark.lat as office_lat,
vp_bookmark.lng as office_lng,
vp.note as 注意事項,
0 as pickup_car_restriction,
0 as wc,
0 as walker_size,
0 as is_absent,
null as absence_reason,
0 as walker,
vp_bookmark.住所ラベル as pickup_address_label,
vp_bookmark.住所ラベル as dropoff_address_label,
null as reserved1,
car_pattern.name as car_pattern_name,
car.max_seat,
car.max_wc_seat,
coalesce(counts.wheelchair_count, 0) as wheelchair_count,
vp_bookmark.待ち時間 as wait_time,
staff.name as staff_name,
null as reserved2, 
null as reserved3,
0 as is_self

from visitings_points vp
left join offices office on vp.office_id=office.id
left join visitings visiting on vp.visiting_id=visiting.id
left join cars car on visiting.car_id=car.id
left join staffs staff on visiting.driver_id=staff.id
left join bookmark vp_bookmark on vp.point_id=vp_bookmark.bid
left join car_patterns car_pattern on car.car_pattern_id=car_pattern.id
left join visiting_counts counts on vp.visiting_id = counts.visiting_id

where vp.date = @date
and vp.office_id = @office_id
and car.number>''
and visiting.bin_order>''