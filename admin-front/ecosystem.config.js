module.exports = {
  apps: [{
    name: 'admin-frontend',
    cwd: '/home/rudin/samurai-monorepo/admin-front',
    script: 'npm',
    args: 'run serve',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log', 
    log_file: './logs/combined.log',
    time: true
  }]
}
