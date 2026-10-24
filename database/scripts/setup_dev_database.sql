-- =============================================================================
-- DocuRisk AI — Dedicated Development Database & Least-Privilege User Setup
-- Run as MySQL root or administrative user:
-- mysql -u root -p < setup_dev_database.sql
-- =============================================================================

-- 1. Create Dedicated Application Database
CREATE DATABASE IF NOT EXISTS `docurisk_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create Application User with Explicit Least-Privilege Scope
-- Replaces default root usage with a dedicated service account
CREATE USER IF NOT EXISTS 'docurisk_user'@'localhost' IDENTIFIED BY 'docurisk_secure_password';
CREATE USER IF NOT EXISTS 'docurisk_user'@'127.0.0.1' IDENTIFIED BY 'docurisk_secure_password';
CREATE USER IF NOT EXISTS 'docurisk_user'@'%' IDENTIFIED BY 'docurisk_secure_password';

-- 3. Grant Application Permissions Only on docurisk_db
-- Grants DML and schema management privileges, restricting server-level administrative access
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES 
  ON `docurisk_db`.* 
  TO 'docurisk_user'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES 
  ON `docurisk_db`.* 
  TO 'docurisk_user'@'127.0.0.1';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES 
  ON `docurisk_db`.* 
  TO 'docurisk_user'@'%';

FLUSH PRIVILEGES;

SELECT 'DocuRisk development database and least-privilege user successfully configured.' AS status;
