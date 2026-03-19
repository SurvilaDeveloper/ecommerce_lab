alter table product_image
add column if not exists public_id varchar(255);

alter table product_image
add column if not exists width integer,
add column if not exists height integer;

update product_image
set
    public_id = image_url
where
    public_id is null;

alter table product_image
alter column public_id
set
    not null;

create unique index if not exists uq_product_image_public_id on product_image (public_id);

create unique index if not exists uq_product_image_primary_per_product on product_image (product_id)
where
    is_primary = true;