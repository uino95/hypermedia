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

// get json files that contains data to populate db
let doctorsList = require("./other/doctorsdata.json");
let locationsList = require("./other/locationsdata.json");
let servicesList = require("./other/servicesdata.json");
let servicesLocationsList = require("./other/serviceslocationsdata.json");

const sqlDb = sqlDbFactory({
  client: "sqlite3",
  debug: true,
  connection: {
    filename: "./other/clinicdb.sqlite"
  }
});


function initDoctorsTable() {
  return sqlDb.schema.hasTable("doctors").then(exists => {
    if (!exists) {
      sqlDb.schema
        .createTable("doctors", table => {
          // create the table
          table.increments("id").primary();
          table.string("name");
          table.string("surname");
          table.integer("locationId");
          table.string("basicInfo");
          table.integer("serviceId");
          table.boolean("isResponsible");
        })
        .then(() => {
          return Promise.all(
            _.map(doctorsList, p => {
              // insert the row
              return sqlDb("doctors").insert(p);
            })
          );
        });
    } else {
      return true;
    }
  });
}

function initLocationsTable() {
  return sqlDb.schema.hasTable("locations").then(exists => {
    if (!exists) {
      sqlDb.schema
        .createTable("locations", table => {
          // create the table
          table.increments("id").primary();
          table.string("name");
          table.string("basicInfo");
          table.string("contacts");
        })
        .then(() => {
          return Promise.all(
            _.map(locationsList, p => {
              // insert the row
              return sqlDb("locations").insert(p);
            })
          );
        });
    } else {
      return true;
    }
  });
}

function initServicesTable() {
  return sqlDb.schema.hasTable("services").then(exists => {
    if (!exists) {
      sqlDb.schema
        .createTable("services", table => {
          // create the table
          table.increments("id").primary();
          table.string("name");
          table.string("description");
          table.string("treatment");
        })
        .then(() => {
          return Promise.all(
            _.map(servicesList, p => {
              // insert the row
              return sqlDb("services").insert(p);
            })
          );
        });
    } else {
      return true;
    }
  });
}

function initServicesLocationsTable() {
  return sqlDb.schema.hasTable("servicesLocations").then(exists => {
    if (!exists) {
      sqlDb.schema
        .createTable("servicesLocations", table => {
          // create the table
          table.integer("serviceId");
          table.integer("locationId");
          table.primary(["serviceId", "locationId"]);
          // set both as foreign key
          table.foreign("serviceId").references("services.id");
          table.foreign("locationId").references("locations.id");
        })
        .then(() => {
          return Promise.all(
            _.map(servicesLocationsList, p => {
              // insert the row
              return sqlDb("servicesLocations").insert(p);
            })
          );
        });
    } else {
      return true;
    }
  });
}


function initDb() {
	// for each table required, check if already existing
	// if not, create and populate
	initDoctorsTable();
	initLocationsTable();
	initServicesTable();
	initServicesLocationsTable();

	return true; 
}

/////////////////////////////////////////////
////////////////// APP.USE //////////////////
/////////////////////////////////////////////

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/////////////////////////////////////////////
////////////////// APP.GET //////////////////
/////////////////////////////////////////////

// Name of the tables are:
// doctors
// locations
// services
// servicesLocations

// Register REST entry points


app.get("/doctors", function(req, res) {
  let myQuery = sqlDb("doctors")
    .then(result => {
    res.send(JSON.stringify(result));
  })
})

app.get("/doctors/:id", function(req, res) {
	let myQuery = sqlDb("doctors");
	myQuery.where("id",req.params.id)
    .then(result => {
		res.send(JSON.stringify(result));
	})
})

app.get("/services/:id", function(req, res) {
	let myQuery = sqlDb("services");
	myQuery.where("id",req.params.id)
    .then(result => {
		res.send(JSON.stringify(result));
	})
})

app.get("/locations/:id", function(req, res) {
  let myQuery = sqlDb("locations");
  myQuery.where("id",req.params.id)
    .then(result => {
    res.send(JSON.stringify(result));
  })
})


// retrieve doctors working in the service with the id passed as parameter
app.get("/doctorsbyservice/:id", function(req,res) {
  let myQuery = sqlDb("doctors");
	myQuery.select().where("serviceId", req.params.id)
    .then(result => {
    res.send(JSON.stringify(result));
  })
})

// get ids of the locations in which serviceId is present
app.get("/locationsbyservice/:id", function(req, res) {
  let myQuery = sqlDb("servicesLocations");
  myQuery.select("locationId").where("serviceId",req.params.id)
    .then(result => {
		res.send(JSON.stringify(result));
	})
})


// get ids of the services located in a location
app.get("/servicesbylocation/:id", function(req, res) {
  let myQuery = sqlDb("servicesLocations");
  myQuery.select("serviceId").where("locationId",req.params.id)
    .then(result => {
    res.send(JSON.stringify(result));
  })
})

/////////////////////////////////////////////
/////////////////// INIT ////////////////////
/////////////////////////////////////////////

let serverPort = process.env.PORT || 5000;
  
app.set("port", serverPort);

initDb();

/* Start the server on port 3000 */
app.listen(serverPort, function() {
  console.log(`Your app is ready at port ${serverPort}`);
});
