-- backend/src/main/resources/db/migration/V7__allow_guest_addresses.sql
alter table address
alter column user_id
drop not null;