let refArray = [];
function renderScatterplot(arr, prop1, prop2){
    refArray = [];
    var paras = document.getElementsByClassName('plot');

    while(paras[0]) {
        paras[0].parentNode.removeChild(paras[0]);
    }

    paras = document.getElementsByClassName('scatterGrid');
    while(paras[0]) {
        paras[0].parentNode.removeChild(paras[0]);
    }

    const array = [];
    arr.forEach(item => {
        if(item.distance < 30000 && item.pace > 2.82){
            array.push({...item});
        }
        
    })
    array.forEach(item => {
        item.distance /= 1609
        item.elevation *= 3.28;
        item.pace = 1609 / item.pace;
        item.cadence = 2 * item.cadence
        item.startDate = Date.parse(item.startDate) / 1000
        refArray.push({...item})
    })

    //console.log("running!")
    let minX = 9223372036854775807
    let minY = 9223372036854775807
    let maxX = -1
    let maxY = -1
    const fixedArray = [];
    const regressionArray = [];
    array.forEach(item => {
        if(item[prop1] != null && item[prop2] != null && item[prop1] != NaN && item[prop2] != NaN) {
            fixedArray.push({x: item[prop1], y: item[prop2]})
            regressionArray.push([item[prop1], item[prop2]])
            if(item[prop1] < minX){
                minX = item[prop1]
            }
            if(item[prop1] > maxX){
                maxX = item[prop1]
            }
            if(item[prop2] < minY){
                minY= item[prop2]
            }
            if(item[prop2] > maxY){
                maxY = item[prop2]
            }
        }
        
    })
    for(var i = 0; i < fixedArray.length; i++){
        var plot = document.createElement('p');
        plot.className = 'plot';
        plot.style.left = ((fixedArray[i].x - minX) / (maxX - minX))*100 + '%';
        plot.style.bottom = ((fixedArray[i].y - minY) / (maxY- minY))*100 -3 + '%';
        plot.id = i;
        plot.addEventListener('onmouseenter', show)
        document.getElementById('scatterPlot').appendChild(plot)
    }

    const verticalIncrement = 8;
    const horizontalIncrement = 6;

    for(let i = 0; i < verticalIncrement; i++){
        for(let j = 0; j < horizontalIncrement; j++){
            let grid = document.createElement('div');
            grid.className = 'scatterGrid';
            const txt = getComputedStyle(document.getElementById('scatterPlot')).height
            const height = parseFloat(txt.substring(0, txt.length - 2))
            grid.style.height = (height / verticalIncrement) + "px"
            grid.style.width = 100 / horizontalIncrement + '%'
            grid.style.top = i * (height / verticalIncrement) + "px"
            grid.style.left = j * ( 100 / horizontalIncrement) + '%'

            if( j == 0) {
                // add the vertical signs
                let yDisplay = document.createElement('p');
                yDisplay.className = 'yScatterDisplay';
                if(prop2 == 'pace' || prop2 == 'elapsedTime' || prop2 == 'time'){
                    
                    yDisplay.innerHTML = convert(maxY - i*(((maxY - minY) / verticalIncrement))).split('.')[0]
                }else{
                    yDisplay.innerHTML = (maxY - i*(((maxY - minY) / verticalIncrement))).toFixed(1)
                }
                
                grid.append(yDisplay)
            }

            if( i == verticalIncrement - 1) {
                // add the vertical signs
                let xDisplay = document.createElement('p');
                xDisplay.className = 'xScatterDisplay';
                if(prop1 == 'pace' || prop1 == 'elapsedTime' || prop1 == 'time'){
                    xDisplay.innerHTML = convert(minX + (j+1)*(((maxX - minX) / horizontalIncrement))).split('.')[0]
                }else{
                   xDisplay.innerHTML = (minX + (j+1)*(((maxX - minX) / horizontalIncrement))).toFixed(1)
                }
                
                grid.append(xDisplay)
            }
            document.getElementById('scatterPlot').appendChild(grid)
        }
    }
}

function updateScatterDrawings() {
    renderScatterplot(allActivities, document.getElementsByName('variable1')[0].value, document.getElementsByName('variable2')[0].value)
}

function show(){
    console.log(JSON.stringify(refArray[this.id]))
}
