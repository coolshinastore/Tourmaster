-- V1: Initial schema

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'CLIENT',
    loyalty_points INT       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE tours (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255)   NOT NULL,
    description     TEXT,
    country         VARCHAR(100)   NOT NULL,
    city            VARCHAR(100),
    hotel_name      VARCHAR(255),
    hotel_stars     SMALLINT       CHECK (hotel_stars BETWEEN 1 AND 5),
    meal_type       VARCHAR(50),   -- BB, HB, FB, AI
    duration_nights SMALLINT       NOT NULL,
    price_from      NUMERIC(12,2)  NOT NULL,
    old_price       NUMERIC(12,2),
    badge           VARCHAR(50),   -- HIT, SALE, NEW, LAST_SEATS
    rating          NUMERIC(2,1)   DEFAULT 0,
    reviews_count   INT            DEFAULT 0,
    image_url       VARCHAR(512),
    gallery_urls    TEXT[],
    status          VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE tour_dates (
    id              BIGSERIAL PRIMARY KEY,
    tour_id         BIGINT         NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    departure_date  DATE           NOT NULL,
    return_date     DATE           NOT NULL,
    departure_city  VARCHAR(100),
    total_seats     INT            NOT NULL,
    available_seats INT            NOT NULL,
    price_override  NUMERIC(12,2),
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE extra_services (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    type        VARCHAR(50)   NOT NULL -- INSURANCE, TRANSFER, EXCURSION
);

CREATE TABLE bookings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT         NOT NULL REFERENCES users(id),
    tour_date_id    BIGINT         NOT NULL REFERENCES tour_dates(id),
    status          VARCHAR(20)    NOT NULL DEFAULT 'NEW', -- NEW, CONFIRMED, PAID, COMPLETED, CANCELLED
    total_price     NUMERIC(12,2)  NOT NULL,
    discount        NUMERIC(12,2)  NOT NULL DEFAULT 0,
    manager_note    TEXT,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_items (
    id              BIGSERIAL PRIMARY KEY,
    booking_id      BIGINT        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    birth_date      DATE          NOT NULL,
    passport_number VARCHAR(50)   NOT NULL,
    passport_expiry DATE          NOT NULL
);

CREATE TABLE booking_extra_services (
    booking_id       BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    extra_service_id BIGINT NOT NULL REFERENCES extra_services(id),
    PRIMARY KEY (booking_id, extra_service_id)
);

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT     NOT NULL REFERENCES users(id),
    tour_id     BIGINT     NOT NULL REFERENCES tours(id),
    booking_id  BIGINT     NOT NULL REFERENCES bookings(id),
    rating      SMALLINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, booking_id)
);

CREATE TABLE wishlist (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id    BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    added_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tour_id)
);

CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT        NOT NULL REFERENCES users(id),
    booking_id  BIGINT        REFERENCES bookings(id),
    type        VARCHAR(50)   NOT NULL, -- EMAIL, PUSH
    subject     VARCHAR(255),
    body        TEXT,
    sent_at     TIMESTAMP,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING' -- PENDING, SENT, FAILED
);

-- Indexes
CREATE INDEX idx_tours_country  ON tours(country);
CREATE INDEX idx_tours_status   ON tours(status);
CREATE INDEX idx_tour_dates_tour ON tour_dates(tour_id);
CREATE INDEX idx_tour_dates_departure ON tour_dates(departure_date);
CREATE INDEX idx_bookings_user  ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
