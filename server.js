const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
var admin = require("firebase-admin");
var fs = require("fs");
let custom_auth = "1emvITsGXUyCVqUz5Lxzgw==";
var serviceAccount = require("../clevelandmcgill-final.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clevelandmcgill-final.firebaseio.com"
});
admin.auth().createCustomToken(custom_auth);
var db = admin.database();

const PORT = process.env.PORT || 5000;

if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();
  app.use(express.static("public"));
  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
  });

  app.get("/getImageNames", function(req, res) {
    fs.readdir("public/img", function(err, items) {
      res.send(JSON.stringify(items));
    });
  });

  app.post("/sendAnswer", function(req, res) {
    getReq(req).then(body => {
      //send info to /trials/sessionid/trial
      var str =
        "Trial/" +
        body.image_name.toString() +
        "/" +
        body.session_id.toString();
      var ref = db.ref(str);
      ref.set(body);
      res.sendStatus(200);
    });
  });
  app.post("/sendSessionInfo", function(req, res) {
    getReq(req).then(body => {
      //send info to /Sessions/sessionid
      var str = "Session/" + body.session_id.toString();
      var ref = db.ref(str);
      ref.set(body);
      res.sendStatus(200);
    });
  });

  app.listen(PORT, function() {
    console.error(
      `Node cluster worker ${process.pid}: listening on port ${PORT}`
    );
  });
}
async function getReq(req) {
  let body = [];
  return new Promise(function(resolve, reject) {
    req
      .on("data", chunk => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        resolve(JSON.parse(body));
      });
  });
}
