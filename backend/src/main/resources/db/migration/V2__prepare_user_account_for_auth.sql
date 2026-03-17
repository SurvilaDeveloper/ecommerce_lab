alter table user_account
alter column password_hash
drop not null;

alter table user_account
add column if not exists auth_provider varchar(30) not null default 'LOCAL',
add column if not exists provider_user_id varchar(190),
add column if not exists avatar_url text,
add column if not exists avatar_public_id varchar(255);

alter table user_account add constraint chk_user_account_auth_provider check (auth_provider in ('LOCAL', 'GOOGLE'));

create unique index if not exists uq_user_account_provider_user_id on user_account (auth_provider, provider_user_id)
where
    provider_user_id is not null;