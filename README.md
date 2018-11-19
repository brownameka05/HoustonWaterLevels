# HoustonWaterLevels
## Flood Gauge Reports for Houston area

## Live link: http://houston-water-levels.herokuapp.com

This website is a Node.js project using Express.js and PostgreSQL to show recent data about the flood gauge levels for 
Lake Houston and Buffalo Bayou, bodies of water that created some of the largest flooding problems during Hurriane Harvey.
## The API
We pulled data from the USGS water data resource API at https://waterservices.usgs.gov/rest/IV-Test-Tool.html.  
When a user pulls up this website, a graph displays the most recent data from this API in a line graph drawn with a canvas 
element using JavaScript.  This is displayed in a 24 hour time frame, and the most recent flood gauge reading is shown.

## Our Database
The data from USGS is given in generally consistent intervals of 15 minutes.  To show data for the past week, month, or year 
in the graph of the webpage, we boiled this data down into our own PostgreSQL database to have only one data point per day.
The trends seen are not significantly affected, since water levels may rise quickly during the day, but will not lower quickly, 
meaning a quick rise will always show at least on the following day, and still show the same trend of data.

So in the time frames of week, month, and year, the data comes from our Postgres database instead of the API call.  
The server checks if the data is up to date, and will fill in any number of missing dates missing from the record 
if it finds one or more dates are not present in the database.

## The Graph
The graph displays either Lake Houston or Buffalo Bayou's water levels relative to the gauge.  The y-axis marks the height in feet,
and the x-axis marks the time up to present. The point of Hurricane Harvey's max gauge level is displayed for each body of water, 
which was used to decide the upper-range of y values and give the user a point of reference.  The flood gauges for each body of
water are set at different heights, so the y values are judged relative to the normal heights seen for each body.
