const db = require('../models');

exports.showMissions = async (req, res, next) => {
  try {
    const missions = await db.Mission.find().populate('user', ['username', 'id']);
    // .populate('voted', ['username', 'id']);

    return res.status(200).json(missions);
  } catch (err) {
    return next({
      status: 400,
      message: err.message,
    });
  }
};

exports.usersMissions = async (req, res, next) => {
  const { id } = req.decoded;
  try {
    const user = await db.User.findById(id).populate('missions');
    return res.status(200).json(user.missions);
  } catch (err) {
    return next({
      status: 400,
      message: err.message,
    });
  }
};

exports.createMission = async (req, res, next) => {
  const { id } = req.decoded;
  const { question, options } = req.body;
  try {
    const user = await db.User.findById(id);
    const mission = await db.Mission.create({
      question,
      user,
      options: options.map(option => ({ option, votes: 0 })),
    });
    user.missions.push(mission._id);
    await user.save();

    return res.status(201).json({ ...mission._doc, user: user._id });
  } catch (err) {
    return next({
      status: 400,
      message: err.message,
    });
  }
};

// exports.vote = async (req, res, next) => {
//   const { id: missionId } = req.params;
//   const { id: userId } = req.decoded;
//   const { answer } = req.body;
//   try {
//     if (answer) {
//       const mission = await db.Mission.findById(missionId);
//       if (!mission) throw new Error('No mission found');

//       const vote = mission.options.map(
//         option =>
//           option.option === answer
//             ? {
//                 option: option.option,
//                 _id: option._id,
//                 votes: option.votes + 1,
//               }
//             : option,
//       );

//       console.log('VOTE: USERID ', userId);
//       console.log('VOTE: mission.voted ', mission.voted);
//       console.log(
//         'VOTE: vote filter',
//         mission.voted.filter(user => user.toString() === userId).length,
//       );

//       if (mission.voted.filter(user => user.toString() === userId).length <= 0) {
//         mission.voted.push(userId);
//         mission.options = vote;
//         await mission.save();

//         return res.status(202).json(mission);
//       } else {
//         throw new Error('Already voted');
//       }
//     } else {
//       throw new Error('No Answer Provided');
//     }
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };

exports.getMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mission = await db.Mission.findById(id).populate('user', [
      'username',
      'id',
    ]);
    // .populate('voted', ['username', 'id']);
    if (!mission) throw new Error('No mission found');
    return res.status(200).json(mission);
  } catch (err) {
    return next({
      status: 400,
      message: err.message,
    });
  }
};

exports.deleteMission = async (req, res, next) => {
  const { id: missionId } = req.params;
  const { id: userId } = req.decoded;
  try {
    let user = await db.User.findById(userId)
    if(user.missions) { // not sure if necessary either...
      user.missions = user.missions.filter(userMission => {
        return userMission._id.toString() !== missionId.toString() // not sure if necessary to use toString()
      })
    }
    
    const mission = await db.Mission.findById(missionId);
    if (!mission) throw new Error('No mission found');
    if (mission.user.toString() !== userId) {
      throw new Error('Unauthorized access');
    }
    await user.save()
    await mission.remove();
    return res.status(202).json({ mission, deleted: true });
  } catch (err) {
    return next({
      status: 400,
      message: err.message,
    });
  }
};