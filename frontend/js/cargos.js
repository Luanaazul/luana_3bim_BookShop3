const URL_API = 'http://localhost:3000';

let operacaoAtual = '';
let cargoAtual = null;

window.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
  document.getElementById('btProcure').addEventListener('click', procurar);
  document.getElementById('btInserir').addEventListener('click', inserir);
  document.getElementById('btAlterar').addEventListener('click', alterar);
  document.getElementById('btExcluir').addEventListener('click', excluir);
  document.getElementById('btSalvar').addEventListener('click', salvar);
  document.getElementById('btCancelar').addEventListener('click', cancelar);

  bloquearNome(true);
  visibilidade(true, false, false, false, false);
  listar();
}

async function procurar() {
  const id = Number(document.getElementById('inputId_cargo').value);

  if (!Number.isInteger(id) || id < 1) {
    mostrarAviso('Informe um ID inteiro válido.', true);
    return;
  }

  try {
    const response = await fetch(`${URL_API}/cargos/${id}`);

    if (response.status === 404) {
      cargoAtual = null;
      limpar(false);
      visibilidade(true, true, false, false, false);
      mostrarAviso('Cargo não encontrado. Clique em Inserir.');
      return;
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    cargoAtual = await response.json();
    document.getElementById('inputId_cargo').value = cargoAtual.id_cargo;
    document.getElementById('inputNome_cargo').value = cargoAtual.nome_cargo;
    bloquearNome(true);
    visibilidade(false, false, true, true, false);
    mostrarAviso('Cargo encontrado. Escolha Alterar ou Excluir.');
  } catch (error) {
    mostrarAviso('Servidor indisponível.', true);
  }
}

function inserir() {
  operacaoAtual = 'inserindo';
  cargoAtual = null;
  document.getElementById('inputId_cargo').value = '';
  document.getElementById('inputNome_cargo').value = '';
  document.getElementById('inputId_cargo').readOnly = true;
  bloquearNome(false);
  visibilidade(false, false, false, false, true);
  mostrarAviso('INSERINDO: informe o nome e clique em Salvar.');
  document.getElementById('inputNome_cargo').focus();
}

function alterar() {
  operacaoAtual = 'alterando';
  document.getElementById('inputId_cargo').readOnly = true;
  bloquearNome(false);
  visibilidade(false, false, false, false, true);
  mostrarAviso('ALTERANDO: edite o nome e clique em Salvar.');
}

function excluir() {
  operacaoAtual = 'excluindo';
  bloquearNome(true);
  visibilidade(false, false, false, false, true);
  mostrarAviso('EXCLUINDO: clique em Salvar para confirmar.');
}

async function salvar() {
  if (operacaoAtual === 'excluindo') {
    await excluirCargo();
    return;
  }

  const nome_cargo = document.getElementById('inputNome_cargo').value.trim();

  if (!nome_cargo) {
    mostrarAviso('Informe o nome do cargo.', true);
    return;
  }

  const alterando = operacaoAtual === 'alterando';
  const id = cargoAtual?.id_cargo;

  try {
    const response = await fetch(
      alterando ? `${URL_API}/cargos/${id}` : `${URL_API}/cargos`,
      {
        method: alterando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_cargo }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);

    mostrarAviso(alterando ? 'Cargo alterado com sucesso.' : 'Cargo inserido com sucesso.');
    finalizarOperacao();
    await listar();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
}

async function excluirCargo() {
  const id = cargoAtual?.id_cargo;

  if (!id) {
    mostrarAviso('Nenhum cargo selecionado.', true);
    return;
  }

  try {
    const response = await fetch(`${URL_API}/cargos/${id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);

    mostrarAviso('Cargo excluído com sucesso.');
    finalizarOperacao();
    await listar();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
}

async function listar() {
  const output = document.getElementById('outputSaida');

  try {
    const response = await fetch(`${URL_API}/cargos`);
    if (!response.ok) throw new Error();

    const cargos = await response.json();
    output.replaceChildren();

    cargos.forEach((cargo) => {
      const article = document.createElement('article');
      article.className = 'cargo-item';

      const texto = document.createElement('span');
      texto.textContent = `${cargo.id_cargo} - ${cargo.nome_cargo}`;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button-secondary';
      button.textContent = 'Selecionar';
      button.addEventListener('click', () => selecionar(cargo));

      article.append(texto, button);
      output.appendChild(article);
    });

    document.getElementById('list-status').textContent =
      `${cargos.length} cargo(s) cadastrado(s).`;

    if (!cargos.length) output.textContent = 'Nenhum cargo cadastrado.';
  } catch (error) {
    output.textContent = 'Servidor offline ou banco indisponível.';
    document.getElementById('list-status').textContent =
      'Não foi possível carregar os cargos.';
  }
}

function selecionar(cargo) {
  cargoAtual = cargo;
  document.getElementById('inputId_cargo').value = cargo.id_cargo;
  document.getElementById('inputNome_cargo').value = cargo.nome_cargo;
  bloquearNome(true);
  visibilidade(false, false, true, true, false);
  mostrarAviso('Cargo selecionado. Escolha Alterar ou Excluir.');
}

function limpar(limparId = true) {
  cargoAtual = null;

  if (limparId) {
    document.getElementById('inputId_cargo').value = '';
  }

  document.getElementById('inputNome_cargo').value = '';
  bloquearNome(true);
}

function finalizarOperacao() {
  operacaoAtual = '';
  limpar();
  document.getElementById('inputId_cargo').readOnly = false;
  visibilidade(true, false, false, false, false);
}

function cancelar() {
  finalizarOperacao();
  mostrarAviso('Operação cancelada.');
}

function bloquearNome(readonly) {
  document.getElementById('inputNome_cargo').readOnly = readonly;
}

function visibilidade(procure, inserirBtn, alterarBtn, excluirBtn, salvarBtn) {
  document.getElementById('btProcure').hidden = !procure;
  document.getElementById('btInserir').hidden = !inserirBtn;
  document.getElementById('btAlterar').hidden = !alterarBtn;
  document.getElementById('btExcluir').hidden = !excluirBtn;
  document.getElementById('btSalvar').hidden = !salvarBtn;
  document.getElementById('btCancelar').hidden = !salvarBtn;
}

function mostrarAviso(texto, erro = false) {
  const aviso = document.getElementById('divAviso');
  aviso.textContent = texto;
  aviso.classList.toggle('error', erro);
}
