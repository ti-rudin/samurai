export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cors: {
    origin: env.array('CORS_ORIGIN'),
  },
  allowedHosts: env.array('VITE_ALLOWED_HOSTS'),
});
