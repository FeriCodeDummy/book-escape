import {RowDataPacket} from "mysql2";

export interface LoginEntity extends RowDataPacket {
    id?: number;
    name: string;
    surname: string;
    email: string;
}

export interface HotelEntity extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    address_line: string;
    checkin_time: string;
    checkout_time: string;
    cancellation_policy_days:number;
    is_active: boolean;
}

/*
CREATE TABLE hotels (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  description     TEXT NULL,
  address_line    VARCHAR(255) NULL,
  city            VARCHAR(128) NOT NULL,
  country         CHAR(2) NOT NULL,
  checkin_time    TIME NULL,
  checkout_time   TIME NULL,
  cancellation_policy_days INT NOT NULL DEFAULT 1,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_hotels (name, description, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 */