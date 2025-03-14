module.exports = {
  apps : [{
    name: 'eskort-api',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/mydatabase',
      CLIENT_URL: 'http://eskortvsegorodarfreal.site'
    }
  }]
}; 