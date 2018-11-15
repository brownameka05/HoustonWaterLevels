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

let dailyData96Houston
let dailyData96Buffalo
let chartReady = false
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
     drawChart()
 })

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

function drawChart() {

    if(!chartReady){
        return
    }

    const xLabel = document.getElementById('x-label')
    const xMarkers = Array.from(document.querySelectorAll('.x-marker'))

    loading.innerHTML = ''
    water.style.display = 'unset'

    waterBodyTitle.innerHTML = waterBody

    let dataMin
    let dataMax
    if(waterBody == 'Lake Houston'){
        dataMin = 30
        dataMax = 55
    }
    else{
        dataMin = 80
        dataMax = 130
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
    const multiplier = deskBool ? 0.5 : 0.6
    switch(range){
        case 96:
            dataArr = (waterBody == 'Lake Houston' 
                      ?
                      dailyData96Houston
                      :
                      dailyData96Buffalo
                      ).map(obj => parseFloat(obj.height))
            water.style.width =  deskBool ? '49.5vw' : '59.5vw'
            xMarkers.forEach((marker,index) => {
                const markerDate = new Date(today - (21600000 * (xMarkers.length - 1 - index)))
                marker.children[0].innerHTML = markerDate.toDateString().slice(0,10)
                marker.children[1].innerHTML = markerDate.toLocaleTimeString().replace(miliSecRegex,'')
            })
            break
        case 7:
            water.style.width = deskBool ? '42.9vw' : '51.5vw'
            break
        case 31:
            water.style.width = deskBool ? '48.5vw' : '58.5vw'
            break
        case 365:
            water.style.width = deskBool ? '50vw' : '60vw'
            break
    }

    const baseWidth = window.innerWidth * multiplier
    canvas.width = baseWidth * 1.1
    canvas.height = baseWidth

    // declare graph start and end  
    let GRAPH_TOP = baseWidth * 0.1
    let GRAPH_LEFT = baseWidth * 0.1  
    let GRAPH_RIGHT = baseWidth
    let GRAPH_BOTTOM = baseWidth * 0.9
    let GRAPH_HEIGHT = baseWidth * 0.8

    // clear canvas (if another graph was previously drawn)  
    ctx.clearRect( 0, 0, 500, 400 );
    ctx.font = "12px Open Sans"; 
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
        const x = i == 0 ? prevX : prevX + (GRAPH_RIGHT / (dataArr.length))
        const y = ( GRAPH_HEIGHT - (dataArr[ i ] - dataMin) / dataRange * GRAPH_HEIGHT ) + GRAPH_TOP
        // ctx.fillRect(x - 4,y - 4,8,8)
        ctx.lineTo( x, y )
        // ctx.fillText( i, x - 3, GRAPH_BOTTOM + baseWidth * 0.05)
        // ctx.fillText( i, GRAPH_RIGHT / dataArr.length * i, GRAPH_BOTTOM + 25)
        prevX = x
        finalValX = x
        finalValY = y
        finalValue = dataArr[i]
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0)'
    ctx.lineTo(finalValX,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,firstValX)
    ctx.closePath()

    ctx.fillStyle = 'whitesmoke'
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = 'lightgray'
    ctx.fillStyle = 'black'
    ctx.lineWidth = 1;
    ctx.fillText( "Now: " + finalValue, finalValX - 60, finalValY - 10)
    const refLines = 10 // can change to different number of reference lines
    for(let i=0;i <= refLines;i++)
    {
        ctx.beginPath();
        ctx.moveTo( GRAPH_LEFT, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        ctx.lineTo( finalValX, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        ctx.fillText( (dataRange / refLines) * (refLines - i) + dataMin, GRAPH_LEFT - 30, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP + 5);
        ctx.stroke();
    }
    ctx.fillStyle = 'blue'
    ctx.fillRect(finalValX - 4,finalValY - 4,8,8)
}

drawChart()

window.addEventListener('resize',drawChart)
radios.forEach(radio => radio.addEventListener('change',drawChart))
waterInputs.forEach(waterInput => waterInput.addEventListener('change',changeWater))