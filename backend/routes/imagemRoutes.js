const express = require('express');
const multer = require('multer');
const controller = require('../controllers/imagemController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/livro/:id', upload.single('imagem'), controller.uploadImagem);

module.exports = router;
