
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

app.listen(3002,function(req,res){
  console.log("Server has started...")
})
app.get('/',function(req,res){
  res.render('index')
})
//------------------------------------------

let lakeHouston = []
let lakeBuffalo = []
let recentDataOfHoustonLake = []  // DATA OF LAST 10 DAYS
let recentDataOfBuffaloLake = []
// https://waterservices.usgs.gov/nwis/iv/?site=08072300,08072000&format=json&parameterCd=00065&period=PT240H

const https = require("https");
const url = "https://waterservices.usgs.gov/nwis/iv/?site=08072000&format=json&parameterCd=00065&startDT=2018-11-13&endDT=2018-11-14";

https.get(url, res => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", data => {
    body += data;
  });
  var count = 71
  res.on("end", () => {
    body = JSON.parse(body);
    let dataObject = body.value.timeSeries[0].values[0].value
    let siteName = "Houston Lake"
    let siteId = 08072000
    // lakeHouston = []
    dataObject.forEach(function(each){
      let height = each.value
      let dateTime = each.dateTime
      let dataOfHoustonLake = {height:height, dateTime:dateTime}
      // console.log(dataOfHoustonLake)
      lakeHouston.push(dataOfHoustonLake)

    })
        // console.log(lakeHouston)
      let dataOfDay1 = lakeHouston.slice(49,50)
      // console.log(dataOfDay1)
      let dataOfDay2 = lakeHouston.slice(109,110)

      recentDataOfHoustonLake.push(dataOfDay2)
      // console.log(recentDataOfHoustonLake)
      recentDataOfHoustonLake.push(dataOfDay1)

      // console.log(recentDataOfHoustonLake)

      // let recentDataOfHouston = lakeHouston.slice((lakeHouston.length-10), lakeHouston.length)
      // console.log(recentDataOfHouston)

      recentDataOfHoustonLake.forEach(function(each){
        count++
        let waterHeight = each[0].height
        console.log(waterHeight)

        let recordedDate = each[0].dateTime
        console.log(recordedDate)



  })

    // =========================================================

  })   // end of line 58
// })     // https === end of line 51
