// const express = require('express')
// const app = express()
// const bodyParser = require('body-parser')
// const mustacheExpress = require('mustache-express')
//
//
//
// app.use(bodyParser.urlencoded({extended:false}))
// app.use(express.static('public'))
// app.engine('mustache', mustacheExpress())
// app.set("views", "./views")
// app.set("view engine", "mustache")

const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
app.use(express.static('css'))
app.use(express.static('js'))


// import the pg-promise library which is used to connect and execute SQL on a postgres database
const pgp = require('pg-promise')()
// connection string which is used to specify the location of the database
const connectionString = "postgres://localhost:5432/houstonlakes"
// creating a new database object which will allow us to interact with the database
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({ extended: false }))


app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.listen(3005,function(req,res){
  console.log("Server has started...")
})
app.get('/',function(req,res){
  res.render('index')
})
//------------------------------------------
//  old one =====>>> https://waterservices.usgs.gov/nwis/iv/?site=08072300&format=json&parameterCd=00065&period=P7D

// let dataObject = body.value.timeSeries[0].values[0].value
  let lakeHOUSTON =[]
  let lakeBuffalo = []
const https = require("https");
const url = "https://waterservices.usgs.gov/nwis/iv/?site=08072300,08072000&format=json&parameterCd=00065&period=P1D";
https.get(url, res => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", data => {
    body += data;
  });
  res.on("end", () => {
    body = JSON.parse(body);
    let dataObject = body.value.timeSeries[0].values[0].value
    dataObject.forEach(function(each){
      let height = each.value
      let dateTime = each.dateTime
     let lakeHOUSTON = {height: height, datetime:dateTime}
     // let lakeBUFFALO = {}

      db.none('INSERT INTO waterheight(height,datetime) VALUES($1,$2)',[height,dateTime])
      .then(function(){

      })
      .catch(function(error){
        console.log(error)
      })

    })
  })
})
