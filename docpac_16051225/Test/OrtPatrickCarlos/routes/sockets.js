const express = require('express');
const router = express.Router();
const userLayout = require('../modules/userLayout');

router.get('/', (req, res) => {
  const layout = userLayout.getLayoutData(req.session.user);
  res.render('sockets', layout);
});

module.exports = router;
