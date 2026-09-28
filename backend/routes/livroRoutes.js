const express = require('express');
const multer = require('multer');
const controller = require('../controllers/livroController');
const imagemController = require('../controllers/imagemController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/generos', controller.listarGeneros);
router.get('/', controller.listarLivros);
router.get('/:id', controller.obterLivro);
router.post('/', controller.criarLivro);
router.put('/:id', controller.atualizarLivro);
router.delete('/:id', controller.excluirLivro);
router.post('/:id/imagem', upload.single('imagem'), imagemController.uploadImagem);

module.exports = router;
