const http = require("http");
const fs = require("fs");
const ODataServer = require("simple-odata-server");
const MongoClient = require("mongodb").MongoClient;
const Adapter = require("simple-odata-server-mongodb");

var config, model;

Promise.all([
    new Promise((res, rej) => {
        fs.readFile("./model/model.json", {
            encoding: "utf-8"
        }, (err, data) => {
            if(err) rej(err);
            else res(data);
        });
    }),
    new Promise((res, rej) => {
        fs.readFile("./config/config.json", {
            encoding: "utf-8"
        }, (err, data) => {
            if(err) rej(err);
            else res(data);
        });
    })
]).then(data => {
    model = JSON.parse(data[0]);
    config = JSON.parse(data[1]);

    console.log(JSON.stringify(model, 3));

    const server = ODataServer("http://localhost:" + config.odata.port)
    .model(model)
    .cors("*")

    const dbUri = `mongodb+srv://${config.db.user.name}:${config.db.user.password}@${config.db.uri}`;

    MongoClient.connect(dbUri, {
        useNewUrlParser: true
    }, (err, db) => {
        server.adapter(Adapter(cb => cb(err, db.db("fritz-friends"))));
    });

    server.query()

    http.createServer(server.handle.bind(server)).listen(config.odata.port);

    console.log(`started server on port ${config.odata.port}`);
});