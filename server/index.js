require('dotenv').config()
const express = require('express')
const axios = require('axios')
const path = require('path')
const app = express()
const cors = require('cors')
const { SERVER_PORT, CLIENT_ID, CLIENT_SECRET } = process.env
let SECERET = ""
// const passport = require('passport')
// var CoinbaseStrategy = require('passport-coinbase-oauth2').Strategy;
const { encrypt } = require('./crypto.js')
const { createItem, createUser, getAllItems, getItemImage, getFilteredItems, generateKey } = require('./controller.js')
const {seed} = require('./seed.js')
const qs = require('qs')

const { generateImageURL } = require("./s3.js")


app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(cors())

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})

// passport.use(
//     new CoinbaseStrategy(
//         {
//             clientID: COINBASE_CLIENT_ID,
//             clientSecret: COINBASE_CLIENT_SECRET,
//             callbackURL: "http://localhost:3000/callback",
//             authorizationURL: "https://coinbase.com/oauth/authorize",
//             tokenURL: "https://api.coinbase.com/oauth/token",
//             userProfileURL: "https://api.coinbase.com/v2/user"
//         },
//         function (accessToken, refreshToken, profile, done) {
//             console.log(`access token: ${accessToken}`)
//             console.log(`refresh token ${refreshToken}`)
//             console.log(profile)
//             return done(null, profile)
//         }
//     )
// )

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

let accessToken = ""
let refreshToken = ""

app.get('/getLink', (req, res) => {
    SECERET = generateKey(20)
    let keys = {
        client: process.env.CLIENT_ID,
        sec: SECERET,
        url: "https://cryptaegis-exchange.herokuapp.com/callback",
        scope: "wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:transactions:read&account=all,wallet:transactions:transfer, wallet:transactions:read"
    }
    res.status(200).send(keys)
})

app.get("/callback", async (req, res) => {
    const {code, state} = req.query;
    console.log(`state: ${state}`)
    console.log(`code: ${code}`)
    if (state === SECERET) {
        const data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': "https://cryptaegis-exchange.herokuapp.com/callback"
        });
        console.log(`data: ${data}`)

        try {
            await axios.post('https://api.coinbase.com/oauth/token', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => {
                accessToken = response.data.access_token
                refreshToken = response.data.refresh_token
                console.log(`accessToken: ${accessToken}`)
                console.log(`refreshToken: ${refreshToken}`)
                res.send({ response: response?.data })
            })
            .catch(err => {
                console.log(`error: ${err}`)
                console.log(`data2: ${data}`)
                console.log(`response: ${response}`)
                console.log(`data: ${response.data}`)
            })
        } catch (e) {
            console.log('There was an error fool')
            console.log("Could not trade code for tokens", e)
        }

        // const config = {
        //     method: 'post',
        //     url: 'https//api.coinbase.com/oauth/token',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     data
        // };

        // try {
        //     const response = await axios(config);
            
        //     accessToken = response.data.access_token;
        //     refreshToken = response.data.refresh_token;
        //     console.log(`access: ${accessToken}`)
        //     console.log(`refresh: ${refreshToken}`)
        //     res.send({ response: response?.data });
        // } catch (e) {
        //     console.log(`e: ${e}`)
        //     console.log(`response: ${e.response}`)
        //     console.log("Could not trade code for tokens", e.response.data)
        // }
    } else {
        console.log("keys don't match")
    }
})

app.get("/user", async (req, res) => {
    axios.get("https://api.coinbase.com/v2/user", {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        res.send({ response: response?.data })
    })
    .catch(err => {
        console.log(`Could not get user: ${err}`)
    })
})

app.get("/account", async (req, res) => {
    axios.get('https://api.coinbase.com/v2/accounts/BTC', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        res.send({ response: response?.data })
    })
    .catch(err => {
        console.log(`Could not get accounts: ${err}`)
    })
})

app.get("/transferMoney", async (req, res) => {
    // make sure these are all strings
    const fromId = "" // wallet id of the person buying the item
    const toId = "" // wallet id of the person selling the item
    const amount = "" // amount of item
    const currency = "" // type of currency of the amount
    const description = "" // item title

    const data = JSON.stringify({
        "type": "transaction",
        "to" : toId,
        "amount": amount,
        "currency": currency,
        "description": description
    })

    axios.post(`https://api.coinbase.com/v2/accounts/${fromId}/transactions`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .send(response => {
        res.send({ response: response?.data })
    })
    .catch(err => {
        console.log(`Their was an error with this transaction: ${err}`)
    })
})

// app.use(passport.initialize())


// app.get(
//     '/',
//     passport.authenticate('coinbase', { scope: "wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:transactions:read", account: ["all"] }),
//     function (req, res) {
//         console.log(accessToken)
//         console.log(refreshToken)
//         console.log(profile)
//         console.log(res)
//     }
// )

// app.get(
//     '/callback',
//     passport.authenticate('coinbase'),
//     function (req, res) {
//         res.redirect('/')
//     }
// )
// --------------------------------------------------------------------



app.use(express.static(path.join(__dirname, '../client')))


// Dev 
// app.post(`/seed`, seed)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Online - ${port}`))