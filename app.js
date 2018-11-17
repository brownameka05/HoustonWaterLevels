// const express = require('express')
// const app = express()
// const bodyParser = require('body-parser')
// const mustacheExpress = require('mustache-express')
//
//
// app.use(bodyParser.urlencoded({extended:false}))
// app.use(express.static('public'))
// app.engine('mustache', mustacheExpress())
// app.set("views", "./views")
// app.set("view engine", "mustache")
// ========================================

const updateDaily = require('./dailyimports')
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const dotEnv = require('dotenv').config()
const app = express()
app.use(express.static('views'))

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: true
}

// import the pg-promise library which is used to connect and execute SQL on a postgres database
const pgp = require('pg-promise')()
// connection string which is used to specify the location of the database
const connectionString = process.env.DB_CONN
// creating a new database object which will allow us to interact with the database
const db = pgp(config)

app.use(bodyParser.urlencoded({ extended: false }))


app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.listen(process.env.PORT || 3002,function(req,res){
  console.log("Server has started...")
})
app.get('/',function(req,res){
  res.render('index')
})
//------------------------------------------

let lakeHouston = []
let lakeBuffalo = []

//harvey max houston = 53.12
//harvey max buffalo = 116.76


const https = require("https");
const url = "https://waterservices.usgs.gov/nwis/iv/?site=08072300,08072000&format=json&parameterCd=00065&period=PT30H";

app.get('/recentData', (req,response)=>{
  https.get(url, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    // var count = 31
    res.on("end", () => {
      body = JSON.parse(body);
      const dataObjectHouston = body.value.timeSeries[0].values[0].value
      const dataObjectBuffalo = body.value.timeSeries[1].values[0].value
      let lakeHouston = []
      let buffaloBayou = []
      dataObjectHouston.forEach(function(each){
        const height = each.value
        const dateTime = each.dateTime
        const dataOfHoustonLake = {height:height, dateTime:dateTime}
        lakeHouston.push(dataOfHoustonLake)
      })
      dataObjectBuffalo.forEach(function(each){
        const height = each.value
        const dateTime = each.dateTime
        const dataOfBuffaloBayou = {height:height, dateTime:dateTime}
        buffaloBayou.push(dataOfBuffaloBayou)
      })

        const recentDataOfLakeHouston = lakeHouston.slice(lakeHouston.length >= 96 ? (lakeHouston.length-96) : 0, lakeHouston.length)
        const recentDataOfBuffaloBayou = buffaloBayou.slice(buffaloBayou.length >= 96 ? (buffaloBayou.length-96) : 0, buffaloBayou.length)

        response.send(JSON.stringify({houston:recentDataOfLakeHouston,buffalo:recentDataOfBuffaloBayou}))
    })
  })
})

app.get('/pastYear', (req,res) => {
  db.any('select w.siteid, w.sitename, w.height, w.date from waterheights w where w.date between now() - INTERVAL \'365 DAYS\' and now();')
  .then(rows => {
    let buffaloData = []
    let houstonData = []
    rows.forEach(row => {
      if(row.siteid == 8072000){
        houstonData.push(row)
      }
      else{
        buffaloData.push(row)
      }
    })
    houstonData.sort((a,b)=> a.date > b.date ? -1:1)
    buffaloData.sort((a,b)=> a.date > b.date ? -1:1)
    res.send(JSON.stringify({buffalo: buffaloData,houston:houstonData}))
  })
})


updateDaily(db);
