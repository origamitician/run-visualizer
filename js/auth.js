//file for all the misc. operations, such as hiding and showing elements of the UI, updating the date, etc...
var allActivities = []; // actual, dynamically changing activities list upon filtering.
const allActivitiesRef = []; // FIXED activities list. All lifetime activities are stored in here so that no unneccessary API calls are made.

const allAnalysisVariables = [
    "distance", 
    "pace", 
    "maxPace", 
    "time", 
    "elapsedTime", 
    "uptime", 
    "elevation", 
    "incline", 
    "kudos", 
    "cadence", 
    "totalSteps", 
    "stepsPerMile", 
    "strideLength"]

const allValuesSorted = {}

const randomSubtitles = [
    "Follow me on Strava - @infigral",
    "As you can tell I'm addicted to gradients.",
    "This site can be slower than a recovery run.",
    "Vanilla JS is faster than a tempo run!",
    "NaN == NaN returns False!",
    "the github repository for this is 'origamitician/stravalytics'.",
    "Rizz wanted",
    "I took so long to create this app b/c (insert reason here)",
    "Only in Ohio!",
    "The toilet is not skibidi pls help",
    "Not sigma, but sigma^2",
    "THE TAX IS NOT FANUM",
    "Go run some miles.",
    "Go catch those endorphins.",
    "I have a yt channel! https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "4000+ lines of code!",
    "Something happened along the way, and a long run was all we had",
    "Is this the real pace, is it just fantasy?",
    "I should have used React.js for this",
    "AHHHHHHHHHHHHH!!!!!!11!11!1!!1!11!!",
    "idk I can't think of any more subtitles",
    "thank you for all my Strava kudoers <3",
    "Do not look at the source code if you want to preserve your sanity.",
    "Attempting a sub 4 mile!",
    "Attempting a sub 8 2 mile!",
    "Attempting a sub 13 5k!",
    "Attempting a sub 27 10k!",
    "Attempting a sub 1 half marathon!",
    "Attempting a sub 2 full marathon!",
    "Why stay in Zone 2 when you can go Mach 2?",
    "Stop wasting time looking at your run analytics. Do your homework!",
    "Running shoes are overpriced",
    "Yes.",
    "No.",
    "What?",
    "Erm, what the sigma",
    "Inspired by Smashrun and other Strava visualizers!"
]
// for asthetics
const sectionColors = ['blue', 'cornflowerblue', 'green', 'purple', 'orange', 'maroon'];
for (let i = 0; i < sectionColors.length; i++){
    document.getElementsByClassName('applicationMenuOption')[i].style.borderLeft = '5px solid  ' + sectionColors[i];
    document.getElementsByClassName('applicationMenuOption')[i].addEventListener('mouseover', () => {document.getElementsByClassName('applicationMenuOption')[i].style.backgroundColor = sectionColors[i]})
    document.getElementsByClassName('applicationMenuOption')[i].addEventListener('mouseout', () => {document.getElementsByClassName('applicationMenuOption')[i].style.backgroundColor = 'white'})
    document.getElementsByClassName('applicationMenuOption')[i].addEventListener('click', (e) => {
        let link = e.target.href;
        console.log(link.substring(link.indexOf('#')+1));
        /* for (let j = 0; j < document.getElementsByClassName('mainDiv').length; j++) {
            document.getElementsByClassName('mainDiv')[j].style.display = 'none';
        }
        document.getElementById(link.substring(link.indexOf('#')+1)).style.display = 'block'; */
    })
    if (i < document.getElementsByClassName('mainDiv').length) {
        document.getElementsByClassName('quickOverviewTopDiv')[i].style.backgroundColor = sectionColors[i];
    }
}

// keep track of which components are shown.
let loadingBarFrame = 0;
document.getElementById("applicationBody").style.display = "none";
function init(){
    window.location = `http://www.strava.com/oauth/authorize?client_id=107318&response_type=code&redirect_uri=${window.location.href}&approval_prompt=auto&scope=activity:read_all`
}

function showMobileMenu () {
    const displayInQuestion = document.getElementById("applicationMenu");
    if (displayInQuestion.style.display == "block") {
        displayInQuestion.style.display = "none";
    } else {
        displayInQuestion.style.display = "block";
    }
}

function showLagMenu () {
    const displayInQuestion = document.getElementById("lagDiv");
    if (displayInQuestion.style.display == "block") {
        displayInQuestion.style.display = "none";
    } else {
        displayInQuestion.style.display = "block";
    }
}

function changeDates(){
    /*try{*/
        if(document.getElementsByName("startDate")[0].value == ""){
            startDate = 0;
        }else{
            startDate = Math.floor(Date.parse(document.getElementsByName("startDate")[0].value) / 1000)
        }
        
        if(document.getElementsByName("endDate")[0].value == ""){
            endDate = Math.floor(Date.now() / 1000)
        }else{
            endDate = Math.floor(Date.parse(document.getElementsByName("endDate")[0].value) / 1000)
        }
        
        //console.log(Date.parse(document.getElementsByName("startDate")[0].value))
        allActivities = []
        allActivitiesRef.forEach(a => {
            console.log(a.startDate);
            if (Date.parse(a.startDate)/1000 >= startDate && Date.parse(a.startDate)/1000 <= endDate) {
                allActivities.push(a);
            }
        })

        if (allActivities.length !== 0) {
           allAnalysisVariables.forEach((v) => {
                const arrayToSort = []
                allActivities.forEach((act) => {
                    if (act[v] != null) {
                        arrayToSort.push(Number(act[v]))
                    }
                })

                arrayToSort.sort((a, b) => a - b)
                allValuesSorted[v] = arrayToSort
            })

            createSummaryPage();
            renderGraph();
            renderScatterplot(allActivities, document.getElementsByName('variable1')[0].value, document.getElementsByName('variable2')[0].value, null, [1, 2])
            document.getElementById("displayNumRuns").innerHTML = "Displaying <b>" + allActivities.length + "</b> runs from (timestamp " + startDate + " to " + endDate + ")"
            runTrends();
            runAnalysis();
        }

        document.getElementById("randomSubTitle").innerHTML = randomSubtitles[Math.floor(Math.random()*randomSubtitles.length)]
        
    /* } /*catch (err){
        alert("Invalid date! " + err)
    } */
}

console.log(localStorage)

const indexOfAuthorization = window.location.href.indexOf('&code=')
const indexOfRandom = window.location.href.indexOf('?random=true')

if (indexOfAuthorization == -1) {
    if(localStorage.isLoggedIn == 'true'){
        // when the user is logged in.
        const loadingBarInterval = setInterval(updateLoadingBar, 10)
        document.getElementById('notLoggedInBody').style.display = 'none';
        document.getElementById('applicationBody').style.display = 'none';
        document.getElementById('transition').style.display = 'block';
        fetch('/api/activities/' + localStorage.getItem('accountID'))
        .then((response) => response.json()).then((data) => {
            data.forEach(d => {
                let item = {...d}
                item.distance /= 1609.344
                item.elevation *= 3.28;
                item.incline = parseFloat(((item.elevation / (item.distance * 5280))*100).toFixed(3))
                item.pace = 1609.344 / item.pace;
                item.uptime = parseFloat(((item.time / item.elapsedTime)*100).toFixed(2))
                if (item.maxPace) {
                    item.maxPace = 1609.344 / item.maxPace;
                } else {
                    item.maxPace = null;
                }
                
                item.parsedNumericalDate = Date.parse(item.startDate) / 1000;
                /*item.startDate = Date.parse(item.startDate) / 1000*/
                if (item.cadence) {
                    item.cadence = 2 * item.cadence
                    item.totalSteps = Math.round(item.cadence * (item.time / 60))
                    item.stepsPerMile = item.totalSteps / item.distance
                    item.strideLength = 5280 / item.stepsPerMile
                } else {
                    item.cadence = null;
                    item.stepsPerMile = null;
                    item.strideLength = null;
                    item.totalSteps = null;
                }
                allActivities.push(item)
                allActivitiesRef.push(item);
            })
            document.getElementById("applicationBody").style.display = "block";
            document.getElementById("randomSubTitle").innerHTML = randomSubtitles[Math.floor(Math.random()*randomSubtitles.length)]
            if (allActivities.length !== 0) {
                allAnalysisVariables.forEach((v) => {
                    const arrayToSort = []
                    allActivities.forEach((act) => {
                        if (act[v] != null) {
                            arrayToSort.push(Number(act[v]))
                        }
                    })

                    arrayToSort.sort((a, b) => a - b)
                    allValuesSorted[v] = arrayToSort
                })

                console.log(allValuesSorted)

                createSummaryPage();
                renderGraph(); //histograms
                renderScatterplot(allActivities, 'distance', 'pace', null, [1, 2]); //scatterplot
                runTrends();
                runAnalysis();
            } 
            
            document.getElementById("displayNumRuns").innerHTML = "Displaying <b>" + allActivities.length + "</b> runs from (timestamp " + startDate + " to " + endDate + ")"
            document.getElementById('applicationBody').style.display = 'block';
            document.getElementById('applicationMenu').style.display = 'block';
            clearInterval(loadingBarInterval)
            document.getElementById('transition').style.display = 'none';
            document.getElementById("summaryDivWelcomeMsg").innerHTML = 'Welcome, ' + '<b>' + localStorage.getItem('stravaName') + '!</b>'
            document.title = `${localStorage.getItem('stravaName')} on Stravalytics`
        })
        
    } else {
        // if new user and not logged in.
        if(indexOfRandom == -1){
            // if user is on the home page.
            document.getElementById('applicationBody').style.display = 'none';
            document.getElementById('transition').style.display = 'none';
        }else{
            // if user wants to generate random data
            document.getElementById('notLoggedInBody').style.display = 'none';
            document.getElementById("applicationBody").style.display = "block";
            document.getElementById('applicationMenu').style.display = 'block';
            document.getElementById('transition').style.display = 'none';
            document.getElementById("summaryDivWelcomeMsg").innerHTML = 'Viewing randomly generated data.'
            
            generateRandomData();
        }
    }
} else {
    // when the user is redirected from the authorization page
    const cut = window.location.href.substring(indexOfAuthorization + 6)
    const accessCode = cut.substring(0, cut.indexOf('&'))
    
    const loadingBarInterval = setInterval(updateLoadingBar, 10)
    document.getElementById('notLoggedInBody').style.display = 'none';
    document.getElementById('transition').style.display = 'block';
    document.getElementById('statusMsg').innerHTML = 'Redirecting...'
    
    fetch('/api/token/' + accessCode)
    .then((res)=> res.json()).then(json => {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('accountID', json.accountID)
        localStorage.setItem('stravaName', json.stravaName)
        clearInterval(loadingBarInterval)
        window.location = '/' 
    })
    .catch(err => {console.log(err)})
}

function generateRandomData(){
    allActivities = [];
    for (let i = 0; i < 400; i++){
        const generatedDistance = ((Math.random()*25000) + 1000)/1609;
        // console.log("Dist: " + generatedDistance);
        const generatedPace = 1609 / ((Math.random()*2+ 2.65) * (Math.log(30 - generatedDistance) / Math.log(20)))
        // console.log("Pace: " + generatedPace);
        const elapsedPaceDifferencePercent = Math.random()*45
        const generatedTime = generatedDistance * generatedPace
        const generatedYear = Math.floor(Math.random()*5 + 2020);

        let generatedMonth, generatedDay;
        if (generatedYear !== new Date().getFullYear()) {
            generatedMonth = Math.floor(Math.random()*12 + 1);
            generatedDay = Math.floor(Math.random()*28 + 1);
        } else {
            generatedMonth = Math.floor(Math.random()*(new Date().getMonth()+1) + 1);
            generatedDay = Math.floor(Math.random()*(new Date().getDate()-1) + 1);
        }
        
        let generatedHour = Math.floor(Math.random()*15 + 5);
        let generatedMin = Math.floor(Math.random()*60);
        let generatedSec = Math.floor(Math.random()*60);
        if (generatedMonth < 10) {
            generatedMonth = "0" + generatedMonth;
        }

        if (generatedDay < 10) {
            generatedDay = "0" + generatedDay;
        }

        if (generatedHour < 10) {
            generatedHour = "0" + generatedHour;
        }

        if (generatedMin < 10) {
            generatedMin = "0" + generatedMin;
        }

        if (generatedSec < 10) {
            generatedSec = "0" + generatedSec;
        }

        const properDateFormat = generatedYear + "-" + generatedMonth + "-" + generatedDay + "T" + generatedHour + ":" + generatedMin + ":" + generatedSec + "Z"
        const generatedEntry = {
            distance: generatedDistance,
            pace: generatedPace,
            time: generatedTime,
            cadence: 77 + Number((Math.random()*15).toFixed(1)),
            elapsedTime: generatedTime * (1+elapsedPaceDifferencePercent/100),
            uptime: 1 / (1+elapsedPaceDifferencePercent/100) * 100,
            elevation: Math.random()*540,
            
            kudos: Math.round(Math.random()*20 + 4),
            maxPace: generatedPace * (1 + ((Math.random() * 50) / 100)),
            id: -1,
            /*startDate: "2021-07-21T16:20:13Z",*/
            startDate: properDateFormat,
            parsedNumericalDate: Date.parse(properDateFormat) / 1000,
            name: "Run " + i
        }
        allActivities.push(generatedEntry);
        allActivitiesRef.push(generatedEntry);
    }
    document.getElementById('applicationBody').style.display = 'block';
    createSummaryPage();
    renderGraph(); //histograms
    renderScatterplot(allActivities, 'distance', 'pace', null,  [1, 2]); //scatterplot
    runTrends(); //create trends page
    runAnalysis();
}

function updateLoadingBar(){
    document.getElementById("loadingBar").style.background = 'linear-gradient(to right, gold, #ff2200 ' + loadingBarFrame + '%, gold ' + (loadingBarFrame + 15) +'%)';
    loadingBarFrame++;
    if(loadingBarFrame >= 100) {
        loadingBarFrame = 0;
    }
}

function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('accountID');
    localStorage.removeItem('stravaName')
    window.location = '/'
}