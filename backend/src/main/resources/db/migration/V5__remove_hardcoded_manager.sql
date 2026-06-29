-- V5: Remove hardcoded manager from V2 (DataSeeder creates it with correct BCrypt hash on startup)
DELETE FROM users WHERE email = 'manager@tourmaster.ua';
