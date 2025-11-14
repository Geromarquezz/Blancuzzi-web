-- Agregar columna google_id a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Crear índice para búsquedas rápidas por google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Ver la estructura actualizada de la tabla users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
