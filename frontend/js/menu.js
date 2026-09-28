// =========================================================
// BOOKSHOP
// CARROSSEL DO MENU
// =========================================================


// =========================================================
// IMAGENS DO CARROSSEL
// =========================================================

const imagens = [

    "../../imagens/menu1.jpe",

    "../../imagens/menu2.jpe",

    "../../imagens/menu3.jpe"

];


// Guarda qual imagem está sendo exibida

let imagemAtual = 0;


// =========================================================
// INICIALIZAÇÃO
// =========================================================

window.addEventListener(
    "DOMContentLoaded",
    inicializar
);


function inicializar() {

    const imagem =
        document.getElementById(
            "carousel-image"
        );


    const botaoAnterior =
        document.getElementById(
            "carousel-prev"
        );


    const botaoProximo =
        document.getElementById(
            "carousel-next"
        );


    const indicadores =
        document.querySelectorAll(
            ".carousel-indicator"
        );


    // =====================================================
    // VERIFICAÇÃO
    // =====================================================

    if (
        !imagem ||
        !botaoAnterior ||
        !botaoProximo
    ) {

        console.error(
            "Elementos do carrossel não foram encontrados."
        );

        return;

    }


    // =====================================================
    // BOTÃO ANTERIOR
    // =====================================================

    botaoAnterior.addEventListener(
        "click",
        function () {

            imagemAtual--;

            if (imagemAtual < 0) {

                imagemAtual =
                    imagens.length - 1;

            }

            atualizarCarrossel();

        }
    );


    // =====================================================
    // BOTÃO PRÓXIMO
    // =====================================================

    botaoProximo.addEventListener(
        "click",
        function () {

            imagemAtual++;

            if (
                imagemAtual >=
                imagens.length
            ) {

                imagemAtual = 0;

            }

            atualizarCarrossel();

        }
    );


    // =====================================================
    // INDICADORES
    // =====================================================

    indicadores.forEach(
        function (indicador, indice) {

            indicador.addEventListener(
                "click",
                function () {

                    imagemAtual = indice;

                    atualizarCarrossel();

                }
            );

        }
    );


    // =====================================================
    // MOSTRA A PRIMEIRA IMAGEM
    // =====================================================

    atualizarCarrossel();

}


// =========================================================
// ATUALIZA O CARROSSEL
// =========================================================

function atualizarCarrossel() {

    const imagem =
        document.getElementById(
            "carousel-image"
        );


    const indicadores =
        document.querySelectorAll(
            ".carousel-indicator"
        );


    if (!imagem) {

        return;

    }


    // =====================================================
    // TROCA A IMAGEM
    // =====================================================

    imagem.src =
        imagens[imagemAtual];


    // =====================================================
    // ALTERA O ALT
    // =====================================================

    imagem.alt =
        `Imagem ${imagemAtual + 1} da BookShop`;


    // =====================================================
    // ATUALIZA OS INDICADORES
    // =====================================================

    indicadores.forEach(
        function (indicador, indice) {

            if (
                indice === imagemAtual
            ) {

                indicador.classList.add(
                    "active"
                );

            } else {

                indicador.classList.remove(
                    "active"
                );

            }

        }
    );

}