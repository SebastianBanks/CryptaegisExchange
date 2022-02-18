const Sequelize = require('sequelize')
const { encrypt, decrypt } = require('./crypto.js')
require('dotenv').config()

const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    
})

module.exports = {
    createItem: (req, res) => {
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
        // based on certain filters return item if available
        // make sure to get the url for the item image
        // if no items, send a response that their are no matches
    },

    getNotAvailableItems: (req, res) => {
        // take in user id
        // return all unavailabe items owned by the user
        // if no items, send a response that their are no matches
    },

    deleteItem: (req, res) => {
        // get the item id
        // remove that item from the database
    },

    editItem: (req, res) => {
        // get the item id and new item details
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