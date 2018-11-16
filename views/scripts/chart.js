let dataMin = 80 // can change to different value for reference
let dataMax = 130 // also can be changed to higher
let dataRange = dataMax - dataMin

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext( "2d" )

const water = document.getElementById('water')
const radios = Array.from(document.querySelectorAll('.range-radio'))

const waterBodySelector = document.getElementById('water-body-selector')
const waterInputs = Array.from(document.querySelectorAll('.water-radio'))

const loading = document.getElementById('Loading')

const currentLevel = document.getElementById('current-level')

let dailyData96Houston
let dailyData96Buffalo
let pastYearHouston
let pastYearBuffalo
let chartReady = false
window.onload = () => {
    fetch('/recentData',{
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        dailyData96Houston = data.houston
        dailyData96Buffalo = data.buffalo
        chartReady = true
        fetch('/pastYear',{
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            pastYearHouston = data.houston
            pastYearBuffalo = data.buffalo
            currentLevel.innerHTML = 'Current level: ' + dailyData96Houston[0].height + ' ft'
            drawChart()
            loading.innerHTML = ''
            water.style.display = 'unset'
        })
    })

}
const waterBodyTitle = document.getElementById('water-body')
let waterBody = 'Lake Houston'

function changeWater(){
    waterInputs.forEach(waterInput => {
        if(waterInput.checked){
            waterBody = waterInput.value
            drawChart()
        }
    })
}

const miliSecRegex = new RegExp(/:[\d][\d] /)

const yMarkers = Array.from(document.querySelectorAll('.y-marker'))

function drawChart() {

    if(!chartReady){
        return
    }

    const xLabel = document.getElementById('x-label')
    const xMarkers = Array.from(document.querySelectorAll('.x-marker'))

    waterBodyTitle.innerHTML = waterBody.toLocaleUpperCase()

    let dataMin
    let dataMax
    if(waterBody == 'Lake Houston'){
        dataMin = 30
        dataMax = 55
        currentLevel.innerHTML = 'Current level: ' + dailyData96Houston[0].height + ' ft'
    }
    else{
        dataMin = 80
        dataMax = 130
        currentLevel.innerHTML = 'Current level: ' + dailyData96Buffalo[0].height + ' ft'
    }
    let dataRange = dataMax - dataMin

    let range
    radios.forEach(radio => {
        if(radio.checked)
        {
            range = parseInt(radio.value)
        }
    })

    let dataArr = []
    for(let n = 0;n < range;n++)
    {
        dataArr.push(Math.random() * 40 + 85)
    }

    const today = new Date()

    const deskBool = window.innerWidth >= 1040
    const multiplier = deskBool ? 0.5 : 0.7
    
    let yLabelDivider
    switch(range){
        case 96:
            dataArr = (waterBody == 'Lake Houston' 
                      ?
                      dailyData96Houston
                      :
                      dailyData96Buffalo
                      ).map(obj => parseFloat(obj.height))
            yLabelDivider = Math.round(dataArr.length / 4)
            xMarkers.forEach((marker,index) => {
                const markerDate = new Date(today - (21600000 * (5 - 1 - index)))
                if(index >= 5){
                    marker.children[0].innerHTML = ''
                    marker.children[1].innerHTML = ''
                    marker.style.display = 'none'
                }
                else{
                    marker.children[0].innerHTML = markerDate.toLocaleTimeString().replace(miliSecRegex,'')
                    marker.children[1].innerHTML = markerDate.toDateString().slice(0,10)
                }
            })
            break
        case 7:
            dataArr = (waterBody == 'Lake Houston' 
                      ?
                      pastYearHouston.slice(0,7)
                      :
                      pastYearBuffalo.slice(0,7)
                      ).map(obj => parseFloat(obj.height))
            yLabelDivider = Math.round(dataArr.length / 7)
            xMarkers.forEach((marker,index) => {
                const markerDate = new Date(today - (86400000 * (7 - 1 - index)))
                if(index >= 7){
                    marker.children[0].innerHTML = ''
                    marker.children[1].innerHTML = ''
                    marker.style.display = 'none'
                }
                else{
                    marker.style.display = 'flex'
                    marker.children[0].innerHTML = markerDate.toDateString().slice(4,10)
                    marker.children[1].innerHTML = ''
                }
            })
            break
        case 31:
            dataArr = (waterBody == 'Lake Houston' 
                      ?
                      pastYearHouston.slice(0,29)
                      :
                      pastYearBuffalo.slice(0,29)
                      ).map(obj => parseFloat(obj.height))
            yLabelDivider = Math.round(dataArr.length / 4)
            xMarkers.forEach((marker,index) => {
                const markerDate = new Date(today - (604800000 * (5 - 1 - index)))
                if(index >= 5){
                    marker.children[0].innerHTML = ''
                    marker.children[1].innerHTML = ''
                    marker.style.display = 'none'
                }
                else{
                    marker.style.display = 'flex'
                    marker.children[0].innerHTML = markerDate.toDateString().slice(4,10)
                    marker.children[1].innerHTML = ''
                }
            })
            break
        case 365:
            dataArr = (waterBody == 'Lake Houston' 
                      ?
                      pastYearHouston
                      :
                      pastYearBuffalo
                      ).map(obj => parseFloat(obj.height))
            yLabelDivider = Math.round(dataArr.length / 13)
            xMarkers.forEach((marker,index) => {
                const markerDate = new Date(today - (2678400000 * (12 - 1 - index)))
                if(index >= 12)
                {
                    marker.children[0].innerHTML = ''
                    marker.children[1].innerHTML = ''
                    marker.style.display = 'none'
                }
                else
                {
                    marker.style.display = 'flex'
                    marker.children[0].innerHTML = markerDate.toDateString().slice(4,7)
                    marker.children[1].innerHTML = markerDate.toDateString().slice(10,15)
                }
            })
            xLabel.style.width = parseInt(xLabel.style.width.slice(0,1)) * 0.8 + 'vw'
            break
    }

    const baseWidth = window.innerWidth * multiplier
    canvas.width = baseWidth * 1.1
    canvas.height = baseWidth

    const skyGradient = ctx.createLinearGradient(0,0,baseWidth * 0.5,baseWidth)
    skyGradient.addColorStop(0,"lightgoldenrodyellow");
    skyGradient.addColorStop(0.5,"lightcyan");
    skyGradient.addColorStop(1,"lightcyan");

    // declare graph start and end  
    let GRAPH_TOP = baseWidth * 0.1
    let GRAPH_LEFT = baseWidth * 0.1  
    let GRAPH_RIGHT = baseWidth
    let GRAPH_BOTTOM = baseWidth * 0.9
    let GRAPH_HEIGHT = baseWidth * 0.8
    let GRAPH_WIDTH = GRAPH_RIGHT - GRAPH_LEFT

    // clear canvas (if another graph was previously drawn)  
    ctx.clearRect( 0, 0, 500, 400 );
    ctx.font = "2vw Oswald"; 
    // draw x and y

    //references x

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.strokeStyle = "lightblue";
    ctx.fillStyle = 'black';
    ctx.lineWidth = 5;

    //first value
    const firstValX = GRAPH_LEFT
    const firstValY = ( GRAPH_HEIGHT - (dataArr[0] - dataMin) / dataRange * GRAPH_HEIGHT)  + GRAPH_TOP
    ctx.moveTo(firstValX, firstValY)
    // ctx.fillRect(firstValX - 4,firstValY - 4,8,8)
    // draw values line
    let finalValY
    let finalValX
    let finalValue
    let prevX = GRAPH_LEFT + 2

    for(let i = 0; i < dataArr.length; i++ )
    {
        // const x = GRAPH_RIGHT / (dataArr.length) * i + GRAPH_LEFT + 2
        const x = i == 0 ? prevX : prevX + GRAPH_WIDTH / (dataArr.length - 1)
        const y = ( GRAPH_HEIGHT - (dataArr[ i ] - dataMin) / dataRange * GRAPH_HEIGHT ) + GRAPH_TOP
        // ctx.fillRect(x - 4,y - 4,8,8)
        ctx.lineTo( x, y )
        if(i % yLabelDivider == 0){
            ctx.fillRect(x - 2,GRAPH_BOTTOM - 4,3,8)
        }
        // ctx.fillText( i, x - 3, GRAPH_BOTTOM + baseWidth * 0.05)
        // ctx.fillText( i, GRAPH_RIGHT / dataArr.length * i, GRAPH_BOTTOM + 25)
        prevX = x
        finalValX = x
        finalValY = y
        finalValue = dataArr[i]
    }
    ctx.fillRect(GRAPH_RIGHT,GRAPH_BOTTOM - 4,3,8)
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0)'
    ctx.lineTo(finalValX,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,firstValX)
    ctx.closePath()

    ctx.fillStyle = skyGradient
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = 'lightgray'
    ctx.fillStyle = 'black'
    ctx.lineWidth = 1;
    const refLines = 10 // can change to different number of reference lines
    for(let i=0;i <= refLines;i++)
    {
        ctx.beginPath();
        ctx.moveTo( GRAPH_LEFT, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        ctx.lineTo( finalValX, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        // ctx.fillText( (dataRange / refLines) * (refLines - i) + dataMin, GRAPH_LEFT - 10, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP + 5);
        ctx.stroke();
    }
    ctx.fillStyle = 'blue'
    ctx.fillRect(finalValX - 4,finalValY - 4,8,8)
}

drawChart()

window.addEventListener('resize',drawChart)
radios.forEach(radio => radio.addEventListener('change',drawChart))
waterInputs.forEach(waterInput => waterInput.addEventListener('change',changeWater))