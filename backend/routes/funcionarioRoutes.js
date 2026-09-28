const express = require('express');
const controller = require('../controllers/funcionarioController');

const router = express.Router();

router.get('/', controller.listarFuncionarios);
router.get('/:id', controller.obterFuncionario);
router.post('/', controller.criarFuncionario);
router.put('/:id', controller.atualizarFuncionario);
router.delete('/:id', controller.excluirFuncionario);

module.exports = router;
