-- ASCII Studio Database Schema
-- MySQL 8.0+
--
-- The database is selected by the environment that runs this schema.
-- Do not CREATE DATABASE or USE a specific database here.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------
-- users
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- artworks
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artworks (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  title             VARCHAR(150) NOT NULL,
  ascii_content     LONGTEXT     NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  settings          JSON         NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_artworks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_artworks_user_id (user_id),
  INDEX idx_artworks_created_at (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- shared_artworks
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_artworks (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  artwork_id   INT UNSIGNED NOT NULL,
  share_token  VARCHAR(64)  NOT NULL,
  is_public    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shared_artwork
    FOREIGN KEY (artwork_id) REFERENCES artworks(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_shared_token UNIQUE (share_token),
  INDEX idx_shared_artwork_id (artwork_id)
) ENGINE=InnoDB;