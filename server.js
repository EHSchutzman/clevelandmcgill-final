const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var admin = require('firebase-admin');
var fs = require('fs')
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "clevelandmcgill-c116c",
    "private_key_id": "ee4064c178736f35b55500e65668c597a7bf0f5d",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDJCoDCSlQZCkFq\nVWUrB8JyBg0++VNJhaCvFmIv7v1NMB86wPxYABLX7y3ByZUZQPI7XPCKViISSdPy\n9r6/MVY+OriMCv2ZU4e9UxZp5K7k9hu0m4YnE98w7nLHd5DSdiheYJoWL+fkTUDr\n5OVig66tT0SipfhMJrRLIGNpbxr+N+ID2MdmfcXIx1xxAVwqlo2ad/DjhgFhRCSr\nfVCgy29NQszeoSAbM/uZqPw6zEskAlwTQOKtL/RS+6E7otTUhgZHvvjyZSwpClFY\nePHDIZKmGX6mE/2+6+L6CukRCeaqYV2dFTJqJ+XeLFDqntCVosQkbjXZso63j79/\n0FdWLtBbAgMBAAECggEAKrjvqdovyu5x/k3NZPqOKLr+f55uQ5aBEhQYo4UPESMj\nz9GJDo5dcsPiHmdfJvG1SEY028D4FpjX0K781BaA9FJ4O1Jul/G3S9VnUvOE8yUV\nuCjAtnczm+tgOuE+xmrTo1K2C/b8OXjtTfPjhy7ipPPOax4ICO7Eq55jYdl5jAIl\nND0lLZZzzxXSY59RI0BtV0t/aSfaM8oDu560ZZ3/i4zg/ZLS1lPjeDJfOkAiZfZ7\ngQl5dlPwyR2TmFdrW7xaTXAeikz430VsPOZeagh+W5Z//Eo/C0AogLOMhEfVSN/t\nREO4r+Ed6t4CpyCdlnmAjcaHW7WahsRbxXp/Gw39MQKBgQD71MrNXficQVkgb+RF\nzVo5YO45oKi6lNawOjDW7nAQGTXaGp2UPPUMhlwR4Xmj5IOJDFp11Tvmbm5d+Fwb\neMIbDQ3AeK/3AZhQR/zFyLhH7fc54Pf53IKUiXDaO4EfM5OEUx644AtgXsJIr0bX\nkw3vUf2PQ1tOOV1cjp09dSQMKQKBgQDMXnj8ib/UMSLOXlmtadXEcwUilEDJqdkN\nCN1zT/i3Dp4wgENJO3IFHQJCllyDJRVS70e6XLv9CS36YaRwU17IZmoML7/Y7efW\nx+dLM3gnxkDmcIzMXOu1sRCiJacwtDHS0KnAQr1KU+gHN+IKtbn2KTx7PTpL8BdR\npewVFvjI4wKBgQDeaJiTt6KRncUxOKDKZQqCEnFSw+lAn6LcEQiBSiP+k8VT0p3J\nBe0GGsPFpvTfIjppF1ftKV21rWIb6/Ss7oG/kk/K5MvDwszaWjmMFDFslWX64A0h\nxvYsaRYaJuNqwwpNm3tOm9BwVEASIXrXeTCdZDQkCsDg3RjvXaTRWltzwQKBgQCE\n3vNINYL7wYqAo8UoQwQRujpfdgX9VylgGSBpZVguJBnjLLESfsyt2GNsyXeSaFzJ\n0/pNhxdN91bmT+9qfDnGjxdpnu3bayntcYDGWstHCNWPPSO9hrhVI67NzS87Mhym\nlLWY44tQNOdJMiMLlYU3Ly48bd1mG839bqPkPlA3wwKBgQCtYAkyNjQpAbGPoF+S\n7Ipkuas4bDSNjNc1AMLH4RCD1j5Tc+HiJo79qRcC3V6XAdLfjeY6lra6Tn8zFxaV\nVdjf3XDjL6yeQXk9u5PPqVqEiOfb77/3Jj6UZt1N0tDZiFQ8g4x1IIJTXVvt7YvI\n85Uxx58l0lZq6VK3S8SgXqgJFg==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-4f9wy@clevelandmcgill-c116c.iam.gserviceaccount.com",
    "client_id": "101166259211186558582",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4f9wy%40clevelandmcgill-c116c.iam.gserviceaccount.com"
  }),
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
  app.use(express.static('public'))
  app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname + '/index.html'));

  });

  app.get('/getImageNames', function(req, res){
    fs.readdir("public/img", function(err, items) {
      res.send(JSON.stringify(items));

    });

  })

  app.post("/sendAnswer", function(req, res){
    getReq(req).then(body =>{
      //send info to /trials/sessionid/trial
      var str = "Trial/" + body.image_name.toString() + "/"  + body.session_id.toString()
      var ref = db.ref(str)
      ref.set(body)
      res.sendStatus(200)
    })

  })
  app.post("/sendSessionInfo", function(req, res){
    getReq(req).then(body =>{
      //send info to /Sessions/sessionid
      var str = "Session/" + body.session_id.toString()
      var ref = db.ref(str)
      ref.set(body)
      res.sendStatus(200)
    })

  })



  app.listen(PORT, function () {
    console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
  });

}
async function getReq(req) {
  let body = []
  return new Promise(function(resolve, reject) {
    req.on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      resolve(JSON.parse(body))
    })
  })
}

  // Answer API requests

/** FORM SUBMISSION AND STORAGE TO FIREBASE DATABASE **/
/*
var ref = db.ref("Session");

$('#personal').submit(function(event) {
  var formId = uuidv4();
  var nameToSend = $('#name').val();
  var ageToSend = $('#age').val();
  var genderToSend = $("input[name='gender']:checked").val();
  var countryToSend = $('#country').val();
  var animalToSend = $("input[name='animal']:checked").val();

  var formData = {
    formId: {
      "name": nameToSend,
      "age": ageToSend,
      "gender": genderToSend,
      "country": countryToSend,
      "animal": animalToSend
    }
  }

  ref.set(formData);
});

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
*/
