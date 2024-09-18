const express = require('express');
const bodyParser = require('body-parser');
const scimAppSvc = require("./config").service
const fs = require('fs');

//middleware : creating express server
const app = express();

//middleware: separation of incoming request into req.header, req.body
app.use(bodyParser.urlencoded({ extended: true }));

//middleware: req.body -> Json object conversion
app.use(bodyParser.json());

//middleware: adding logger for each request coming to server
app.use((req, res, next) => {
    bodyParser.json({ type: ['application/json', 'application/scim+json'] })(req, res, err => {
        if (err) {
            return res.status(400).json({
                status: 'error',
                message: "INVALID JSON"
            });
        }
        next();
    });
});

//middleware : connecting to DB
const db = require("./models");
db.sequelize.sync().then(()=>{
    console.log('Table create successfully')
}).catch((ex)=>{
    console.log('failed to create tables : ',ex)
});

const msvcPort = '443';
const key = "./certs/server.key"
const cert =  "./certs/server.crt"
const password = 'password';

server = require('https').createServer({
    minVersion: "TLSv1.2",
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
    passphrase: password,
    ciphers: [
        "ECDHE-RSA-AES256-GCM-SHA384",
        "ECDHE-RSA-AES256-SHA384",
        "ECDHE-RSA-AES256-SHA",
        "AES256-GCM-SHA384",
        "AES256-SHA256",
        "AES256-SHA",
        "ECDHE-RSA-AES128-GCM-SHA256",
        "ECDHE-RSA-AES128-SHA256",
        "ECDHE-RSA-AES128-SHA",
        "AES128-GCM-SHA256",
        "AES128-SHA256",
        "AES128-SHA"
    ].join(':'),
}, app).listen(msvcPort, () => {
    console.log(`Starting the server on ${msvcPort}`);
    console.log(`Server is up on ${msvcPort}`);
});

//start server
//app.listen(8081, () => console.log(`Listening on port 8081`));

//middleware : serving REST API routes
app.use('/', require('./routes'));
