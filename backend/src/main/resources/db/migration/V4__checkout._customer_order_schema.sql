alter table customer_order
add column if not exists delivery_method varchar(20);

alter table customer_order
add column if not exists recipient_name varchar(150);

alter table customer_order
add column if not exists phone varchar(40);