/////////////////////////////////////////////
////////////////// REQUIRES /////////////////
/////////////////////////////////////////////


const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sqlDbFactory = require("knex");
const _ = require("lodash");


/////////////////////////////////////////////
////////////////// INIT DB //////////////////
/////////////////////////////////////////////


const sqlDb = sqlDbFactory({
  client: "sqlite3",
  debug: true,
  connection: {
    filename: "./other/clinicdb.sqlite"
  }
});

function initDb() {
 // TODO
}


let serverPort = process.env.PORT || 80;

let petsList = require("./other/doctorsdata.json");
let petsList = require("./other/locationsdata.json");
let petsList = require("./other/servicesdata.json");
let petsList = require("./other/serviceslocationsdata.json");

/////////////////////////////////////////////
////////////////// APP.USE //////////////////
/////////////////////////////////////////////

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/////////////////////////////////////////////
////////////////// APP.USE //////////////////
/////////////////////////////////////////////

// Register REST entry points

// app.get("/***", function(req, res) {



/////////////////////////////////////////////
/////////////////// INIT ////////////////////
/////////////////////////////////////////////
  
app.set("port", serverPort);

initDb();

/* Start the server on port 3000 */
app.listen(serverPort, function() {
  console.log(`Your app is ready at port ${serverPort}`);
});
