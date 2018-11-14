let dataMin = 80 // can change to different value for reference
let dataMax = 130 // also can be changed to higher
let dataRange = dataMax - dataMin

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext( "2d" )
ctx.font = "16px Arial"; 

const water = document.getElementById('water')
const radios = Array.from(document.querySelectorAll('.range-radio'))

let dailyData96
let chartReady = false
fetch('/recentData',{
    headers: {
        'Accept': 'application/json'
    }
})
 .then(response => response.json())
 .then(data => {
     dailyData96 = data
     chartReady = true
     drawChart()
 })

const waterBodyTitle = document.getElementById('water-body')
let waterBody = 'Lake Houston'

function drawChart() {

    if(!chartReady){
        return
    }

    waterBodyTitle.innerHTML = waterBody

    let dataMin
    let dataMax
    if(waterBody == 'Lake Houston'){
        dataMin = 40
        dataMax = 55
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

    const deskBool = window.innerWidth >= 1040
    const multiplier = deskBool ? 0.5 : 0.6
    switch(range){
        case 96:
            dataArr = dailyData96.map(obj => parseFloat(obj.height))
            water.style.width =  deskBool ? '49.5vw' : '59.5vw'
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
    console.log(dataArr)
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

    // draw x and y
    ctx.beginPath();  
    ctx.moveTo( GRAPH_LEFT, GRAPH_TOP );
    ctx.lineTo( GRAPH_LEFT, GRAPH_BOTTOM );
    // ctx.lineTo( GRAPH_RIGHT, GRAPH_BOTTOM );
    ctx.stroke(); 

    //references x

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.strokeStyle = "whitesmoke";
    ctx.fillStyle = 'whitesmoke';
    ctx.lineWidth = 5;

    //first value
    const firstValX = GRAPH_LEFT
    const firstValY = ( GRAPH_HEIGHT - (dataArr[0] - dataMin) / dataRange * GRAPH_HEIGHT)  + GRAPH_TOP
    ctx.moveTo(firstValX, firstValY)
    // ctx.fillRect(firstValX - 4,firstValY - 4,8,8)

    // draw values line
    let finalValY
    let finalValX
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
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0)'
    ctx.lineTo(finalValX,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,GRAPH_TOP)
    ctx.lineTo(GRAPH_LEFT,firstValX)
    ctx.closePath()

    ctx.fillStyle = 'rgb(9,9,175)'
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = '#BBB'
    ctx.fillStyle = 'whitesmoke'
    ctx.lineWidth = 1;
    const refLines = 10 // can change to different number of reference lines
    for(let i=0;i <= refLines;i++)
    {
        ctx.beginPath();
        ctx.moveTo( GRAPH_LEFT, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        ctx.lineTo( finalValX, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP );
        ctx.fillText( (dataRange / refLines) * (refLines - i) + dataMin, GRAPH_LEFT - 20, ( GRAPH_HEIGHT ) / refLines * i + GRAPH_TOP + 5);
        ctx.stroke();
    }
}

drawChart()

window.addEventListener('resize',drawChart)
radios.forEach(radio => radio.addEventListener('change',drawChart))