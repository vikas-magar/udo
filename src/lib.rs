pub mod core;
pub mod processors;
pub mod io;
pub mod api;
pub mod utils;

// Re-export common types for convenience
pub use core::error::{Result, UdoError};
pub use core::pipeline::{InputSource, DataProcessor, OutputSink, PipelineRunner};
pub use core::schema::infer_schema;
pub use utils::json::{parse_json, json_rows_to_batch};
