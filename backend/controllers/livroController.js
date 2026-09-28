const db = require('../database');
const fs = require('fs');
const path = require('path');

const PASTA_IMAGENS_LIVROS = path.resolve(__dirname, '../../imagens/livros');

const SELECT_LIVRO = `
  SELECT
    l.id_livro,
    l.titulo,
    l.autor,
    l.isbn,
    l.editora,
    l.paginas,
    l.ano,
    l.sinopse,
    l.preco,
    l.estoque,
    l.genero_id,
    g.nome_genero
  FROM livros l
  JOIN generos g ON g.id_genero = l.genero_id
`;

function validarLivro(dados) {
  const tituloValido = typeof dados.titulo === 'string' && dados.titulo.trim() !== '';
  const autorValido = typeof dados.autor === 'string' && dados.autor.trim() !== '';
  const paginas = Number(dados.paginas);
  const ano = dados.ano === null || dados.ano === undefined || dados.ano === ''
    ? null
    : Number(dados.ano);
  const preco = Number(dados.preco);
  const estoque = Number(dados.estoque);
  const generoId = Number(dados.genero_id);

  return tituloValido
    && autorValido
    && Number.isInteger(paginas) && paginas > 0
    && (ano === null || (Number.isInteger(ano) && ano > 0))
    && Number.isFinite(preco) && preco >= 0
    && Number.isInteger(estoque) && estoque >= 0
    && Number.isInteger(generoId) && generoId > 0;
}

function normalizarDados(dados) {
  return {
    titulo: String(dados.titulo).trim(),
    autor: String(dados.autor).trim(),
    isbn: dados.isbn ? String(dados.isbn).trim() : null,
    editora: dados.editora ? String(dados.editora).trim() : null,
    paginas: Number(dados.paginas),
    ano: dados.ano === '' || dados.ano === undefined || dados.ano === null
      ? null
      : Number(dados.ano),
    sinopse: dados.sinopse ? String(dados.sinopse).trim() : null,
    preco: Number(dados.preco),
    estoque: Number(dados.estoque),
    genero_id: Number(dados.genero_id),
  };
}

async function listarLivros(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_LIVRO} ORDER BY l.id_livro`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os livros.' });
  }
}

async function obterLivro(req, res) {
  try {
    const resultado = await db.query(
      `${SELECT_LIVRO} WHERE l.id_livro = $1`,
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível obter o livro.' });
  }
}

async function listarGeneros(req, res) {
  try {
    const resultado = await db.query(
      'SELECT id_genero, nome_genero FROM generos ORDER BY nome_genero'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível listar os gêneros.' });
  }
}

async function criarLivro(req, res) {
  const idLivro = Number(req.body.id_livro);
  if (!Number.isInteger(idLivro) || idLivro < 1) {
    return res.status(400).json({ erro: 'Informe um ID inteiro positivo para o livro.' });
  }

  if (!validarLivro(req.body)) {
    return res.status(400).json({ erro: 'Preencha os dados do livro com valores válidos.' });
  }

  const dados = normalizarDados(req.body);

  try {
    const resultado = await db.query(
      `INSERT INTO livros
       (id_livro, titulo, autor, isbn, editora, paginas, ano, sinopse, preco, estoque, genero_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id_livro`,
      [
        idLivro,
        dados.titulo,
        dados.autor,
        dados.isbn,
        dados.editora,
        dados.paginas,
        dados.ano,
        dados.sinopse,
        dados.preco,
        dados.estoque,
        dados.genero_id,
      ]
    );

    // Mantém a sequência SERIAL acima do maior ID existente para futuros INSERTs automáticos.
    await db.query(
      `SELECT setval(
         pg_get_serial_sequence('livros', 'id_livro'),
         GREATEST((SELECT COALESCE(MAX(id_livro), 1) FROM livros), 1),
         true
       )`
    );

    const livro = await db.query(
      `${SELECT_LIVRO} WHERE l.id_livro = $1`,
      [resultado.rows[0].id_livro]
    );

    res.status(201).json(livro.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      if (String(error.constraint || '').includes('pkey') || String(error.constraint || '').includes('id_livro')) {
        return res.status(409).json({ erro: 'Esse ID já está cadastrado. Escolha outro ID livre.' });
      }
      return res.status(409).json({ erro: 'O ISBN informado já está cadastrado.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'O gênero selecionado não existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível cadastrar o livro.' });
  }
}

async function atualizarLivro(req, res) {
  if (!validarLivro(req.body)) {
    return res.status(400).json({ erro: 'Preencha os dados do livro com valores válidos.' });
  }

  const dados = normalizarDados(req.body);

  try {
    const resultado = await db.query(
      `UPDATE livros
       SET titulo = $1,
           autor = $2,
           isbn = $3,
           editora = $4,
           paginas = $5,
           ano = $6,
           sinopse = $7,
           preco = $8,
           estoque = $9,
           genero_id = $10
       WHERE id_livro = $11
       RETURNING id_livro`,
      [
        dados.titulo,
        dados.autor,
        dados.isbn,
        dados.editora,
        dados.paginas,
        dados.ano,
        dados.sinopse,
        dados.preco,
        dados.estoque,
        dados.genero_id,
        req.params.id,
      ]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    const livro = await db.query(
      `${SELECT_LIVRO} WHERE l.id_livro = $1`,
      [req.params.id]
    );

    res.json(livro.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'O ISBN informado já está cadastrado.' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ erro: 'O gênero selecionado não existe.' });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível alterar o livro.' });
  }
}

async function excluirLivro(req, res) {
  try {
    const resultado = await db.query(
      'DELETE FROM livros WHERE id_livro = $1 RETURNING id_livro',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    const caminhoImagem = path.join(PASTA_IMAGENS_LIVROS, `livro-${resultado.rows[0].id_livro}.jpg`);
    try {
      await fs.promises.unlink(caminhoImagem);
    } catch (erroArquivo) {
      if (erroArquivo.code !== 'ENOENT') {
        console.error('Livro excluído, mas não foi possível remover a capa:', erroArquivo.message);
      }
    }

    res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        erro: 'Este livro possui lançamento relacionado e não pode ser excluído.',
      });
    }
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível excluir o livro.' });
  }
}

module.exports = {
  listarLivros,
  obterLivro,
  listarGeneros,
  criarLivro,
  atualizarLivro,
  excluirLivro,
};
