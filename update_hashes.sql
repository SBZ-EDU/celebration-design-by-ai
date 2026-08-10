UPDATE users SET password_hash = '$2b$10$n8G2I4dGJ/Yx9gWpvLHB5.2kkaq5ECpt4uHeMAzdXOoR2tk8puamO' WHERE id='admin-001';
UPDATE users SET password_hash = '$2b$10$Y7GgOkxxFGLlKxVSttzVkeg3tSFtdDgehR7pZsG2odpQ37QmAdp7q' WHERE id='user-001';
SELECT id, email, role FROM users;
