pub mod api;
pub mod core;
pub mod io;
pub mod processors;
pub mod utils;

// Re-export common types for convenience
pub use core::error::{Result, UdoError};
pub use core::pipeline::{DataProcessor, InputSource, OutputSink, PipelineRunner};
pub use core::schema::infer_schema;
pub use utils::json::{json_rows_to_batch, parse_json};
