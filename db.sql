CREATE TABLE users (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  is_verified     TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE email_verifications (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  token           CHAR(64) NOT NULL UNIQUE,
  expires_at      DATETIME NOT NULL,
  used_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE admins (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  status          ENUM('active','disabled') NOT NULL DEFAULT 'active',
  otp_secret      VARCHAR(64) NULL, -- za 2FA
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE managers (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NULL,
  phone           VARCHAR(64) NULL,
  status          ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE manager_hotels (
  manager_id      BIGINT UNSIGNED NOT NULL,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (manager_id, hotel_id)
) ENGINE=InnoDB;

CREATE TABLE hotels (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  description     TEXT NULL,
  address_line    VARCHAR(255) NULL,
  city            VARCHAR(128) NOT NULL,
  country         VARCHAR(2) NOT NULL, 
  checkin_time    TIME NULL,
  checkout_time   TIME NULL,
  cancellation_policy_days INT NOT NULL DEFAULT 1, 
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_hotels (name, description, city)
) ENGINE=InnoDB;

ALTER TABLE manager_hotels
  ADD CONSTRAINT fk_mh_manager FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_mh_hotel   FOREIGN KEY (hotel_id)   REFERENCES hotels(id)   ON DELETE CASCADE;

CREATE TABLE hotel_photos (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  url             VARCHAR(512) NOT NULL,
  is_cover        TINYINT(1) NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE room_types (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(255) NOT NULL,  
  description     TEXT NULL,
  capacity        INT NOT NULL,
  base_price      DECIMAL(10,2) NOT NULL, 
  currency        CHAR(3) NOT NULL DEFAULT 'EUR',
  total_rooms     INT NOT NULL, 
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_rt_hotel (hotel_id),
  INDEX idx_rt_price (base_price)
) ENGINE=InnoDB;

CREATE TABLE room_inventory (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  room_type_id    BIGINT UNSIGNED NOT NULL,
  date            DATE NOT NULL,
  available_rooms INT NOT NULL, 
  price_override  DECIMAL(10,2) NULL,
  min_stay_nights INT NULL,
  UNIQUE KEY uk_rt_date (room_type_id, date),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  INDEX idx_inventory_date (date)
) ENGINE=InnoDB;

CREATE TABLE reservations (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  status          ENUM('pending','confirmed','declined','cancelled','expired') NOT NULL DEFAULT 'pending',
  total_price     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency        CHAR(3) NOT NULL DEFAULT 'EUR',
  cancellation_deadline DATETIME NOT NULL,
  cancelled_at    DATETIME NULL,
  confirmation_sent_at DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
  INDEX idx_res_user (user_id),
  INDEX idx_res_hotel_dates (hotel_id, check_in, check_out),
  INDEX idx_res_status (status)
) ENGINE=InnoDB;

CREATE TABLE reservation_items (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_id  BIGINT UNSIGNED NOT NULL,
  room_type_id    BIGINT UNSIGNED NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  price_per_night DECIMAL(10,2) NOT NULL,
  nights          INT NOT NULL,
  line_total      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id)   REFERENCES room_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE reservation_status_history (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_id  BIGINT UNSIGNED NOT NULL,
  changed_by_role ENUM('system','manager','user','admin') NOT NULL,
  changed_by_id   BIGINT UNSIGNED NULL,
  old_status      VARCHAR(32) NULL,
  new_status      VARCHAR(32) NOT NULL,
  note            VARCHAR(512) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  INDEX idx_rsh_res (reservation_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  rating          TINYINT NOT NULL, 
  comment         TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_public       TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_review_once (hotel_id, user_id), 
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  INDEX idx_review_hotel (hotel_id),
  INDEX idx_review_rating (rating)
) ENGINE=InnoDB;

CREATE TABLE favorites (
  user_id         BIGINT UNSIGNED NOT NULL,
  hotel_id        BIGINT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, hotel_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            ENUM('email') NOT NULL DEFAULT 'email',
  template        ENUM('verify_email','booking_confirmed','booking_pending','booking_declined','booking_cancelled','arrival_reminder') NOT NULL,
  payload_json    JSON NULL, 
  scheduled_at    DATETIME NOT NULL,
  sent_at         DATETIME NULL,
  status          ENUM('scheduled','sent','failed') NOT NULL DEFAULT 'scheduled',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_sched (scheduled_at),
  INDEX idx_notif_status (status)
) ENGINE=InnoDB;


CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id varchar(512) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT NOW()
);

