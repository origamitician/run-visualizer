let accessToken;
const semester1 = [{name:"Peter L.",totalKudos:118},{name:"Laurynn A.",totalKudos:100},{name:"Izzy L.",totalKudos:95},{name:"Charlotte D.",totalKudos:69},{name:"George L.",totalKudos:126},{name:"Nicolas A.",totalKudos:66},{name:"Malachi C.",totalKudos:48},{name:"Gavin K.",totalKudos:17},{name:"Isaac P.",totalKudos:72},{name:"Dot C.",totalKudos:68},{name:"Chris C.",totalKudos:31},{name:"Ethan K.",totalKudos:13},{name:"Brandon R.",totalKudos:8},{name:"Marcus R.",totalKudos:2},{name:"Matthew C.",totalKudos:12},{name:"Ana N.",totalKudos:26},{name:"Abraham P.",totalKudos:5},{name:"Andrea M.",totalKudos:8},{name:"Theresa L.",totalKudos:6},{name:"Lainey F.",totalKudos:3},{name:"Savannah S.",totalKudos:2},{name:"Austin C.",totalKudos:4},{name:"Micah W.",totalKudos:1},{name:"Conor U.",totalKudos:4},{name:"jonathan F.",totalKudos:1},{name:"Caleb M.",totalKudos:14},{name:"Ryan T.",totalKudos:4},{name:"Mac R.",totalKudos:21},{name:"noah L.",totalKudos:10},{name:"Crishelle I.",totalKudos:19},{name:"Andrew M.",totalKudos:4},{name:"Jai C.",totalKudos:4},{name:"Matt L.",totalKudos:2},{name:"Ashten A.",totalKudos:1},{name:"Franklin H.",totalKudos:1},{name:"Jullien B.",totalKudos:3},{name:"B ❕.",totalKudos:1},{name:"Nicholas P.",totalKudos:1}]

const semester2 = [{name:"Crishelle I.",totalKudos:93},{name:"Isaac P.",totalKudos:106},{name:"Jullien B.",totalKudos:26},{name:"Laurynn A.",totalKudos:71},{name:"George L.",totalKudos:134},{name:"Chris C.",totalKudos:14},{name:"Malachi C.",totalKudos:51},{name:"Izzy L.",totalKudos:77},{name:"Dot C.",totalKudos:45},{name:"Nicolas A.",totalKudos:59},{name:"Abraham P.",totalKudos:39},{name:"Charlotte D.",totalKudos:39},{name:"Ana N.",totalKudos:34},{name:"Ryan T.",totalKudos:1},{name:"Andrew M.",totalKudos:11},{name:"Matthew C.",totalKudos:18},{name:"Brennan Y.",totalKudos:3},{name:"Peter L.",totalKudos:30},{name:"Matt L.",totalKudos:2},{name:"Josh T.",totalKudos:5},{name:"Matt C.",totalKudos:8},{name:"Mac R.",totalKudos:13},{name:"Conor U.",totalKudos:36},{name:"Christian K.",totalKudos:1},{name:"Ethan K.",totalKudos:45},{name:"Tai W.",totalKudos:72},{name:"Nik K.",totalKudos:24},{name:"James H.",totalKudos:76},{name:"John M.",totalKudos:47},{name:"Gavin K.",totalKudos:5},{name:"Lucy T.",totalKudos:20},{name:"Ashten A.",totalKudos:10},{name:"Austin C.",totalKudos:3},{name:"Macyann M.",totalKudos:13},{name:"Michael D.",totalKudos:8},{name:"jonathan F.",totalKudos:4},{name:"Micah K.",totalKudos:2},{name:"jasmine G.",totalKudos:39},{name:"Myndee D.",totalKudos:4},{name:"Josh S.",totalKudos:25},{name:"Marcus R.",totalKudos:4},{name:"William R.",totalKudos:9},{name:"Brandon R.",totalKudos:2},{name:"Andrea M.",totalKudos:4},{name:"Brock S.",totalKudos:12},{name:"Jacob M.",totalKudos:8},{name:"Albert J.",totalKudos:5},{name:"Jai C.",totalKudos:2},{name:"Carter B.",totalKudos:2},{name:"Theresa L.",totalKudos:1},{name:"Rasil M.",totalKudos:1},{name:"Ariana M.",totalKudos:1},{name:"Tomas S.",totalKudos:1},{name:"Boozy T.",totalKudos:1},{name:"Jesse W.",totalKudos:1},{name:"Alex G.",totalKudos:1},{name:"Andre K.",totalKudos:1},{name:"Sal  C.",totalKudos:1},{name:"Cory S.",totalKudos:1},{name:"Micah W.",totalKudos:1},{name:"Dr. Alyx B.",totalKudos:1}]

const listOfNames = [] // {name: 'john smith', totalKudos: 5};
const fragmentLength = 35; // the number of activities that will get processed before strava api hits rate limit.
let batchInterval;
let fragmentNum = 0;

console.log(listOfNames);

function runKudoAnalysis() {
    const minIndex = 0;
    const maxIndex = allActivities.length;
    console.log('running kudo analysis')
    const numberOfFragments = Math.ceil(allActivities.length / fragmentLength);
    fetch(`https://www.strava.com/api/v3/oauth/token?client_id=107318&client_secret=1bac185421708876ddd639fcef0a319d5896d3b1&refresh_token=48f138733218bdd7c10c586c704b8f104a5221f2&grant_type=refresh_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((res) => res.json()).then((j) => {
        accessToken = j.access_token
        console.log(`access token is: ${accessToken}`)
        /* getBatchKudos();
        batchInterval = setInterval(getBatchKudos, 900000); */
        for (let index = minIndex; index < maxIndex; index++) {
            const peoplePromise = fetchAPIData(allActivities[index].id);
            peoplePromise.then((res => {
                const people = [...res];
                people.forEach(ppl => {
                    const fullName = `${ppl.firstname} ${ppl.lastname}`;
                    const index = listOfNames.map(a => a.name).indexOf(fullName)
                    if (index == -1) {
                        // if there is no name in the listOfNames.
                        listOfNames.push({name: fullName, totalKudos: 1});
                    } else {
                        listOfNames[index].totalKudos++;
                    }
                })
                console.log("Running total is: " + JSON.stringify(listOfNames));
            }))
        }
        fragmentNum++;
        // combine();
    })
    console.log(JSON.stringify(listOfNames))
}

function getBatchKudos() {
    /* if (fragmentNum > Math.ceil(allActivities.length / fragmentLength)) {
        for (let index = 0; index < fragmentLength; index++) {
            const peoplePromise = fetchAPIData(allActivities[(fragmentNum * fragmentLength) + index].id);
            peoplePromise.then((res => {
                const people = [...res];
                people.forEach(ppl => {
                    const fullName = `${ppl.firstname} ${ppl.lastname}`;
                    const index = listOfNames.map(a => a.name).indexOf(fullName)
                    if (index == -1) {
                        // if there is no name in the listOfNames.
                        listOfNames.push({name: fullName, totalKudos: 1});
                    } else {
                        listOfNames[index].totalKudos++;
                    }
                })
                console.log("Running total is: " + JSON.stringify(listOfNames));
            }))
        }
        fragmentNum++;
    } else {
        clearInterval(batchInterval);
    } */
}

async function fetchAPIData(id) {
    // my refresh token: 64e1cb8497985aef6e9614d0
    console.log("Fetching data for id " + id + ": https://www.strava.com/api/v3/activities/" + id + "/kudos?access_token=" + accessToken)
    // generate an access token
    let toReturn = [];
    await fetch("https://www.strava.com/api/v3/activities/" + id + "/kudos?access_token=" + accessToken).then((response) => response.json()).then((jsonData) => { 
        toReturn = [...jsonData]
    })
    console.log("returned stuff is: " + JSON.stringify(toReturn));
    return toReturn;
}

function combine() {
    const semester1parsed = [...semester1];
    const semester2parsed = [...semester2];

    // const combined = [{name:"Ethan K.",totalKudos:5},{name:"Micaiah C.",totalKudos:174},{name:"Kia'i T.",totalKudos:42},{name:"Peter L.",totalKudos:134},{name:"Isaac P.",totalKudos:100},{name:"Theresa L.",totalKudos:7},{name:"Josh T.",totalKudos:2},{name:"Austin C.",totalKudos:17},{name:"Ethan F.",totalKudos:1},{name:"Seita T.",totalKudos:7},{name:"Christian K.",totalKudos:1},{name:"Evan C.",totalKudos:1}]
    /* semester1.forEach(e => {
        semester1parsed.push(JSON.parse(e));
    })
    semester2.forEach(e => {
        semester2parsed.push(JSON.parse(e));
    }) */

    /*for (let i = 0; i < semester1parsed.length; i++) {
        const sem2names = semester2parsed.map(e => e.name)
        const index = sem2names.indexOf(semester1parsed[i].name)
        if (index == -1) {
            // if name was not found in the second semester list.
            combined.push(semester1parsed[i]);
        } else {
            combined.push({name: semester1parsed[i].name, totalKudos: semester1parsed[i].totalKudos + semester2parsed[index].totalKudos});
        }
    }

    for (let i = 0; i < semester2parsed.length; i++) {
        const sem1names = semester1parsed.map(e => e.name)
        if (sem1names.indexOf(semester2parsed[i].name) == -1) {
            // if name was not found in the first semester list.
            combined.push(semester2parsed[i]);
        }
    } */

        const combined = [{name:"tony S.",totalKudos:78},{name:"Sara M.",totalKudos:62},{name:"Alex D.",totalKudos:45},{name:"Lucy T.",totalKudos:21},{name:"Suzanne N.",totalKudos:57},{name:"John McCann (.",totalKudos:72},{name:"James H.",totalKudos:80},{name:"Johnny J.",totalKudos:38},{name:"Dot C.",totalKudos:6},{name:"Crishelle I.",totalKudos:73},{name:"Rasil M.",totalKudos:69},{name:"Malachi C.",totalKudos:61},{name:"George L.",totalKudos:72},{name:"noah L.",totalKudos:1},{name:"Aaron B.",totalKudos:34},{name:"Isaac P.",totalKudos:49},{name:"Ken Y.",totalKudos:6},{name:"Iván Pedro R.",totalKudos:3},{name:"Peter L.",totalKudos:58},{name:"Carlene B.",totalKudos:32},{name:"Jenna B.",totalKudos:28},{name:"Ian T.",totalKudos:58},{name:"Austin C.",totalKudos:6},{name:"Macyann M.",totalKudos:53},{name:"Michael D.",totalKudos:63},{name:"Chris C.",totalKudos:12},{name:"Chester L.",totalKudos:3},{name:"Matthew C.",totalKudos:24},{name:"Nicolas A.",totalKudos:6},{name:"Izzy L.",totalKudos:26},{name:"Jasmine G.",totalKudos:21},{name:"Josh S.",totalKudos:9},{name:"Ana N.",totalKudos:31},{name:"Myndee D.",totalKudos:26},{name:"Conor U.",totalKudos:5},{name:"Gavin K.",totalKudos:6},{name:"Ashten A.",totalKudos:10},{name:"Abraham P.",totalKudos:14},{name:"Jacob M.",totalKudos:5},{name:"Micah W.",totalKudos:17},{name:"Bojan T.",totalKudos:3},{name:"Black Mamba H.",totalKudos:4},{name:"fred C.",totalKudos:35},{name:"Theresa L.",totalKudos:9},{name:"Ethan K.",totalKudos:17},{name:"Keahi J.",totalKudos:24},{name:"Jeff C.",totalKudos:1},{name:"Trey R.",totalKudos:26},{name:"Micah K.",totalKudos:2},{name:"Telmen L.",totalKudos:4},{name:"Evan L.",totalKudos:5},{name:"Laurynn A.",totalKudos:13},{name:"Dalan K.",totalKudos:1},{name:"mike I.",totalKudos:17},{name:"Michael C.",totalKudos:6},{name:"Travis S.",totalKudos:1},{name:"Matt C.",totalKudos:7},{name:"Nathan F.",totalKudos:1},{name:"Ian F.",totalKudos:5},{name:"Mac R.",totalKudos:1},{name:"Naomi J.",totalKudos:3},{name:"Ian W.",totalKudos:2},{name:"Duane T.",totalKudos:5},{name:"Charlotte D.",totalKudos:8},{name:"Tai W.",totalKudos:2},{name:"Kanika S.",totalKudos:1},{name:"William R.",totalKudos:1},{name:"Brock S.",totalKudos:2},{name:"Carter B.",totalKudos:1},{name:"Jai C.",totalKudos:1},{name:"Matt L.",totalKudos:1}]

    // sort allActivities by date.
    for (let i = 1; i < combined.length; i++) {
        let currentElement = combined[i];
        let lastIndex = i - 1;
  
        while (lastIndex >= 0 && combined[lastIndex].totalKudos < currentElement.totalKudos) {
            combined[lastIndex + 1] = combined[lastIndex];
            lastIndex--;
        }
        combined[lastIndex + 1] = currentElement;
    }

    //console.log(JSON.stringify(combined));

    const graphColors = ['cornflowerblue', '#fc9003', 'purple', '#3bbf53', '#d12828', 'darkgreen', 'maroon', 'darkblue', 'seagreen', 'gray']
    const maxValue = 190;
    for (let i = 0; i < combined.length; i++) {
        const graphRow = document.createElement('div');
        graphRow.className = 'graphRow';

        const graphText = document.createElement('p');
        graphText.className = 'kudoGraphText';
        graphText.innerHTML = combined[i].name;
        graphRow.appendChild(graphText);

        const graphBarHolder = document.createElement('div');
        graphBarHolder.className = 'kudoGraphBarHolder';

        const graphBar = document.createElement('div');
        graphBar.className = 'kudoGraphBar';
        graphBar.style.backgroundColor = graphColors[i % graphColors.length];
        /* graphBar.style.background = 'linear-gradient(to right, white, ' + graphColors[i % graphColors.length] + ')'; */
        if ((combined[i].totalKudos / maxValue) * 100 > 18) {
            graphBar.innerHTML = combined[i].totalKudos + " (" + ((combined[i].totalKudos / maxValue) * 100).toFixed(1) + "%)";
        } else {
            graphBar.innerHTML = "."
        }
        
        graphBar.style.width = (combined[i].totalKudos / maxValue) * 100 + "%";
        graphBarHolder.appendChild(graphBar);
         
        if ((combined[i].totalKudos / maxValue) * 100 <= 18) {
            const graphTailText = document.createElement('p');
            graphTailText.innerHTML = combined[i].totalKudos + " (" + ((combined[i].totalKudos / maxValue) * 100).toFixed(1) + "%)";
            graphTailText.style.paddingLeft = "2%";
            graphTailText.style.marginTop = "1%";
            graphTailText.style.marginBottom = "1%";
            graphTailText.style.fontSize = "110%";
            graphBarHolder.appendChild(graphTailText);
        }
        
        graphRow.appendChild(graphBarHolder);

        document.getElementById('kudoGraphDiv').appendChild(graphRow);
    }

    const kudoScale = document.createElement('div');
    kudoScale.className = 'kudoGraphScale';

    const increments = 5;
    for (let j = 0; j < increments; j++) {
        const scaleIncrement = document.createElement('div');
        scaleIncrement.className = 'kudoScaleIncrement'
        scaleIncrement.style.width = (100 / increments) + "%";
        scaleIncrement.innerHTML = (maxValue / increments) * (j + 1);
        kudoScale.appendChild(scaleIncrement);
    }

    document.getElementById('kudoGraphDiv').appendChild(kudoScale);

    let sumOfKudos = 0;
    combined.forEach(e => {
        sumOfKudos+=e.totalKudos;
    })

    document.getElementById('kudoGraphSummary').innerHTML = '<b>' + combined.length + '</b> unique people kudoed | <b>' + sumOfKudos + '</b> total kudos'
}

// combine();

function analyzeTitles() {
    listOfWords = []
    allActivities.forEach(e => {
        const titleArr = e.name.split(" ")
        titleArr.forEach(words => {
            const index = listOfWords.map(a => a.word).indexOf(words.toLowerCase())
            if (index == -1) {
                // if there is no name in the listOfNames.
                listOfWords.push({word: words.toLowerCase(), count: 1});
            } else {
                listOfWords[index].count++;
            }
        })
    })

    for (let i = 1; i < listOfWords.length; i++) {
        let currentElement = listOfWords[i];
        let lastIndex = i - 1;

        while (lastIndex >= 0 && listOfWords[lastIndex].count < currentElement.count) {
            listOfWords[lastIndex + 1] = listOfWords[lastIndex];
            lastIndex--;
        }
        listOfWords[lastIndex + 1] = currentElement;
    }

    console.log(JSON.stringify(listOfWords));
}