const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('../database');

const PASTA_IMAGENS = path.join(__dirname, '../../imagens/livros');

async function uploadImagem(req, res) {
  const idLivro = Number(req.params.id);

  if (!Number.isInteger(idLivro) || idLivro < 1) {
    return res.status(400).json({ erro: 'ID do livro inválido.' });
  }

  if (!req.file) {
    return res.status(400).json({ erro: 'Selecione uma imagem.' });
  }

  try {
    const livro = await db.query(
      'SELECT id_livro FROM livros WHERE id_livro = $1',
      [idLivro]
    );

    if (livro.rowCount === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    await fs.promises.mkdir(PASTA_IMAGENS, { recursive: true });

    const nomeArquivo = `livro-${idLivro}.jpg`;
    const caminhoArquivo = path.join(PASTA_IMAGENS, nomeArquivo);

    await sharp(req.file.buffer)
      .resize({
        width: 300,
        height: 450,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 88 })
      .toFile(caminhoArquivo);

    res.status(201).json({
      mensagem: 'Imagem cadastrada com sucesso.',
      caminho: `/imagens/livros/${nomeArquivo}`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Não foi possível salvar a imagem.' });
  }
}

module.exports = { uploadImagem };
