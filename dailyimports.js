function updateDaily(db){

    // 1 Get missing last datetimes per lake per day from db
    const sql = `select LPAD(w.siteid::text, 8, '0') as siteid
                    , max(DATE(w.date)) + 1 as lastmaxdateentry
                    , DATE(current_timestamp) as currentdatetime
                from waterheight w
                group by w.siteid, current_timestamp
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

        let sitesArray = []
        let recentDataOfSites = []

        const https = require("https");

        const url = siteUrls[i]

        https.get(url, res => {

            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });

            res.on("end", () => {

                body = JSON.parse(body);
                let dataObject = body.value.timeSeries[0].values[0].value

                let siteName = body.value.timeSeries[0].sourceInfo.siteName
                let siteId = body.value.timeSeries[0].sourceInfo.siteCode[0].value

                dataObject.forEach(function(each){
                    let height = each.value
                    let dateTime = each.dateTime
                    let dataOfHoustonLake = {height:height, dateTime:dateTime}
                    sitesArray.push(dataOfHoustonLake)



                })


                let dataOfDay1 = sitesArray.slice(49,50)
                let dataOfDay2 = sitesArray.slice(109,110)

                recentDataOfSites.push(dataOfDay2)
                recentDataOfSites.push(dataOfDay1)

                recentDataOfSites.forEach(function(each){
                    let waterHeight = each[0].height
                    let recordedDate = each[0].dateTime.replace('T',' ')

                db.none('INSERT INTO waterheight (siteid,sitename,height,date) VALUES ($1,$2,$3,$4)',[siteId,siteName,waterHeight,recordedDate])
                    .then(function(){
                        console.log('Inserts complete')
                    })
                    .catch(function(error){
                        console.log(error)
                    })

                })
            })
        })


    }
}

module.exports = updateDaily;
