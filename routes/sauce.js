const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrol = require('../controllers/sauce');

router.post('/', auth, multer, sauceCtrol.createSauce);
router.put('/:id', auth, multer, sauceCtrol.updateSauce);
router.delete('/:id', auth, sauceCtrol.deleteSauce);
router.get('/:id', auth, sauceCtrol.getSauce);
router.get('/', auth, sauceCtrol.getAllSauce);

module.exports = router;