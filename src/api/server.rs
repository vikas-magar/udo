#[cfg(feature = "server")]
use crate::api::auth::User;
#[cfg(feature = "server")]
use actix_cors::Cors;
#[cfg(feature = "server")]
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
#[cfg(feature = "server")]
use actix_web_httpauth::middleware::HttpAuthentication;
#[cfg(feature = "server")]
use duckdb::{AccessMode, Config, Connection};
#[cfg(feature = "server")]
use serde::Serialize;

#[cfg(feature = "server")]
struct AppState {
    db_path: String,
}

#[cfg(feature = "server")]
#[derive(Serialize)]
struct Metric {
    id: i64,
    timestamp: String,
    processed_rows: i64,
    latency_ms: f64,
    tokens_saved: i64,
    operation: String,
}

#[cfg(feature = "server")]
#[derive(Serialize)]
struct DashboardStats {
    total_rows: i64,
    avg_latency: f64,
    total_tokens_saved: i64,
    recent_metrics: Vec<Metric>,
}

#[cfg(feature = "server")]
#[get("/metrics")]
async fn get_metrics(data: web::Data<AppState>, _user: User) -> impl Responder {
    // _user ensures that a valid token with Role::Admin or Role::Viewer was provided
    let config = Config::default()
        .access_mode(AccessMode::ReadOnly)
        .expect("Failed to create config");
    let conn = match Connection::open_with_flags(&data.db_path, config) {
        Ok(c) => c,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Get aggregates
    let (total_rows, avg_latency, total_tokens_saved) = match conn.prepare(
        "
        SELECT 
            COALESCE(SUM(processed_rows), 0), 
            COALESCE(AVG(latency_ms), 0), 
            COALESCE(SUM(tokens_saved), 0) 
        FROM metrics
    ",
    ) {
        Ok(mut stmt) => stmt
            .query_row([], |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, f64>(1)?,
                    row.get::<_, i64>(2)?,
                ))
            })
            .unwrap_or((0, 0.0, 0)),
        Err(_) => (0, 0.0, 0),
    };

    // Get recent rows
    let recent_metrics: Vec<Metric> = match conn.prepare(
        "
        SELECT id, CAST(timestamp AS TEXT), processed_rows, latency_ms, tokens_saved, operation 
        FROM metrics 
        ORDER BY id DESC 
        LIMIT 10
    ",
    ) {
        Ok(mut stmt) => stmt
            .query_map([], |row| {
                Ok(Metric {
                    id: row.get(0)?,
                    timestamp: row.get(1)?,
                    processed_rows: row.get(2)?,
                    latency_ms: row.get(3)?,
                    tokens_saved: row.get(4)?,
                    operation: row.get(5)?,
                })
            })
            .map(|iter| iter.filter_map(|r| r.ok()).collect())
            .unwrap_or_default(),
        Err(_) => Vec::new(),
    };

    HttpResponse::Ok().json(DashboardStats {
        total_rows,
        avg_latency,
        total_tokens_saved,
        recent_metrics,
    })
}

#[cfg(feature = "server")]
pub async fn start_server(db_path: &str) -> std::io::Result<()> {
    let db_path_owned = db_path.to_string();

    println!("Server running on http://0.0.0.0:8080");

    HttpServer::new(move || {
        let cors = Cors::permissive();
        let auth = HttpAuthentication::bearer(crate::api::auth::validator);

        App::new()
            .wrap(cors)
            .wrap(auth)
            .app_data(web::Data::new(AppState {
                db_path: db_path_owned.clone(),
            }))
            .service(get_metrics)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
