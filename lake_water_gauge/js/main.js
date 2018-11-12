// const WATER_HEIGHT = "https://waterservices.usgs.gov/nwis/iv/?site=08072300&format=json&parameterCd=00065&period=P7D"
// var height = []
// var dateTime = []
// fetch(WATER_HEIGHT)
//   .then(function(data) {
//     return data.json()})
//   .then(function(dataObject) {
//     for(var key in dataObject){
//       let valueArrays = dataObject.value.timeSeries[0].values[0].value
//       valueArrays.forEach(function(each){
//
//            height.push(each.value)
//            dateTime.push(each.dateTime)
//           console.log(each.value)
//           console.log(each.dateTime)
//
//       })
//     }
//
//   })
