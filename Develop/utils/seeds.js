require('dotenv').config();
const connection = require('../config/connection');
const { User, Thoughts } = require('../models');

// import { faker } from '@faker-js/faker';
const { faker, userName, email, internet} = require('@faker-js/faker');


connection.on('error', (err) => err);

connection.once('open', async () => {
    console.log('connected to database');
    //delete the collections if they exist
    let userCheck = await connection.db.listCollections({ name: 'users' }).toArray();
    if (userCheck.length !== 0) {
        await connection.dropCollection('users');
    }

    let thoughtCheck = await connection.db.listCollections({ name: 'thoughts' }).toArray();
    if (thoughtCheck.length !== 0) {
        await connection.dropCollection('thoughts');
    }

    const users = [];

    for (let i = 0; i < 15; i++) {
        let username = faker.internet.userName();
        let Email = faker.internet.email();

        users.push({ username, Email }); 
    }

    await User.collection.insertMany(users);

    const thoughts = [];

    //generate faker thoughts for each user that was seeded
    for (let i = 0; i < 11; i++) {
        const thoughtText = faker.lorem.words(Math.round(Math.random() * 10) + 1);
        const username = users[i]
    
        thoughts.push({ thoughtText, username });
    }

    await Thoughts.collection.insertMany(thoughts);

    const friends = [];

    for (let i = 0; i < 10; i++) {
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const following = users[i]

        friends.push({ username, email, following });
    }

    await User.collection.insertMany(friends);

    console.table(users);
    // console.table(thoughts);
    // console.table(friends);
    console.info('Seeding complete! 🌱')
    process.exit(0);
});