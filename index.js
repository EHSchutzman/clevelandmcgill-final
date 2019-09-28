const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var admin = require('firebase-admin');
var serviceAccount = require("../clevelandmcgill-c116c-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clevelandmcgill-c116c.firebaseio.com"
});
var db = admin.database()

const PORT = process.env.PORT || 5000;
/*
Sending data to the database:
use the db object to set a reference.
var ref = db.ref("restricted_access/secret_document"); -- this will be the "branch that data is being sent to"

then call ref.set and pass the json object you want to send to the database.
ref.set({
    "alanisawesome": {
      "date_of_birth": "June 23, 1912",
      "full_name": "Alan Turing"
    },
    "gracehop": {
      "date_of_birth": "December 9, 1906",
      "full_name": "Grace Hopper"
    }
    });

This will set data to be  "restricted_access/secret_document/alanisawesome" to have a "date_of_birth" and "full_name" fields
and "restricted_access/secret_document/gracehop" to have a "date_of_birth" and "full_name" fields
*/

/*
Retrieving Data from the database:
    set a reference to the databse location you want to pull data from:
    var ref = db.ref("server/saving-data/fireblog/posts")

    You can then call ref.on() on the reference to retrieve data.

    ref.on("value", function(snapshot) {
        console.log(snapshot.val());
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });


*/

/*
    All documentation for the use of the firebase admin api is located at:

    https://firebase.google.com/docs/database/admin/start
    
*/

if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname + '/index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
  });

}

  // Answer API requests
