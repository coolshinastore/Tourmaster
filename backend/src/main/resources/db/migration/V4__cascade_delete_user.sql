-- Add ON DELETE CASCADE to user references that were missing it

ALTER TABLE bookings
    DROP CONSTRAINT bookings_user_id_fkey,
    ADD CONSTRAINT bookings_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews
    DROP CONSTRAINT reviews_user_id_fkey,
    ADD CONSTRAINT reviews_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
    DROP CONSTRAINT notifications_user_id_fkey,
    ADD CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
