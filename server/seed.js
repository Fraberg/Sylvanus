require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });

const db = require('./models');

const users = [
  { username: 'username', password: 'password' }
];

const missions = [
  {
    title: 'Construre une serre à la Quantinière',
    tags: ['Bricolage', 'Potager'],
    place: '2 la Quantinière, Vallières-Les-Grandes'
  }
];

const seed = async () => {
  try {
    await db.User.remove();
    console.log('DROP ALL USERS');

    await db.Mission.remove();
    console.log('DROP ALL MISSIONS');

    await Promise.all(
      users.map(async user => {
        const data = await db.User.create(user);
        await data.save();
      }),
    );
    console.log('CREATED USERS', JSON.stringify(users));

    await Promise.all(
      missions.map(async mission => {
        mission.tags = mission.tags.map(tag => ({ tag }));
        const data = await db.Mission.create(mission);
        const user = await db.User.findOne({ username: 'username' });
        data.user = user;
        user.missions.push(data._id);
        await user.save();
        await data.save();
      }),
    );
    console.log('CREATED MISSIONS', JSON.stringify(missions));
  } catch (err) {
    console.error(err);
  }
};

seed();