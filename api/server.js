const express = require('express');
var cors = require('cors');
const mongoose = require('mongoose');
const path = require('path')
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.static(path.join(__dirname, '../')));

require('dotenv').config({ path: path.join(__dirname, 'secrets.env') });

let allActivities = []

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'index.html'))
})

// mongoose.set('strictQuery', true);
 
app.get('/api/token/:authCode', (req, res) => {

    // runs when the user is redirected from the authorization page.
    // template: http://localhost:3000/?state=&code=bdd55c5743cea421e334fef3f168cd5372ffa433&scope=read,activity:read_all
    fetch(`https://www.strava.com/api/v3/oauth/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.params.authCode}&grant_type=authorization_code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((response) => response.json())
    .then((json) => {
        const obtainedToken = json.refresh_token
        const name = json.athlete.firstname + ' ' + json.athlete.lastname
        // obtain refreshtoken for a user. It should be the same every time the same user logs in. 
        // console.log('-----')
        // console.log('trying to find doc w refresh token ' + obtainedToken)

        RefreshTokens.findOne({ refreshToken : obtainedToken }).exec((err, data) => {
            // console.log('result for finding one: ' + JSON.stringify(data))
            let accountId;
            if(data){
                // if the refresh token exists.
                accountId = data._id
            } else {
                // if the refresh token doesn't exist in the database; create a new user.
                let r = new RefreshTokens({refreshToken: obtainedToken});
                r.save((err, data) => {
                    // console.log('refresh token doesnt exist and creating a new one')
                    if(err) console.log(err);
                    // console.log(data)
                    accountId = data._id
                })
            }
            if (accountId){
                // if accountID was successfully fetched
                res.json({accountID: accountId, stravaName: name})
            } else {
                // if accountID was NOT successfully fetched
                res.sendStatus(404)
            }
        })
    })
})
    
app.get('/api/activities/:accountID', (req, res) => {
    allActivities = [];
    const CLIENT_ID = process.env.CLIENT_ID
    const CLIENT_SECRET = process.env.CLIENT_SECRET
    // console.log('trying to find by id ' + req.params.accountID)
    RefreshTokens.findById(req.params.accountID).exec((err, data) => {
        if (err) {
            console.log(err)
        } else {
            // console.log(data)
            if (data) {
                // console.log('no refresh tokens')
                const token = data.refreshToken
                console.log(`https://www.strava.com/api/v3/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${token}&grant_type=refresh_token`)
                fetch(`https://www.strava.com/api/v3/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${token}&grant_type=refresh_token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then((res) => res.json())
                .then((j) => {
                    // fetching each page of activities using the obtained access token
                    const key = j.access_token

                    //make sure this is an array of Promise objects.
                    Promise.all([
                        getIndividualPaginatedData(1, key),
                        /*getIndividualPaginatedData(2, key), 
                        getIndividualPaginatedData(3, key), 
                        getIndividualPaginatedData(4, key),
                        getIndividualPaginatedData(5, key), 
                        getIndividualPaginatedData(6, key),
                        getIndividualPaginatedData(7, key)*/,
                        ]).then(() => {
                            res.send(allActivities)
                        })
                })
            } else {
                res.sendStatus(404)
            }
        }
    })
})

function getIndividualPaginatedData(page, accessKey) {
    console.log("https://www.strava.com/api/v3/athlete/activities?access_token=" + accessKey + "&page=" + page + "&per_page=200&after=0" +  "&before=" + Math.round(Date.now()/1000));
    return new Promise ((resolve, reject) => {
        fetch("https://www.strava.com/api/v3/athlete/activities?access_token=" + accessKey + "&page=" + page + "&per_page=200&after=0" +  "&before=" + Math.round(Date.now()/1000)).then((response) => response.json()).then((jsonData) => {  
            for (var i = 0; i < jsonData.length; i++){
                if(jsonData[i].type == "Run"){
                    allActivities.push({
                        distance: jsonData[i].distance,
                        time: jsonData[i].moving_time,
                        elapsedTime: jsonData[i].elapsed_time,
                        elevation: jsonData[i].total_elevation_gain,
                        pace: jsonData[i].average_speed,
                        name: jsonData[i].name,
                        startDate: jsonData[i].start_date_local,
                        id:  jsonData[i].id,
                        kudos: jsonData[i].kudos_count,
                        maxPace: jsonData[i].max_speed,
                        cadence: jsonData[i].average_cadence
                    });
                }
            }
            resolve("success")
        })
    })
}

const refreshTokenDoc = new mongoose.Schema({
    refreshToken: String,
})

const RefreshTokens = mongoose.model("tokens", refreshTokenDoc);

mongoose.connect(process.env.MONGO_URI, () => {
    const port = process.env.PORT || 3000;
    app.listen(port, "0.0.0.0", () => {
        console.log("Server is running on port: " + port);
    })
})