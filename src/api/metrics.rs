#[cfg(feature = "db")]
use duckdb::{Connection, params};
#[cfg(feature = "db")]
use crate::core::error::{Result, UdoError};

#[cfg(feature = "db")]
#[derive(Clone)]
pub struct MetricsDb {
    path: String,
}

#[cfg(feature = "db")]
impl MetricsDb {
    pub fn new(path: &str) -> Result<Self> {
        Ok(Self {
            path: path.to_string(),
        })
    }

    pub fn record_metric(&self, processed_rows: usize, latency_ms: f64, tokens_saved: usize, operation: &str) -> Result<()> {
        let conn = Connection::open(&self.path).map_err(|e| UdoError::Unknown(e.to_string()))?;
        
        conn.execute_batch(
            "CREATE SEQUENCE IF NOT EXISTS metrics_id_seq;
             CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY DEFAULT nextval('metrics_id_seq'),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_rows BIGINT,
                latency_ms DOUBLE,
                tokens_saved BIGINT,
                operation TEXT
            );"
        ).map_err(|e| UdoError::Unknown(e.to_string()))?;

        conn.execute(
            "INSERT INTO metrics (processed_rows, latency_ms, tokens_saved, operation) VALUES (?, ?, ?, ?)",
            params![processed_rows as i64, latency_ms, tokens_saved as i64, operation],
        ).map_err(|e| UdoError::Unknown(e.to_string()))?;
        Ok(())
    }
}
