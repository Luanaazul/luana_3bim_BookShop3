const express = require('express');
const controller = require('../controllers/lancamentoController');

const router = express.Router();

router.get('/', controller.listarLancamentos);
router.get('/:id', controller.obterLancamento);
router.post('/', controller.criarLancamento);
router.put('/:id', controller.atualizarLancamento);
router.delete('/:id', controller.excluirLancamento);

module.exports = router;
