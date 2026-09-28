const db = require('../database');

function dadosValidos(salario, cargo, comissao) {
  return salario !== undefined && salario !== null && salario !== ''
    && Number.isFinite(Number(salario))
    && Number(salario) >= 0
    && Number.isInteger(Number(cargo))
    && Number(cargo) > 0
    && comissao !== undefined && comissao !== null && comissao !== ''
    && Number.isFinite(Number(comissao))
    && Number(comissao) >= 0
    && Number(comissao) <= 100;
}

const SELECT_FUNCIONARIO = `
  SELECT
    f.pessoa_cpf_pessoa,
    p.nome_pessoa,
    f.salario_funcionario,
    f.cargo_id_cargo,
    c.nome_cargo,
    f.porcentagem_comissao_funcionario
  FROM funcionarios f
  JOIN pessoas p ON p.cpf_pessoa = f.pessoa_cpf_pessoa
  JOIN cargos c ON c.id_cargo = f.cargo_id_cargo
`;

async function listarFuncionarios(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_FUNCIONARIO} ORDER BY p.nome_pessoa`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os funcionários.' });
  }
}

async function obterFuncionario(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_FUNCIONARIO} WHERE f.pessoa_cpf_pessoa = $1`,
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o funcionário.' });
  }
}

async function criarFuncionario(req, res) {
  const {
    pessoa_cpf_pessoa,
    salario_funcionario,
    cargo_id_cargo,
    porcentagem_comissao_funcionario,
  } = req.body;

  if (!pessoa_cpf_pessoa || !dadosValidos(
    salario_funcionario,
    cargo_id_cargo,
    porcentagem_comissao_funcionario
  )) {
    return res.status(400).json({
      erro: 'Pessoa, salário, cargo e comissão devem ser válidos.',
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO funcionarios
       (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        pessoa_cpf_pessoa,
        salario_funcionario,
        cargo_id_cargo,
        porcentagem_comissao_funcionario,
      ]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'A pessoa ou cargo informado não existe.' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Esta pessoa já é funcionário.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o funcionário.' });
  }
}

async function atualizarFuncionario(req, res) {
  const {
    salario_funcionario,
    cargo_id_cargo,
    porcentagem_comissao_funcionario,
  } = req.body;

  if (!dadosValidos(
    salario_funcionario,
    cargo_id_cargo,
    porcentagem_comissao_funcionario
  )) {
    return res.status(400).json({
      erro: 'Salário, cargo e comissão devem ser válidos.',
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE funcionarios
       SET salario_funcionario = $1,
           cargo_id_cargo = $2,
           porcentagem_comissao_funcionario = $3
       WHERE pessoa_cpf_pessoa = $4
       RETURNING *`,
      [
        salario_funcionario,
        cargo_id_cargo,
        porcentagem_comissao_funcionario,
        req.params.id,
      ]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'O cargo informado não existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o funcionário.' });
  }
}

async function excluirFuncionario(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM funcionarios WHERE pessoa_cpf_pessoa = $1 RETURNING pessoa_cpf_pessoa',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o funcionário.' });
  }
}

module.exports = {
  listarFuncionarios,
  obterFuncionario,
  criarFuncionario,
  atualizarFuncionario,
  excluirFuncionario,
};
