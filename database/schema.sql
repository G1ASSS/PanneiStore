-- ============================================================
-- PanneiStore.com - Full MySQL Database Schema
-- Mobile Legends Account Marketplace & Diamond Top-Up
-- ============================================================

CREATE DATABASE IF NOT EXISTS `panneistore`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `panneistore`;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE `users` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `name`          VARCHAR(100) NOT NULL,
  `name_myanmar`  VARCHAR(200) NULL,
  `avatar`        VARCHAR(500) NULL,
  `phone`         VARCHAR(20)  NULL,
  `role`          ENUM('BUYER','SELLER','ADMIN') NOT NULL DEFAULT 'BUYER',
  `google_id`     VARCHAR(255) NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `is_verified`   TINYINT(1)   NOT NULL DEFAULT 0,
  `language`      VARCHAR(5)   NOT NULL DEFAULT 'en',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- SELLERS
-- ─────────────────────────────────────────────
CREATE TABLE `sellers` (
  `id`               VARCHAR(36)    NOT NULL DEFAULT (UUID()),
  `user_id`          VARCHAR(36)    NOT NULL,
  `shop_name`        VARCHAR(100)   NOT NULL,
  `shop_name_myanmar` VARCHAR(200)  NULL,
  `bio`              TEXT           NULL,
  `bio_myanmar`      TEXT           NULL,
  `avatar`           VARCHAR(500)   NULL,
  `is_approved`      TINYINT(1)     NOT NULL DEFAULT 0,
  `is_active`        TINYINT(1)     NOT NULL DEFAULT 1,
  `total_sales`      INT            NOT NULL DEFAULT 0,
  `total_revenue`    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  `rating`           FLOAT          NOT NULL DEFAULT 0,
  `review_count`     INT            NOT NULL DEFAULT 0,
  `response_rate`    FLOAT          NOT NULL DEFAULT 100,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sellers_user_id_unique` (`user_id`),
  INDEX `idx_sellers_is_approved` (`is_approved`),
  INDEX `idx_sellers_rating` (`rating`),
  CONSTRAINT `fk_sellers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- ACCOUNTS (ML Accounts for sale)
-- ─────────────────────────────────────────────
CREATE TABLE `accounts` (
  `id`            VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  `listing_code`  VARCHAR(50)   NULL,
  `seller_id`     VARCHAR(36)   NOT NULL,
  `title`         VARCHAR(200)  NOT NULL,
  `title_myanmar` VARCHAR(400)  NULL,
  `description`   TEXT          NULL,
  `desc_myanmar`  TEXT          NULL,
  `rank`          VARCHAR(50)   NOT NULL,
  `hero_count`    INT           NOT NULL DEFAULT 0,
  `skin_count`    INT           NOT NULL DEFAULT 0,
  `emblem_count`  INT           NOT NULL DEFAULT 0,
  `price`         DECIMAL(12,2) NOT NULL,
  `server`        VARCHAR(50)   NOT NULL,
  `win_rate`      FLOAT         NOT NULL DEFAULT 0,
  `total_matches` INT           NOT NULL DEFAULT 0,
  `level`         INT           NOT NULL DEFAULT 0,
  `is_featured`   TINYINT(1)    NOT NULL DEFAULT 0,
  `status`        ENUM('AVAILABLE','SOLD','PENDING','REJECTED','HIDDEN') NOT NULL DEFAULT 'AVAILABLE',
  `view_count`    INT           NOT NULL DEFAULT 0,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_accounts_listing_code` (`listing_code`),
  INDEX `idx_accounts_seller_id` (`seller_id`),
  INDEX `idx_accounts_status` (`status`),
  INDEX `idx_accounts_rank` (`rank`),
  INDEX `idx_accounts_price` (`price`),
  INDEX `idx_accounts_is_featured` (`is_featured`),
  INDEX `idx_accounts_server` (`server`),
  CONSTRAINT `fk_accounts_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_images` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `account_id` VARCHAR(36)  NOT NULL,
  `url`        VARCHAR(500) NOT NULL,
  `public_id`  VARCHAR(200) NOT NULL,
  `is_primary` TINYINT(1)   NOT NULL DEFAULT 0,
  `order`      INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_account_images_account` (`account_id`),
  CONSTRAINT `fk_account_images_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_heroes` (
  `id`         VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `account_id` VARCHAR(36) NOT NULL,
  `hero_name`  VARCHAR(100) NOT NULL,
  `role`       VARCHAR(50)  NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_account_heroes_account` (`account_id`),
  CONSTRAINT `fk_account_heroes_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_skins` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `account_id` VARCHAR(36)  NOT NULL,
  `skin_name`  VARCHAR(100) NOT NULL,
  `hero_name`  VARCHAR(100) NULL,
  `rarity`     VARCHAR(50)  NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_account_skins_account` (`account_id`),
  CONSTRAINT `fk_account_skins_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- DIAMOND PACKAGES
-- ─────────────────────────────────────────────
CREATE TABLE `diamond_packages` (
  `id`              VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  `amount`          INT           NOT NULL,
  `bonus_diamonds`  INT           NOT NULL DEFAULT 0,
  `price`           DECIMAL(10,2) NOT NULL,
  `label`           VARCHAR(100)  NULL,
  `label_myanmar`   VARCHAR(200)  NULL,
  `is_popular`      TINYINT(1)    NOT NULL DEFAULT 0,
  `is_best_value`   TINYINT(1)    NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `sort_order`      INT           NOT NULL DEFAULT 0,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_diamonds_is_active` (`is_active`),
  INDEX `idx_diamonds_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE `orders` (
  `id`              VARCHAR(36)    NOT NULL DEFAULT (UUID()),
  `order_number`    VARCHAR(20)    NOT NULL,
  `buyer_id`        VARCHAR(36)    NOT NULL,
  `seller_id`       VARCHAR(36)    NULL,
  `type`            ENUM('ACCOUNT','DIAMOND') NOT NULL,
  `total_price`     DECIMAL(12,2)  NOT NULL,
  `discount_amount` DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `final_price`     DECIMAL(12,2)  NOT NULL,
  `status`          ENUM('PENDING','PAYMENT_SUBMITTED','PAYMENT_VERIFIED','PROCESSING','COMPLETED','CANCELLED','REFUNDED','DISPUTED') NOT NULL DEFAULT 'PENDING',
  `payment_method`  VARCHAR(50)    NULL,
  `payment_proof`   VARCHAR(500)   NULL,
  `ml_user_id`      VARCHAR(50)    NULL,
  `ml_server_id`    VARCHAR(50)    NULL,
  `notes`           TEXT           NULL,
  `coupon_id`       VARCHAR(36)    NULL,
  `completed_at`    DATETIME       NULL,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  INDEX `idx_orders_buyer_id` (`buyer_id`),
  INDEX `idx_orders_seller_id` (`seller_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_type` (`type`),
  CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`),
  CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id`                  VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  `order_id`            VARCHAR(36)   NOT NULL,
  `account_id`          VARCHAR(36)   NULL,
  `diamond_package_id`  VARCHAR(36)   NULL,
  `quantity`            INT           NOT NULL DEFAULT 1,
  `unit_price`          DECIMAL(12,2) NOT NULL,
  `subtotal`            DECIMAL(12,2) NOT NULL,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `fk_order_items_diamond` FOREIGN KEY (`diamond_package_id`) REFERENCES `diamond_packages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE `payments` (
  `id`               VARCHAR(36)    NOT NULL DEFAULT (UUID()),
  `order_id`         VARCHAR(36)    NOT NULL,
  `gateway`          ENUM('KBZPAY','WAVEMONEY','AYAPAY','UABPAY','MANUAL') NOT NULL,
  `amount`           DECIMAL(12,2)  NOT NULL,
  `currency`         VARCHAR(10)    NOT NULL DEFAULT 'MMK',
  `status`           ENUM('PENDING','SUBMITTED','VERIFIED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transaction_id`   VARCHAR(200)   NULL,
  `gateway_ref`      VARCHAR(200)   NULL,
  `proof_image_url`  VARCHAR(500)   NULL,
  `verified_by`      VARCHAR(36)    NULL,
  `verified_at`      DATETIME       NULL,
  `metadata`         JSON           NULL,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_order_id_unique` (`order_id`),
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_gateway` (`gateway`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE `reviews` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `order_id`         VARCHAR(36)  NOT NULL,
  `buyer_id`         VARCHAR(36)  NOT NULL,
  `seller_id`        VARCHAR(36)  NOT NULL,
  `account_id`       VARCHAR(36)  NULL,
  `rating`           TINYINT      NOT NULL,
  `comment`          TEXT         NULL,
  `comment_myanmar`  TEXT         NULL,
  `images`           JSON         NULL,
  `is_verified`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_order_id_unique` (`order_id`),
  INDEX `idx_reviews_seller_id` (`seller_id`),
  INDEX `idx_reviews_account_id` (`account_id`),
  INDEX `idx_reviews_rating` (`rating`),
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_reviews_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reviews_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`),
  CONSTRAINT `fk_reviews_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- CONVERSATIONS & MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE `conversations` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `buyer_id`        VARCHAR(36)  NOT NULL,
  `seller_id`       VARCHAR(36)  NOT NULL,
  `last_message`    TEXT         NULL,
  `last_message_at` DATETIME     NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_buyer_seller_unique` (`buyer_id`, `seller_id`),
  INDEX `idx_conversations_buyer_id` (`buyer_id`),
  INDEX `idx_conversations_seller_id` (`seller_id`),
  CONSTRAINT `fk_conversations_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_conversations_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `messages` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `conversation_id`  VARCHAR(36)  NOT NULL,
  `sender_id`        VARCHAR(36)  NOT NULL,
  `content`          TEXT         NULL,
  `image_url`        VARCHAR(500) NULL,
  `image_public_id`  VARCHAR(200) NULL,
  `read_at`          DATETIME     NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_messages_conversation_id` (`conversation_id`),
  INDEX `idx_messages_sender_id` (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE `notifications` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `user_id`          VARCHAR(36)  NOT NULL,
  `type`             ENUM('NEW_ORDER','PAYMENT_COMPLETED','PAYMENT_VERIFIED','MESSAGE_RECEIVED','ACCOUNT_SOLD','ORDER_CANCELLED','REVIEW_RECEIVED','SELLER_APPROVED','SYSTEM') NOT NULL,
  `title`            VARCHAR(200) NOT NULL,
  `title_myanmar`    VARCHAR(400) NULL,
  `message`          TEXT         NOT NULL,
  `message_myanmar`  TEXT         NULL,
  `data`             JSON         NULL,
  `read_at`          DATETIME     NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user_id` (`user_id`),
  INDEX `idx_notifications_read_at` (`read_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────────
CREATE TABLE `coupons` (
  `id`               VARCHAR(36)    NOT NULL DEFAULT (UUID()),
  `code`             VARCHAR(50)    NOT NULL,
  `description`      VARCHAR(500)   NULL,
  `desc_myanmar`     VARCHAR(1000)  NULL,
  `discount_type`    ENUM('PERCENTAGE','FIXED') NOT NULL,
  `discount_value`   DECIMAL(10,2)  NOT NULL,
  `min_order_amount` DECIMAL(10,2)  NULL,
  `max_discount`     DECIMAL(10,2)  NULL,
  `max_uses`         INT            NULL,
  `used_count`       INT            NOT NULL DEFAULT 0,
  `applicable_to`    VARCHAR(20)    NOT NULL DEFAULT 'ALL',
  `is_active`        TINYINT(1)     NOT NULL DEFAULT 1,
  `expires_at`       DATETIME       NULL,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`),
  INDEX `idx_coupons_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- BANNERS
-- ─────────────────────────────────────────────
CREATE TABLE `banners` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `title`            VARCHAR(200) NOT NULL,
  `title_myanmar`    VARCHAR(400) NULL,
  `subtitle`         VARCHAR(300) NULL,
  `subtitle_myanmar` VARCHAR(600) NULL,
  `image_url`        VARCHAR(500) NOT NULL,
  `public_id`        VARCHAR(200) NULL,
  `link`             VARCHAR(500) NULL,
  `position`         VARCHAR(50)  NOT NULL DEFAULT 'HOME_HERO',
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `sort_order`       INT          NOT NULL DEFAULT 0,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_banners_position` (`position`),
  INDEX `idx_banners_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- WISHLIST & CART
-- ─────────────────────────────────────────────
CREATE TABLE `wishlist_items` (
  `id`         VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id`    VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_user_account_unique` (`user_id`, `account_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_items` (
  `id`         VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id`    VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_user_account_unique` (`user_id`, `account_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- SEED: Default Diamond Packages
-- ─────────────────────────────────────────────
INSERT INTO `diamond_packages` (`id`, `amount`, `bonus_diamonds`, `price`, `label`, `label_myanmar`, `is_popular`, `is_best_value`, `sort_order`) VALUES
  (UUID(), 86,   0,   3900,  NULL,        NULL,             0, 0, 1),
  (UUID(), 172,  0,   7800,  NULL,        NULL,             0, 0, 2),
  (UUID(), 257,  0,   11700, NULL,        NULL,             0, 0, 3),
  (UUID(), 344,  0,   15600, NULL,        NULL,             0, 0, 4),
  (UUID(), 514,  0,   23400, 'Popular',   'နိုင်ငံတော်ကြီး', 1, 0, 5),
  (UUID(), 706,  0,   31200, NULL,        NULL,             0, 0, 6),
  (UUID(), 878,  88,  39000, 'Best Deal', 'အကောင်းဆုံး',    0, 0, 7),
  (UUID(), 1412, 142, 62400, NULL,        NULL,             0, 0, 8),
  (UUID(), 2195, 220, 93600, 'Best Value','အကောင်းဆုံးတန်ဖိုး', 0, 1, 9),
  (UUID(), 3688, 369, 156000, NULL,       NULL,             0, 0, 10),
  (UUID(), 5532, 553, 234000, NULL,       NULL,             0, 0, 11);

-- ─────────────────────────────────────────────
-- EVENT PHOTOS (Hero Showcase)
-- ─────────────────────────────────────────────
CREATE TABLE `event_photos` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `title`         VARCHAR(255) NOT NULL,
  `image_url`     VARCHAR(500) NOT NULL,
  `display_order` INT          NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_event_photos_display_order` (`display_order`),
  INDEX `idx_event_photos_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- GAMES (for Top Up System)
-- ─────────────────────────────────────────────
CREATE TABLE `games` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `name`          VARCHAR(100) NOT NULL,
  `logo`          VARCHAR(500) NULL,
  `status`        ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `display_order` INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_games_status` (`status`),
  INDEX `idx_games_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- TOP UP PACKAGES
-- ─────────────────────────────────────────────
CREATE TABLE `topup_packages` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `game_id`       VARCHAR(36)  NOT NULL,
  `package_name`  VARCHAR(255) NOT NULL,
  `price`         DECIMAL(10,2) NOT NULL,
  `category`      VARCHAR(50)  NOT NULL,
  `status`        ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `display_order` INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE,
  INDEX `idx_topup_packages_game_id` (`game_id`),
  INDEX `idx_topup_packages_status` (`status`),
  INDEX `idx_topup_packages_category` (`category`),
  INDEX `idx_topup_packages_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED: Admin user (change password!)
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `is_active`, `is_verified`) VALUES
  (UUID(), 'admin@panneistore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TieqrAIXse0mBuF.qeNrGgWCQX7i', 'Admin', 'ADMIN', 1, 1);
-- Default admin password: Admin@123456 (CHANGE IN PRODUCTION!)
