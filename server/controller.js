const Sequelize = require('sequelize')
const { encrypt, decrypt } = require('./crypto.js')
require('dotenv').config()

const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    
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
        const id = req.params.is
        // return all unavailabe items owned by the user
        // if no items, send a response that their are no matches
    },

    deleteItem: (req, res) => {
        // get the item id
        const id = req.params.id
        // remove that item from the database
    },

    editItem: (req, res) => {
        // get the item id and new item details
        const { id, price, description, is_available, item_name, product_size, owner_id, category_id} = req.body

        // update the item to match the new item details
    },

    createUser: (req, res) => {
        // get the users id from coinbase api
        // get necassary data to create user
        // add user to database
        // add user wallet to database
        // make sure this information is encrypted
    },

    deleteUser: (req, res) => {
        // get user id
        // delete all items associated with that id
        // delete images with item id's
        // delete wallet
        // delete saved_items
        // delete reliability_score
        // delete user
    },

    editUser: (req, res) => {
        // get user's id and new info
        // update the user in the database
    },

    addReliabilityScore: (req, res) => {
        // get user id and score
        // add that to the database
    },

    getReliabilityScore: (req, res) => {
        // get user id
        // return the average score for that id
        // if no scores exist then send no score yet
    },

    getSavedItems: (req, res) => {
        // get user id
        // send back all saved items with corresponding user id
    },

    addSavedItems: (req, res) => {
        // get user id and item id
        // add that to the saved_items table
    },

    deleteSavedItem: (req, res) => {
        // get saved item id
        // remove it from the saved items table
    },
}