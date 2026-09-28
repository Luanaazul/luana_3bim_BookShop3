const db = require('../database');

const SELECT_LANCAMENTO = `
  SELECT
    la.id_lancamento,
    la.livro_id_livro,
    l.titulo,
    la.pais_lancamento,
    la.data_lancamento
  FROM lancamentos la
  JOIN livros l ON l.id_livro = la.livro_id_livro
`;

function validarDados(dados) {
  const livro = Number(dados.livro_id_livro);
  return Number.isInteger(livro)
    && livro > 0
    && typeof dados.pais_lancamento === 'string'
    && dados.pais_lancamento.trim() !== ''
    && typeof dados.data_lancamento === 'string'
    && dados.data_lancamento.trim() !== '';
}

async function listarLancamentos(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_LANCAMENTO} ORDER BY la.id_lancamento`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os lançamentos.' });
  }
}

async function obterLancamento(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_LANCAMENTO} WHERE la.id_lancamento = $1`,
      [req.params.id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o lançamento.' });
  }
}

async function criarLancamento(req, res) {
  const idLancamento = Number(req.body.id_lancamento);

  if (!Number.isInteger(idLancamento) || idLancamento < 1) {
    return res.status(400).json({ erro: 'Informe um ID de lançamento válido.' });
  }

  if (!validarDados(req.body)) {
    return res.status(400).json({ erro: 'Livro, país e data são obrigatórios.' });
  }

  const livro = Number(req.body.livro_id_livro);
  const pais = req.body.pais_lancamento.trim();
  const data = req.body.data_lancamento;

  try {
    const resultado = await db.query(
      `INSERT INTO lancamentos
       (id_lancamento, livro_id_livro, pais_lancamento, data_lancamento)
       VALUES ($1, $2, $3, $4)
       RETURNING id_lancamento, livro_id_livro, pais_lancamento, data_lancamento`,
      [idLancamento, livro, pais, data]
    );

    // Como o ID é SERIAL, ajusta a sequência para o próximo cadastro automático
    // não tentar reutilizar um ID que foi informado manualmente.
    await db.query(`
      SELECT setval(
        pg_get_serial_sequence('lancamentos', 'id_lancamento'),
        (SELECT MAX(id_lancamento) FROM lancamentos),
        true
      )
    `);

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint === 'lancamentos_pkey') {
        return res.status(409).json({ erro: 'Este ID de lançamento já está cadastrado.' });
      }
      return res.status(409).json({ erro: 'Este livro já possui um lançamento.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'O livro selecionado não existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o lançamento.' });
  }
}

async function atualizarLancamento(req, res) {
  if (!validarDados(req.body)) {
    return res.status(400).json({ erro: 'Livro, país e data são obrigatórios.' });
  }

  const livro = Number(req.body.livro_id_livro);
  const pais = req.body.pais_lancamento.trim();
  const data = req.body.data_lancamento;

  try {
    const resultado = await db.query(
      `UPDATE lancamentos
       SET livro_id_livro = $1,
           pais_lancamento = $2,
           data_lancamento = $3
       WHERE id_lancamento = $4
       RETURNING id_lancamento, livro_id_livro, pais_lancamento, data_lancamento`,
      [livro, pais, data, req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este livro já possui outro lançamento.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'O livro selecionado não existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o lançamento.' });
  }
}

async function excluirLancamento(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM lancamentos WHERE id_lancamento = $1 RETURNING id_lancamento',
      [req.params.id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o lançamento.' });
  }
}

module.exports = {
  listarLancamentos,
  obterLancamento,
  criarLancamento,
  atualizarLancamento,
  excluirLancamento,
};
