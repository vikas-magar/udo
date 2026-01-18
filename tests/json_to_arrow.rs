use std::sync::Arc;

use arrow::array::{Float64Array, Int64Array, StringArray};
use arrow::datatypes::{DataType, Field, Schema};
use simd_json::OwnedValue;
use udo::{json_rows_to_batch, parse_json};

#[test]
fn test_json_to_record_batch() {
    let json_data = r#"[
        {"a": 1, "b": 2.0, "c": "foo"},
        {"a": 2, "b": 3.0, "c": "bar"},
        {"a": 3, "b": 4.0, "c": "baz"}
    ]"#;

    let schema = Arc::new(Schema::new(vec![
        Field::new("a", DataType::Int64, true),
        Field::new("b", DataType::Float64, true),
        Field::new("c", DataType::Utf8, true),
    ]));

    let val = parse_json(json_data.as_bytes()).expect("Failed to parse JSON");
    let rows = match val {
        OwnedValue::Array(arr) => arr,
        _ => panic!("Expected array"),
    };

    let result = json_rows_to_batch(&rows, schema.clone());
    assert!(result.is_ok());

    let record_batch = result.unwrap();
    assert_eq!(record_batch.schema(), schema);
    assert_eq!(record_batch.num_columns(), 3);
    assert_eq!(record_batch.num_rows(), 3);

    let a = record_batch
        .column(0)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();
    let b = record_batch
        .column(1)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    let c = record_batch
        .column(2)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    assert_eq!(a.value(0), 1);
    assert_eq!(b.value(0), 2.0);
    assert_eq!(c.value(0), "foo");
}
