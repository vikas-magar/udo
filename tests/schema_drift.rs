use arrow::datatypes::DataType;
use simd_json::{json, OwnedValue};
use udo::core::schema::infer_schema;

#[test]
fn test_schema_drift_new_field() {
    let row1: OwnedValue = json!({"a": 1, "b": "foo"});
    let row2: OwnedValue = json!({"a": 2, "c": 3.0});
    let data: OwnedValue = vec![row1, row2].into();

    let schema = infer_schema(&data, None).unwrap();

    assert!(schema.field_with_name("a").is_ok());
    assert!(schema.field_with_name("b").is_ok());
    assert!(schema.field_with_name("c").is_ok());

    assert_eq!(
        schema.field_with_name("a").unwrap().data_type(),
        &DataType::Int64
    );
}

#[test]
fn test_type_widening() {
    let row1: OwnedValue = json!({"a": 1});
    let row2: OwnedValue = json!({"a": 2.5});
    let data: OwnedValue = vec![row1, row2].into();

    let schema = infer_schema(&data, None).unwrap();

    // Int64 + Float64 -> Float64
    assert_eq!(
        schema.field_with_name("a").unwrap().data_type(),
        &DataType::Float64
    );
}
