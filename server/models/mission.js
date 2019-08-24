const mongoose = require('mongoose');
const User = require('./user');

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true
    }, 
    created: {
        type: Date,
        default: Date.now,
    },
    updated: {
        type: Date,
        default: Date.now,
    },
  });

const missionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    created: {
        type: Date,
        default: Date.now,
    },
    updated: {
        type: Date,
        default: Date.now,
    },
    title: {
        type: String,
        required: true
    },
    tags: [tagSchema],
    place: {
        type: String,
        required: true
    }
});

missionSchema.pre('remove', async function(next) {
  try {
    const user = await User.findById(this.user);
    user.missions = user.missions.filter(
      mission => mission._id.toString() !== this._id.toString(),
    );
    await user.save();
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('Mission', missionSchema);