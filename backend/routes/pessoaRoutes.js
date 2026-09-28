const express = require('express');
const controller = require('../controllers/pessoaController');

const router = express.Router();

router.get('/', controller.listarPessoas);
router.get('/:id', controller.obterPessoa);
router.post('/', controller.criarPessoa);
router.put('/:id', controller.atualizarPessoa);
router.delete('/:id', controller.excluirPessoa);

module.exports = router;
