create extension if not exists citext;

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

create table if not exists category (
    id bigserial primary key,
    name varchar(120) not null,
    slug varchar(140) not null unique,
    description varchar(500),
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists product (
    id bigserial primary key,
    category_id bigint not null,
    name varchar(180) not null,
    slug varchar(200) not null unique,
    sku varchar(80) not null unique,
    short_description varchar(300),
    description text,
    price numeric(12, 2) not null,
    compare_at_price numeric(12, 2),
    cost_price numeric(12, 2),
    currency varchar(3) not null default 'ARS',
    stock integer not null default 0,
    low_stock_threshold integer not null default 0,
    is_active boolean not null default true,
    is_featured boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_product_category
        foreign key (category_id)
        references category(id),
    constraint chk_product_price
        check (price >= 0),
    constraint chk_product_compare_at_price
        check (compare_at_price is null or compare_at_price >= 0),
    constraint chk_product_cost_price
        check (cost_price is null or cost_price >= 0),
    constraint chk_product_stock
        check (stock >= 0),
    constraint chk_product_low_stock_threshold
        check (low_stock_threshold >= 0),
    constraint chk_product_compare_vs_price
        check (compare_at_price is null or compare_at_price >= price)
);

create table if not exists product_image (
    id bigserial primary key,
    product_id bigint not null,
    image_url text not null,
    alt_text varchar(200),
    sort_order integer not null default 0,
    is_primary boolean not null default false,
    created_at timestamp not null default current_timestamp,
    constraint fk_product_image_product
        foreign key (product_id)
        references product(id)
        on delete cascade,
    constraint chk_product_image_sort_order
        check (sort_order >= 0)
);

create table if not exists user_account (
    id bigserial primary key,
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    email citext not null unique,
    password_hash text not null,
    phone varchar(40),
    role varchar(30) not null default 'CUSTOMER',
    is_active boolean not null default true,
    is_email_verified boolean not null default false,
    last_login_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint chk_user_role
        check (role in ('CUSTOMER', 'ADMIN'))
);

create table if not exists address (
    id bigserial primary key,
    user_id bigint not null,
    label varchar(80),
    recipient_name varchar(150) not null,
    line_1 varchar(180) not null,
    line_2 varchar(180),
    city varchar(120) not null,
    state varchar(120),
    postal_code varchar(30) not null,
    country_code char(2) not null,
    phone varchar(40),
    is_default_shipping boolean not null default false,
    is_default_billing boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_address_user
        foreign key (user_id)
        references user_account(id)
        on delete cascade
);

create table if not exists cart (
    id bigserial primary key,
    user_id bigint not null unique,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_cart_user
        foreign key (user_id)
        references user_account(id)
        on delete cascade
);

create table if not exists cart_item (
    id bigserial primary key,
    cart_id bigint not null,
    product_id bigint not null,
    quantity integer not null,
    unit_price numeric(12, 2) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_cart_item_cart
        foreign key (cart_id)
        references cart(id)
        on delete cascade,
    constraint fk_cart_item_product
        foreign key (product_id)
        references product(id),
    constraint uq_cart_item_cart_product
        unique (cart_id, product_id),
    constraint chk_cart_item_quantity
        check (quantity > 0),
    constraint chk_cart_item_unit_price
        check (unit_price >= 0)
);

create table if not exists customer_order (
    id bigserial primary key,
    user_id bigint not null,
    shipping_address_id bigint,
    billing_address_id bigint,
    order_number varchar(40) not null unique,
    status varchar(30) not null default 'PENDING',
    payment_status varchar(30) not null default 'PENDING',
    fulfillment_status varchar(30) not null default 'UNFULFILLED',
    currency varchar(3) not null default 'ARS',
    subtotal numeric(12, 2) not null default 0,
    discount_total numeric(12, 2) not null default 0,
    shipping_total numeric(12, 2) not null default 0,
    tax_total numeric(12, 2) not null default 0,
    grand_total numeric(12, 2) not null default 0,
    notes text,
    placed_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_customer_order_user
        foreign key (user_id)
        references user_account(id),
    constraint fk_customer_order_shipping_address
        foreign key (shipping_address_id)
        references address(id),
    constraint fk_customer_order_billing_address
        foreign key (billing_address_id)
        references address(id),
    constraint chk_customer_order_status
        check (status in ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    constraint chk_customer_order_payment_status
        check (payment_status in ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    constraint chk_customer_order_fulfillment_status
        check (fulfillment_status in ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'RETURNED')),
    constraint chk_customer_order_subtotal
        check (subtotal >= 0),
    constraint chk_customer_order_discount_total
        check (discount_total >= 0),
    constraint chk_customer_order_shipping_total
        check (shipping_total >= 0),
    constraint chk_customer_order_tax_total
        check (tax_total >= 0),
    constraint chk_customer_order_grand_total
        check (grand_total >= 0)
);

create table if not exists order_item (
    id bigserial primary key,
    order_id bigint not null,
    product_id bigint not null,
    product_name varchar(180) not null,
    product_sku varchar(80) not null,
    quantity integer not null,
    unit_price numeric(12, 2) not null,
    discount_total numeric(12, 2) not null default 0,
    line_total numeric(12, 2) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_order_item_order
        foreign key (order_id)
        references customer_order(id)
        on delete cascade,
    constraint fk_order_item_product
        foreign key (product_id)
        references product(id),
    constraint chk_order_item_quantity
        check (quantity > 0),
    constraint chk_order_item_unit_price
        check (unit_price >= 0),
    constraint chk_order_item_discount_total
        check (discount_total >= 0),
    constraint chk_order_item_line_total
        check (line_total >= 0)
);

create table if not exists payment (
    id bigserial primary key,
    order_id bigint not null,
    provider varchar(50) not null,
    provider_payment_id varchar(120),
    method varchar(30) not null,
    status varchar(30) not null default 'PENDING',
    amount numeric(12, 2) not null,
    currency varchar(3) not null default 'ARS',
    paid_at timestamp,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint fk_payment_order
        foreign key (order_id)
        references customer_order(id)
        on delete cascade,
    constraint chk_payment_method
        check (method in ('CARD', 'TRANSFER', 'CASH', 'WALLET')),
    constraint chk_payment_status
        check (status in ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')),
    constraint chk_payment_amount
        check (amount >= 0)
);

create table if not exists inventory_movement (
    id bigserial primary key,
    product_id bigint not null,
    movement_type varchar(30) not null,
    quantity integer not null,
    reference_type varchar(30),
    reference_id bigint,
    note varchar(255),
    created_at timestamp not null default current_timestamp,
    constraint fk_inventory_movement_product
        foreign key (product_id)
        references product(id)
        on delete cascade,
    constraint chk_inventory_movement_type
        check (movement_type in ('IN', 'OUT', 'ADJUSTMENT')),
    constraint chk_inventory_movement_quantity
        check (quantity <> 0)
);

create index if not exists idx_category_name on category(name);
create index if not exists idx_product_category_id on product(category_id);
create index if not exists idx_product_name on product(name);
create index if not exists idx_product_is_active on product(is_active);
create index if not exists idx_product_is_featured on product(is_featured);
create index if not exists idx_product_image_product_id on product_image(product_id);
create index if not exists idx_user_account_email on user_account(email);
create index if not exists idx_address_user_id on address(user_id);
create index if not exists idx_cart_item_cart_id on cart_item(cart_id);
create index if not exists idx_cart_item_product_id on cart_item(product_id);
create index if not exists idx_customer_order_user_id on customer_order(user_id);
create index if not exists idx_customer_order_status on customer_order(status);
create index if not exists idx_customer_order_payment_status on customer_order(payment_status);
create index if not exists idx_order_item_order_id on order_item(order_id);
create index if not exists idx_order_item_product_id on order_item(product_id);
create index if not exists idx_payment_order_id on payment(order_id);
create index if not exists idx_payment_status on payment(status);
create index if not exists idx_inventory_movement_product_id on inventory_movement(product_id);
create index if not exists idx_inventory_movement_created_at on inventory_movement(created_at);

create trigger trg_category_updated_at
before update on category
for each row
execute function set_updated_at();

create trigger trg_product_updated_at
before update on product
for each row
execute function set_updated_at();

create trigger trg_user_account_updated_at
before update on user_account
for each row
execute function set_updated_at();

create trigger trg_address_updated_at
before update on address
for each row
execute function set_updated_at();

create trigger trg_cart_updated_at
before update on cart
for each row
execute function set_updated_at();

create trigger trg_cart_item_updated_at
before update on cart_item
for each row
execute function set_updated_at();

create trigger trg_customer_order_updated_at
before update on customer_order
for each row
execute function set_updated_at();

create trigger trg_payment_updated_at
before update on payment
for each row
execute function set_updated_at();