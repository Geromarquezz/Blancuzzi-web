-- ============================================
-- SETUP BASE DE DATOS LOCAL - Blancuzzi
-- ============================================

-- ============================================
-- TABLA DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    google_id VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    verify_otp VARCHAR(6),
    verify_otp_expire_at TIMESTAMP,
    reset_password_otp VARCHAR(6),
    reset_password_otp_expire_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA DE TURNOS
-- ============================================
CREATE TABLE IF NOT EXISTS turnos(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    consultation_type VARCHAR(16),
    patient_notes TEXT, 
    google_event_id VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_business_hours 
        CHECK (EXTRACT(hour FROM date) >= 12 AND EXTRACT(hour FROM date) <= 20),
    CONSTRAINT check_business_days 
        CHECK (EXTRACT(dow FROM date) BETWEEN 1 AND 5),
    CONSTRAINT check_end_after_start 
        CHECK (end_date > date),
    CONSTRAINT check_one_hour_duration 
        CHECK (end_date = date + INTERVAL '1 hour')
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_turnos_user_id ON turnos (user_id);
CREATE INDEX IF NOT EXISTS idx_turnos_date ON turnos(date);
CREATE INDEX IF NOT EXISTS idx_turnos_status ON turnos(status);
CREATE INDEX IF NOT EXISTS idx_turnos_google_event_id ON turnos(google_event_id);

-- Índice único para prevenir solapamientos de turnos activos
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_overlap_turnos 
ON turnos (date) 
WHERE status NOT IN ('cancelled');

-- ============================================
-- TABLA DE TOKENS DE GOOGLE
-- ============================================
CREATE TABLE IF NOT EXISTS google_tokens (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) UNIQUE NOT NULL DEFAULT 'calendar',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(20),
    expiry_date BIGINT,
    scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_google_tokens_service ON google_tokens(service_name);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column ()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_turnos_updated_at ON turnos;
CREATE TRIGGER update_turnos_updated_at 
    BEFORE UPDATE ON turnos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at 
    BEFORE UPDATE ON google_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MENSAJE FINAL
-- ============================================
SELECT 'Base de datos configurada exitosamente!' as message;
