const db = require('../database');

async function listarGeneros(req, res) {
  try {
    const resultado = await db.query(
      'SELECT id_genero, nome_genero FROM generos ORDER BY id_genero'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os gêneros.' });
  }
}

async function obterGenero(req, res) {
  try {
    const resultado = await db.query(
      'SELECT id_genero, nome_genero FROM generos WHERE id_genero = $1',
      [req.params.id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o gênero.' });
  }
}

async function criarGenero(req, res) {
  const nome = typeof req.body.nome_genero === 'string'
    ? req.body.nome_genero.trim()
    : '';
  if (!nome) return res.status(400).json({ erro: 'O nome do gênero é obrigatório.' });

  try {
    const resultado = await db.query(
      'INSERT INTO generos (nome_genero) VALUES ($1) RETURNING *',
      [nome]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este gênero já existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o gênero.' });
  }
}

async function atualizarGenero(req, res) {
  const nome = typeof req.body.nome_genero === 'string'
    ? req.body.nome_genero.trim()
    : '';
  if (!nome) return res.status(400).json({ erro: 'O nome do gênero é obrigatório.' });

  try {
    const resultado = await db.query(
      'UPDATE generos SET nome_genero = $1 WHERE id_genero = $2 RETURNING *',
      [nome, req.params.id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este gênero já existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o gênero.' });
  }
}

async function excluirGenero(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM generos WHERE id_genero = $1 RETURNING id_genero',
      [req.params.id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ erro: 'Este gênero possui livros relacionados.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o gênero.' });
  }
}

module.exports = {
  listarGeneros,
  obterGenero,
  criarGenero,
  atualizarGenero,
  excluirGenero,
};
