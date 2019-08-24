const router = require('express').Router();
const handle = require('../handlers');
const auth = require('../middleware/auth');

router
  .route('/')
  .get(handle.showMissions)
  .post(auth, handle.createMission);

router.get('/user', auth, handle.usersMissions);

router
  .route('/:id')
  .get(handle.getMission)
  // .post(auth, handle.vote)
  .delete(auth, handle.deleteMission);

module.exports = router;