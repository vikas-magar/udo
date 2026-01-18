use simd_json::OwnedValue;
use arrow::datatypes::{Schema, DataType, Field};
use std::collections::BTreeMap;
use simd_json::prelude::*;
use simd_json::ValueType;
use crate::core::error::{Result, UdoError};

pub fn infer_schema(json_val: &OwnedValue, max_rows: Option<usize>) -> Result<Schema> {
    let rows = match json_val {
        OwnedValue::Array(arr) => arr,
        _ => return Err(UdoError::JsonParse(simd_json::Error::generic(simd_json::ErrorType::ExpectedArray))),
    };

    if rows.is_empty() {
        return Err(UdoError::Pipeline("Empty JSON array, cannot infer schema".to_string()));
    }

    // Use BTreeMap to ensure deterministic column order
    let mut field_map: BTreeMap<String, DataType> = BTreeMap::new();

    let iter = rows.iter().take(max_rows.unwrap_or(usize::MAX));

    for row in iter {
        if let Some(map) = row.as_object() {
            for (key, value) in map {
                let new_type = match value.value_type() {
                    ValueType::I64 | ValueType::U64 => DataType::Int64,
                    ValueType::F64 => DataType::Float64,
                    ValueType::String => DataType::Utf8,
                    ValueType::Bool => DataType::Boolean,
                    _ => DataType::Utf8, // Fallback
                };

                field_map.entry(key.to_string())
                    .and_modify(|existing_type| {
                        // Type Coercion / Widening logic
                        if *existing_type == DataType::Int64 && new_type == DataType::Float64 {
                            *existing_type = DataType::Float64;
                        }
                    })
                    .or_insert(new_type);
            }
        }
    }

    let fields: Vec<Field> = field_map.into_iter()
        .map(|(name, dt)| Field::new(name, dt, true))
        .collect();

    Ok(Schema::new(fields))
}
