-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.32 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for globaltrade_db
CREATE DATABASE IF NOT EXISTS `globaltrade_db` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `globaltrade_db`;

-- Dumping structure for table globaltrade_db.account_type
CREATE TABLE IF NOT EXISTS `account_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.account_type: ~2 rows (approximately)
REPLACE INTO `account_type` (`id`, `type`) VALUES
	(1, 'customer'),
	(2, 'customs_agent');

-- Dumping structure for table globaltrade_db.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password_hash` text NOT NULL,
  `created_at` datetime NOT NULL,
  `roles_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `fk_admin_roles1_idx` (`roles_id`),
  CONSTRAINT `fk_admin_roles1` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.admin: ~1 rows (approximately)
REPLACE INTO `admin` (`id`, `username`, `password_hash`, `created_at`, `roles_id`) VALUES
	(1, 'admin123', '$2a$12$jCtFhA.reaBT0AZ/OL4x0Ovm.Y.iv1vwZHflbkW4Pv/KuYrsaxcdK', '2026-08-18 03:14:36', 1);

-- Dumping structure for table globaltrade_db.admin_profile
CREATE TABLE IF NOT EXISTS `admin_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `admin_id` int NOT NULL,
  `user_status_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_admin_profile_admin1_idx` (`admin_id`),
  KEY `fk_admin_profile_user_status1_idx` (`user_status_id`),
  CONSTRAINT `fk_admin_profile_admin1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`),
  CONSTRAINT `fk_admin_profile_user_status1` FOREIGN KEY (`user_status_id`) REFERENCES `user_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.admin_profile: ~1 rows (approximately)
REPLACE INTO `admin_profile` (`id`, `name`, `admin_id`, `user_status_id`, `created_at`, `updated_at`) VALUES
	(1, 'Super Admin', 1, 1, '2026-08-26 05:39:06', '2026-08-26 05:39:09');

-- Dumping structure for table globaltrade_db.country
CREATE TABLE IF NOT EXISTS `country` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.country: ~50 rows (approximately)
REPLACE INTO `country` (`id`, `name`) VALUES
	(1, 'Afghanistan'),
	(2, 'Argentina'),
	(3, 'Australia'),
	(4, 'Bangladesh'),
	(5, 'Brazil'),
	(6, 'Canada'),
	(7, 'China'),
	(8, 'Colombia'),
	(9, 'DR Congo'),
	(10, 'Egypt'),
	(11, 'Ethiopia'),
	(12, 'France'),
	(13, 'Germany'),
	(14, 'India'),
	(15, 'Indonesia'),
	(16, 'Iran'),
	(17, 'Iraq'),
	(18, 'Italy'),
	(19, 'Japan'),
	(20, 'Kenya'),
	(21, 'Malaysia'),
	(22, 'Mexico'),
	(23, 'Maldives'),
	(24, 'Myanmar'),
	(25, 'Nepal'),
	(26, 'Netherlands'),
	(27, 'Nigeria'),
	(28, 'Pakistan'),
	(29, 'Peru'),
	(30, 'Philippines'),
	(31, 'Poland'),
	(32, 'Russia'),
	(33, 'Saudi Arabia'),
	(34, 'South Africa'),
	(35, 'South Korea'),
	(36, 'Spain'),
	(37, 'Sudan'),
	(38, 'Sri Lanka'),
	(39, 'Thailand'),
	(40, 'Turkey'),
	(41, 'Uganda'),
	(42, 'Ukraine'),
	(43, 'United Kingdom'),
	(44, 'United States'),
	(45, 'Uzbekistan'),
	(46, 'Venezuela'),
	(47, 'Vietnam'),
	(48, 'Yemen'),
	(49, 'Zambia'),
	(50, 'Zimbabwe');

-- Dumping structure for table globaltrade_db.customs_cases
CREATE TABLE IF NOT EXISTS `customs_cases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_number` varchar(45) NOT NULL,
  `shipment_id` int NOT NULL,
  `risk_level` varchar(45) NOT NULL,
  `customs_value` double NOT NULL,
  `estimated_duty` double NOT NULL,
  `deadline` datetime NOT NULL,
  `submitted_at` datetime NOT NULL,
  `response_at` datetime NOT NULL,
  `remarks` text NOT NULL,
  `custom_agent_id` int DEFAULT NULL,
  `custom_status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_customs_cases_custom_status1_idx` (`custom_status_id`),
  KEY `fk_customs_cases_shipment1_idx` (`shipment_id`),
  KEY `fk_customs_cases_custom_agent1_idx` (`custom_agent_id`),
  CONSTRAINT `fk_customs_cases_custom_agent1` FOREIGN KEY (`custom_agent_id`) REFERENCES `custom_agent` (`id`),
  CONSTRAINT `fk_customs_cases_custom_status1` FOREIGN KEY (`custom_status_id`) REFERENCES `custom_status` (`id`),
  CONSTRAINT `fk_customs_cases_shipment1` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.customs_cases: ~3 rows (approximately)
REPLACE INTO `customs_cases` (`id`, `case_number`, `shipment_id`, `risk_level`, `customs_value`, `estimated_duty`, `deadline`, `submitted_at`, `response_at`, `remarks`, `custom_agent_id`, `custom_status_id`) VALUES
	(1, 'C-260825-040451', 4, '-', 0, 0, '2026-08-27 04:04:51', '2026-08-25 04:04:51', '2026-08-25 04:04:51', '-', NULL, 1),
	(2, 'C-260823-040651', 1, 'MEDIUM', 1160, 174, '2026-08-27 04:20:12', '2026-08-23 04:20:18', '2026-08-26 14:12:18', 'special clearance required', 1, 5),
	(3, 'C-260822-065137', 3, 'LOW', 520, 78, '2026-08-26 04:21:30', '2026-08-22 04:21:44', '2026-08-26 13:47:18', 'no issue to clear', 1, 5);

-- Dumping structure for table globaltrade_db.customs_documents
CREATE TABLE IF NOT EXISTS `customs_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customs_cases_id` int NOT NULL,
  `document_type_id` int NOT NULL,
  `file_path` text NOT NULL,
  `uploaded_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_customs_documents_customs_cases1_idx` (`customs_cases_id`),
  KEY `fk_customs_documents_document_type1_idx` (`document_type_id`),
  CONSTRAINT `fk_customs_documents_customs_cases1` FOREIGN KEY (`customs_cases_id`) REFERENCES `customs_cases` (`id`),
  CONSTRAINT `fk_customs_documents_document_type1` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.customs_documents: ~15 rows (approximately)
REPLACE INTO `customs_documents` (`id`, `customs_cases_id`, `document_type_id`, `file_path`, `uploaded_at`) VALUES
	(1, 3, 1, 'C-260822-065137-commercialInvoice.pdf', '2026-08-25 11:55:50'),
	(2, 3, 2, 'C-260822-065137-certOfOrigin.pdf', '2026-08-25 11:55:50'),
	(3, 3, 3, 'C-260822-065137-permit.pdf', '2026-08-25 11:55:50'),
	(4, 3, 4, 'C-260822-065137-insuranceCert.pdf', '2026-08-25 11:55:50'),
	(5, 3, 5, 'C-260822-065137-customsDeclaration.pdf', '2026-08-25 11:55:50'),
	(6, 3, 6, 'C-260822-065137-otherDocs.pdf', '2026-08-25 11:55:50'),
	(7, 2, 1, 'C-260823-040651-commercialInvoice.pdf', '2026-08-25 11:58:43'),
	(8, 2, 2, 'C-260823-040651-certOfOrigin.pdf', '2026-08-25 11:58:43'),
	(9, 2, 3, 'C-260823-040651-permit.pdf', '2026-08-25 11:58:43'),
	(10, 2, 1, 'C-260823-040651-commercialInvoice.pdf', '2026-08-25 11:59:27'),
	(11, 2, 2, 'C-260823-040651-certOfOrigin.pdf', '2026-08-25 11:59:27'),
	(12, 2, 3, 'C-260823-040651-permit.pdf', '2026-08-25 11:59:27'),
	(13, 2, 4, 'C-260823-040651-insuranceCert.pdf', '2026-08-25 11:59:27'),
	(14, 2, 5, 'C-260823-040651-customsDeclaration.pdf', '2026-08-25 11:59:27'),
	(15, 2, 6, 'C-260823-040651-otherDocs.pdf', '2026-08-25 11:59:27');

-- Dumping structure for table globaltrade_db.custom_agent
CREATE TABLE IF NOT EXISTS `custom_agent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `position` varchar(45) NOT NULL,
  `reg_number` varchar(45) NOT NULL,
  `country_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_status_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_custom_agent_country1_idx` (`country_id`),
  KEY `fk_custom_agent_user1_idx` (`user_id`),
  KEY `fk_custom_agent_user_status1_idx` (`user_status_id`),
  CONSTRAINT `fk_custom_agent_country1` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`),
  CONSTRAINT `fk_custom_agent_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_custom_agent_user_status1` FOREIGN KEY (`user_status_id`) REFERENCES `user_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.custom_agent: ~1 rows (approximately)
REPLACE INTO `custom_agent` (`id`, `name`, `position`, `reg_number`, `country_id`, `user_id`, `user_status_id`, `created_at`, `updated_at`) VALUES
	(1, 'Doris K. Thomas De Silva', 'Senior Inspector', 'CA-79380', 38, 2, 1, '2026-08-26 06:03:41', '2026-08-26 06:03:41');

-- Dumping structure for table globaltrade_db.custom_status
CREATE TABLE IF NOT EXISTS `custom_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.custom_status: ~7 rows (approximately)
REPLACE INTO `custom_status` (`id`, `status`) VALUES
	(1, 'DOCUMENTS_REQUIRED'),
	(2, 'SUBMITTED'),
	(3, 'UNDER_REVIEW'),
	(4, 'CUSTOMS_REVIEW'),
	(5, 'APPROVED'),
	(6, 'REJECTED'),
	(7, 'CLEARED');

-- Dumping structure for table globaltrade_db.document_type
CREATE TABLE IF NOT EXISTS `document_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.document_type: ~6 rows (approximately)
REPLACE INTO `document_type` (`id`, `type`) VALUES
	(1, 'Commercial Invoice'),
	(2, 'Certificate of Origin'),
	(3, 'Import-Export Permit'),
	(4, 'Insurance Certificate'),
	(5, 'Customs Declaration'),
	(6, 'Other Supporting Documents');

-- Dumping structure for table globaltrade_db.inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(45) NOT NULL,
  `hs_code` varchar(45) NOT NULL,
  `quantity` int NOT NULL,
  `unit_value` int NOT NULL,
  `warehouses_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inventory_warehouses1_idx` (`warehouses_id`),
  CONSTRAINT `fk_inventory_warehouses1` FOREIGN KEY (`warehouses_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.inventory: ~4 rows (approximately)
REPLACE INTO `inventory` (`id`, `product_name`, `hs_code`, `quantity`, `unit_value`, `warehouses_id`) VALUES
	(1, 'Monitors', '8507.60.00', 54, 120, 3),
	(2, 'Smartwatch', '8544.70.00', 75, 55, 3),
	(3, 'TV', '8543.23.01', 24, 950, 9),
	(5, 'Printers', '8722.02.00', 50, 145, 13);

-- Dumping structure for table globaltrade_db.refresh_token
CREATE TABLE IF NOT EXISTS `refresh_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `expiryAt` datetime(6) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6t7skxndr9jtm3ckw71g75tfl` (`email`),
  UNIQUE KEY `UK_r4k4edos30bx9neoq81mdvwph` (`token`),
  UNIQUE KEY `UKr4k4edos30bx9neoq81mdvwph` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.refresh_token: ~1 rows (approximately)
REPLACE INTO `refresh_token` (`id`, `createdAt`, `email`, `expiryAt`, `token`) VALUES
	(12, '2026-08-26 08:46:20.260332', 'inspiring@gmail.com', '2026-09-02 08:46:20.260332', 'f2d9b13af6b74289aebf9fb5c3ec82645cd4d6b0cb09421da4eb109c473bffb3');

-- Dumping structure for table globaltrade_db.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.roles: ~5 rows (approximately)
REPLACE INTO `roles` (`id`, `role`) VALUES
	(1, 'admin'),
	(2, 'manager'),
	(3, 'customs agent'),
	(4, 'logistics coordinator'),
	(5, 'vendor manager');

-- Dumping structure for table globaltrade_db.shipment
CREATE TABLE IF NOT EXISTS `shipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipment_id` varchar(45) NOT NULL,
  `carrier` varchar(45) NOT NULL,
  `expect_data` datetime NOT NULL,
  `weight` double NOT NULL,
  `description` text NOT NULL,
  `origin_address` varchar(100) NOT NULL,
  `sender_name` varchar(45) NOT NULL,
  `sender_phone` varchar(45) NOT NULL,
  `dest_address` varchar(100) NOT NULL,
  `recipient_name` varchar(45) NOT NULL,
  `recipient_phone` varchar(45) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `origin_country_id` int NOT NULL,
  `dest_country_id` int NOT NULL,
  `admin_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shipment_country1_idx` (`origin_country_id`),
  KEY `fk_shipment_country2_idx` (`dest_country_id`),
  KEY `fk_shipment_admin1_idx` (`admin_id`),
  CONSTRAINT `fk_shipment_admin1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`),
  CONSTRAINT `fk_shipment_country1` FOREIGN KEY (`origin_country_id`) REFERENCES `country` (`id`),
  CONSTRAINT `fk_shipment_country2` FOREIGN KEY (`dest_country_id`) REFERENCES `country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.shipment: ~3 rows (approximately)
REPLACE INTO `shipment` (`id`, `shipment_id`, `carrier`, `expect_data`, `weight`, `description`, `origin_address`, `sender_name`, `sender_phone`, `dest_address`, `recipient_name`, `recipient_phone`, `created_at`, `updated_at`, `origin_country_id`, `dest_country_id`, `admin_id`) VALUES
	(1, 'SHP-157861', 'DHL', '2026-08-26 00:00:00', 5, 'carefull', 'No. 4/a Aluthgama, Dekinda, Nawalapitiya.', 'Dinuka', '0762078415', '70568 Samantha Pass, Apt. 351, 6848, Tshwane, Limpopo, South Africa', 'Samantha', '0762078415', '2026-08-22 06:51:37', '2026-08-22 06:51:37', 38, 34, 1),
	(3, 'SHP-495688', 'Global Air', '2026-08-30 00:00:00', 10, 'nothing special', 'Sri Lanka - GlobalTrade Katunayake Express', 'Global Trade Logistics Corporation', '0123456789', 'ul. Mazowiecka 45 m. 1200-052 Warszawa', 'Jan Kowalski', '48226543210', '2026-08-23 04:06:46', '2026-08-23 04:06:46', 38, 31, 1),
	(4, 'SHP-990312', 'Global express', '2026-08-30 00:00:00', 16, 'handle carefully', 'China - GlobalTrade Shanghai Pudong Hub', 'Global Trade Logistics Corporation', '0123456789', 'No. 4/a Aluthgama, Dekinda, Nawalapitiya.', 'Chanuka', '0772323225', '2026-08-25 04:04:51', '2026-08-25 04:04:51', 7, 38, 1);

-- Dumping structure for table globaltrade_db.shipment_items
CREATE TABLE IF NOT EXISTS `shipment_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ship_product_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `shipment_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shipment_items_ship_product1_idx` (`ship_product_id`),
  KEY `fk_shipment_items_shipment1_idx` (`shipment_id`),
  KEY `fk_shipment_items_inventory1_idx` (`inventory_id`),
  CONSTRAINT `fk_shipment_items_inventory1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`),
  CONSTRAINT `fk_shipment_items_ship_product1` FOREIGN KEY (`ship_product_id`) REFERENCES `ship_product` (`id`),
  CONSTRAINT `fk_shipment_items_shipment1` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.shipment_items: ~5 rows (approximately)
REPLACE INTO `shipment_items` (`id`, `ship_product_id`, `inventory_id`, `quantity`, `shipment_id`) VALUES
	(1, 5, NULL, 1, 1),
	(2, 6, NULL, 1, 1),
	(3, NULL, 1, 2, 3),
	(4, NULL, 2, 4, 3),
	(5, NULL, 3, 1, 4);

-- Dumping structure for table globaltrade_db.shipment_progress
CREATE TABLE IF NOT EXISTS `shipment_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ship_status_id` int NOT NULL,
  `location` varchar(45) NOT NULL,
  `description` text NOT NULL,
  `shipment_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shipment_progress_ship_status1_idx` (`ship_status_id`),
  KEY `fk_shipment_progress_shipment1_idx` (`shipment_id`),
  CONSTRAINT `fk_shipment_progress_ship_status1` FOREIGN KEY (`ship_status_id`) REFERENCES `ship_status` (`id`),
  CONSTRAINT `fk_shipment_progress_shipment1` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.shipment_progress: ~5 rows (approximately)
REPLACE INTO `shipment_progress` (`id`, `ship_status_id`, `location`, `description`, `shipment_id`, `created_at`) VALUES
	(1, 1, 'From : Sri Lanka To : South Africa', 'Shipment Accepted By Global Trade Logistics Corporation', 1, '2026-08-22 06:51:37'),
	(2, 4, 'GlobalTrade Katunayake Express', 'We are preparing your item for shipment', 1, '2026-08-22 10:10:24'),
	(3, 5, 'katunayake airport', 'Your package is on its way', 1, '2026-08-22 10:38:21'),
	(4, 1, 'GlobalTrade Katunayake Express - Sri Lanka', 'Shipment Accepted By Global Trade Logistics Corporation', 3, '2026-08-23 04:06:46'),
	(5, 1, 'GlobalTrade Shanghai Pudong Hub - China', 'Shipment Accepted By Global Trade Logistics Corporation', 4, '2026-08-25 04:04:51');

-- Dumping structure for table globaltrade_db.ship_category
CREATE TABLE IF NOT EXISTS `ship_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.ship_category: ~2 rows (approximately)
REPLACE INTO `ship_category` (`id`, `name`) VALUES
	(1, 'DIRECT'),
	(2, 'INVENTORY');

-- Dumping structure for table globaltrade_db.ship_product
CREATE TABLE IF NOT EXISTS `ship_product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `hs_code` varchar(45) NOT NULL,
  `quantity` int NOT NULL,
  `unit_value` int NOT NULL,
  `vendor_shipment_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ship_product_vendor_shipment1_idx` (`vendor_shipment_id`),
  CONSTRAINT `fk_ship_product_vendor_shipment1` FOREIGN KEY (`vendor_shipment_id`) REFERENCES `vendor_shipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.ship_product: ~4 rows (approximately)
REPLACE INTO `ship_product` (`id`, `name`, `hs_code`, `quantity`, `unit_value`, `vendor_shipment_id`) VALUES
	(1, 'Monitors', '8507.60.00', 56, 120, 2),
	(2, 'Smartwatch', '8544.70.00', 79, 55, 2),
	(5, 'Laptop Cooling Pad', '8413.50.90', 1, 10, 4),
	(6, 'ASUS ExpertBook B1', '8542.31.00', 1, 1000, 4);

-- Dumping structure for table globaltrade_db.ship_status
CREATE TABLE IF NOT EXISTS `ship_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.ship_status: ~8 rows (approximately)
REPLACE INTO `ship_status` (`id`, `name`) VALUES
	(1, 'ACCEPTED'),
	(2, 'NOT_ACCEPTED'),
	(3, 'PENDING'),
	(4, 'PROCESSING'),
	(5, 'IN_TRANSIT'),
	(6, 'DELAYED'),
	(7, 'DELIVERED'),
	(8, 'CANCELLED');

-- Dumping structure for table globaltrade_db.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password_hash` text NOT NULL,
  `account_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_account_type_idx` (`account_type_id`),
  CONSTRAINT `fk_user_account_type` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.user: ~2 rows (approximately)
REPLACE INTO `user` (`id`, `username`, `email`, `password_hash`, `account_type_id`) VALUES
	(1, 'Doris K. Thomas', 'doris@gmail.com', '$2a$12$10.VsrznjxWhyDz/N9ff8.Vf56E9UMbDeORFVOo6./sfGAVbGOCRS', 1),
	(2, 'inspiringtorvalds8', 'inspiring@gmail.com', '$2a$12$8qqkEf/62u9BY4Mh1D9GDu.XF5XQPA5WQEWKSDOWIqKhNsLCDoR8K', 2);

-- Dumping structure for table globaltrade_db.user_status
CREATE TABLE IF NOT EXISTS `user_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.user_status: ~3 rows (approximately)
REPLACE INTO `user_status` (`id`, `status`) VALUES
	(1, 'ACTIVE'),
	(2, 'SUSPENDED'),
	(3, 'PENDING');

-- Dumping structure for table globaltrade_db.vendor
CREATE TABLE IF NOT EXISTS `vendor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` varchar(45) NOT NULL,
  `company_name` varchar(45) NOT NULL,
  `contact_person` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `phone` varchar(45) NOT NULL,
  `address` text NOT NULL,
  `reg_number` varchar(45) NOT NULL,
  `compliance_information` text NOT NULL,
  `req_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `country_id` int NOT NULL,
  `vendor_status_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vendor_vendor_status1_idx` (`vendor_status_id`),
  KEY `fk_vendor_country1_idx` (`country_id`),
  KEY `fk_vendor_user1_idx` (`user_id`),
  CONSTRAINT `fk_vendor_country1` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`),
  CONSTRAINT `fk_vendor_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_vendor_vendor_status1` FOREIGN KEY (`vendor_status_id`) REFERENCES `vendor_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.vendor: ~1 rows (approximately)
REPLACE INTO `vendor` (`id`, `vendor_id`, `company_name`, `contact_person`, `email`, `phone`, `address`, `reg_number`, `compliance_information`, `req_date`, `created_at`, `country_id`, `vendor_status_id`, `user_id`) VALUES
	(1, 'VND-1768', 'Sky Camping', 'Dinuka Dilshan', 'dinukadilshan8026@gmail.com', '0762078415', 'No. 4/a Aluthgama, Dekinda, Nawalapitiya.', 'REG-3287374', 'government approved', '2026-08-19 07:59:15', '2026-08-19 07:59:15', 38, 2, 1);

-- Dumping structure for table globaltrade_db.vendor_shipment
CREATE TABLE IF NOT EXISTS `vendor_shipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipment_id` varchar(45) NOT NULL,
  `carrier` varchar(45) NOT NULL,
  `expect_data` datetime NOT NULL,
  `weight` double NOT NULL,
  `description` text NOT NULL,
  `origin_address` varchar(100) NOT NULL,
  `sender_name` varchar(45) NOT NULL,
  `sender_phone` varchar(45) NOT NULL,
  `dest_address` varchar(100) DEFAULT NULL,
  `warehouses_id` int DEFAULT NULL,
  `recipient_name` varchar(45) DEFAULT NULL,
  `recipient_phone` varchar(45) DEFAULT NULL,
  `ship_category_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `origin_country_id` int NOT NULL,
  `dest_country_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `ship_status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vendor_shipment_ship_category1_idx` (`ship_category_id`),
  KEY `fk_vendor_shipment_vendor1_idx` (`vendor_id`),
  KEY `fk_vendor_shipment_warehouses1_idx` (`warehouses_id`),
  KEY `fk_vendor_shipment_country1_idx` (`origin_country_id`),
  KEY `fk_vendor_shipment_country2_idx` (`dest_country_id`),
  KEY `fk_vendor_shipment_ship_status1_idx` (`ship_status_id`),
  CONSTRAINT `fk_vendor_shipment_country1` FOREIGN KEY (`origin_country_id`) REFERENCES `country` (`id`),
  CONSTRAINT `fk_vendor_shipment_country2` FOREIGN KEY (`dest_country_id`) REFERENCES `country` (`id`),
  CONSTRAINT `fk_vendor_shipment_ship_category1` FOREIGN KEY (`ship_category_id`) REFERENCES `ship_category` (`id`),
  CONSTRAINT `fk_vendor_shipment_ship_status1` FOREIGN KEY (`ship_status_id`) REFERENCES `ship_status` (`id`),
  CONSTRAINT `fk_vendor_shipment_vendor1` FOREIGN KEY (`vendor_id`) REFERENCES `vendor` (`id`),
  CONSTRAINT `fk_vendor_shipment_warehouses1` FOREIGN KEY (`warehouses_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.vendor_shipment: ~2 rows (approximately)
REPLACE INTO `vendor_shipment` (`id`, `shipment_id`, `carrier`, `expect_data`, `weight`, `description`, `origin_address`, `sender_name`, `sender_phone`, `dest_address`, `warehouses_id`, `recipient_name`, `recipient_phone`, `ship_category_id`, `vendor_id`, `origin_country_id`, `dest_country_id`, `created_at`, `ship_status_id`) VALUES
	(2, 'SHP-230634', 'FedEx', '2026-08-29 00:00:00', 70, 'noo', '3434', 'dfdf', '455435435435', '', 3, '', '', 2, 1, 34, 38, '2026-08-21 07:38:34', 1),
	(4, 'SHP-157861', 'DHL', '2026-08-26 00:00:00', 5, 'carefull', 'No. 4/a Aluthgama, Dekinda, Nawalapitiya.', 'Dinuka', '0762078415', '70568 Samantha Pass, Apt. 351, 6848, Tshwane, Limpopo, South Africa', NULL, 'Samantha', '565645635', 1, 1, 38, 34, '2026-08-21 08:10:40', 1);

-- Dumping structure for table globaltrade_db.vendor_status
CREATE TABLE IF NOT EXISTS `vendor_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.vendor_status: ~4 rows (approximately)
REPLACE INTO `vendor_status` (`id`, `status`) VALUES
	(1, 'review'),
	(2, 'active'),
	(3, 'warning'),
	(4, 'suspended');

-- Dumping structure for table globaltrade_db.warehouses
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `country_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wearehouses_country1_idx` (`country_id`),
  CONSTRAINT `fk_wearehouses_country1` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table globaltrade_db.warehouses: ~16 rows (approximately)
REPLACE INTO `warehouses` (`id`, `name`, `country_id`) VALUES
	(1, 'GlobalTrade Colombo Central Hub', 38),
	(2, 'GlobalTrade Kelani Valley Facility', 38),
	(3, 'GlobalTrade Katunayake Express', 38),
	(4, 'GlobalTrade Hambantota Gateway', 38),
	(5, 'GlobalTrade Nhava Sheva Logistics Park', 14),
	(6, 'GlobalTrade NCR Mega-Center', 14),
	(7, 'GlobalTrade Bengaluru Tech-Fulfillment', 14),
	(8, 'GlobalTrade Chennai Coast Depot', 14),
	(9, 'GlobalTrade Shanghai Pudong Hub', 7),
	(10, 'GlobalTrade Shenzhen Greater Bay Center', 7),
	(11, 'GlobalTrade Ningbo Port Terminal', 7),
	(12, 'GlobalTrade Chengdu Western Gateway', 7),
	(13, 'GlobalTrade Tokyo Bay Logistics Center', 19),
	(14, 'GlobalTrade Osaka Kansai Depot', 19),
	(15, 'GlobalTrade Yokohama Harbor Facility', 19),
	(16, 'GlobalTrade Narita Air Cargo Center', 19);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
