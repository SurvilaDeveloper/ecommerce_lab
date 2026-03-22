-- backend/src/main/resources/db/migration/V6__support_guest_orders.sql
alter table customer_order
alter column user_id
drop not null;

alter table customer_order
add column if not exists customer_email citext;

alter table customer_order
add column if not exists order_source varchar(20) not null default 'REGISTERED';

alter table customer_order add constraint chk_customer_order_source check (order_source in ('REGISTERED', 'GUEST'));

create index if not exists idx_customer_order_customer_email on customer_order (customer_email);

create index if not exists idx_customer_order_order_source on customer_order (order_source);