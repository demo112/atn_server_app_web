module.exports = {
  apps: [
    {
      name: 'attendance-server',
      script: './dist/server/src/index.js',
      instances: 'max', // 利用所有 CPU 核心
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production'
      },
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // 故障恢复
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
