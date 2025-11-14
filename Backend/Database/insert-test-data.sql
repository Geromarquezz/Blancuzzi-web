-- ============================================
-- DATOS DE PRUEBA (20 USUARIOS CON 1 TURNO CADA UNO)
-- ============================================
-- Contraseña para todos: "password123"

-- Eliminar turnos y usuarios de prueba anteriores (opcional)
DELETE FROM turnos WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');
DELETE FROM users WHERE email LIKE '%@example.com';

INSERT INTO users (name, lastname, phone, email, password, is_verified) VALUES
('Juan', 'Pérez', '1134567890', 'juan.perez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('María', 'González', '1134567891', 'maria.gonzalez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Carlos', 'Rodríguez', '1134567892', 'carlos.rodriguez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Ana', 'Martínez', '1134567893', 'ana.martinez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Luis', 'Fernández', '1134567894', 'luis.fernandez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Laura', 'López', '1134567895', 'laura.lopez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Diego', 'Sánchez', '1134567896', 'diego.sanchez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Sofía', 'Ramírez', '1134567897', 'sofia.ramirez@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Miguel', 'Torres', '1134567898', 'miguel.torres@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Valentina', 'Flores', '1134567899', 'valentina.flores@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Mateo', 'Romero', '1134567800', 'mateo.romero@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Camila', 'Silva', '1134567801', 'camila.silva@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Santiago', 'Morales', '1134567802', 'santiago.morales@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Isabella', 'Ortiz', '1134567803', 'isabella.ortiz@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Benjamín', 'Vargas', '1134567804', 'benjamin.vargas@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Martina', 'Castro', '1134567805', 'martina.castro@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Lucas', 'Ríos', '1134567806', 'lucas.rios@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Emma', 'Mendoza', '1134567807', 'emma.mendoza@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Sebastián', 'Herrera', '1134567808', 'sebastian.herrera@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true),
('Lucía', 'Acosta', '1134567809', 'lucia.acosta@example.com', '$2a$12$jWvE.FnLGdymhu1nd4KSi.fipu8bFHcDFN43RDtR6LsKYXaekenWG', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar turnos de prueba (próximos días laborables solamente)
-- Calcula el próximo lunes y distribuye turnos en lunes, martes, miércoles, jueves y viernes
INSERT INTO turnos (user_id, date, end_date, status, consultation_type, patient_notes) 
SELECT u.id, date_part, date_part + INTERVAL '1 hour', 'confirmed', consultation_type, patient_notes
FROM (VALUES
    -- Lunes
    ('juan.perez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days' + TIME '12:00:00', 'Limpieza dental', 'Primera consulta'),
    ('maria.gonzalez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days' + TIME '13:00:00', 'Consulta general', NULL),
    ('carlos.rodriguez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days' + TIME '14:00:00', 'Ortodoncia', 'Control mensual'),
    ('ana.martinez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days' + TIME '15:00:00', 'Extracción', 'Muela del juicio'),
    -- Martes
    ('luis.fernandez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '8 days' + TIME '12:00:00', 'Blanqueamiento', NULL),
    ('laura.lopez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '8 days' + TIME '13:00:00', 'Consulta general', 'Dolor de muelas'),
    ('diego.sanchez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '8 days' + TIME '14:00:00', 'Endodoncia', 'Conducto'),
    ('sofia.ramirez@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '8 days' + TIME '16:00:00', 'Limpieza dental', NULL),
    -- Miércoles
    ('miguel.torres@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '9 days' + TIME '12:00:00', 'Consulta general', 'Revisión anual'),
    ('valentina.flores@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '9 days' + TIME '13:00:00', 'Ortodoncia', 'Ajuste de brackets'),
    ('mateo.romero@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '9 days' + TIME '15:00:00', 'Limpieza dental', NULL),
    ('camila.silva@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '9 days' + TIME '17:00:00', 'Consulta general', 'Sensibilidad dental'),
    -- Jueves
    ('santiago.morales@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '10 days' + TIME '12:00:00', 'Blanqueamiento', 'Segunda sesión'),
    ('isabella.ortiz@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '10 days' + TIME '13:00:00', 'Consulta general', NULL),
    ('benjamin.vargas@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '10 days' + TIME '14:00:00', 'Limpieza dental', 'Sarro acumulado'),
    ('martina.castro@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '10 days' + TIME '16:00:00', 'Consulta general', NULL),
    -- Viernes
    ('lucas.rios@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '11 days' + TIME '12:00:00', 'Ortodoncia', 'Retiro de brackets'),
    ('emma.mendoza@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '11 days' + TIME '14:00:00', 'Consulta general', 'Caries'),
    ('sebastian.herrera@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '11 days' + TIME '16:00:00', 'Limpieza dental', NULL),
    ('lucia.acosta@example.com', DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '11 days' + TIME '18:00:00', 'Consulta general', 'Dolor agudo')
) AS t(email, date_part, consultation_type, patient_notes)
JOIN users u ON u.email = t.email;
