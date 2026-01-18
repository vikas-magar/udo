use actix_web::dev::ServiceRequest;
use actix_web::{Error, FromRequest, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use futures::future::{ready, Ready};
use std::env;

#[derive(Debug, Clone, PartialEq)]
pub enum Role {
    Admin,
    Viewer,
}

pub struct User {
    pub role: Role,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let auth = BearerAuth::from_request(req, payload).into_inner();

        if let Ok(bearer) = auth {
            let token = bearer.token();
            let admin_key = env::var("UDO_ADMIN_KEY").unwrap_or_else(|_| "admin-secret".to_string());
            let viewer_key =
                env::var("UDO_VIEWER_KEY").unwrap_or_else(|_| "viewer-secret".to_string());

            if token == admin_key {
                return ready(Ok(User { role: Role::Admin }));
            } else if token == viewer_key {
                return ready(Ok(User { role: Role::Viewer }));
            }
        }

        ready(Err(actix_web::error::ErrorUnauthorized(
            "Invalid or missing token",
        )))
    }
}

pub async fn validator(
    req: ServiceRequest,
    creds: BearerAuth,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let token = creds.token();
    let admin_key = env::var("UDO_ADMIN_KEY").unwrap_or_else(|_| "admin-secret".to_string());
    let viewer_key = env::var("UDO_VIEWER_KEY").unwrap_or_else(|_| "viewer-secret".to_string());

    if token == admin_key {
        req.extensions_mut().insert(User { role: Role::Admin });
        Ok(req)
    } else if token == viewer_key {
        req.extensions_mut().insert(User { role: Role::Viewer });
        Ok(req)
    } else {
        Err((actix_web::error::ErrorUnauthorized("Invalid token"), req))
    }
}
