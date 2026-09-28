const db = require('../database');

/*
==================================================
CAMPOS DA TABELA PESSOAS
==================================================
*/

const CAMPOS_PESSOA = `
  cpf_pessoa,
  nome_pessoa,
  data_nascimento_pessoa,
  endereco_pessoa,
  senha_pessoa,
  email_pessoa
`;

/*
==================================================
VALIDAÇÃO
==================================================
*/

function dadosValidos(dados) {
  const camposObrigatorios = [
    'cpf_pessoa',
    'nome_pessoa',
    'data_nascimento_pessoa',
    'endereco_pessoa',
    'senha_pessoa',
    'email_pessoa'
  ];

  return camposObrigatorios.every(
    (campo) =>
      dados[campo] !== undefined &&
      dados[campo] !== null &&
      String(dados[campo]).trim() !== ''
  );
}

/*
==================================================
LISTAR TODAS AS PESSOAS
GET /pessoas
==================================================
*/

async function listarPessoas(req, res) {
  try {
    const resultado = await db.query(`
      SELECT
        ${CAMPOS_PESSOA}
      FROM pessoas
      ORDER BY nome_pessoa
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error('Erro ao listar pessoas:', error.message);

    res.status(500).json({
      erro: 'Não foi possível listar as pessoas.'
    });
  }
}

/*
==================================================
OBTER UMA PESSOA
GET /pessoas/:id
==================================================
*/

async function obterPessoa(req, res) {
  const cpf = req.params.id;

  try {
    const resultado = await db.query(
      `
      SELECT
        ${CAMPOS_PESSOA}
      FROM pessoas
      WHERE cpf_pessoa = $1
      `,
      [cpf]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Pessoa não encontrada.'
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error('Erro ao obter pessoa:', error.message);

    res.status(500).json({
      erro: 'Não foi possível obter a pessoa.'
    });
  }
}

/*
==================================================
CADASTRAR PESSOA
POST /pessoas
==================================================
*/

async function criarPessoa(req, res) {
  if (!dadosValidos(req.body)) {
    return res.status(400).json({
      erro: 'Todos os dados da pessoa são obrigatórios.'
    });
  }

  const {
    cpf_pessoa,
    nome_pessoa,
    data_nascimento_pessoa,
    endereco_pessoa,
    senha_pessoa,
    email_pessoa
  } = req.body;

  try {
    const resultado = await db.query(
      `
      INSERT INTO pessoas (
        cpf_pessoa,
        nome_pessoa,
        data_nascimento_pessoa,
        endereco_pessoa,
        senha_pessoa,
        email_pessoa
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${CAMPOS_PESSOA}
      `,
      [
        cpf_pessoa.trim(),
        nome_pessoa.trim(),
        data_nascimento_pessoa,
        endereco_pessoa.trim(),
        senha_pessoa,
        email_pessoa.trim()
      ]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    if (error.code === '23505') {
      return res.status(409).json({
        erro: 'CPF ou email já cadastrado.'
      });
    }

    console.error('Erro ao cadastrar pessoa:', error.message);

    res.status(500).json({
      erro: 'Não foi possível cadastrar a pessoa.'
    });
  }
}

/*
==================================================
ALTERAR PESSOA
PUT /pessoas/:id
==================================================
*/

async function atualizarPessoa(req, res) {
  const cpf = req.params.id;

  const {
    nome_pessoa,
    data_nascimento_pessoa,
    endereco_pessoa,
    senha_pessoa,
    email_pessoa
  } = req.body;

  if (
    !nome_pessoa ||
    !data_nascimento_pessoa ||
    !endereco_pessoa ||
    !senha_pessoa ||
    !email_pessoa
  ) {
    return res.status(400).json({
      erro: 'Todos os dados da pessoa são obrigatórios.'
    });
  }

  try {
    const resultado = await db.query(
      `
      UPDATE pessoas
      SET
        nome_pessoa = $1,
        data_nascimento_pessoa = $2,
        endereco_pessoa = $3,
        senha_pessoa = $4,
        email_pessoa = $5
      WHERE cpf_pessoa = $6
      RETURNING ${CAMPOS_PESSOA}
      `,
      [
        nome_pessoa.trim(),
        data_nascimento_pessoa,
        endereco_pessoa.trim(),
        senha_pessoa,
        email_pessoa.trim(),
        cpf
      ]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Pessoa não encontrada.'
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {

    if (error.code === '23505') {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.'
      });
    }

    console.error('Erro ao alterar pessoa:', error.message);

    res.status(500).json({
      erro: 'Não foi possível alterar a pessoa.'
    });
  }
}

/*
==================================================
EXCLUIR PESSOA
DELETE /pessoas/:id
==================================================

A pessoa pode possuir um registro relacionado
em clientes ou funcionarios.

Por isso o banco pode impedir a exclusão enquanto
esses registros existirem.

O frontend deve excluir primeiro o relacionamento
e depois a pessoa.
==================================================
*/

async function excluirPessoa(req, res) {
  const cpf = req.params.id;

  try {
    const resultado = await db.query(
      `
      DELETE FROM pessoas
      WHERE cpf_pessoa = $1
      RETURNING cpf_pessoa
      `,
      [cpf]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Pessoa não encontrada.'
      });
    }

    res.status(204).send();

  } catch (error) {

    /*
    Código PostgreSQL 23503:
    violação de chave estrangeira.
    */

    if (error.code === '23503') {
      return res.status(409).json({
        erro:
          'A pessoa possui cliente ou funcionário relacionado. ' +
          'Exclua o relacionamento primeiro.'
      });
    }

    console.error('Erro ao excluir pessoa:', error.message);

    res.status(500).json({
      erro: 'Não foi possível excluir a pessoa.'
    });
  }
}

/*
==================================================
EXPORTAÇÃO
==================================================
*/

module.exports = {
  listarPessoas,
  obterPessoa,
  criarPessoa,
  atualizarPessoa,
  excluirPessoa
};