# Stage 1: Builder
FROM rust:1.83-slim-bookworm as builder

WORKDIR /usr/src/udo

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
# Assuming build context is project root (.)
COPY Cargo.toml Cargo.lock ./

# Create dummy src to build dependencies
RUN mkdir src && \
    echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs && \
    echo "pub fn dummy() {}" > src/lib.rs

# Build dependencies
RUN cargo build --release --features full

# Remove dummy files
RUN rm -rf src

# Copy actual source code
COPY src ./src
COPY config ./config

# Build the actual application
RUN touch src/main.rs src/lib.rs
RUN cargo build --release --features full

# Stage 2: Runtime (Distroless)
FROM gcr.io/distroless/cc-debian12

WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/udo/target/release/udo-cli /app/udo

# Copy config if needed (optional)
# COPY --from=builder /usr/src/udo/config /app/config

# Set entrypoint
ENTRYPOINT ["/app/udo"]
