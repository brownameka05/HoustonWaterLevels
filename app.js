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
const app = express()
app.use(express.static('views'))

// import the pg-promise library which is used to connect and execute SQL on a postgres database
const pgp = require('pg-promise')()
// connection string which is used to specify the location of the database
const connectionString = "postgres://postgres:@localhost:5432/houstonlakes"
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

const https = require("https");
const url = "https://waterservices.usgs.gov/nwis/iv/?site=08072300,08072000&format=json&parameterCd=00065&period=PT30H";

app.get('/recentData', (req,response)=>{
  https.get(url, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    var count = 31
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

        // recentDataOfHouston.forEach(function(each){
        //   count++
        //   let waterHeight = each.height
        //   let recordedDate = each.dateTime


          // db.none('UPDATE waterheight SET (height,date,sitename,siteid) = ($1,$2,$3,$4) WHERE id=$5',[waterHeight,recordedDate,siteName,siteId,count]).then(function(){

          // })
          // .catch(function(error){
          //   console.log(error)
          // })
         // db.none('INSERT INTO waterheight(height,date,sitename,siteid) //VALUES($1,$2,$3,$4)',[waterHeight,recordedDate,siteName,siteId])
        // .then(function(){
        //
        // })
        // .catch(function(error){
        //   console.log(error)
        // })
      // })

    })
  })


})



updateDaily(db);
