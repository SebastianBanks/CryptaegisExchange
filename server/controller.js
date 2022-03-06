const Sequelize = require('sequelize')
const { encrypt, decrypt } = require('./crypto.js')
require('dotenv').config()
const axios = require('axios')
const qs = require('qs')
const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
            require: true
        }
    }
})
let accessToken = ""
let refreshToken = ""
let SECERET = ""
let currentUser = 0
const { CLIENT_ID, CLIENT_SECRET, CRYPTO_SECERET } = process.env

let info = {
    i: "",
    n: "",
    e: "",
    s: ""

}

module.exports = {
    createItem: (req, res) => {
        const { item_price, item_title, item_desc, item_size, category_id, item_images} = req.body

        if (currentUser !== 0) {
            sequelize.query(`
                INSERT INTO item(item_price, item_title, item_description, item_size, owner_id, category_id)
                VALUES(${item_price}, '${item_title.toLowerCase()}', '${item_desc}', '${item_size}', ${currentUser}, ${category_id})
                RETURNING item_id;
            `)
            .then(item_id => {
                for (let i = 0; i < item_images.length; i++) {
                    if (item_images[i] !== undefined) {
                        sequelize.query(`
                            INSERT INTO images(image_url_path, item_id)
                            VALUES('${item_images[i]}', ${item_id[0][0]["item_id"]});
                        `)
                        .then(dbRes => res.status(200).send(dbRes[0]))
                        .catch(err => console.log(err))
                    } else {
                        console.log("undefined")
                    }
                }
            })
            .catch(err => console.log(err))

            console.log(item_images)
        } else {
            console.log('No current user')
            res.sendStatus(200)
        }
        
        
    },

    getItemImage: async (req, res) => {
        const { id } = req.params
        await sequelize.query(`
            SELECT image_url_path FROM images
            WHERE item_id = ${id}
            LIMIT 1;
        `)
        .then(dbRes => {
            res.status(200).send(dbRes[0])
        })
        .catch(err => console.log(err))
    },

    getAllItems: (req, res) => {
        sequelize.query(`
            SELECT * FROM item
            WHERE item_is_available = true;
        `)
        .then(dbRes => {
            res.status(200).send(dbRes[0])
        })
        .catch(err => console.log(err))
    },

    getFilteredItems: (req, res) => {
        // take in filters if any
        let { searchBar, price, location, category } = req.query

        console.log(searchBar)
        console.log(price)
        console.log(location)
        console.log(category)

        if (searchBar === "") {
            searchBar = undefined
        }
        if (price === "") {
            price = undefined
        }
        if (location === "") {
            location = undefined
        }
        category = Number(category)
        
        console.log(searchBar)
        console.log(price)
        console.log(location)
        console.log(category)
        // based on certain filters return item if available
        if (searchBar !== undefined  && price !== undefined && location !== undefined && category !== 0) {
            // nothing undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.item_price <= ${price} 
                AND u.user_location LIKE '${location}%'  
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @1: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price !== undefined && location !== undefined && category === 0) {
            // category undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.item_price <= ${price} 
                AND u.user_location LIKE '${location}%'  
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @2: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price !== undefined && location === undefined && category !== 0) {
            // location is empty
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.item_price <= ${price} 
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @3: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price === undefined && location !== undefined && category !== 0) {
            // price is undifind
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND u.user_location LIKE '${location}%'  
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @4: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price !== undefined && location !== undefined && category !== 0) {
            // sb undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE i.item_price <= ${price} 
                AND u.user_location LIKE '${location}%'  
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @5: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price !== undefined && location === undefined && category === 0) {
            // category & location undefind
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.item_price <= ${price}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @6: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price === undefined && location !== undefined && category === 0) {
            // category & price is undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE 'position('${searchBar}' in i.item_title)>0
                AND u.user_location LIKE '${location}%'
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @7: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price !== undefined && location !== undefined && category === 0) {
            // category & sb is undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE i.item_price <= ${price} 
                AND u.user_location LIKE '${location}%'
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @8: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price === undefined && location === undefined && category !== 0) {
            // location & price are undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @9: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price !== undefined && location === undefined && category !== 0) {
            // location & sb are undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id 
                AND i.item_price <= ${price}  
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @10: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price === undefined && location !== undefined && category !== 0) {
            // price and sb undefined
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE u.user_location LIKE '${location}%'  
                AND i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @11: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price === undefined && location === undefined && category !== 0) {
            //everything but category
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE i.category_id = ${category}
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @12: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price === undefined && location !== undefined && category === 0) {
            //everything but location
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE u.user_location LIKE '${location}%' 
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @13: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price !== undefined && location === undefined && category === 0) {
            // everything but price
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE i.item_price <= ${price} 
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @14: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar !== undefined && price === undefined && location === undefined && category === 0) {
            // everyting but search
            sequelize.query(`
                SELECT i.item_id, i.item_title, i.item_price, i.category_id, i.owner_id, i.item_is_available, u.user_id, u.user_location
                FROM item i
                JOIN user_account u
                ON i.owner_id = u.user_id
                WHERE position('${searchBar}' in i.item_title)>0
                AND i.item_is_available = true;
            `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
            })
            .catch(err => {
                console.log('ERROR @15: Filter Search')
                console.log(err)
                
            })
        } else if (searchBar === undefined && price === undefined && location === undefined && category === 0) {
            // everything is undefined
            sequelize.query(`
            SELECT * FROM item
            WHERE item_is_available = true;
        `)
        .then(dbRes => {
            res.status(200).send(dbRes[0])
        })
        .catch(err => {
            console.log('ERROR @16: Filter Search')
            console.log(err)
        })
        } else {
            console.log("error: condition not considered")
            sequelize.query(`
            SELECT * FROM item
            WHERE item_is_available = true;
        `)
        .then(dbRes => {
            console.log(`dbRes: ${dbRes[0]}`)
            res.status(200).send(dbRes[0])
        })
        .catch(err => {
            console.log('ERROR @17: Filter Search')
            console.log(err)
        })
        }
        

        
        // if no items, send a response that their are no matches
    },

    getNotAvailableItems: (req, res) => {
        // take in user id
        const id = req.params.id
        // return all unavailabe items owned by the user
        sequelize.query(`
            SELECT * FROM item
            WHERE owner_id = ${id} AND item_is_available = false;
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // if no items, send a response that their are no matches
    },

    deleteItem: (req, res) => {
        // get the item id
        const id = req.params.id

        sequelize.query(`
            DELETE FROM item
            WHERE item_id = ${id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // remove that item from the database
    },

    editItem: (req, res) => {
        // get the item id and new item details
        const { id, price, description, is_available, item_name, product_size, owner_id, category_id} = req.body

        // update the item to match the new item details
        sequelize.query(`
            UPDATE item
            SET item_price = ${price}, item_description = '${description}, item_is_available = ${is_available}, item_name = '${item_name}, item_size = '${product_size}, category_id = ${category_id}
            WHERE item_id = ${id} AND owner_id = ${owner_id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        
    },

    createUser: (req, res) => {
        // get the users id from coinbase api
        const encryptedId = encrypt(req.body.coinbase_id, CRYPTO_SECERET)
        const encryptedUserName = encrypt(req.body.user_name, CRYPTO_SECERET)
        const encryptedUserEmail = encrypt(req.body.user_email, CRYPTO_SECERET)
        const encryptedUserPhoneNumber = encrypt(req.body.user_phone_number, CRYPTO_SECERET)
        const encryptedUserLocation = encrypt(req.body.user_location, CRYPTO_SECERET)
        // get necassary data to create user

        const redir = { redirect: "/" }

        sequelize.query(`
            INSERT INTO user_account(user_name, user_email, user_phone_number, user_location)
            VALUES('${encryptedUserName}', '${encryptedUserEmail}', '${encryptedUserPhoneNumber}', '${encryptedUserLocation}')
            RETURNING user_id;
        `)
        .then(user_id => {
            currentUser = user_id[0][0]["user_id"]
            sequelize.query(`
                INSERT INTO coinbase_connect(coinbase_connect_user_id, user_id)
                VALUES('${encryptedId}', ${user_id[0][0]["user_id"]});
            `)
            console.log("2nd redirect")
            res.status(200).send(redir)
        })
            

    },

    // checkForUser: (req, res) => {
    //     const { id, name, email, location } = req.query

    //     sequelize.query(`
    //         SELECT * FROM coinbase_connect
    //         RETURNING coinbase_connect_id;
    //     `)
    //     .then(coinbase_id => {
    //         console.log(coinbase_id[0])
    //         // const coin_id = decrypt(coinbase_id[0][0]["coinbase_connect_id"], CRYPTO_SECERET)
    //         // console.log(coin_id)
    //         // sequelize.query(`
    //         //     SELECT * FROM coinbase_connect
    //         //     WHERE '${id} = '${coin_id}';
    //         // `)
    //         // .then(dbRes => {
    //         //     console.log('Check for user ----------------')
    //         //     console.log(dbRes[0])
    //         //     console.log('-------------------------------')
    //         //     res.status(200).send(dbRes[0])
    //         // })
    //         // .catch(err => console.log(err))
    //         res.status(200).send(coinbase_id[0][0])
    //     })
    //     .catch(err => console.log(err))
    // },

    deleteUser: (req, res) => {
        // get user id
        const id = req.params.id
        // delete all items associated with that id
        sequelize.query(`
            DELETE FROM images
            WHERE item_id = (SELECT item_id FROM item WHERE owner_id = ${id});

            DELETE FROM saved_items
            WHERE user_id = ${id};

            DELETE FROM item
            WHERE owner_id = ${id};

            DELETE FROM coinbase_connect
            WHERE user_id = ${id};

            DELETE FROM reliability_score
            WHERE user_id = ${id};

            DELETE FROM user_account
            WHERE user_id = ${id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // delete images with item id's
        // delete wallet
        // delete saved_items
        // delete reliability_score
        // delete user
    },

    editUser: (req, res) => {
        // get user's id and new info
        const { user_id, user_name, user_email, user_phone_number, user_location, user_age} = req.body
        // update the user in the database
        sequelize.query(`
            UPDATE user_account
            SET user_name = '${user_name}', user_email = '${user_email}', user_phone_number = '${user_phone_number}', user_location = '${user_location}', user_age = ${user_age}
            WHERE user_id = ${user_id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        
    },

    addReliabilityScore: (req, res) => {
        const { reliability_score, user_id } = req.body
        // get user id and score
        sequelize.query(`
            INSERT INTO reliability_score(reliability_score, user_id)
            VALUES(${reliability_score}, ${user_id});
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // add that to the database
    },

    getReliabilityScore: (req, res) => {
        const id = req.params.id
        // get user id
        sequelize.query(`
            SELECT AVG(reliability_score) FROM reliability_score
            WHERE user_id = ${id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // return the average score for that id
        // if no scores exist then send no score yet
    },

    getSavedItems: (req, res) => {
        // get user id
        const id = req.body.id
        // send back all saved items with corresponding user id
        sequelize.query(`
            SELECT * FROM saved_items
            WHERE user_id = ${id};
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },

    addSavedItems: (req, res) => {
        // get user id and item id
        const { user_id, item_id } = req.body
        // add that to the saved_items table
        sequelize.query(`
            INSERT INTO saved_items(item_id, user_id)
            VALUES(${item_id, user_id});
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },

    deleteSavedItem: (req, res) => {
        // get saved item id
        const id = req.params.id
        // remove it from the saved items table
        sequelize.query(`
            DELETE FROM saved_items
            WHERE saved_item_id = ${id}
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },

    generateKey: (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    },

    getFormData: (req, res) => {
        const body = {
            i: decrypt(info.i, CRYPTO_SECERET),
            n: decrypt(info.n, CRYPTO_SECERET),
            e: decrypt(info.e, CRYPTO_SECERET),
            s: decrypt(info.s, CRYPTO_SECERET)
        }

        res.status(200).send(body)
    },

    returnIsSignedIn: (req, res) => {
        if (accessToken === "") {
            res.status(200).send(false)
        } else {
            res.status(200).send(true)
        }
    },

    // ------------ Coinbase ---------------------

    getUrlLink: (req, res) => {
        SECERET = module.exports.generateKey(20)
        let keys = {
            client: process.env.CLIENT_ID,
            sec: SECERET,
            url: "https://cryptaegis-exchange.herokuapp.com/callback",
            scope: "wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:transactions:read&account=all,wallet:transactions:transfer, wallet:transactions:read"
        }
        res.status(200).send(keys)
    },

    coinbaseCallback: async (req, res) => {
        const {code, state} = req.query;
        if (state === SECERET) {
            const data = qs.stringify({
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'redirect_uri': "https://cryptaegis-exchange.herokuapp.com/callback"
            });
    
            try {
                await axios.post('https://api.coinbase.com/oauth/token', data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(response => {
                    accessToken = response.data.access_token
                    refreshToken = response.data.refresh_token
                    res.redirect('/user')
                    
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
    
        } else {
            console.log("keys don't match")
            res.redirect("/")
        }
    },

    getCoinbaseUser: (req, res) => {
        axios.get("https://api.coinbase.com/v2/user", {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'CB-VERSION': ' 2019-05-13'
            }
        })
        .then( async response => {
            // const id = response.data.data.id
            const encryptedId = encrypt(await response.data.data.id, CRYPTO_SECERET)
            const id = await response.data.data.id
            const name = encrypt(await response.data.data.name, CRYPTO_SECERET)
            const email = encrypt(await response.data.data.email, CRYPTO_SECERET)
            const state = encrypt(await response.data.data.state, CRYPTO_SECERET)

            info.i = encryptedId
            info.n = name
            info.e = email
            info.s = state

            sequelize.query(`
                SELECT coinbase_connect_user_id FROM coinbase_connect
            `)
            .then(coinbase_id => {
                const arrLength = coinbase_id[0].length
                for (let i = 0; i < arrLength; i++) {
                    if (decrypt(coinbase_id[0][i]["coinbase_connect_user_id"], CRYPTO_SECERET) === decrypt(encryptedId, CRYPTO_SECERET)) {
                        sequelize.query(`
                            SELECT user_id FROM coinbase_connect
                            WHERE coinbase_connect_user_id = '${coinbase_id[0][i]["coinbase_connect_user_id"]}'
                        `)
                        .then(user_id => {
                            console.log("already a user")
                            currentUser = user_id[0][0]["user_id"]
                            console.log(`User is: ${currentUser}`)
                            res.redirect("/")
                        })
                        .catch(err => {
                            console.log(`There was an error redirecting the current user: ${err}`)
                        })
                    }
                }
                console.log(currentUser)
                if (currentUser === 0) {
                    res.redirect("/signUp")
                } else {
                    res.redirect("/")
                }
            })
            .catch(err => {
                console.log(`there was an error redirecting the user 2 ${err}`)
            })
        })
        .catch(err => {
            console.log(`Could not get user: ${err}`)
        })
    },

    getCoinbaseAccount: async (req, res) => {
        axios.get('https://api.coinbase.com/v2/accounts', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'CB-VERSION': ' 2019-05-13'
            }
        })
        .then(response => {
            res.send({ response: response?.data })
        })
        .catch(err => {
            console.log(`Could not get accounts: ${err}`)
        })
    },

    coinbaseTransaction: async (req, res) => {
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
                'Authorization': `Bearer ${accessToken}`,
                'CB-VERSION': ' 2019-05-13'
            }
        })
        .send(response => {
            res.send({ response: response?.data })
        })
        .catch(err => {
            console.log(`Their was an error with this transaction: ${err}`)
        })
    }
    // -------------------------------------------
}