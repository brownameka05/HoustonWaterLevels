const fetch = require('node-fetch');
function updateDaily(db){

    // 1 Get missing last datetimes per lake per day from db
    const sql = `select LPAD(w.siteid::text, 8, '0') as siteid
                    , max(DATE(w.date)) + 1 as lastmaxdateentry
                    , DATE(current_timestamp) as currentdatetime
                from waterheights w
                group by w.siteid, DATE(current_timestamp)
                having max(DATE(w.date)) + 1 < DATE(current_timestamp)`

    db.any(sql)
        .then((results) => {

            // 2 Build api url strings per site with start/end dates into array
            if (!results.length) {
                console.log('Daily site gage values up to date!');
                return
            }
            else {

                let siteUrls = []
                results.forEach( (site) => {

                    let startDt = site.lastmaxdateentry.toISOString().split('T')[0]  // 2018-11-13
                    let endDt = site.currentdatetime.toISOString().split('T')[0]     // 2018-11-14

                    const url = `https://waterservices.usgs.gov/nwis/iv/?site=${site.siteid}&format=json&parameterCd=00065&startDT=${startDt}&endDT=${endDt}`;

                    siteUrls.push(url)
                });

                    console.log(siteUrls)
                // 3 Get one gage value per day per site
                oneDayData(siteUrls, db)
            }
        })
        .catch((err) => {
            console.log(err);
        });
}


// Get one gage value per day per site
function oneDayData(siteUrls, db) {

    // Loop through built url api calls for missing dates
    for (let i=0; i < siteUrls.length; i ++) {

        const url = siteUrls[i]

        // const connectionString = process.env.DB_CONN
        // const db = pgp(config)

        fetch(url)
            .then(result => {
                return result.json();
            })
            .then((data)=> {
                const valueArray = data.value.timeSeries[0].values[0].value;
                let siteName = data.value.timeSeries[0].sourceInfo.siteName
                let siteId = data.value.timeSeries[0].sourceInfo.siteCode[0].value

                // let waterHeight = each[0].height
                // let recordedDate = each[0].dateTime.replace('T',' ')

                let previousDate = ''
                let promises = []
                valueArray.forEach((valueObject,index) => {
                    const height = valueObject.value
                    const dateTimeStr = valueObject.dateTime
                    const dateTimeObj = new Date(Date.parse(dateTimeStr))

                    const dateCompare = dateTimeObj.getFullYear() + dateTimeObj.getMonth() + dateTimeObj.getDate()

                    if(dateCompare != previousDate)
                    {
                        promises.push(db.any('INSERT INTO waterheights (siteid,sitename,height,date) VALUES ($1,$2,$3,$4)',[siteId,siteName,height,dateTimeStr.replace('T',' ')]))
                        // promises.push(db.any('INSERT INTO waterheights (siteid,sitename,height,date) VALUES(08072000, \'Lake Houston\', ' + height + ', \'' + dateTimeStr.replace('T',' ') + '\')'))
                    }

                    previousDate = dateCompare
                })
                Promise.all(promises)
                .then(after => console.log("DONE"))
            })
            .catch(err => console.log(err));
    }
}

module.exports = updateDaily;
