const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.array('files', 10), (req, res) => imageController.uploadImage(req, res));
router.post('/upload/single', upload.single('file'), (req, res) => imageController.uploadImage(req, res));
router.delete('/:fileName', (req, res) => imageController.deleteImage(req, res));
router.get('/', (req, res) => imageController.getImages(req, res));

module.exports = router; 