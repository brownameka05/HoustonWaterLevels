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
const connectionString = "postgres://localhost:5432/hw"
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
const url = "https://waterservices.usgs.gov/nwis/iv/?site=08072300,08072000&format=json&parameterCd=00065&period=PT26H";

app.get('/',(req,res) => res.render('index'))

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
      let dataObject = body.value.timeSeries[0].values[0].value
      let siteName = "Houston Lake"
      let siteId = 0807200
      lakeHouston = []
      dataObject.forEach(function(each){
        let height = each.value
        let dateTime = each.dateTime
        let dataOfHoustonLake = {height:height, dateTime:dateTime}
        lakeHouston.push(dataOfHoustonLake)

      })

        let recentDataOfLakeHouston = lakeHouston.slice((lakeHouston.length-96), lakeHouston.length)
        console.log(recentDataOfLakeHouston)

        response.send(JSON.stringify(recentDataOfLakeHouston))
        
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




