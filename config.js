


module.exports = {
  service: {
    "workers": 5,
    "sslConfig": {
        "enabled": true,
        "key": "/scim_app/certs/server.key",
        "cert": "/scim_app/certs/server.crt",
    }
},

    postgresDB : {
      HOST: "localhost",
      USER: "postgres",
      PASSWORD: "12345",
      DB: "scimapp",
      PORT: 5432,
      dialect: "postgres",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
};