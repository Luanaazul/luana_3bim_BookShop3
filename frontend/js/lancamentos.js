const URL_API = 'http://localhost:3000';

let operacaoAtual = '';
let lancamentoAtual = null;

window.addEventListener('DOMContentLoaded', inicializar);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

function inicializar() {

    document
        .getElementById('btProcure')
        .addEventListener('click', procurar);

    document
        .getElementById('btInserir')
        .addEventListener('click', inserir);

    document
        .getElementById('btAlterar')
        .addEventListener('click', alterar);

    document
        .getElementById('btExcluir')
        .addEventListener('click', excluir);

    document
        .getElementById('btSalvar')
        .addEventListener('click', salvar);

    document
        .getElementById('btCancelar')
        .addEventListener('click', cancelar);

    document
        .getElementById('btn-atualizar')
        .addEventListener('click', listar);


    // Livro, país e data começam bloqueados.
    // O ID NÃO é bloqueado.
    bloquearCampos(true);

    // Limpa o formulário.
    limparCampos();

    // Estado inicial dos botões.
    mostrarBotoesInicial();

    // Carrega os livros no select.
    carregarLivros();

    // Carrega a lista de lançamentos.
    listar();
}


// ============================================================
// CARREGAR LIVROS
// ============================================================

async function carregarLivros() {

    const selectLivro =
        document.getElementById('livro_id_livro');

    try {

        const resposta =
            await fetch(`${URL_API}/livros`);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const livros =
            await resposta.json();

        selectLivro.replaceChildren(
            new Option(
                'Selecione um livro',
                ''
            )
        );

        livros.forEach((livro) => {

            selectLivro.add(
                new Option(
                    `${livro.id_livro} - ${livro.titulo}`,
                    livro.id_livro
                )
            );
        });

    } catch (erro) {

        console.error(
            'Erro ao carregar livros:',
            erro
        );

        selectLivro.replaceChildren(
            new Option(
                'Não foi possível carregar os livros',
                ''
            )
        );

        mostrarAviso(
            'Não foi possível carregar os livros.',
            true
        );
    }
}


// ============================================================
// PROCURAR
// ============================================================

async function procurar() {

    const campoId =
        document.getElementById(
            'id_lancamento'
        );

    const idLancamento =
        Number(campoId.value);


    if (
        !Number.isInteger(idLancamento) ||
        idLancamento < 1
    ) {

        mostrarAviso(
            'Digite um ID de lançamento válido.',
            true
        );

        campoId.focus();

        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/lancamentos/${idLancamento}`
            );


        // ====================================================
        // NÃO ENCONTROU
        // ====================================================

        if (resposta.status === 404) {

            lancamentoAtual = null;

            /*
             * Mantém o ID digitado.
             *
             * Exemplo:
             * ID = 20
             *
             * O 20 continua aparecendo.
             */

            limparCamposSemId();

            // Livro, país e data continuam bloqueados
            // até clicar em INSERIR.
            bloquearCampos(true);

            mostrarBotoesNaoEncontrado();

            mostrarAviso(
                'Lançamento não encontrado. Clique em Inserir para cadastrar.'
            );

            return;
        }


        // ====================================================
        // OUTRO ERRO
        // ====================================================

        if (!resposta.ok) {

            throw new Error(
                `HTTP ${resposta.status}`
            );
        }


        // ====================================================
        // ENCONTROU
        // ====================================================

        const lancamento =
            await resposta.json();

        lancamentoAtual =
            lancamento;

        preencherCampos(
            lancamento
        );

        bloquearCampos(true);

        mostrarBotoesEncontrado();

        mostrarAviso(
            'Lançamento encontrado. Você pode Alterar ou Excluir.'
        );

    } catch (erro) {

        console.error(
            'Erro ao procurar lançamento:',
            erro
        );

        mostrarAviso(
            'Não foi possível consultar o servidor.',
            true
        );
    }
}


// ============================================================
// INSERIR
// ============================================================

function inserir() {

    const campoId =
        document.getElementById(
            'id_lancamento'
        );

    /*
     * O ID precisa ter sido informado.
     */

    if (!campoId.value) {

        mostrarAviso(
            'Digite primeiro o ID que deseja cadastrar.',
            true
        );

        campoId.focus();

        return;
    }


    operacaoAtual = 'inserir';

    lancamentoAtual = null;


    /*
     * Mantém o ID.
     *
     * Limpa apenas:
     * - livro
     * - país
     * - data
     */

    limparCamposSemId();


    /*
     * Agora Livro, País e Data
     * ficam disponíveis para preenchimento.
     */

    bloquearCampos(false);


    mostrarBotoesEditando();


    mostrarAviso(
        'INSERINDO: preencha Livro, País e Data e clique em Salvar.'
    );


    document
        .getElementById('livro_id_livro')
        .focus();
}


// ============================================================
// ALTERAR
// ============================================================

function alterar() {

    if (!lancamentoAtual) {

        mostrarAviso(
            'Procure um lançamento antes de alterar.',
            true
        );

        return;
    }


    operacaoAtual = 'alterar';


    /*
     * Libera Livro, País e Data.
     */

    bloquearCampos(false);


    mostrarBotoesEditando();


    mostrarAviso(
        'ALTERANDO: edite os dados e clique em Salvar.'
    );
}


// ============================================================
// EXCLUIR
// ============================================================

async function excluir() {

    if (!lancamentoAtual) {

        mostrarAviso(
            'Procure um lançamento antes de excluir.',
            true
        );

        return;
    }


    const confirmar =
        confirm(
            `Deseja excluir o lançamento ${lancamentoAtual.id_lancamento}?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${URL_API}/lancamentos/${lancamentoAtual.id_lancamento}`,
                {
                    method: 'DELETE'
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(() => ({}));


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                resultado.message ||
                `HTTP ${resposta.status}`
            );
        }


        mostrarAviso(
            'Lançamento excluído com sucesso.'
        );


        finalizarOperacao();

        await listar();

    } catch (erro) {

        console.error(
            'Erro ao excluir:',
            erro
        );

        mostrarAviso(
            erro.message,
            true
        );
    }
}


// ============================================================
// SALVAR
// ============================================================

async function salvar() {

    if (
        operacaoAtual !== 'inserir' &&
        operacaoAtual !== 'alterar'
    ) {

        mostrarAviso(
            'Escolha Inserir ou Alterar antes de salvar.',
            true
        );

        return;
    }


    const dados =
        coletarDados();


    if (!dados) {
        return;
    }


    let endpoint =
        `${URL_API}/lancamentos`;

    let method =
        'POST';


    // ALTERAÇÃO
    if (operacaoAtual === 'alterar') {

        endpoint =
            `${URL_API}/lancamentos/${lancamentoAtual.id_lancamento}`;

        method =
            'PUT';
    }


    try {

        const resposta =
            await fetch(
                endpoint,
                {
                    method,

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(dados)
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(() => ({}));


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                resultado.message ||
                `HTTP ${resposta.status}`
            );
        }


        mostrarAviso(
            operacaoAtual === 'inserir'
                ? 'Lançamento inserido com sucesso.'
                : 'Lançamento alterado com sucesso.'
        );


        finalizarOperacao();

        await listar();

    } catch (erro) {

        console.error(
            'Erro ao salvar:',
            erro
        );

        mostrarAviso(
            erro.message,
            true
        );
    }
}


// ============================================================
// COLETAR DADOS
// ============================================================

function coletarDados() {

    const idLancamento =
        Number(
            document.getElementById(
                'id_lancamento'
            ).value
        );

    const livroId =
        Number(
            document.getElementById(
                'livro_id_livro'
            ).value
        );


    const pais =
        document.getElementById(
            'pais_lancamento'
        ).value.trim();


    const data =
        document.getElementById(
            'data_lancamento'
        ).value;


    if (
        !Number.isInteger(idLancamento) ||
        idLancamento < 1
    ) {
        mostrarAviso(
            'Informe um ID de lançamento válido.',
            true
        );
        document.getElementById('id_lancamento').focus();
        return null;
    }

    if (
        !Number.isInteger(livroId) ||
        livroId < 1
    ) {

        mostrarAviso(
            'Selecione um livro.',
            true
        );

        return null;
    }


    if (!pais) {

        mostrarAviso(
            'Informe o país de lançamento.',
            true
        );

        return null;
    }


    if (!data) {

        mostrarAviso(
            'Informe a data de lançamento.',
            true
        );

        return null;
    }


    return {

        id_lancamento:
            idLancamento,

        livro_id_livro:
            livroId,

        pais_lancamento:
            pais,

        data_lancamento:
            data
    };
}


// ============================================================
// LISTAR
// ============================================================

async function listar() {

    const tbody =
        document.getElementById(
            'lancamentos-tbody'
        );


    try {

        const resposta =
            await fetch(
                `${URL_API}/lancamentos`
            );


        if (!resposta.ok) {

            throw new Error(
                `HTTP ${resposta.status}`
            );
        }


        const lancamentos =
            await resposta.json();


        tbody.replaceChildren();


        if (lancamentos.length === 0) {

            const row =
                tbody.insertRow();

            const cell =
                row.insertCell();

            cell.colSpan =
                4;

            cell.textContent =
                'Nenhum lançamento cadastrado.';

        } else {

            lancamentos.forEach(
                (lancamento) => {

                    const row =
                        tbody.insertRow();


                    // LIVRO
                    row.insertCell()
                        .textContent =
                        lancamento.titulo ||
                        lancamento.livro_id_livro;


                    // PAÍS
                    row.insertCell()
                        .textContent =
                        lancamento.pais_lancamento;


                    // DATA
                    row.insertCell()
                        .textContent =
                        formatarData(
                            lancamento.data_lancamento
                        );


                    // AÇÃO
                    const actions =
                        row.insertCell();


                    const botao =
                        document.createElement(
                            'button'
                        );


                    botao.type =
                        'button';

                    botao.className =
                        'button-secondary';

                    botao.textContent =
                        'Selecionar';


                    botao.addEventListener(
                        'click',
                        () =>
                            selecionar(
                                lancamento
                            )
                    );


                    actions.appendChild(
                        botao
                    );
                }
            );
        }


        document.getElementById(
            'list-status'
        ).textContent =
            `${lancamentos.length} lançamento(s) cadastrado(s).`;


    } catch (erro) {

        console.error(
            'Erro ao listar:',
            erro
        );


        tbody.replaceChildren();


        const row =
            tbody.insertRow();

        const cell =
            row.insertCell();

        cell.colSpan =
            4;

        cell.textContent =
            'Não foi possível carregar os lançamentos.';


        document.getElementById(
            'list-status'
        ).textContent =
            'Erro ao carregar a lista.';
    }
}


// ============================================================
// SELECIONAR DA LISTA
// ============================================================

function selecionar(lancamento) {

    lancamentoAtual =
        lancamento;


    preencherCampos(
        lancamento
    );


    bloquearCampos(true);


    mostrarBotoesEncontrado();


    mostrarAviso(
        'Lançamento selecionado. Você pode Alterar ou Excluir.'
    );
}


// ============================================================
// PREENCHER CAMPOS
// ============================================================

function preencherCampos(lancamento) {

    document.getElementById(
        'id_lancamento'
    ).value =
        lancamento.id_lancamento;


    document.getElementById(
        'livro_id_livro'
    ).value =
        lancamento.livro_id_livro;


    document.getElementById(
        'pais_lancamento'
    ).value =
        lancamento.pais_lancamento ||
        '';


    document.getElementById(
        'data_lancamento'
    ).value =
        converterDataParaInput(
            lancamento.data_lancamento
        );
}


// ============================================================
// LIMPAR TUDO
// ============================================================

function limparCampos() {

    document.getElementById(
        'id_lancamento'
    ).value =
        '';


    limparCamposSemId();
}


// ============================================================
// LIMPAR SEM APAGAR ID
// ============================================================

function limparCamposSemId() {

    document.getElementById(
        'livro_id_livro'
    ).value =
        '';


    document.getElementById(
        'pais_lancamento'
    ).value =
        '';


    document.getElementById(
        'data_lancamento'
    ).value =
        '';
}


// ============================================================
// FINALIZAR
// ============================================================

function finalizarOperacao() {

    operacaoAtual =
        '';

    lancamentoAtual =
        null;


    limparCampos();


    bloquearCampos(true);


    mostrarBotoesInicial();
}


// ============================================================
// CANCELAR
// ============================================================

function cancelar() {

    finalizarOperacao();

    mostrarAviso(
        'Operação cancelada.'
    );
}


// ============================================================
// BLOQUEAR CAMPOS
// ============================================================

function bloquearCampos(bloquear) {

    /*
     * ATENÇÃO:
     *
     * O ID NÃO É BLOQUEADO.
     *
     * Isso permite:
     *
     * ID 1 → Procurar
     * ID 2 → Procurar
     * ID 3 → Procurar
     *
     * a qualquer momento.
     */

    const campoId =
        document.getElementById(
            'id_lancamento'
        );


    campoId.readOnly =
        false;

    campoId.disabled =
        false;


    /*
     * Esses três sim são bloqueados
     * quando não estamos inserindo/alterando.
     */

    document.getElementById(
        'livro_id_livro'
    ).disabled =
        bloquear;


    document.getElementById(
        'pais_lancamento'
    ).readOnly =
        bloquear;


    document.getElementById(
        'data_lancamento'
    ).readOnly =
        bloquear;
}


// ============================================================
// BOTÕES - INICIAL
// ============================================================

function mostrarBotoesInicial() {

    document.getElementById(
        'btProcure'
    ).hidden =
        false;


    document.getElementById(
        'btInserir'
    ).hidden =
        true;


    document.getElementById(
        'btAlterar'
    ).hidden =
        true;


    document.getElementById(
        'btExcluir'
    ).hidden =
        true;


    document.getElementById(
        'btSalvar'
    ).hidden =
        true;


    document.getElementById(
        'btCancelar'
    ).hidden =
        true;
}


// ============================================================
// BOTÕES - NÃO ENCONTRADO
// ============================================================

function mostrarBotoesNaoEncontrado() {

    document.getElementById(
        'btProcure'
    ).hidden =
        false;


    document.getElementById(
        'btInserir'
    ).hidden =
        false;


    document.getElementById(
        'btAlterar'
    ).hidden =
        true;


    document.getElementById(
        'btExcluir'
    ).hidden =
        true;


    document.getElementById(
        'btSalvar'
    ).hidden =
        true;


    document.getElementById(
        'btCancelar'
    ).hidden =
        true;
}


// ============================================================
// BOTÕES - ENCONTRADO
// ============================================================

function mostrarBotoesEncontrado() {

    document.getElementById(
        'btProcure'
    ).hidden =
        false;


    document.getElementById(
        'btInserir'
    ).hidden =
        true;


    document.getElementById(
        'btAlterar'
    ).hidden =
        false;


    document.getElementById(
        'btExcluir'
    ).hidden =
        false;


    document.getElementById(
        'btSalvar'
    ).hidden =
        true;


    document.getElementById(
        'btCancelar'
    ).hidden =
        true;
}


// ============================================================
// BOTÕES - EDITANDO / INSERINDO
// ============================================================

function mostrarBotoesEditando() {

    document.getElementById(
        'btProcure'
    ).hidden =
        true;


    document.getElementById(
        'btInserir'
    ).hidden =
        true;


    document.getElementById(
        'btAlterar'
    ).hidden =
        true;


    document.getElementById(
        'btExcluir'
    ).hidden =
        true;


    document.getElementById(
        'btSalvar'
    ).hidden =
        false;


    document.getElementById(
        'btCancelar'
    ).hidden =
        false;
}


// ============================================================
// AVISO
// ============================================================

function mostrarAviso(
    mensagem,
    erro = false
) {

    const aviso =
        document.getElementById(
            'divAviso'
        );


    aviso.textContent =
        mensagem;


    aviso.classList.toggle(
        'error',
        erro
    );
}


// ============================================================
// FORMATAR DATA DA LISTA
// ============================================================

function formatarData(data) {

    if (!data) {
        return '';
    }


    /*
     * PostgreSQL:
     *
     * 2021-09-14
     *
     * ou:
     *
     * 2021-09-14T00:00:00.000Z
     *
     * Pegamos apenas YYYY-MM-DD.
     */

    const texto =
        String(data).substring(
            0,
            10
        );


    const partes =
        texto.split('-');


    if (partes.length !== 3) {
        return 'Data inválida';
    }


    const ano =
        partes[0];

    const mes =
        partes[1];

    const dia =
        partes[2];


    return `${dia}/${mes}/${ano}`;
}


// ============================================================
// DATA PARA INPUT TYPE DATE
// ============================================================

function converterDataParaInput(data) {

    if (!data) {
        return '';
    }


    /*
     * <input type="date">
     * precisa receber:
     *
     * YYYY-MM-DD
     */

    return String(data).substring(
        0,
        10
    );
}