//all variables + bargraph info is here;

var startDate = Math.floor(Date.parse("01-01-2023") / 1000)
var endDate = Math.floor(Date.now() / 1000);
let scrub;

let defaultClr1 = "#1688b5"
let defaultClr2 = "#6e2aad"
scrub = {
    distance: {unit: "miles", abbrUnit: "mi", roundTo: 1, decimalPlaces: 2, title: "Distance", summable: true},

    pace: {unit: "seconds/mi", abbrUnit: "/mi", roundTo: 5, decimalPlaces: 2, title: "Pace", dividendVar: "time", divisorVar: "distance"},

    maxPace: {unit: "seconds/mi", abbrUnit: "/mi", roundTo: 5, decimalPlaces: 2, title: "Pace", dividendVar: "time", divisorVar: "distance"},

    time: {unit: "", abbrUnit: "", roundTo: 60, decimalPlaces: 0, title: "Moving Time", summable: true},

    elapsedTime: {unit: "", abbrUnit: "", roundTo: 60, decimalPlaces: 0, title: "Elapsed Time", summable: true},

    uptime: {unit: "%", abbrUnit: "%", roundTo: 0.5, title: "Uptime", decimalPlaces: 2, ceiling: 100, dividentVar: "time", divisorVar: "elapsedTime"},

    elevation: {unit: "feet", abbrUnit: "ft", roundTo: 5, decimalPlaces: 2, title: "Elevation", summable: true},

    incline: {unit: "", abbrUnit: "%", roundTo: 0.05, decimalPlaces: 3, title: "Incline", divisorVar: "elevation", dividendVar: "distance"},

    kudos: {unit: "", abbrUnit: "", roundTo: 1, decimalPlaces: 0, title: "Kudos", summable: true},

    cadence: {unit: "steps/min", abbrUnit: "spm", roundTo: 0.25, decimalPlaces: 2, title: "Cadence", divisorVar: "totalSteps", dividendVar: "time"},

    totalSteps: {unit: "steps", abbrUnit: "", roundTo: 1000, decimalPlaces: 0, title: "Steps", summable: true},
    
    stepsPerMile: {unit: "steps/mile", abbrUnit: "", roundTo: 10, decimalPlaces: 0, title: "Steps per Mile", divisorVar: "totalSteps", dividendVar: "distance"},

    strideLength: {unit: "ft", abbrUnit: "ft", roundTo: 0.05, decimalPlaces: 3, title: "Stride Length", divisorVar: "distance", dividendVar: "totalSteps"},
}

const summableUnits = []
const nonSummableUnits = []
const runningTotals = {}
Object.keys(scrub).forEach(key => {
    if (scrub[key].summable) {
        summableUnits.push(key)
        runningTotals[key] = 0
    } else {
        nonSummableUnits.push(key)
    }
})

Object.keys(scrub).forEach(key => {
    scrub[key].color = defaultClr1
    scrub[key].color2 = defaultClr2
    scrub[key].left = null
    scrub[key].right = null
    scrub[key].increment = null
    scrub[key].leftOutlier = true
    scrub[key].rightOutlier = true
    scrub[key].totalBars = null
    scrub[key].edited = false
})

// to establish gradients. Totally didn't copy this from StackOverflow
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// this is the variable that holds all the histogram data.
var curr_distribution = [];

//helper function to convert seconds to m:ss

function convert(seconds, decimalPlaces){
    let numOfDecimals;
    if (!decimalPlaces) {
        numOfDecimals = 0;
    } else {
        numOfDecimals = decimalPlaces;
    }

    if(seconds >= 3600){
        if(seconds % 3600 >= 600) {
            return Math.floor(seconds / 3600) + ":" +convert(seconds % 3600)
        }else{
            return Math.floor(seconds / 3600) + ":0" +convert(seconds % 3600)
        }
        
    }
    if(seconds % 60 >= 10){
        return Math.floor(seconds / 60) + ":" + (seconds % 60).toFixed(numOfDecimals);
    }else{
        return Math.floor(seconds / 60) + ":0" + (seconds % 60).toFixed(numOfDecimals);
    }
}

function updateDefaultStatistics(index, inputObject){
    //update these regardless of index
    // console.log("From updatedefaultstats: " + curr_distribution)
    // console.log("From updatedefaultstats: index is = " + index)
    curr_distribution[index].count++;
    curr_distribution[index].list_of_activities.push(inputObject);

    summableUnits.forEach((unit) => {
        curr_distribution[index][unit + "_breakdown"].total += inputObject[unit]
        runningTotals[unit] += inputObject[unit]

        if(inputObject[unit] > curr_distribution[index][unit + "_breakdown"].high && inputObject[unit] != null){
            curr_distribution[index][unit + "_breakdown"].high = inputObject[unit];
        }
        if(inputObject[unit] < curr_distribution[index][unit + "_breakdown"].low && inputObject[unit] != null){
            curr_distribution[index][unit + "_breakdown"].low = inputObject[unit];
        }
    })

    nonSummableUnits.forEach((unit) => {
        weightUnit = scrub[unit].divisorVar
        if (inputObject[unit] == 0 || inputObject[unit] != null) {
            curr_distribution[index][unit + "_breakdown"].weight += inputObject[weightUnit]
            curr_distribution[index][unit + "_breakdown"].weightedTotal += inputObject[weightUnit] * inputObject[unit] 

            if(inputObject[unit] > curr_distribution[index][unit + "_breakdown"].high){
                curr_distribution[index][unit + "_breakdown"].high = inputObject[unit];
            }

            if(inputObject[unit] < curr_distribution[index][unit + "_breakdown"].low){
                curr_distribution[index][unit + "_breakdown"].low = inputObject[unit];
            }
        } 
    })
}

function showMoreStats(){
    const varToAnalyze = document.getElementsByName("histogramVariable")[0].value
    //process - get index and graph type from the id that was clicked.
    console.log(this.id)
    var processed = this.id.split("-");
    for(let i = 0; i < document.getElementById("curr_distribution").getElementsByClassName("verticalHolder").length; i++){
        document.getElementById("curr_distribution").getElementsByClassName("verticalHolder")[i].style.border = "0px solid black";
        //document.getElementById(processed[1]).getElementsByClassName("verticalHolder")[i].addEventListener("mouseover", () => {this.style.border = "2px solid black"})
        //console.log("removing all borders")
    }
    
    this.style.border = "2px dotted black";
    document.getElementById("curr_distribution_wrapper").style.display = "block";
    let span1 = document.getElementById("curr_distribution_counter").getElementsByTagName("span")[0]
    let span2 = document.getElementById("curr_distribution_counter").getElementsByTagName("span")[1]
    let span3 = document.getElementById("curr_distribution_counter").getElementsByTagName("span")[2]

    span1.innerHTML = `${curr_distribution[processed[0]].count} (${((curr_distribution[processed[0]].count / allActivities.length)*100).toFixed(2)}%)`;
    span1.style.color = processed[2];
    span1.parentElement.style.borderLeft = "5px solid " + processed[2];
    span1.style.fontWeight = "bold";

    span2.innerHTML = document.getElementById("curr_distribution").getElementsByClassName("verticalHolderBelow")[processed[0]].innerHTML;
    span2.style.color = processed[2];
    span2.style.fontWeight = "bold";

    span3.innerHTML = scrub[varToAnalyze].title.toLowerCase()

    showStatsOnHTML(processed[0], processed[2], varToAnalyze)
}

function disableStats(){
    var processed = this.id.split("-");
    document.getElementById(processed[1] + "_info").innerHTML = "Hover over graph to show more details!"
}

function createHistSummaryCell(unit, id, isSummable) {
    // console.log("isSummable is: " + isSummable)
    const numDecimals = scrub[unit].decimalPlaces
    const unitCell = document.createElement("div")
    unitCell.className = "histSummaryCell"
    let computedAvg = null
    const sortedRef = allValuesSorted[unit]
    
    if (isSummable) {
        computedAvg = curr_distribution[id][unit + "_breakdown"].total / curr_distribution[id].count
    } else {
        computedAvg = curr_distribution[id][unit + "_breakdown"].weightedTotal / curr_distribution[id][unit + "_breakdown"].weight
    }

    /*
    let ind = 0;
    while (ind < sortedRef.length && computedAvg >= sortedRef[ind]) {
        ind+=1
    }*/

    
    let computedMedian = null
    const high = curr_distribution[id][unit + "_breakdown"].high
    const low = curr_distribution[id][unit + "_breakdown"].low
    const percentile1 = sortedRef[Math.floor(0.01*sortedRef.length)]
    const percentile99 = sortedRef[Math.floor(0.99*sortedRef.length)]
    const high_location = ((high - percentile1) / (percentile99 - percentile1))*100
    const low_location = ((low - percentile1) / (percentile99 - percentile1))*100
    const avg_location = ((computedAvg - percentile1) / (percentile99 - percentile1))*100

    // compute the median by sorting all activities in order

    const arrayForMedianCalc = []

    curr_distribution[id].list_of_activities.forEach((activity) => {
        if (activity[unit] != null) {
            arrayForMedianCalc.push(activity[unit])
        }
    })

    for (let i = 1; i < arrayForMedianCalc.length; i++) {
    let currentElement = arrayForMedianCalc[i];
    let lastIndex = i - 1;

    while (lastIndex >= 0 && arrayForMedianCalc[lastIndex] > currentElement) {
        arrayForMedianCalc[lastIndex + 1] = arrayForMedianCalc[lastIndex];
        lastIndex--;
    }
        arrayForMedianCalc[lastIndex + 1] = currentElement;
    }

    // console.log(arrayForMedianCalc)

    if (arrayForMedianCalc.length % 2 == 1) {
        computedMedian = arrayForMedianCalc[Math.floor(arrayForMedianCalc.length / 2)]
    } else {
        computedMedian = (arrayForMedianCalc[(arrayForMedianCalc.length / 2) - 1] + arrayForMedianCalc[(arrayForMedianCalc.length / 2)]) / 2
    }

    // create the items

    const barVariableTitle = document.createElement("p")
    barVariableTitle.className = "histSummaryVariableDisplay"
    barVariableTitle.innerHTML = `Avg ${scrub[unit].title}`

    const barVariableValue = document.createElement("p")
    barVariableValue.className = "histSummaryVariableValue"
    if (unit == "time" || unit == "elapsedTime") {
        barVariableValue.innerHTML = `${convert(computedAvg)}`
    } else if (unit == "pace"|| unit == "maxPace") {
        barVariableValue.innerHTML = `${convert(computedAvg, 2)}<span> /mi<span>`
    } else {
        barVariableValue.innerHTML = `${computedAvg.toFixed(numDecimals)}<span> ${scrub[unit].abbrUnit}</span>`
    }
    
    unitCell.appendChild(barVariableTitle)
    unitCell.appendChild(barVariableValue)

    // create the bar

    const underBar = document.createElement('div');
    underBar.className = 'histBarUnder'

    const underBarLeft = document.createElement('p');
    underBarLeft.className = 'histBarLeftValue';
    if (unit == "time" || unit == "elapsedTime") {
        underBarLeft.innerHTML = `${convert(low)}`
    } else if (unit == "pace"|| unit == "maxPace") {
        underBarLeft.innerHTML = `${convert(low, 2)}`
    } else {
        underBarLeft.innerHTML = `${low.toFixed(numDecimals)}`
    }
    underBarLeft.style.left = low_location + "%";
    
    underBar.appendChild(underBarLeft);

    const underBarRight = document.createElement('p');
    underBarRight.className = 'histBarRightValue';
    if (unit == "time" || unit == "elapsedTime") {
        underBarRight.innerHTML = `${convert(high)}`
    } else if (unit == "pace"|| unit == "maxPace") {
        underBarRight.innerHTML = `${convert(high, 2)}`
    } else {
        underBarRight.innerHTML = `${high.toFixed(numDecimals)}`
    }
    underBarRight.style.left = high_location + "%";
    underBar.appendChild(underBarRight);

    /*const underBarMedian = document.createElement('p');
    underBarMedian.className = 'histBarMedianValue';
    underBarMedian.innerHTML = `Median: ${computedMedian.toFixed(numDecimals)}${scrub[unit].abbrUnit}`
    underBarMedian.left = (((computedMedian - low) / (high - low))*100) + "%";
    underBar.appendChild(underBarMedian);*/

    // create spectrum
    const spectrum = document.createElement('div');
    spectrum.className = 'histSummarySpectrum';
    spectrum.style.position = "relative";

    spectrum.style.background = 'linear-gradient(to right, ' + scrub[unit].color + ', ' + scrub[unit].color2 + ')'

    const rangeBar = document.createElement('div');
    rangeBar.className = 'histSummaryRangeBar';
    rangeBar.style.position = 'absolute';
    rangeBar.style.left = low_location + "%";
    rangeBar.style.right = (100 - high_location) + "%";
    spectrum.appendChild(rangeBar)

    const avgBar = document.createElement('div');
    avgBar.className = 'histSummarySpectrumBar';
    avgBar.style.position = 'absolute';
    avgBar.style.left = avg_location + "%";
    spectrum.appendChild(avgBar)

    unitCell.appendChild(spectrum)
    unitCell.appendChild(underBar)

    if (isSummable) {
        const totalComment = document.createElement('p')
        totalComment.className = 'histSummaryTotal';
        
        if (unit == "time" || unit == "elapsedTime") {
            totalComment.innerHTML = `<b>Cum: </b> ${convert(curr_distribution[id][unit + "_breakdown"].total)} (<b>${((curr_distribution[id][unit + "_breakdown"].total / runningTotals[unit])*100).toFixed(2)}</b>% of total ${scrub[unit].title.toLowerCase()})`
        } else {
            totalComment.innerHTML = `<b>Cum: </b> ${(curr_distribution[id][unit + "_breakdown"].total).toFixed(numDecimals)} ${scrub[unit].abbrUnit} (<b>${((curr_distribution[id][unit + "_breakdown"].total / runningTotals[unit])*100).toFixed(2)}</b>% of total ${scrub[unit].title.toLowerCase()})`
        }
        
        unitCell.appendChild(totalComment)
    }
    document.getElementById("curr_distribution_info").appendChild(unitCell)
}

function showStatsOnHTML(id, color, varToHighlight){
    const elementsToRemove = document.querySelectorAll('.histSummaryCell');

    elementsToRemove.forEach(e => e.remove())

    Object.keys(scrub).forEach((un) => {
        createHistSummaryCell(un, id, isSummable=scrub[un].summable)
    })

    console.log(curr_distribution[id])

    //document.getElementById("curr_distribution_total_summary").innerHTML = totalStatString

    // remove all rows from the table
    var chartRows = document.getElementById("curr_distribution_wrapper").getElementsByClassName('outerDiv');

    while(chartRows[0]) {
        chartRows[0].parentNode.removeChild(chartRows[0]);
    }

    if((document.getElementById("curr_distribution_wrapper").getElementsByClassName("headerDiv")[0])){
        document.getElementById("curr_distribution_wrapper").getElementsByClassName("headerDiv")[0].remove()
    }

    // create the table
    for (var i = -1; i < curr_distribution[id].list_of_activities.length; i++){
        var outerDiv = document.createElement("div");

        if(i >= 0){
            outerDiv.className = "outerDiv";
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("infoWrapperRight")[0].appendChild(outerDiv);
        }else {
            outerDiv.className = "headerDiv"
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("infoWrapperRight")[0].appendChild(outerDiv);
        }

        document.getElementById("curr_distribution_wrapper").getElementsByClassName("infoWrapperRight")[0].style.height = window.innerHeight/2 + "px"

        let span;
        span = document.createElement("span");
        span.className = "indivGrid";
        //span.id = "date";
        span.style.width = "10%"
        span.style.textAlign = "left";
        if(i == -1){
            span.innerHTML = "Date"
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("headerDiv")[0].appendChild(span)
        }else{
            let date = curr_distribution[id].list_of_activities[i].startDate.split("T")[0].split("-")
            span.innerHTML = date[1] + "/" + date[2] + "/" +date[0].substring(2, 4)
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("outerDiv")[i].appendChild(span)
        }
        
        span = document.createElement("span");
        span.className = "indivGrid";
        span.style.width = "20%"
        span.style.textAlign = "left";
        span.id = "runLookupLink";
        //span.id = "title";
        if(i == -1){
            span.innerHTML = "Title"
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("headerDiv")[0].appendChild(span)
        }else{
            if(curr_distribution[id].list_of_activities[i].name.length > 50){
                span.innerHTML = curr_distribution[id].list_of_activities[i].name.substring(0, 50) + "...";
            }else{
                span.innerHTML  = curr_distribution[id].list_of_activities[i].name;
            }
            span.style.color = 'darkblue';
            span.style.textDecoration = 'underline';
            span.addEventListener('click', createRunLookup.bind(this, curr_distribution[id].list_of_activities[i].id))
            document.getElementById("curr_distribution_wrapper").getElementsByClassName("outerDiv")[i].appendChild(span)
        }

        let defaultVariables = ["distance", "pace", "time","elapsedTime", "elevation"]

        if (!defaultVariables.includes(varToHighlight)) {
            defaultVariables.unshift(varToHighlight)
        }

        defaultVariables.forEach(item => {
            span = document.createElement("span");
            span.className = "indivGrid";

            span.style.width = (70 / defaultVariables.length) + "%"

            if(i == -1){
                span.innerHTML = scrub[item].title
                document.getElementById("curr_distribution_wrapper").getElementsByClassName("headerDiv")[0].appendChild(span)
            }else{
                if (item == varToHighlight) {
                    span.style.color = color
                    span.style.fontWeight = "bold"
                }
                if (item == "time" || item == "elapsedTime" || item == "pace" || item == "maxPace") {
                    span.innerHTML = convert(curr_distribution[id].list_of_activities[i][item], scrub[item].decimalPlaces)
                } else {
                    span.innerHTML = (curr_distribution[id].list_of_activities[i][item]).toFixed(scrub[item].decimalPlaces) + scrub[item].abbrUnit
                }
                document.getElementById("curr_distribution_wrapper").getElementsByClassName("outerDiv")[i].appendChild(span)
            }
        })
    }
}

var totalMileage =0
var totalElevGain =0
var totalPace=0
var totalMovingTime=0
var totalElapsedTime=0

function establishIncrements(item, scrubProperty){
    // item is one individual object returned from the Strava API.
    // value is object's value in question
    let value = item[scrubProperty]
    if(value >= scrub[scrubProperty].right || value <= scrub[scrubProperty].left){
        //if right outlier is enabled
        if((scrub[scrubProperty].rightOutlier && value >= scrub[scrubProperty].right) || (!scrub[scrubProperty].rightOutlier && value == scrub[scrubProperty].right)){
            console.log("adding stuff to right outlier")
            updateDefaultStatistics(scrub[scrubProperty].totalBars-1, item);
        }      

        // if left outlier is enabled
        if((scrub[scrubProperty].leftOutlier && value <= scrub[scrubProperty].left) || (!scrub[scrubProperty].leftOutlier && value == scrub[scrubProperty].left)){
             console.log("adding stuff to left outlier")
            updateDefaultStatistics(0, item);
        }
    }else if (value < scrub[scrubProperty].right && value > scrub[scrubProperty].left){
        if(scrub[scrubProperty].leftOutlier){
            updateDefaultStatistics(Math.floor((value - scrub[scrubProperty].left) / scrub[scrubProperty].increment) + 1, item);
        }else{
            if(value != scrub[scrubProperty].right && value != scrub[scrubProperty].right){
                updateDefaultStatistics(Math.floor((value - scrub[scrubProperty].left) / scrub[scrubProperty].increment), item);
            }
        }
    }
}

function renderGraph(){
    curr_distribution = []
    Object.keys(runningTotals).forEach((k) => {runningTotals[k] = 0})
    totalMileage=0;
    totalElevGain=0;
    totalPace=0;
    totalMovingTime=0;
    totalElapsedTime=0;
   
    const elementsToRemove = document.querySelectorAll('.verticalOuterContainer');

    elementsToRemove.forEach(e => e.remove())

    renderTypeGraph(document.getElementsByName("histogramVariable")[0].value)
}

//helper method

function getBarTitles(i, scrubName, unit){
    //i is the index
    if(i == 0 && scrub[scrubName].leftOutlier){
        if(scrubName == "pace" || scrubName == "maxPace"){
            return "<" + convert(scrub[scrubName].left) + unit;
        } else if (scrubName == "time" || scrubName == "elapsedTime") {
            return "<" + convert(scrub[scrubName].left, 0) + unit;
        } else {
            return "<" + (scrub[scrubName].left) + unit;
        }
        
    }else if (i == scrub[scrubName].totalBars - 1 && scrub[scrubName].rightOutlier){
        if(scrubName == "pace" || scrubName == "maxPace"){
            return  ">" + convert(scrub[scrubName].right) + unit;
        } else if (scrubName == "time" || scrubName == "elapsedTime") {
            return  ">" + convert(scrub[scrubName].right, 0) + unit;
        } else {
            return  ">" + (scrub[scrubName].right) + unit;
        }
        
    }else{
        let valLeft = scrub[scrubName].left + ((i-Number(scrub[scrubName].leftOutlier))*scrub[scrubName].increment) 
        let valRight = scrub[scrubName].left + ((i+1-Number(scrub[scrubName].leftOutlier))*scrub[scrubName].increment)

        if(scrubName == "pace" || scrubName == "maxPace"){
            return (convert(valLeft) + "-" + convert(valRight) + unit);
        } else if (scrubName == "time" || scrubName == "elapsedTime") { 
            return (convert(valLeft, 0) + "-" + convert(valRight, 0) + unit);
        } else {
            return (valLeft + "-" + valRight + unit);
        }
    }
}

var currentField = null;
function showIncrementMenu(){
    field = document.getElementsByName("histogramVariable")[0].value
    currentField = field
    document.getElementById("settingsTitle").innerHTML = "Edit " + field + " increments"
    document.getElementById("settingsTitle").style.color = scrub[field].color
    document.getElementById("settings").style.display = "block";
    document.getElementById("settings").style.border = "4px solid " + scrub[field].color

    document.getElementsByName("leftOutlier")[0].value = scrub[field].left;
    document.getElementsByName("rightOutlier")[0].value = scrub[field].right;
    document.getElementsByName("increment")[0].value = scrub[field].increment;

    document.getElementById("leftOutlier").innerHTML = "Include values less than " + document.getElementsByName("leftOutlier")[0].value + " " + scrub[currentField].unit + "?"

    document.getElementById("rightOutlier").innerHTML = "Include values more than " + document.getElementsByName("rightOutlier")[0].value + " " + scrub[currentField].unit + "?"

    if(scrub[field].leftOutlier){
        document.getElementsByName("leftOutlierCheck")[0].checked = true
    }else{
        document.getElementsByName("leftOutlierCheck")[0].checked = false
    }

    if(scrub[field].rightOutlier){
        document.getElementsByName("rightOutlierCheck")[0].checked = true
    }else{
        document.getElementsByName("rightOutlierCheck")[0].checked = false
    }
    
    document.getElementsByName("distributionColor")[0].value = scrub[field].color;
    document.getElementsByName("distributionColor2")[0].value = scrub[field].color2;
}

document.getElementsByClassName("incrementBtn")[0].addEventListener("click", showIncrementMenu)

function closeSettingsMenu(){
    document.getElementById("settings").style.display = "none";
}

function applySettings(){
    const diff = Math.round((document.getElementsByName("rightOutlier")[0].value - document.getElementsByName("leftOutlier")[0].value) / document.getElementsByName("increment")[0].value)

    document.getElementsByName("rightOutlier")[0].value = parseFloat(document.getElementsByName("leftOutlier")[0].value) + (diff * parseFloat(document.getElementsByName("increment")[0].value))

    let key = currentField;
    scrub[key].left =  parseFloat(document.getElementsByName("leftOutlier")[0].value);
    scrub[key].right =  parseFloat(document.getElementsByName("rightOutlier")[0].value);
    scrub[key].increment = parseFloat(document.getElementsByName("increment")[0].value);

    scrub[key].leftOutlier = document.getElementsByName("leftOutlierCheck")[0].checked;
    scrub[key].rightOutlier = document.getElementsByName("rightOutlierCheck")[0].checked;

    scrub[key].totalBars = Math.round((scrub[key].right - scrub[key].left) / scrub[key].increment) + Number(scrub[key].leftOutlier) + Number(scrub[key].rightOutlier)
    scrub[key].color = document.getElementsByName("distributionColor")[0].value;
    scrub[key].color2 = document.getElementsByName("distributionColor2")[0].value;
    document.getElementById("settings").style.display = "none";

    curr_distribution = []
    renderGraph()
}

function realtimeUpdateLeft(){
    document.getElementById("leftOutlier").innerHTML = "Include values less than " + document.getElementsByName("leftOutlier")[0].value + " " + scrub[currentField].unit + "?"
}

function realtimeUpdateRight(){
    document.getElementById("rightOutlier").innerHTML = "Include values more than " + document.getElementsByName("rightOutlier")[0].value + " " + scrub[currentField].unit + "?"
}

function showPercentiles(){
    const idBreakdown = this.id.split("-");
    const displayInQuestion = document.getElementById("percentileMarkersDisplay-" + idBreakdown[1])
    displayInQuestion.style.display = "block";
    /*if (displayInQuestion.style.display == "block") {
        displayInQuestion.style.display = "none";
    } else {
        displayInQuestion.style.display = "block";
    }*/
}

function hidePercentiles() {
    const idBreakdown = this.id.split("-");
    const displayInQuestion = document.getElementById("percentileMarkersDisplay-" + idBreakdown[1])
    displayInQuestion.style.display = "none";
}

function renderTypeGraph(sortBy){
    totalMileage=0;
    totalElevGain=0;
    totalPace=0;
    totalMovingTime=0;
    totalElapsedTime=0;

    const clr1 = hexToRgb(scrub[sortBy].color)
    const clr2 = hexToRgb(scrub[sortBy].color2)

    const minBarsLandscape = 14
    const maxBarsLandscape = 20
    const minBarsPortrait = 7
    const maxBarsPortrait = 10

    let minBars;
    let maxBars;

    if (window.innerHeight >= window.innerWidth) {
        minBars = minBarsPortrait
        maxBars = maxBarsPortrait
    } else {
        minBars = minBarsLandscape
        maxBars = maxBarsLandscape
    }

    //array is the array that is getting iterated over
    //type is the destination where the graph is getting added
    //color is the bar color
    //sortBy is the property in question

    for (let i = 1; i < allActivities.length; i++) {
        let currentElement = allActivities[i];
        let lastIndex = i - 1;
    
        while (lastIndex >= 0 && allActivities[lastIndex][sortBy] > currentElement[sortBy]) {
            allActivities[lastIndex + 1] = allActivities[lastIndex];
            lastIndex--;
        }
        allActivities[lastIndex + 1] = currentElement;
    }

    if (document.getElementById("curr_distribution_spectrum")) {
        document.getElementById("curr_distribution_spectrum").remove()
    }
    
    /* create the spectrum */
    const percentageSpectrum = document.createElement('div');
    percentageSpectrum.style.background = 'linear-gradient(to right, ' + scrub[sortBy].color + ', ' + scrub[sortBy].color2 + ')'
    percentageSpectrum.className = "percentileSpectrum"
    percentageSpectrum.id = "curr_distribution_spectrum"
    document.getElementById("curr_distribution_breakdown").appendChild(percentageSpectrum);

    /* place visual percentiles */
    const percentilesOfInterest = [5, 25, 50, 75, 95];

    // set the minimum and maximum values
    const len = allActivities.length;
    let percentVal5 = (allActivities[Math.floor(len*(0.05))][sortBy])
    let percentVal95 = (allActivities[Math.floor(len*(0.95))][sortBy])

    // automatically set the maximum and minimum values, if the left and right values are null. If they're not null, don't bother.

    // --> start manual computation for left and right outliers and number of bars.

    if (scrub[sortBy].left === null && scrub[sortBy].right === null && !scrub[sortBy].edited) {
        // the optimal number of bars on PC is anywhere between 14 and 22, plus or minus 2. On mobile, it's 8-12, plus or minus 2.

        let percentVal5Adjusted = Math.floor(percentVal5 / scrub[sortBy].roundTo)*scrub[sortBy].roundTo
        let percentVal95Adjusted = Math.ceil(percentVal95 / scrub[sortBy].roundTo)*scrub[sortBy].roundTo

        let testIncrement;
        let numBars;

        for (let i = 1; i < 20; i++) {
            testIncrement = scrub[sortBy].roundTo*i
            numBars = Math.ceil((percentVal95Adjusted - percentVal5Adjusted) / testIncrement)

            if ((numBars <= maxBars && numBars >= minBars) || numBars < minBars) {
                percentVal95Adjusted = percentVal5Adjusted + (numBars*testIncrement)
                break
            }
        }

        console.log("Lower end is: " + percentVal5Adjusted)
        console.log("Higher end is: " + percentVal95Adjusted)

        scrub[sortBy].left = percentVal5Adjusted
        scrub[sortBy].right = percentVal95Adjusted
        if (percentVal5Adjusted == 0) {
            scrub[sortBy].leftOutlier = false
        }
        if (sortBy == "uptime" && percentVal95Adjusted > 100) {
            scrub[sortBy].right = percentVal95Adjusted - testIncrement
            numBars--;
        }
        scrub[sortBy].increment = testIncrement
        scrub[sortBy].totalBars = numBars + Number(scrub[sortBy].leftOutlier) + Number(scrub[sortBy].rightOutlier)
    }

    // --> end manual computation for left and right outliers and number of bars.

    // --> end computation of mean

    console.log("The total number of bars is: " + scrub[sortBy].totalBars)

    for(var i = 0; i < scrub[sortBy].totalBars; i++){
        curr_distribution[i] = {}
        curr_distribution[i].count = 0
        curr_distribution[i].valueStorageForMedian = []
        curr_distribution[i].list_of_activities = []
        summableUnits.forEach((unit) => {
            curr_distribution[i][unit + "_breakdown"] = {total: 0, high: -1, low: 2147483687}
        })
        nonSummableUnits.forEach((unit) => {
            curr_distribution[i][unit + "_breakdown"] = {weightedTotal: 0, weight: 0, high: -1, low: 2147483687}
        })
    }

    allActivities.forEach(e => {
        if (e[sortBy] != null) {
            establishIncrements(e, sortBy)
        }
    })

    // compute the percentages of each.

    for (var i = 0; i < scrub[sortBy].totalBars; i++) {
        Object.keys(scrub).forEach((unit) => {
            const hi = curr_distribution[i][unit + "_breakdown"].high
            const lo = curr_distribution[i][unit + "_breakdown"].low
            const sortedRef = allValuesSorted[unit]

            let hi_ind = 0;
            let low_ind = 0;
            while (hi_ind < sortedRef.length && hi >= sortedRef[hi_ind]) {
                if (lo > sortedRef[hi_ind]) {
                    low_ind+=1
                } 
                hi_ind+=1
            }

            const hi_percentile = (hi_ind / sortedRef.length)*100
            const low_percentile = (low_ind / sortedRef.length)*100

            curr_distribution[i][unit + "_breakdown"].high_percent = hi_percentile
            curr_distribution[i][unit + "_breakdown"].low_percent = low_percentile
        })
    }

    // create the box and whisker plots

    let minValue = scrub[sortBy].left
    let maxValue = scrub[sortBy].right
    if (scrub[sortBy].leftOutlier) {
        minValue = scrub[sortBy].left - scrub[sortBy].increment;
    }

    if (scrub[sortBy].rightOutlier) {
        maxValue = scrub[sortBy].right + scrub[sortBy].increment;
    }

    for (let i = 0; i < percentilesOfInterest.length; i++) {
        const sortedRef = allValuesSorted[sortBy]
        let calculatedPosition = ((sortedRef[Math.floor(sortedRef.length*(percentilesOfInterest[i]/100))] - minValue) / (maxValue - minValue)) * 100
        if (calculatedPosition < 0) {
            calculatedPosition = 0;
        }
        if (calculatedPosition > 100) {
            calculatedPosition = 100;
        }
        const percentageInfo = document.createElement('div');
        /*percentageInfo.innerHTML = percentilesOfInterest[i] + "%: " + allActivities[Math.floor(len*(percentilesOfInterest[i]/100))][sortBy] */
        percentageInfo.className = "percentileMarkers"
        percentageInfo.style.height = "100%";
        percentageInfo.style.width = "0.35%";
        percentageInfo.style.backgroundColor = "white"
        percentageInfo.style.position = "absolute";
        percentageInfo.style.left = calculatedPosition + "%";
        document.getElementById("curr_distribution_spectrum").appendChild(percentageInfo);

        const percentageHoverHitbox = document.createElement('div');
        percentageHoverHitbox.className = 'percentileMarkersHoverFlex';
        percentageHoverHitbox.id = 'percentileMarkersHover-curr_distribution_' + i;
        percentageHoverHitbox.style.height = (window.innerHeight*0.07)*0.8 + "px";
        percentageHoverHitbox.style.width = (window.innerHeight*0.07)*0.8 + "px";
        percentageHoverHitbox.style.left = calculatedPosition + "%";
        percentageHoverHitbox.addEventListener("mouseover", showPercentiles);
        percentageHoverHitbox.addEventListener("mouseout", hidePercentiles);
        document.getElementById("curr_distribution_spectrum").appendChild(percentageHoverHitbox);

        const percentageHoverHitboxText = document.createElement("p");
        percentageHoverHitboxText.className = 'percentileMarkersHoverText';
        percentageHoverHitboxText.innerHTML = percentilesOfInterest[i] + "%";
        document.getElementById('percentileMarkersHover-curr_distribution_' + i).appendChild(percentageHoverHitboxText);

        const r = (clr1.r + (clr2.r - clr1.r) * (calculatedPosition / 100))
        const g = (clr1.g + (clr2.g - clr1.g) * (calculatedPosition / 100))
        const b = (clr1.b + (clr2.b - clr1.b) * (calculatedPosition / 100))
        const percentileDisplayClr = 'rgb(' + r + ', ' + g + ', ' + b + ')';

        const percentageDisplay = document.createElement('div');
        percentageDisplay.className = 'percentileMarkersDisplay';
        percentageDisplay.id = 'percentileMarkersDisplay-curr_distribution_' + i;
        percentageDisplay.style.color = percentileDisplayClr;
        percentageDisplay.style.border = "2px solid " + percentileDisplayClr;
        let val = sortedRef[Math.floor(sortedRef.length*(percentilesOfInterest[i]/100))]
        let percentileValue;

        if (sortBy == "maxPace" || sortBy == "pace") {
            percentileValue = convert(val, 2);
        } else if (sortBy == "time" || sortBy == "elapsedTime") {
            percentileValue = convert(val, 0);
        } else {
            percentileValue = val.toFixed(2)
        }
 
        percentageDisplay.innerHTML = percentileValue + " " + scrub[sortBy].abbrUnit + "<br>(" + percentilesOfInterest[i] + "th percentile)";
        percentageDisplay.style.left = calculatedPosition + "%";

        document.getElementById("curr_distribution_spectrum").appendChild(percentageDisplay);
    }

    // --> end creation of box/whisker plot

    if(curr_distribution != undefined){
        //console.log("curr_distribution is: " + curr_distribution)
        let greatest = -1;
        
        //get the greatest frequency in the curr_distribution
        for (var j = 0; j< curr_distribution.length; j++){
            if(curr_distribution[j].count > greatest){
                greatest = curr_distribution[j].count;
            }
        }

        //draw graph + bars
        let i = 0;
        while(i < curr_distribution.length){
            const red = (clr1.r + (clr2.r - clr1.r) * (i / curr_distribution.length))
            const green = (clr1.g + (clr2.g - clr1.g) * (i / curr_distribution.length))
            const blue = (clr1.b + (clr2.b - clr1.b) * (i / curr_distribution.length))
            const gradientClr = 'rgb(' + red + ', ' + green + ', ' + blue + ')'
            var o = document.createElement("div");
            o.className = "verticalOuterContainer";
            o.style.width = 100/curr_distribution.length + "%";
            document.getElementById("curr_distribution").appendChild(o);

            var verticalHolder = document.createElement("div");
            verticalHolder.className = "verticalHolder";
            verticalHolder.id = i + "-curr_distribution-" + rgbToHex(Math.round(red), Math.round(green), Math.round(blue))
            verticalHolder.style.height = window.innerHeight / 4 + "px";
            verticalHolder.addEventListener("click", showMoreStats);
            //verticalHolder.addEventListener("mouseout", disableStats);
            //verticalHolder.style.height = window.innerHeight / 3 + "px";
            document.getElementById("curr_distribution").getElementsByClassName("verticalOuterContainer")[i].appendChild(verticalHolder);

            var verticalHolderBelow = document.createElement("p");
            verticalHolderBelow.className = "verticalHolderBelow";
            verticalHolderBelow.innerHTML = getBarTitles(i, sortBy, scrub[sortBy].abbrUnit)

            document.getElementById("curr_distribution").getElementsByClassName("verticalOuterContainer")[i].appendChild(verticalHolderBelow);

            //draw bars
            var verticalHolderStat = document.createElement("p");
            verticalHolderStat.className= "verticalHolderStat";
            if(curr_distribution[i].count / greatest > 0.2){
                verticalHolderStat.innerHTML = curr_distribution[i].count;
            }else{
                verticalHolderStat.innerHTML = curr_distribution[i].count;
                verticalHolderStat.style.fontSize = "0px";
                //creating overflow text on the top of the
                var verticalHolderStatTop = document.createElement("p");
                verticalHolderStatTop.className = "verticalHolderStatTop";
                verticalHolderStatTop.innerHTML = curr_distribution[i].count;
                verticalHolderStatTop.style.bottom = ((curr_distribution[i].count / greatest) * (window.innerHeight / 4)) + "px"
                document.getElementById("curr_distribution").getElementsByClassName("verticalHolder")[i].appendChild(verticalHolderStatTop);
            }
            
            verticalHolderStat.style.backgroundColor = gradientClr;
            verticalHolderStat.style.height = ((curr_distribution[i].count / greatest) * (window.innerHeight / 4)) + "px";
            verticalHolderStat.style.marginTop = (((greatest - curr_distribution[i].count) / greatest) * (window.innerHeight / 4)) + "px";
            verticalHolderStat.style.width = "100%";
            document.getElementById("curr_distribution").getElementsByClassName("verticalHolder")[i].appendChild(verticalHolderStat);

            //console.log(curr_distribution);
            totalMileage += curr_distribution[i].total_distance;
            totalElevGain +=curr_distribution[i].total_elevation_gain;
            totalMovingTime +=curr_distribution[i].total_time;
            totalElapsedTime +=curr_distribution[i].total_elapsed_time;

            document.getElementById("curr_distribution_overview").style.color = scrub[sortBy].color;
            i++;
        }

        try{
            let calculatedMile = convert(totalMovingTime / totalMileage, 2).split(".");
            let calculatedKm = convert((totalMovingTime / totalMileage) / 1.609, 2).split(".")
            document.getElementById("pace_distribution_overview").innerHTML = "Average pace: " + calculatedMile[0] + "." + calculatedMile[1].substring(0, 2) +"/mi (" + calculatedKm[0] + "." + calculatedKm[1].substring(0, 2) + "/km) <br> " + (3600 / (totalMovingTime / totalMileage)).toFixed(3) + "mi/h (" + (3600 / ((totalMovingTime / totalMileage) / 1.609)).toFixed(3) + "km/h)"

            document.getElementById("elev_distribution_overview").innerHTML = "Total elevation: " + (totalElevGain.toFixed(2)) + " ft (" + (totalElevGain / 3.28).toFixed(2) + " m) <br> Avg per run: " + ((totalElevGain/allActivities.length).toFixed(2)) + " ft (" + ((totalElevGain/allActivities.length) / 3.28).toFixed(2) + "m)"

            document.getElementById("dist_distribution_overview").innerHTML = "Total mileage: " + (totalMileage.toFixed(2)) + " mi (" + (totalMileage*1.609).toFixed(2) + " km) <br> Avg per run: " + ((totalMileage/allActivities.length).toFixed(3)) + " mi (" + ((totalMileage/allActivities.length)*1.609).toFixed(3) + " km)"

            let minutes = Math.floor(totalMovingTime % 3600)
            document.getElementById("time_distribution_overview").innerHTML = "<b>*Note: Uptime = (Moving time / Elapsed time) * 100</b><br>Total moving time: " + /*Math.floor(totalMovingTime / 3600) + " hours, " + Math.floor(minutes / 60) + " minutes, " + (minutes % 60)*/ convertToDays(totalMovingTime) + "<br> Avg. % moving overall: " + (totalMovingTime / totalElapsedTime*100).toFixed(3) + "%"
        }catch{
            
        }
    }
}

function createRunLookup (id) {

    console.log(id);
    
    const propertiesToParse = [{display: 'mi', property: 'distance', decimalPlaces: 3, min: 'Shorter', max: 'Longer'}, {display: '/mi', property: 'pace', decimalPlaces: 2, min: 'Faster', max: 'Slower'}, {display: 'ft gain', property: 'elevation', decimalPlaces: 2, min: 'Less', max: 'More'}, {display: '% uptime', property: 'uptime', decimalPlaces: 2, min: 'Less', max: 'More'}, {display: 'moving time', property: 'time', decimalPlaces: 0, min: 'Shorter', max: 'Longer'}, {display: 'elapsed time', property: 'elapsedTime', decimalPlaces: 0, min: 'Shorter', max: 'Longer'}, {display: "% incline", property: 'incline' , decimalPlaces: 2, min: 'Gentler', max: 'Steeper'}, {display: 'kudos', property: 'kudos', decimalPlaces: 0, min: 'Less', max: 'More'}, {display: 'steps/min', property: 'cadence', decimalPlaces: 2, min: 'Lower', max: 'Higher'}, {display: 'steps/mile', property: 'stepsPerMile', decimalPlaces: 0, min: 'Less', max: 'More'}, {display: 'ft/stride', property: 'strideLength', decimalPlaces: 3, min: 'Shorter', max: 'Longer'}, {display: 'steps', property: 'totalSteps', decimalPlaces: 0, min: 'Less', max: 'More'}]

    const runObject = allActivities[allActivities.map(e => e.id).indexOf(id)]

    document.getElementById("runLookupDiv").style.display = "block";
    document.getElementById("runLookupDivTitle").innerHTML = runObject.name
    const info = document.getElementsByClassName('indivRunLookupDiv');
    while(info[0]) {
        info[0].parentNode.removeChild(info[0]);
    }
    document.getElementById("runLookupStravaLink").setAttribute('href', 'https://strava.com/activities/' + id)

    for (let i = 0; i < propertiesToParse.length; i++) {
        // sort all activities and rank them.

        if (runObject[propertiesToParse[i].property] != null) {

            const sortedRef = allValuesSorted[propertiesToParse[i].property]
            console.log(propertiesToParse[i].property)
            let j = 0;
            while (j < sortedRef.length && runObject[propertiesToParse[i].property] > sortedRef[j]) {
                j += 1
            }

            let rank;
            // calculate ranks
            if (runObject[propertiesToParse[i].property] == 0) {
                rank = 0 //first
            } else if (propertiesToParse[i].property == "uptime" && runObject[propertiesToParse[i].property] == 100) {
                rank = allActivities.length - 1; //last
            } else {
                rank = j
            }

            let textColor = "black";
            if (scrub[propertiesToParse[i].property]) {
                const clr1 = hexToRgb(scrub[propertiesToParse[i].property].color)
                const clr2 = hexToRgb(scrub[propertiesToParse[i].property].color2);
                const calculatedPosition = rank / allActivities.length;
                const r = (clr1.r + (clr2.r - clr1.r) * (calculatedPosition))
                const g = (clr1.g + (clr2.g - clr1.g) * (calculatedPosition))
                const b = (clr1.b + (clr2.b - clr1.b) * (calculatedPosition))
                textColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
            }

            // the big number.
            const statDiv = document.createElement('div');
            statDiv.className = 'indivRunLookupDiv';
            
            const mainDisplay = document.createElement('p');
            mainDisplay.className = 'runLookupDivMainText'
            if (propertiesToParse[i].property === "pace" || propertiesToParse[i].property === "time" || propertiesToParse[i].property === "elapsedTime") {
                mainDisplay.innerHTML = '<b>' + convert(runObject[propertiesToParse[i].property], propertiesToParse[i].decimalPlaces)+ '</b> <span>' + propertiesToParse[i].display + '</span>'
            } else {
                mainDisplay.innerHTML = '<b>' + runObject[propertiesToParse[i].property].toFixed(propertiesToParse[i].decimalPlaces) + '</b> <span>' + propertiesToParse[i].display + '</span>'
            }
            mainDisplay.style.color = textColor
            statDiv.appendChild(mainDisplay);

            // create the references on the bars
            const underBar = document.createElement('div');
            underBar.className = 'runLookupSpectrumBarReference'

            const underBarLeft = document.createElement('p');
            underBarLeft.className = 'runLookupSpectrumBarReferenceLeft';
            underBarLeft.innerHTML = "[<-- " + propertiesToParse[i].min + "]";
            underBar.appendChild(underBarLeft);

            const underBarRight = document.createElement('p');
            underBarRight.className = 'runLookupSpectrumBarReferenceRight';
            underBarRight.innerHTML = "[" + propertiesToParse[i].max + " -->]";
            underBar.appendChild(underBarRight);

            statDiv.appendChild(underBar);

            // create spectrum
            const spectrum = document.createElement('div');
            spectrum.className = 'runLookupSpectrum';
            if (scrub[propertiesToParse[i].property]) {
                spectrum.style.background = 'linear-gradient(to right, ' + scrub[propertiesToParse[i].property].color + ', ' + scrub[propertiesToParse[i].property].color2 + ')'
            } else {
                spectrum.style.backgroundColor = "orange";
            }

            const bar = document.createElement('div');
            bar.className = 'runLookupSpectrumBar';
            bar.style.position = 'absolute';
            bar.style.left = "0%";
            bar.style.transition = 'transition: 0.5s';
            bar.style.left = ((rank / allActivities.length)*100) + "%";
            spectrum.appendChild(bar)
            statDiv.appendChild(spectrum);

            // create ranking info
            const rankDisplay = document.createElement('p');
            rankDisplay.className = 'runLookupDivRank';
            if (propertiesToParse[i].property === "pace") {
                rankDisplay.innerHTML = propertiesToParse[i].min + ' than <b>' + (sortedRef.length - rank) + "</b> of <b> " + sortedRef.length + "</b> runs" + " (" + (((sortedRef.length - rank)  / allActivities.length)*100).toFixed(2) + "%)";
            } else {
                rankDisplay.innerHTML = propertiesToParse[i].max + ' than <b>' + rank + "</b> of <b> " + sortedRef.length + "</b> runs" + " (" + ((rank / sortedRef.length)*100).toFixed(2) + "%)";
            }

            statDiv.appendChild(rankDisplay);
            document.getElementById('runLookupDivContainer').appendChild(statDiv);
        }
    }
}

function closeRunLookup() {
    document.getElementById('runLookupDiv').style.display = "none";
}



