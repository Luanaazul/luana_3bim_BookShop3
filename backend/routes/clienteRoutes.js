const express = require('express');
const controller = require('../controllers/clienteController');

const router = express.Router();

router.get('/', controller.listarClientes);
router.get('/:id', controller.obterCliente);
router.post('/', controller.criarCliente);
router.put('/:id', controller.atualizarCliente);
router.delete('/:id', controller.excluirCliente);

module.exports = router;
