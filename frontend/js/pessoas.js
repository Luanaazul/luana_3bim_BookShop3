const URL_API = 'http://localhost:3000';

const estado = {
    operacao: '',
    pessoaAtual: null,
    clienteAtual: null,
    funcionarioAtual: null
};


window.addEventListener('DOMContentLoaded', inicializar);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function inicializar() {

    configurarEventos();

    bloquearFormulario(true);

    carregarCargos();

    listarPessoas();

    atualizarCamposTipo();

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    document
        .getElementById('pessoa-procurar')
        .addEventListener('click', procurarPessoa);

    document
        .getElementById('pessoa-inserir')
        .addEventListener('click', inserirPessoa);

    document
        .getElementById('pessoa-alterar')
        .addEventListener('click', alterarPessoa);

    document
        .getElementById('pessoa-excluir')
        .addEventListener('click', excluirPessoa);

    document
        .getElementById('pessoa-salvar')
        .addEventListener('click', salvarPessoa);

    document
        .getElementById('pessoa-cancelar')
        .addEventListener('click', cancelarPessoa);


    document
        .getElementById('checkboxCliente')
        .addEventListener('change', atualizarCamposTipo);

    document
        .getElementById('checkboxFuncionario')
        .addEventListener('change', atualizarCamposTipo);

}


/* =========================================================
   CARGOS
========================================================= */

async function carregarCargos() {

    try {

        const cargos = await buscarJSON('/cargos');

        const select =
            document.getElementById('cargo_id_cargo');

        select.replaceChildren(
            new Option('Selecione um cargo', '')
        );

        cargos.forEach(cargo => {

            select.add(
                new Option(
                    cargo.nome_cargo,
                    cargo.id_cargo
                )
            );

        });

    } catch (error) {

        mostrarStatus(
            'Não foi possível carregar os cargos.',
            true
        );

    }

}


/* =========================================================
   CAMPOS CLIENTE / FUNCIONÁRIO
========================================================= */

function atualizarCamposTipo() {

    const clienteMarcado =
        document.getElementById('checkboxCliente').checked;

    const funcionarioMarcado =
        document.getElementById('checkboxFuncionario').checked;


    document.getElementById('dadosCliente').hidden =
        !clienteMarcado;

    document.getElementById('dadosFuncionario').hidden =
        !funcionarioMarcado;


    document.getElementById('renda_cliente').required =
        clienteMarcado;

    document.getElementById('data_cadastro_cliente').required =
        clienteMarcado;


    document.getElementById('cargo_id_cargo').required =
        funcionarioMarcado;

    document.getElementById('salario_funcionario').required =
        funcionarioMarcado;

    document
        .getElementById('porcentagem_comissao_funcionario')
        .required =
        funcionarioMarcado;

}


/* =========================================================
   PROCURAR PESSOA
========================================================= */

async function procurarPessoa() {

    const cpf =
        document
            .getElementById('pessoa-busca')
            .value
            .trim();


    if (!cpf) {

        mostrarStatus(
            'Informe o CPF para pesquisar.',
            true
        );

        return;
    }


    try {

        const pessoa =
            await buscarJSON(
                `/pessoas/${encodeURIComponent(cpf)}`
            );


        let cliente = null;
        let funcionario = null;


        try {

            cliente =
                await buscarJSON(
                    `/clientes/${encodeURIComponent(cpf)}`
                );

        } catch (error) {

            if (!error.naoEncontrado) {
                throw error;
            }

        }


        try {

            funcionario =
                await buscarJSON(
                    `/funcionarios/${encodeURIComponent(cpf)}`
                );

        } catch (error) {

            if (!error.naoEncontrado) {
                throw error;
            }

        }


        estado.pessoaAtual = pessoa;
        estado.clienteAtual = cliente;
        estado.funcionarioAtual = funcionario;


        preencherPessoa(pessoa);

        preencherCliente(cliente);

        preencherFuncionario(funcionario);


        document.getElementById('checkboxCliente').checked =
            cliente !== null;

        document.getElementById('checkboxFuncionario').checked =
            funcionario !== null;


        atualizarCamposTipo();


        document.getElementById('pessoa-alterar').hidden =
            false;

        document.getElementById('pessoa-excluir').hidden =
            false;

        document.getElementById('pessoa-inserir').hidden =
            true;

        document.getElementById('pessoa-procurar').hidden =
            false;

        document.getElementById('pessoa-salvar').hidden =
            true;

        document.getElementById('pessoa-cancelar').hidden =
            false;


        bloquearFormulario(true);


        mostrarStatus(
            'Pessoa encontrada. Você pode alterar ou excluir.',
            false
        );


    } catch (error) {

        if (error.naoEncontrado) {

            mostrarStatus(
                'Pessoa não encontrada. Clique em Inserir para cadastrar.',
                false
            );

            return;
        }


        mostrarStatus(
            error.message || 'Não foi possível procurar a pessoa.',
            true
        );

    }

}


/* =========================================================
   INSERIR
========================================================= */

function inserirPessoa() {

    estado.operacao = 'inserindo';

    estado.pessoaAtual = null;
    estado.clienteAtual = null;
    estado.funcionarioAtual = null;


    limparFormulario();


    document.getElementById('pessoa-cpf').readOnly =
        false;


    bloquearFormulario(false);


    document.getElementById('pessoa-procurar').hidden =
        true;

    document.getElementById('pessoa-inserir').hidden =
        true;

    document.getElementById('pessoa-alterar').hidden =
        true;

    document.getElementById('pessoa-excluir').hidden =
        true;

    document.getElementById('pessoa-salvar').hidden =
        false;

    document.getElementById('pessoa-cancelar').hidden =
        false;


    mostrarStatus(
        'INSERINDO: preencha os dados da pessoa.',
        false
    );


    document
        .getElementById('pessoa-cpf')
        .focus();

}


/* =========================================================
   ALTERAR
========================================================= */

function alterarPessoa() {

    if (!estado.pessoaAtual) {

        mostrarStatus(
            'Procure uma pessoa antes de alterar.',
            true
        );

        return;
    }


    estado.operacao = 'alterando';


    document.getElementById('pessoa-cpf').readOnly =
        true;


    bloquearFormulario(false);


    document.getElementById('pessoa-procurar').hidden =
        true;

    document.getElementById('pessoa-inserir').hidden =
        true;

    document.getElementById('pessoa-alterar').hidden =
        true;

    document.getElementById('pessoa-excluir').hidden =
        true;

    document.getElementById('pessoa-salvar').hidden =
        false;

    document.getElementById('pessoa-cancelar').hidden =
        false;


    mostrarStatus(
        'ALTERANDO: edite os dados e clique em Salvar.',
        false
    );

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirPessoa() {

    if (!estado.pessoaAtual) {

        mostrarStatus(
            'Procure uma pessoa antes de excluir.',
            true
        );

        return;
    }


    const confirmar =
        window.confirm(
            'Deseja realmente excluir esta pessoa?'
        );


    if (!confirmar) {
        return;
    }


    const cpf =
        estado.pessoaAtual.cpf_pessoa;


    try {

        /*
         * Primeiro removemos as especializações.
         *
         * Isso é necessário porque:
         *
         * clientes.pessoa_cpf_pessoa
         * funcionarios.pessoa_cpf_pessoa
         *
         * possuem FK para pessoas.
         */


        if (estado.funcionarioAtual) {

            await requisicao(
                `/funcionarios/${encodeURIComponent(cpf)}`,
                'DELETE'
            );

        }


        if (estado.clienteAtual) {

            await requisicao(
                `/clientes/${encodeURIComponent(cpf)}`,
                'DELETE'
            );

        }


        await requisicao(
            `/pessoas/${encodeURIComponent(cpf)}`,
            'DELETE'
        );


        mostrarStatus(
            'Pessoa excluída com sucesso.',
            false
        );


        finalizar();


        await listarPessoas();


    } catch (error) {

        mostrarStatus(
            error.message || 'Não foi possível excluir a pessoa.',
            true
        );

    }

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarPessoa() {

    if (!estado.operacao) {

        mostrarStatus(
            'Clique em Inserir ou Alterar antes de salvar.',
            true
        );

        return;
    }


    const dadosPessoa =
        coletarDadosPessoa();


    if (!dadosPessoa) {
        return;
    }


    const clienteMarcado =
        document.getElementById('checkboxCliente').checked;

    const funcionarioMarcado =
        document.getElementById('checkboxFuncionario').checked;


    try {

        let pessoa;


        /* ==============================================
           PESSOA
        ============================================== */

        if (estado.operacao === 'inserindo') {

            pessoa =
                await requisicao(
                    '/pessoas',
                    'POST',
                    dadosPessoa
                );

        } else {

            pessoa =
                await requisicao(
                    `/pessoas/${encodeURIComponent(
                        estado.pessoaAtual.cpf_pessoa
                    )}`,
                    'PUT',
                    dadosPessoa
                );

        }


        const cpf =
            pessoa.cpf_pessoa;


        /* ==============================================
           CLIENTE
        ============================================== */

        await sincronizarCliente(
            cpf,
            clienteMarcado
        );


        /* ==============================================
           FUNCIONÁRIO
        ============================================== */

        await sincronizarFuncionario(
            cpf,
            funcionarioMarcado
        );


        mostrarStatus(
            estado.operacao === 'inserindo'
                ? 'Pessoa cadastrada com sucesso.'
                : 'Pessoa alterada com sucesso.',
            false
        );


        finalizar();


        await listarPessoas();


    } catch (error) {

        mostrarStatus(
            error.message || 'Não foi possível salvar a pessoa.',
            true
        );

    }

}


/* =========================================================
   SINCRONIZAR CLIENTE
========================================================= */

async function sincronizarCliente(
    cpf,
    deveSerCliente
) {

    const renda =
        document
            .getElementById('renda_cliente')
            .value;

    const data =
        document
            .getElementById('data_cadastro_cliente')
            .value;


    if (deveSerCliente) {

        if (!renda || !data) {

            throw new Error(
                'Preencha a renda e a data de cadastro do cliente.'
            );

        }


        const dados = {

            pessoa_cpf_pessoa: cpf,

            renda_cliente: renda,

            data_cadastro_cliente: data

        };


        if (estado.clienteAtual) {

            await requisicao(
                `/clientes/${encodeURIComponent(cpf)}`,
                'PUT',
                dados
            );

        } else {

            await requisicao(
                '/clientes',
                'POST',
                dados
            );

        }

    } else if (estado.clienteAtual) {

        await requisicao(
            `/clientes/${encodeURIComponent(cpf)}`,
            'DELETE'
        );

    }

}


/* =========================================================
   SINCRONIZAR FUNCIONÁRIO
========================================================= */

async function sincronizarFuncionario(
    cpf,
    deveSerFuncionario
) {

    const cargo =
        document
            .getElementById('cargo_id_cargo')
            .value;

    const salario =
        document
            .getElementById('salario_funcionario')
            .value;

    const comissao =
        document
            .getElementById(
                'porcentagem_comissao_funcionario'
            )
            .value;


    if (deveSerFuncionario) {

        if (!cargo || !salario || comissao === '') {

            throw new Error(
                'Preencha cargo, salário e comissão do funcionário.'
            );

        }


        const dados = {

            pessoa_cpf_pessoa: cpf,

            salario_funcionario: salario,

            cargo_id_cargo: Number(cargo),

            porcentagem_comissao_funcionario: comissao

        };


        if (estado.funcionarioAtual) {

            await requisicao(
                `/funcionarios/${encodeURIComponent(cpf)}`,
                'PUT',
                dados
            );

        } else {

            await requisicao(
                '/funcionarios',
                'POST',
                dados
            );

        }

    } else if (estado.funcionarioAtual) {

        await requisicao(
            `/funcionarios/${encodeURIComponent(cpf)}`,
            'DELETE'
        );

    }

}


/* =========================================================
   COLETAR PESSOA
========================================================= */

function coletarDadosPessoa() {

    const dados = {

        cpf_pessoa:
            document
                .getElementById('pessoa-cpf')
                .value
                .trim(),

        nome_pessoa:
            document
                .getElementById('pessoa-nome')
                .value
                .trim(),

        data_nascimento_pessoa:
            document
                .getElementById('pessoa-nascimento')
                .value,

        endereco_pessoa:
            document
                .getElementById('pessoa-endereco')
                .value
                .trim(),

        senha_pessoa:
            document
                .getElementById('pessoa-senha')
                .value,

        email_pessoa:
            document
                .getElementById('pessoa-email')
                .value
                .trim()

    };


    if (
        !dados.cpf_pessoa ||
        !dados.nome_pessoa ||
        !dados.data_nascimento_pessoa ||
        !dados.endereco_pessoa ||
        !dados.senha_pessoa ||
        !dados.email_pessoa
    ) {

        mostrarStatus(
            'Preencha todos os dados da pessoa.',
            true
        );

        return null;
    }


    return dados;

}


/* =========================================================
   PREENCHER PESSOA
========================================================= */

function preencherPessoa(pessoa) {

    document.getElementById('pessoa-busca').value =
        pessoa.cpf_pessoa;

    document.getElementById('pessoa-cpf').value =
        pessoa.cpf_pessoa;

    document.getElementById('pessoa-nome').value =
        pessoa.nome_pessoa;

    document.getElementById('pessoa-nascimento').value =
        String(
            pessoa.data_nascimento_pessoa
        ).slice(0, 10);

    document.getElementById('pessoa-endereco').value =
        pessoa.endereco_pessoa;

    document.getElementById('pessoa-senha').value =
        pessoa.senha_pessoa;

    document.getElementById('pessoa-email').value =
        pessoa.email_pessoa;

}


/* =========================================================
   PREENCHER CLIENTE
========================================================= */

function preencherCliente(cliente) {

    if (!cliente) {

        document.getElementById('renda_cliente').value =
            '';

        document.getElementById('data_cadastro_cliente').value =
            '';

        return;
    }


    document.getElementById('renda_cliente').value =
        cliente.renda_cliente;

    document.getElementById('data_cadastro_cliente').value =
        String(
            cliente.data_cadastro_cliente
        ).slice(0, 10);

}


/* =========================================================
   PREENCHER FUNCIONÁRIO
========================================================= */

function preencherFuncionario(funcionario) {

    if (!funcionario) {

        document.getElementById('cargo_id_cargo').value =
            '';

        document.getElementById('salario_funcionario').value =
            '';

        document
            .getElementById(
                'porcentagem_comissao_funcionario'
            )
            .value = '';

        return;
    }


    document.getElementById('cargo_id_cargo').value =
        funcionario.cargo_id_cargo;

    document.getElementById('salario_funcionario').value =
        funcionario.salario_funcionario;

    document
        .getElementById(
            'porcentagem_comissao_funcionario'
        )
        .value =
        funcionario.porcentagem_comissao_funcionario;

}


/* =========================================================
   LISTAR PESSOAS
========================================================= */

async function listarPessoas() {

    const status =
        document.getElementById(
            'pessoas-list-status'
        );


    try {

        const [
            pessoas,
            clientes,
            funcionarios
        ] = await Promise.all([

            buscarJSON('/pessoas'),

            buscarJSON('/clientes'),

            buscarJSON('/funcionarios')

        ]);


        const clientesPorCpf =
            new Map(
                clientes.map(
                    cliente => [
                        cliente.pessoa_cpf_pessoa,
                        cliente
                    ]
                )
            );


        const funcionariosPorCpf =
            new Map(
                funcionarios.map(
                    funcionario => [
                        funcionario.pessoa_cpf_pessoa,
                        funcionario
                    ]
                )
            );


        const tbody =
            document.getElementById(
                'pessoas-tbody'
            );


        tbody.replaceChildren();


        pessoas.forEach(pessoa => {

            const cliente =
                clientesPorCpf.get(
                    pessoa.cpf_pessoa
                );

            const funcionario =
                funcionariosPorCpf.get(
                    pessoa.cpf_pessoa
                );


            let tipo = 'Pessoa';


            if (cliente && funcionario) {

                tipo = 'Cliente e Funcionário';

            } else if (cliente) {

                tipo = 'Cliente';

            } else if (funcionario) {

                tipo = 'Funcionário';

            }


            const row =
                tbody.insertRow();


            row.insertCell().textContent =
                pessoa.cpf_pessoa;

            row.insertCell().textContent =
                pessoa.nome_pessoa;

            row.insertCell().textContent =
                formatarData(
                    pessoa.data_nascimento_pessoa
                );

            row.insertCell().textContent =
                pessoa.email_pessoa;

            row.insertCell().textContent =
                tipo;

        });


        status.textContent =
            `${pessoas.length} pessoa(s) encontrada(s).`;

        status.classList.remove('error');


    } catch (error) {

        status.textContent =
            error.message ||
            'Não foi possível carregar as pessoas.';

        status.classList.add('error');

    }

}


/* =========================================================
   REQUISIÇÕES
========================================================= */

async function buscarJSON(caminho) {

    const response =
        await fetch(
            `${URL_API}${caminho}`
        );


    const data =
        await response
            .json()
            .catch(() => ({}));


    if (!response.ok) {

        const erro =
            new Error(
                data.erro ||
                `Erro HTTP ${response.status}`
            );


        erro.naoEncontrado =
            response.status === 404;


        throw erro;

    }


    return data;

}


async function requisicao(
    caminho,
    metodo,
    dados = null
) {

    const opcoes = {

        method: metodo,

        headers: {}

    };


    if (dados !== null) {

        opcoes.headers['Content-Type'] =
            'application/json';

        opcoes.body =
            JSON.stringify(dados);

    }


    const response =
        await fetch(
            `${URL_API}${caminho}`,
            opcoes
        );


    const data =
        await response
            .json()
            .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.erro ||
            `Erro HTTP ${response.status}`
        );

    }


    return data;

}


/* =========================================================
   ESTADO DO FORMULÁRIO
========================================================= */

function bloquearFormulario(bloquear) {

    const campos = [

        'pessoa-cpf',

        'pessoa-nome',

        'pessoa-nascimento',

        'pessoa-endereco',

        'pessoa-senha',

        'pessoa-email',

        'checkboxCliente',

        'checkboxFuncionario',

        'renda_cliente',

        'data_cadastro_cliente',

        'cargo_id_cargo',

        'salario_funcionario',

        'porcentagem_comissao_funcionario'

    ];


    campos.forEach(id => {

        const elemento =
            document.getElementById(id);


        if (
            elemento.type === 'checkbox' ||
            elemento.tagName === 'SELECT'
        ) {

            elemento.disabled = bloquear;

        } else {

            elemento.readOnly = bloquear;

        }

    });

}


function limparFormulario() {

    const campos = [

        'pessoa-cpf',

        'pessoa-nome',

        'pessoa-nascimento',

        'pessoa-endereco',

        'pessoa-senha',

        'pessoa-email',

        'renda_cliente',

        'data_cadastro_cliente',

        'salario_funcionario',

        'porcentagem_comissao_funcionario'

    ];


    campos.forEach(id => {

        document.getElementById(id).value = '';

    });


    document.getElementById('cargo_id_cargo').value =
        '';

    document.getElementById('checkboxCliente').checked =
        false;

    document.getElementById('checkboxFuncionario').checked =
        false;


    atualizarCamposTipo();

}


function finalizar() {

    estado.operacao = '';

    estado.pessoaAtual = null;

    estado.clienteAtual = null;

    estado.funcionarioAtual = null;


    limparFormulario();


    document.getElementById('pessoa-busca').value =
        '';


    bloquearFormulario(true);


    document.getElementById('pessoa-procurar').hidden =
        false;

    document.getElementById('pessoa-inserir').hidden =
        false;

    document.getElementById('pessoa-alterar').hidden =
        true;

    document.getElementById('pessoa-excluir').hidden =
        true;

    document.getElementById('pessoa-salvar').hidden =
        true;

    document.getElementById('pessoa-cancelar').hidden =
        true;

}


function cancelarPessoa() {

    finalizar();

    mostrarStatus(
        'Operação cancelada.',
        false
    );

}


/* =========================================================
   STATUS
========================================================= */

function mostrarStatus(texto, erro) {

    const elemento =
        document.getElementById(
            'pessoa-status'
        );


    elemento.textContent =
        texto;


    elemento.classList.toggle(
        'error',
        erro
    );

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarData(data) {

    if (!data) {
        return '';
    }


    return new Date(
        `${String(data).slice(0, 10)}T00:00:00`
    ).toLocaleDateString(
        'pt-BR'
    );

}