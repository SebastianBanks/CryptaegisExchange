const Sequelize = require('sequelize')
const { encrypt, decrypt } = require('./crypto.js')
require('dotenv').config()


const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
            require: true
        }
    }
})

module.exports = {
    createItem: (req, res) => {
        const { item_price, item_title, item_desc, item_size, owner_id, category_id, item_images} = req.body
        
        sequelize.query(`
        INSERT INTO item(item_price, item_title, item_description, item_size, owner_id, category_id)
        VALUES(${item_price}, '${item_title.toLowerCase()}', '${item_desc}', '${item_size}', ${owner_id}, ${category_id})
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
        const { coinbase_id, user_name, user_email, user_phone_number, user_location, user_age} = req.body
        // get necassary data to create user
        sequelize.query(`
            INSERT INTO user_account(user_name, user_email, user_phone_number, user_location, user_age)
            VALUES('${user_name}', '${user_email}', '${user_phone_number}', '${user_location}', ${user_age});

            INSERT INTO coinbase_connect(coinbase_connect_user_id, user_id)
            VALUES('${coinbase_id}', (SELECT user_id FROM user_account WHERE user_name = '${user_name}' AND user_email = '${user_email}' AND user_phone_number = '${user_phone_number}' AND user_age = ${user_age}))
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
        // add user to database
        // add user wallet to database
        // make sure this information is encrypted
    },

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
}