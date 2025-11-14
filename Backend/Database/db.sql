
-- -- Consultar todos los usuarios
-- SELECT * FROM users;

-- -- Asegurar columna para bloquear usuarios
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- -- Ver información de las columnas de la tabla
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- -- Modificar la columna phone para que no acepte valores nulos
-- ALTER TABLE users
-- ALTER COLUMN phone SET NOT NULL;

-- -- Crear índice para el campo google_event_id
-- CREATE INDEX IF NOT EXISTS idx_turnos_google_event_id ON turnos(google_event_id);

-- -- Eliminar la columna description si existe (ejecutar si la tabla ya fue creada previamente con description)
-- ALTER TABLE turnos DROP COLUMN IF EXISTS description;

-- -- Resetear turnos (dev)
-- ALTER SEQUENCE turnos_id_seq RESTART WITH 1;
-- TRUNCATE TABLE turnos RESTART IDENTITY CASCADE;

-- --=====================
-- --      DOCKER 
-- --=====================

-- -- Ver todas las tablas en la base de datos
-- docker exec blancuzzi-db psql -U postgres -d blancuzzi_db -c "\dt"

-- -- Consultar usuarios con campos específicos
-- docker exec blancuzzi-db psql -U postgres -d blancuzzi_db -c "SELECT * FROM users;"

-- -- Consultar todos los turnos
-- docker exec blancuzzi-db psql -U postgres -d blancuzzi_db -c "SELECT * FROM turnos;"

-- -- Insertar datos de prueba
-- docker exec -i blancuzzi-db psql -U postgres -d blancuzzi_db < "Backend\Database\insert-test-data.sql"

-- -- Agregar columna google_id para OAuth
-- docker exec -i blancuzzi-db psql -U postgres -d blancuzzi_db < "Backend\Database\add-google-oauth.sql"

-- Iniciar base de datos (si no está corriendo)
-- docker compose -f docker-compose.local.yml up postgres -d 

-- -- Directorio actual
-- cd C:\Users\gerit\OneDrive\Escritorio\Proyectos\Blancuzzi web