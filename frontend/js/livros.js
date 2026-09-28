const URL_API = 'http://localhost:3000';

const imagensIniciais = {
  1: 'imperio.jpe',
  2: 'milvezesamor.jpe',
  3: 'it.jpe',
  4: 'divinosrivais.jpe',
  5: 'neuromancer.jpe',
  6: 'corvo.jpe',
  7: 'mulherzinhas.jpe',
  8: 'omundo.jpe',
  9: 'orgulhoepreconceito.jpe',
  10: 'dugeons.jpe',
  11: 'jantar.jpe',
  12: 'enaosobrou.jpe',
  13: '1984.jpe',
  14: 'poemasmentais.jpe',
  15: 'ritalee.jpe',
};

let operacaoAtual = '';
let livroAtual = null;

window.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
  document.getElementById('btProcure').addEventListener('click', procurar);
  document.getElementById('btInserir').addEventListener('click', inserir);
  document.getElementById('btAlterar').addEventListener('click', alterar);
  document.getElementById('btExcluir').addEventListener('click', excluir);
  document.getElementById('btSalvar').addEventListener('click', salvar);
  document.getElementById('btCancelar').addEventListener('click', cancelarOperacao);
  document.getElementById('btn-atualizar').addEventListener('click', listar);
  document.getElementById('imagem').addEventListener('change', previewImagem);

  bloquearAtributos(true);
  carregarGeneros();
  listar();
}

async function carregarGeneros() {
  const select = document.getElementById('genero_id');

  try {
    const resposta = await fetch(`${URL_API}/livros/generos`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const generos = await resposta.json();
    select.replaceChildren(new Option('Selecione um gênero', ''));
    generos.forEach((genero) => {
      select.add(new Option(genero.nome_genero, genero.id_genero));
    });
  } catch (erro) {
    select.replaceChildren(new Option('Não foi possível carregar', ''));
    mostrarAviso('Não foi possível carregar os gêneros.', true);
  }
}

async function procurar() {
  const id = Number(document.getElementById('id_livro').value);

  if (!Number.isInteger(id) || id < 1) {
    mostrarAviso('Informe um ID inteiro válido.', true);
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/livros/${id}`);

    if (resposta.status === 404) {
      livroAtual = null;
      limparAtributos(false);
      visibilidadeDosBotoes(true, true, false, false, false);
      mostrarAviso('Livro não encontrado. Clique em Inserir.');
      return;
    }

    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    livroAtual = await resposta.json();
    mostrarDadosLivro(livroAtual);
    mostrarImagemLivro(livroAtual.id_livro);
    visibilidadeDosBotoes(false, false, true, true, false);
    mostrarAviso('Livro encontrado. Escolha Alterar ou Excluir.');
  } catch (erro) {
    mostrarAviso('Não foi possível consultar o servidor.', true);
  }
}

function inserir() {
  operacaoAtual = 'inserindo';
  bloquearAtributos(false);
  // O ID informado na busca é preservado para cadastrar o livro nesse número livre.
  document.getElementById('id_livro').readOnly = false;
  limparCampos();
  visibilidadeDosBotoes(false, false, false, false, true);
  mostrarAviso('INSERINDO: preencha os dados e clique em Salvar.');
  document.getElementById('titulo').focus();
}

function alterar() {
  operacaoAtual = 'alterando';
  bloquearAtributos(false);
  document.getElementById('id_livro').readOnly = true;
  visibilidadeDosBotoes(false, false, false, false, true);
  mostrarAviso('ALTERANDO: edite os dados e clique em Salvar.');
}

function excluir() {
  operacaoAtual = 'excluindo';
  bloquearAtributos(true);
  visibilidadeDosBotoes(false, false, false, false, true);
  mostrarAviso('EXCLUINDO: clique em Salvar para confirmar.');
}

async function salvar() {
  if (operacaoAtual === 'excluindo') {
    await excluirLivro();
    return;
  }

  const dados = coletarDadosLivro();
  if (!dados) return;

  const alterando = operacaoAtual === 'alterando';
  const endpoint = alterando
    ? `${URL_API}/livros/${livroAtual.id_livro}`
    : `${URL_API}/livros`;

  try {
    const resposta = await fetch(endpoint, {
      method: alterando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    const retorno = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(retorno.erro || `HTTP ${resposta.status}`);
    }

    const livroSalvo = retorno;

    if (document.getElementById('imagem').files[0]) {
      await enviarImagem(livroSalvo.id_livro);
    }

    mostrarAviso(alterando
      ? 'Livro alterado com sucesso.'
      : 'Livro inserido com sucesso.');

    finalizarOperacao();
    await listar();
  } catch (erro) {
    mostrarAviso(erro.message, true);
  }
}

async function enviarImagem(idLivro) {
  const arquivo = document.getElementById('imagem').files[0];
  if (!arquivo) return;

  const formulario = new FormData();
  formulario.append('imagem', arquivo);

  const resposta = await fetch(`${URL_API}/livros/${idLivro}/imagem`, {
    method: 'POST',
    body: formulario,
  });

  const retorno = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(retorno.erro || 'Não foi possível salvar a imagem.');
  }
}

async function excluirLivro() {
  try {
    const id = livroAtual.id_livro;
    const resposta = await fetch(`${URL_API}/livros/${id}`, { method: 'DELETE' });
    const retorno = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(retorno.erro || `HTTP ${resposta.status}`);
    }

    mostrarAviso('Livro excluído com sucesso.');
    finalizarOperacao();
    await listar();
  } catch (erro) {
    mostrarAviso(erro.message, true);
  }
}

async function listar() {
  const tbody = document.getElementById('livros-tbody');

  try {
    const resposta = await fetch(`${URL_API}/livros`);
    if (!resposta.ok) throw new Error();

    const livros = await resposta.json();
    tbody.replaceChildren();

    livros.forEach((livro) => {
      const row = tbody.insertRow();

      const imagemCell = row.insertCell();
      const img = document.createElement('img');
      img.className = 'capa-tabela';
      img.alt = `Capa de ${livro.titulo}`;
      configurarImagem(img, livro.id_livro);
      imagemCell.appendChild(img);

      row.insertCell().textContent = livro.titulo;
      row.insertCell().textContent = livro.autor;
      row.insertCell().textContent = livro.nome_genero;
      row.insertCell().textContent = formatarPreco(livro.preco);
      row.insertCell().textContent = livro.estoque;

      const actions = row.insertCell();
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button-secondary';
      button.textContent = 'Selecionar';
      button.addEventListener('click', () => selecionarLivro(livro));
      actions.appendChild(button);
    });

    if (!livros.length) {
      const row = tbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 7;
      cell.textContent = 'Nenhum livro cadastrado.';
    }

    document.getElementById('list-status').textContent =
      `${livros.length} livro(s) cadastrado(s).`;
  } catch (erro) {
    tbody.replaceChildren();
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.textContent = 'Servidor offline ou banco indisponível.';
    document.getElementById('list-status').textContent =
      'Não foi possível carregar os livros.';
  }
}

function selecionarLivro(livro) {
  livroAtual = livro;
  mostrarDadosLivro(livro);
  mostrarImagemLivro(livro.id_livro);
  visibilidadeDosBotoes(false, false, true, true, false);
  mostrarAviso('Livro selecionado. Escolha Alterar ou Excluir.');
}

function coletarDadosLivro() {
  const dados = {
    id_livro: Number(document.getElementById('id_livro').value),
    titulo: document.getElementById('titulo').value.trim(),
    autor: document.getElementById('autor').value.trim(),
    isbn: document.getElementById('isbn').value.trim() || null,
    editora: document.getElementById('editora').value.trim() || null,
    paginas: Number(document.getElementById('paginas').value),
    ano: document.getElementById('ano').value === ''
      ? null
      : Number(document.getElementById('ano').value),
    sinopse: document.getElementById('sinopse').value.trim() || null,
    preco: Number(document.getElementById('preco').value),
    estoque: Number(document.getElementById('estoque').value),
    genero_id: Number(document.getElementById('genero_id').value),
  };

  if (
    !Number.isInteger(dados.id_livro) ||
    dados.id_livro < 1 ||
    !dados.titulo ||
    !dados.autor ||
    !Number.isInteger(dados.paginas) ||
    dados.paginas < 1 ||
    (dados.ano !== null && (!Number.isInteger(dados.ano) || dados.ano < 1)) ||
    !Number.isFinite(dados.preco) ||
    dados.preco < 0 ||
    !Number.isInteger(dados.estoque) ||
    dados.estoque < 0 ||
    !Number.isInteger(dados.genero_id) ||
    dados.genero_id < 1
  ) {
    mostrarAviso('Informe um ID livre e preencha os dados do livro com valores válidos.', true);
    return null;
  }

  return dados;
}

function mostrarDadosLivro(livro) {
  document.getElementById('id_livro').value = livro.id_livro;

  ['titulo', 'autor', 'isbn', 'editora', 'paginas', 'ano', 'sinopse', 'preco', 'estoque', 'genero_id']
    .forEach((campo) => {
      document.getElementById(campo).value = livro[campo] ?? '';
    });

  document.getElementById('imagem').value = '';
  bloquearAtributos(true);
}

function limparCampos() {
  ['titulo', 'autor', 'isbn', 'editora', 'paginas', 'ano', 'sinopse', 'preco', 'estoque']
    .forEach((campo) => {
      document.getElementById(campo).value = '';
    });
  document.getElementById('genero_id').value = '';
  document.getElementById('imagem').value = '';
  esconderPreview();
}

function limparAtributos(limparId = true) {
  livroAtual = null;
  if (limparId) document.getElementById('id_livro').value = '';
  limparCampos();
  bloquearAtributos(true);
}

function finalizarOperacao() {
  operacaoAtual = '';
  limparAtributos();
  visibilidadeDosBotoes(true, false, false, false, false);
}

function cancelarOperacao() {
  finalizarOperacao();
  mostrarAviso('Operação cancelada.');
}

function bloquearAtributos(somenteLeitura) {
  document.getElementById('id_livro').readOnly = !somenteLeitura;

  ['titulo', 'autor', 'isbn', 'editora', 'paginas', 'ano', 'sinopse', 'preco', 'estoque']
    .forEach((campo) => {
      document.getElementById(campo).readOnly = somenteLeitura;
    });

  document.getElementById('genero_id').disabled = somenteLeitura;
  document.getElementById('imagem').disabled = somenteLeitura;
}

function visibilidadeDosBotoes(procure, inserir, alterar, excluir, salvar) {
  document.getElementById('btProcure').hidden = !procure;
  document.getElementById('btInserir').hidden = !inserir;
  document.getElementById('btAlterar').hidden = !alterar;
  document.getElementById('btExcluir').hidden = !excluir;
  document.getElementById('btSalvar').hidden = !salvar;
  document.getElementById('btCancelar').hidden = !salvar;
}

function mostrarAviso(mensagem, erro = false) {
  const aviso = document.getElementById('divAviso');
  aviso.textContent = mensagem;
  aviso.classList.toggle('error', erro);
}

function configurarImagem(img, idLivro) {
  const caminhoUpload = `${URL_API}/imagens/livros/livro-${idLivro}.jpg`;
  const caminhoInicial = imagensIniciais[idLivro]
    ? `${URL_API}/imagens/${imagensIniciais[idLivro]}`
    : '';

  img.src = caminhoUpload;
  img.onerror = () => {
    if (caminhoInicial) {
      img.onerror = () => { img.hidden = true; };
      img.src = caminhoInicial;
    } else {
      img.hidden = true;
    }
  };
}

function mostrarImagemLivro(idLivro) {
  const preview = document.getElementById('imagem-preview');
  configurarImagem(preview, idLivro);
  preview.hidden = false;
}

function previewImagem() {
  const arquivo = document.getElementById('imagem').files[0];
  const preview = document.getElementById('imagem-preview');

  if (!arquivo) {
    esconderPreview();
    return;
  }

  const leitor = new FileReader();
  leitor.onload = () => {
    preview.src = leitor.result;
    preview.hidden = false;
  };
  leitor.readAsDataURL(arquivo);
}

function esconderPreview() {
  const preview = document.getElementById('imagem-preview');
  preview.removeAttribute('src');
  preview.hidden = true;
}

function formatarPreco(preco) {
  return Number(preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
