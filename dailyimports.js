
function updateDaily(db){

    // 1 Get missing last datetimes per lake per day from db
    const sql = `select LPAD(w.siteid::text, 8, '0') as siteid
                    , w.sitename
                    , max(DATE(w.date)) + 1 as lastmaxdateentry
                    , DATE(current_timestamp) as currentdatetime
                from waterheights w
                group by w.siteid, w.sitename, current_timestamp
                having max(DATE(w.date)) + 1 < DATE(current_timestamp)`

    db.any(sql)
        .then((results) => {

            // 2 Build api url strings per site with start/end dates into array
            if (!results) return console.log('Daily site gage values up to date!');

            let siteUrls = []
            results.forEach( (site) => {

                let startDt = site.lastmaxdateentry.toISOString().split('T')[0]  // 2018-11-13
                let endDt = site.currentdatetime.toISOString().split('T')[0]     // 2018-11-14

                const url = `https://waterservices.usgs.gov/nwis/iv/?site=${site.siteid}&format=json&parameterCd=00065&startDT=${startDt}&endDT=${endDt}`;
                siteUrls.push(url)

            });

            console.log(siteUrls)   // check
           
        })
        .catch((err) => {
            console.log(err);
        });

    // 3 Filter for one per day
    // 4 Insert into database
}

module.exports = updateDaily;


