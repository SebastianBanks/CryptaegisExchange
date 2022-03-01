require('../node_modules/dotenv').config()
const express = require('../node_modules/express')
const axios = require('../node_modules/axios')
const path = require('path')
const app = express()
const cors = require('cors')
const { COINBASE_CLIENT_ID, COINBASE_CLIENT_SECRET } = process.env
const passport = require('passport')
var CoinbaseStrategy = require('passport-coinbase-oauth2').Strategy;
const { createItem, createUser, getAllItems, getItemImage, getFilteredItems } = require('./controller.js')
const {seed} = require('./seed.js')
const qs = require('../node_modules/qs')

const { generateImageURL } = require("./s3.js")

app.use(express.json())
app.use(cors())

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})

passport.use(
    new CoinbaseStrategy(
        {
            clientID: COINBASE_CLIENT_ID,
            clientSecret: COINBASE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/callback",
            authorizationURL: "https://coinbase.com/oauth/authorize",
            tokenURL: "https://api.coinbase.com/oauth/token",
            userProfileURL: "https://api.coinbase.com/v2/user"
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(`access token: ${accessToken}`)
            console.log(`refresh token ${refreshToken}`)
            console.log(profile)
            return done(null, profile)
        }
    )
)

app.get('/s3URL', async (req, res) => {
    console.log('works')
    const url = await generateImageURL()
    console.log({url})
    res.status(200).send({url})
})
app.get('/items', getAllItems)
app.get('/getItemImage/:id', getItemImage)
app.get('/getFilteredItems', getFilteredItems)

app.post('/createItem', createItem)
app.post(`/createUser`, createUser)

// COINBASE ----------------------------------

app.get('/getLink', (req, res) => {
    let keys = {
        client: COINBASE_CLIENT_ID,
        sec: COINBASE_CLIENT_SECRET,
        url: "http://localhost:3000/callback",
        scope: "wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:transactions:read&account=all"
    }
    res.status(200).send(keys)
})



app.get("/callback", async (req, res) => {
    const {code, state} = req.query;
    console.log(code)
    if (state === COINBASE_CLIENT_SECRET) {
        const data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': COINBASE_CLIENT_ID,
            'client_secret': COINBASE_CLIENT_SECRET,
            'redirect': "http://localhost:3000/callback"
        });
        const config = {
            method: 'post',
            url: 'https//api.coinbase.com/oauth/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data
        };

        try {
            const response = await axios(config)
            res.send({ response: response?.data });
        } catch (e) {
            console.log("Could not trade code for tokens", e)
        }
    }
});

// app.use(passport.initialize())


app.get(
    '/',
    passport.authenticate('coinbase', { scope: "wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:transactions:read", account: ["all"] }),
    function (req, res) {
        console.log(accessToken)
        console.log(refreshToken)
        console.log(profile)
        console.log(res)
    }
)

app.get(
    '/callback',
    passport.authenticate('coinbase'),
    function (req, res) {
        res.redirect('/')
    }
)
// --------------------------------------------------------------------



app.use(express.static(path.join(__dirname, '../client')))


// Dev 
//app.post(`/seed`, seed)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Online - ${port}`))