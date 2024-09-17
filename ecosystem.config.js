

let instances = 5;
module.exports = {
  apps: [{
    // general
    name: 'scim_app',
    node_args: '--max-http-header-size=16384',
    script: './server.js',
    cwd: '/scim_app',
    watch: false,
    max_memory_restart: '200M', 
    instance_var: 'INSTANCE_ID',
    instances,
    // logs
    error_file: './logs/combined_out.log',
    out_file: './logs/combined_out.log',
    // cluster/worker configuration
    exec_mode: 'cluster',
    merge_logs: true,
    wait_ready: true,
    // control flow
    listen_timeout: 5000,
    kill_timeout: 5000,
    autorestart: true,
    max_restarts: 5,
    restart_delay: 1000,
  }]
};
