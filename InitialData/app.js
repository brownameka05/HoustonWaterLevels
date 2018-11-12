const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const pgp = require('pg-promise')();
const fetch = require('node-fetch');

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))
app.engine('mustache', mustacheExpress())
app.set("views", "./views")
app.set("view engine", "mustache")

const config = {
    host: 'ec2-75-101-138-165.compute-1.amazonaws.com',
    user: 'imwnitnokrnxdd',
    port: 5432,
    password: 'd943a741a13beb3caa85430a5b2db7feee6a6dc93b00c7469d05bdfa3ffc4253',
    database: 'dstj40cctbr7a',
    ssl: true
}

const connectionString = "postgres://imwnitnokrnxdd:d943a741a13beb3caa85430a5b2db7feee6a6dc93b00c7469d05bdfa3ffc4253@ec2-75-101-138-165.compute-1.amazonaws.com:5432/dstj40cctbr7a"
const db = pgp(config)

fetch('https://nwis.waterservices.usgs.gov/nwis/iv/?site=08072000&format=json&parameterCd=00065&startDT=2008-10-01T00:00')
    .then(result => {
        return result.json();
    })
    .then((data)=> {
        const valueArray = data.value.timeSeries[0].values[0].value;
        let previousDate = ''
        let promises = []
        valueArray.forEach((valueObject,index) => {
            const height = valueObject.value
            const dateTimeStr = valueObject.dateTime
            const dateTimeObj = new Date(Date.parse(dateTimeStr))
            
            const dateCompare = dateTimeObj.getFullYear() + dateTimeObj.getMonth() + dateTimeObj.getDate()
            
            if(dateCompare != previousDate)
            {
                promises.push(db.any('INSERT INTO waterheights (siteid,sitename,height,date) VALUES(08072000, \'Lake Houston\', ' + height + ', \'' + dateTimeStr.replace('T',' ') + '\')'))
            }

            previousDate = dateCompare
        })
        Promise.all(promises)
          .then(after => console.log("DONE"))
    })
    .catch(err => console.log(err));





// fetch('https://api.github.com/users/github')
//     .then(res => res.json())
//     .then(json => console.log(json));
    


app.listen(3000, ()=> {
    console.log('Server started');
});


