const CORS_ALLOWED = process.env.ALLOWED_CORS;
const METHODS_ALLOWED = process.env.ALLOWED_METHODS;

module.exports = {
  origins: CORS_ALLOWED.split(" "), // Do not use wildcard`
  methods: METHODS_ALLOWED.split(" "), // List only` available methods
  credentials: true, // Must be set to true
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Authorization",
  ], // Allowed Headers to be received
};
