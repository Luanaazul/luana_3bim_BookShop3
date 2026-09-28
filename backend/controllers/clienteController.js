const db = require('../database');

function dadosValidos(renda, data) {
  return renda !== undefined && renda !== null && renda !== ''
    && Number.isFinite(Number(renda))
    && Number(renda) >= 0
    && typeof data === 'string'
    && data.trim() !== '';
}

const SELECT_CLIENTE = `
  SELECT
    c.pessoa_cpf_pessoa,
    p.nome_pessoa,
    c.renda_cliente,
    c.data_cadastro_cliente
  FROM clientes c
  JOIN pessoas p ON p.cpf_pessoa = c.pessoa_cpf_pessoa
`;

async function listarClientes(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_CLIENTE} ORDER BY p.nome_pessoa`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os clientes.' });
  }
}

async function obterCliente(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_CLIENTE} WHERE c.pessoa_cpf_pessoa = $1`,
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o cliente.' });
  }
}

async function criarCliente(req, res) {
  const { pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente } = req.body;

  if (!pessoa_cpf_pessoa || !dadosValidos(renda_cliente, data_cadastro_cliente)) {
    return res.status(400).json({
      erro: 'Pessoa, renda e data de cadastro são obrigatórios e válidos.',
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO clientes
       (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'A pessoa informada não existe.' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Esta pessoa já é cliente.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o cliente.' });
  }
}

async function atualizarCliente(req, res) {
  const { renda_cliente, data_cadastro_cliente } = req.body;

  if (!dadosValidos(renda_cliente, data_cadastro_cliente)) {
    return res.status(400).json({
      erro: 'Renda e data de cadastro são obrigatórios e válidos.',
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE clientes
       SET renda_cliente = $1, data_cadastro_cliente = $2
       WHERE pessoa_cpf_pessoa = $3
       RETURNING *`,
      [renda_cliente, data_cadastro_cliente, req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o cliente.' });
  }
}

async function excluirCliente(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM clientes WHERE pessoa_cpf_pessoa = $1 RETURNING pessoa_cpf_pessoa',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o cliente.' });
  }
}

module.exports = {
  listarClientes,
  obterCliente,
  criarCliente,
  atualizarCliente,
  excluirCliente,
};
