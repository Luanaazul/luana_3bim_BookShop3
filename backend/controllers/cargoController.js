const db = require('../database');

function validarNome(nome) {
  return typeof nome === 'string' && nome.trim().length > 0;
}

async function listarCargos(req, res) {
  try {
    const resultado = await db.query(
      'SELECT id_cargo, nome_cargo FROM cargos ORDER BY id_cargo'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os cargos.' });
  }
}

async function obterCargo(req, res) {
  try {
    const resultado = await db.query(
      'SELECT id_cargo, nome_cargo FROM cargos WHERE id_cargo = $1',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cargo não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o cargo.' });
  }
}

async function criarCargo(req, res) {
  const nome_cargo = typeof req.body.nome_cargo === 'string'
    ? req.body.nome_cargo.trim()
    : '';

  if (!validarNome(nome_cargo)) {
    return res.status(400).json({ erro: 'O nome do cargo é obrigatório.' });
  }

  try {
    const resultado = await db.query(
      'INSERT INTO cargos (nome_cargo) VALUES ($1) RETURNING id_cargo, nome_cargo',
      [nome_cargo]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este cargo já existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o cargo.' });
  }
}

async function atualizarCargo(req, res) {
  const nome_cargo = typeof req.body.nome_cargo === 'string'
    ? req.body.nome_cargo.trim()
    : '';

  if (!validarNome(nome_cargo)) {
    return res.status(400).json({ erro: 'O nome do cargo é obrigatório.' });
  }

  try {
    const resultado = await db.query(
      'UPDATE cargos SET nome_cargo = $1 WHERE id_cargo = $2 RETURNING id_cargo, nome_cargo',
      [nome_cargo, req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cargo não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este cargo já existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o cargo.' });
  }
}

async function excluirCargo(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM cargos WHERE id_cargo = $1 RETURNING id_cargo',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cargo não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        erro: 'Este cargo possui funcionários relacionados e não pode ser excluído.',
      });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o cargo.' });
  }
}

module.exports = {
  listarCargos,
  obterCargo,
  criarCargo,
  atualizarCargo,
  excluirCargo,
};
