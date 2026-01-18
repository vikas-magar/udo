# Stage 1: Builder
FROM rust:1.83-slim-bookworm as builder

WORKDIR /usr/src/udo

# Install build dependencies (needed for candle/openssl)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests first for caching
COPY ../Cargo.toml Cargo.lock ./

# Create dummy src to build dependencies
RUN mkdir src && \
    echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs && \
    echo "pub fn dummy() {}" > src/lib.rs

# Build dependencies
RUN cargo build --release

# Remove dummy files
RUN rm -rf src

# Copy actual source code
COPY ../src ./src

# Build the actual application
# touch files to ensure cargo rebuilds them
RUN touch src/main.rs src/lib.rs
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies (OpenSSL)
RUN apt-get update && apt-get install -y \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /usr/src/udo/target/release/udo-cli /usr/local/bin/udo

# Set entrypoint
ENTRYPOINT ["udo"]
