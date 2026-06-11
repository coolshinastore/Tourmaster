-- V2: Seed data (extra services + manager account)

INSERT INTO extra_services (name, description, price, type) VALUES
('Страхування туриста',      'Медичне страхування на весь період туру', 450.00,  'INSURANCE'),
('Страхування від скасування','Повернення вартості туру при скасуванні', 850.00,  'INSURANCE'),
('Трансфер аеропорт→готель', 'Комфортний трансфер в обидва напрямки',   750.00,  'TRANSFER'),
('VIP-трансфер',             'Преміум авто + супровід гіда',            1500.00, 'TRANSFER'),
('Екскурсія містом',         'Оглядова екскурсія містом з гідом',       600.00,  'EXCURSION'),
('Морська прогулянка',       'Прогулянка на яхті з обідом',             1200.00, 'EXCURSION');

-- Default manager account (password: Manager@2025 — BCrypt encoded)
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('manager@tourmaster.ua',
 '$2a$12$WGS5v7Dv6JJBERagKPXKU.BZ0KzGUf0UNJIDqv0S4kEMlrP4KcYpG',
 'Адмін', 'Менеджер', '+380991234567', 'MANAGER');
