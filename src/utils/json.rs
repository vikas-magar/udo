use simd_json::OwnedValue;
use arrow::datatypes::{Schema, DataType};
use arrow::record_batch::RecordBatch;
use arrow::array::{ArrayRef, Int64Builder, Float64Builder, StringBuilder, BooleanBuilder};
use crate::core::error::{Result, UdoError};
use std::sync::Arc;
use simd_json::prelude::*;

pub fn parse_json(json_data: &[u8]) -> Result<OwnedValue> {
    let mut data = json_data.to_vec();
    simd_json::to_owned_value(&mut data).map_err(UdoError::JsonParse)
}

pub fn json_rows_to_batch(rows: &[OwnedValue], schema: Arc<Schema>) -> Result<RecordBatch> {
    let row_count = rows.len();
    
    let mut builders: Vec<Box<dyn arrow::array::ArrayBuilder>> = schema.fields().iter().map(|f| {
        match f.data_type() {
            DataType::Int64 => Box::new(Int64Builder::with_capacity(row_count)) as Box<dyn arrow::array::ArrayBuilder>,
            DataType::Float64 => Box::new(Float64Builder::with_capacity(row_count)),
            DataType::Utf8 => Box::new(StringBuilder::with_capacity(row_count, row_count * 10)),
            DataType::Boolean => Box::new(BooleanBuilder::with_capacity(row_count)),
            dt => panic!("Unsupported Arrow type in schema: {:?}", dt), // In a real scenario, return Error
        }
    }).collect();

    for row in rows {
        if let Some(obj) = row.as_object() {
            for (i, field) in schema.fields().iter().enumerate() {
                let val = obj.get(field.name());
                let builder = &mut builders[i];
                
                match field.data_type() {
                    DataType::Int64 => {
                        let b = builder.as_any_mut().downcast_mut::<Int64Builder>().expect("Internal state mismatch");
                        if let Some(v) = val.and_then(|v: &OwnedValue| v.as_i64().or_else(|| v.as_u64().map(|u| u as i64))) {
                            b.append_value(v);
                        } else {
                            b.append_null();
                        }
                    }
                    DataType::Float64 => {
                        let b = builder.as_any_mut().downcast_mut::<Float64Builder>().expect("Internal state mismatch");
                        if let Some(v) = val.and_then(|v: &OwnedValue| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64))) {
                            b.append_value(v);
                        } else {
                            b.append_null();
                        }
                    }
                    DataType::Utf8 => {
                        let b = builder.as_any_mut().downcast_mut::<StringBuilder>().expect("Internal state mismatch");
                        if let Some(v) = val.and_then(|v: &OwnedValue| v.as_str()) {
                            b.append_value(v);
                        } else {
                            b.append_null();
                        }
                    }
                    DataType::Boolean => {
                        let b = builder.as_any_mut().downcast_mut::<BooleanBuilder>().expect("Internal state mismatch");
                        if let Some(v) = val.and_then(|v: &OwnedValue| v.as_bool()) {
                            b.append_value(v);
                        } else {
                            b.append_null();
                        }
                    }
                    _ => {}
                }
            }
        } else {
            for (i, field) in schema.fields().iter().enumerate() {
                append_null(&mut builders[i], field.data_type());
            }
        }
    }

    let columns: Vec<ArrayRef> = builders.into_iter().map(|mut b| b.finish()).collect();
    RecordBatch::try_new(schema, columns).map_err(UdoError::Arrow)
}

fn append_null(builder: &mut Box<dyn arrow::array::ArrayBuilder>, data_type: &DataType) {
    match data_type {
        DataType::Int64 => builder.as_any_mut().downcast_mut::<Int64Builder>().expect("Internal state mismatch").append_null(),
        DataType::Float64 => builder.as_any_mut().downcast_mut::<Float64Builder>().expect("Internal state mismatch").append_null(),
        DataType::Utf8 => builder.as_any_mut().downcast_mut::<StringBuilder>().expect("Internal state mismatch").append_null(),
        DataType::Boolean => builder.as_any_mut().downcast_mut::<BooleanBuilder>().expect("Internal state mismatch").append_null(),
        _ => {}
    }
}
