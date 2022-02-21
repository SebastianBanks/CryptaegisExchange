const Sequelize = require('sequelize')
const { encrypt, decrypt } = require('./crypto.js')
require('dotenv').config()

const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
    
})

module.exports = {
    createItem: (req, res) => {
        const { price, description, item_name, product_size, owner_id, category_id, image1, image2, image3} = req.body

        sequelize.query(`
        INSERT INTO item(price, description, item_name, product_size, owner_id, category_id)
        VALUES(${price}, '${description}', '${item_name}', '${product_size}', ${owner_id}, ${category_id})
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))

        if (image1 !== undefined) {
            // send image to s3 and get url back
            sequelize.query(`
            INSERT INTO images(url_path, item_id)
            VALUES('URL', (SELECT item_id FROM item WHERE owner_id = ${owner_id} AND item_name = '${item_name}' AND price = ${price}));
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        }

        if (image2 !== undefined) {
            // send image to s3 and get url back
            sequelize.query(`
            INSERT INTO images(url_path, item_id)
            VALUES('URL', (SELECT item_id FROM item WHERE owner_id = ${owner_id} AND item_name = '${item_name}' AND price = ${price}));
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        }

        if (image3 !== undefined) {
            // send image to s3 and get url back
            sequelize.query(`
            INSERT INTO images(url_path, item_id)
            VALUES('URL', (SELECT item_id FROM item WHERE owner_id = ${owner_id} AND item_name = '${item_name}' AND price = ${price}));
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        }

        // get user id and make sure they have a wallet
        // double check user has a location and a phone number or email
        // if they don't have the items have them add this information to create item
        // get item info from frontEnd
        // add to the item table
        // add the image to s3
        // get the image url from s3 and save it to images table
    },

    getAvailableItems: (req, res) => {
        // take in filters if any
        const { searchBar, price} = req.body
        // based on certain filters return item if available
        if (searchBar === undefined && price === undefined) {
            sequelize.query(`
                SELECT * FROM item;
                WHERE item_is_available = true
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        } else if (searchBar !== undefined && price > 0) {
            sequelize.query(`
                SELECT * FROM item
                WHERE '${searchBar}' LIKE '%' || item_name || '%' 
                AND price <= ${price};
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        } else if (searchBar != undefined && price === undefined) {
            sequelize.query(`
                SELECT * FROM item
                WHERE '${searchBar}' LIKE '%' || item_name || '%';
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
        } else if (searchBar === undefined && price !== undefined) {
            sequelize.query(`
                SELECT * FROM item
                WHERE price <= ${price};
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
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