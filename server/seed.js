require('dotenv').config()
const {CONNECTION_STRING} = process.env
const Sequelize = require('sequelize')

// you wouldn't want to rejectUnauthorized in a production app, but it's great for practice
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    seed: (req, res) => {
        sequelize.query(`
        DROP TABLE IF EXISTS user_account CASCADE;
        DROP TABLE IF EXISTS category CASCADE;
        DROP TABLE IF EXISTS item CASCADE;
        DROP TABLE IF EXISTS reliability_score CASCADE;
        DROP TABLE IF EXISTS coinbase_connect CASCADE;
        DROP TABLE IF EXISTS images CASCADE;
        DROP TABLE IF EXISTS saved_items CASCADE;


        CREATE TABLE user_account(
            user_id SERIAL PRIMARY KEY,
            user_name VARCHAR(150) NOT NULL ,
            user_email VARCHAR(150) NOT NULL,
            user_phone_number VARCHAR(150) NOT NULL,
            user_location VARCHAR(150) NOT NULL
          );
                  
          CREATE TABLE category(
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL
          );
                  
          CREATE TABLE item(
            item_id SERIAL PRIMARY KEY,
            item_price FLOAT NOT NULL,
            item_title VARCHAR(50) NOT NULL,
            item_description VARCHAR(3000) NOT NULL,
            item_is_available BOOLEAN DEFAULT TRUE,
            item_size VARCHAR(1000) NOT NULL,
            owner_id INTEGER REFERENCES user_account(user_id),
            category_id INTEGER REFERENCES category(category_id)
          );
                 
          CREATE TABLE reliability_score(
            reliability_score_id SERIAL PRIMARY KEY,
            reliability_score INTEGER NOT NULL,
            user_id INTEGER REFERENCES user_account(user_id)
          );
          
          CREATE TABLE coinbase_connect(
            coinbase_connect_id SERIAL PRIMARY KEY,
            coinbase_connect_user_id VARCHAR(500) NOT NULL,
            user_id INTEGER REFERENCES user_account(user_id)
          );
          
          CREATE TABLE images(
            image_id SERIAL PRIMARY KEY,
            image_url_path VARCHAR(200) NOT NULL,
            item_id INTEGER REFERENCES item(item_id)
          );
          
          CREATE TABLE saved_items(
            saved_item_id SERIAL PRIMARY KEY,
            item_id INTEGER REFERENCES item(item_id),
            user_id INTEGER REFERENCES user_account(user_id)
          );
          
          INSERT INTO category(category_name)
          VALUES ('Appliances'), ('Art'),
          ('Auto Parts & Accessories'), ('Baby'), 
          ('Books & Media'), ('Clothings & Appareal'), 
          ('Cycling'), ('Electronics'), 
          ('Fitness Equipment'), ('Furniture'),
          ('General'), ('Home & Garden'), 
          ('Hunting & Fishing'), ('Musical Instruments'),
          ('Outdoors & Sporting'), ('Pets'), 
          ('Recreational Vehicles'), ('Toys'), ('Cookware');


        `)
        console.log('seeded')
    }
}