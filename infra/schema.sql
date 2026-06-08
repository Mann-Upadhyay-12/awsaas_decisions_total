CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    rtt_ms FLOAT,
    bandwidth_mbps FLOAT,
    network_type TEXT,
    network_class TEXT,
    cpu_score INTEGER,
    memory_gb FLOAT,
    cores INTEGER,
    device_class TEXT,
    has_history BOOLEAN,
    strategy TEXT,
    image_quality TEXT,
    deferred_features TEXT[],
    confidence FLOAT,
    decision_ms INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);
