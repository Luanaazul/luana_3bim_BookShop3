const express = require('express');
const controller = require('../controllers/generoController');

const router = express.Router();

router.get('/', controller.listarGeneros);
router.get('/:id', controller.obterGenero);
router.post('/', controller.criarGenero);
router.put('/:id', controller.atualizarGenero);
router.delete('/:id', controller.excluirGenero);

module.exports = router;
