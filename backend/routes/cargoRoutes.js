const express = require('express');
const controller = require('../controllers/cargoController');

const router = express.Router();

router.get('/', controller.listarCargos);
router.get('/:id', controller.obterCargo);
router.post('/', controller.criarCargo);
router.put('/:id', controller.atualizarCargo);
router.delete('/:id', controller.excluirCargo);

module.exports = router;
