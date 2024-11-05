const CELULAR_EMPRESA = '558291981626';
const LOJA_ABRE = 10;
const LOJA_FECHA = 24;

// Inicializa  proximoIdCarrinho com valor salvo no navegador ou o valor 1
let proximoIdCarrinho = 1;

// Obter último carrinho salvo
function obterCarrinhoSalvo() {
    let carrinho = JSON.parse(localStorage.getItem('meu_carrinho')) || [];

    // Obtém o último item adicionado
    const ultimoItem = carrinho.length > 0 ? carrinho[carrinho.length - 1] : null;

    // Obtém a expiração do último item
    const ultimaExpiracao = ultimoItem ? ultimoItem.expiracao : null;

    let carrinhoAtualizado = carrinho.filter(item =>
        ultimaExpiracao > new Date().getTime()
    );

    localStorage.setItem('meu_carrinho', JSON.stringify(carrinhoAtualizado));

    if (carrinhoAtualizado.length > 0) {
        proximoIdCarrinho = localStorage.getItem('proximo_id_carrinho') || 1;
    }

    return carrinhoAtualizado;
}

$(document).ready(function () {
    cardapio.eventos.init();
});

// Mostrar mensagem de loja aberta ou fechada
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        cardapio.metodos.lojaAbertaOuFechada();
    }
});

var cardapio = {};

// Inicializa MEU_CARRINHO com dados salvos no navegador ou uma lista vazia
var MEU_CARRINHO = obterCarrinhoSalvo() || [];
var MEU_ENDERECO = null;
var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 0;
var MEU_NOME = null;
var FORMA_DE_PAGAMENTO = null;

// verificar qual opções o usuário escolheu para exibir ou oculta informações de entrega
const verificar_inputRadio = () => {
    var radioEntrega = document.getElementById("entrega");
    if (radioEntrega.checked) {
        $('.checkedEntrega').removeClass('hidden');
    } else {
        $('.checkedEntrega').addClass('hidden');
    }
}

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.atualizarBadgeTotal();
        cardapio.metodos.atualizarQtdItensCarrinho();
        cardapio.metodos.carregarBotaoWhatsap();
        cardapio.metodos.lojaAbertaOuFechada();

    }
}

cardapio.metodos = {

    // obtem a lista de itens do cardápio
    obterItensCardapio: (categoria = 'milk-shake') => {
        var filtro = MENU[categoria];

        $('#itensCardapio').html('')

        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item
                .replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${dsc}/g, e.dsc)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id);
            $('#itensCardapio').append(temp)
        });

        // remove o botao ativo
        $('.container-menu a').removeClass('active');

        // seta o menu clicado para ativo
        $('#menu-' + categoria).addClass('active')
    },

    //adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {
        let qtd = 1

        // obter a categoria ativa
        var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

        //obtem a lista de itens
        let filtro = MENU[categoria];

        // obter o item
        let item = $.grep(filtro, (e, i) => { return e.id == id });

        // definir tempo para produto sai do carrinho
        if (item.length > 0) {
            // Criar um novo objeto de item com um ID de carrinho exclusivo
            let itemCarrinho = Object.assign({}, item[0]);
            itemCarrinho.idCarrinho = proximoIdCarrinho;
            proximoIdCarrinho++; // Incrementar o contador global

            itemCarrinho.qntd = qtd;

            itemCarrinho.expiracao = new Date().getTime() + 45 * 60 * 1000;
            MEU_CARRINHO.push(itemCarrinho);
        }

        cardapio.metodos.mensagem('Item adicionado ao carrinho', cor = 'green');

        cardapio.metodos.atualizarBadgeTotal();
        cardapio.metodos.atualizarQtdItensCarrinho();
        localStorage.setItem('meu_carrinho', JSON.stringify(MEU_CARRINHO));
        localStorage.setItem('proximo_id_carrinho', JSON.stringify(proximoIdCarrinho));
    },

    // atualiza o badge de totais dos botões "Meu Carrinho"
    atualizarBadgeTotal: () => {
        var total = 0;
        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd;

        });

        if (total > 0) {
            $('.botao-carrinho').removeClass('hidden');
            $('.container-total-carrinho').removeClass('hidden');
        }
        else {
            $('.botao-carrinho').addClass('hidden');
            $('.container-total-carrinho').addClass('hidden');
        }

        $('.badge-total-carrinho').html(total)
    },

    // atualiza a quantidade de itens do carrinho na parte superior do carrinho
    atualizarQtdItensCarrinho: () => {
        const qtdItens = MEU_CARRINHO.length;

        $('#qtd-itens-carrinho').text(qtdItens);

        if (qtdItens != 1) {
            $('#txt-qtd-itens-carrinho').text('Itens');
        } else {
            $('#txt-qtd-itens-carrinho').text('Item');
        }

    },

    // abrir a modal de carrinho
    abrirCarrinho: (abrir) => {
        if (abrir) {
            $('#modalCarrinho').removeClass('hidden');
            $('body').addClass('modal-open');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $('body').removeClass('modal-open');
            $('#modalCarrinho').addClass('hidden');
        }
    },

    // altera os textos e exibe os botões das etapas
    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $('#lblTituloEtapa').text('Seu Carrinho: ');
            $('#itensCarrinho').removeClass('hidden');
            $('#localEntrega').addClass('hidden');
            $('#localEntrega2').addClass('hidden');
            $('#resumoCarrinho').addClass('hidden');
            $('#escolherFormaDeEntrega').addClass('hidden');


            $('.etapa').removeClass('active');
            $('.etapa1').addClass('active');

            $('#btnEtapaPedido').removeClass('hidden');
            $('#btnEtapaEndereco').addClass('hidden');
            $('#btnEtapaResumo').addClass('hidden');
            $('#btnEtapaVoltar').addClass('hidden');
            $('#container-itens-carrinho').removeClass('hidden');
            $('#btnSairCarrinho').removeClass('hidden');

        }
        if (etapa == 2) {
            $('#lblTituloEtapa').text('Endereço de entrega: ');
            $('#itensCarrinho').addClass('hidden');
            $('#localEntrega').removeClass('hidden');
            $('#localEntrega2').removeClass('hidden');
            $('#escolherFormaDeEntrega').removeClass('hidden');

            $('#resumoCarrinho').addClass('hidden');

            $('.etapa').removeClass('active');
            $('.etapa1').addClass('active');
            $('.etapa2').addClass('active');

            $('#btnEtapaPedido').addClass('hidden');
            $('#btnEtapaEndereco').removeClass('hidden');
            $('#btnEtapaResumo').addClass('hidden');
            $('#btnEtapaVoltar').removeClass('hidden');
            $('#container-itens-carrinho').addClass('hidden');
            $('#btnSairCarrinho').addClass('hidden');
        }
        if (etapa == 3) {
            $('#lblTituloEtapa').text('Resumo do pedido: ');
            $('#itensCarrinho').addClass('hidden');
            $('#localEntrega').addClass('hidden');
            $('#localEntrega2').addClass('hidden');
            $('#escolherFormaDeEntrega').addClass('hidden');
            // aqui em dev

            $('#resumoCarrinho').removeClass('hidden');

            $('.etapa').removeClass('active');
            $('.etapa1').addClass('active');
            $('.etapa2').addClass('active');
            $('.etapa3').addClass('active');

            $('#btnEtapaPedido').addClass('hidden');
            $('#btnEtapaEndereco').addClass('hidden');
            $('#btnEtapaResumo').removeClass('hidden');
            $('#btnEtapaVoltar').removeClass('hidden');
            $('#container-itens-carrinho').removeClass('hidden');
            $('#btnSairCarrinho').addClass('hidden');
        }
    },

    // botão voltar etapa 
    voltarEtapa: () => {
        let etapa = $(".etapa.active").length;

        cardapio.metodos.carregarEtapa(etapa - 1);

    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {
        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html('');

            // carrinho para mostrar opções de escolhas de acrescimo e tamanho
            $.each(MEU_CARRINHO, (i, e) => {
                // se for pizza as escolhar é diferente
                if (e.id.includes("pizza")) {

                    // chama método que verifica se Arrays de pizzaTamanho e acrescimo existem 
                    cardapio.metodos.criarArrayDePizzas(i);

                    let itemCarrinho = cardapio.templates.itemCarrinho2.replace(/\${img}/g, e.img)
                        .replace(/\${nome}/g, e.name)
                        .replace(/\${dsc}/g, e.dsc)
                        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                        .replace(/\${id}/g, e.id)
                        .replace(/\${qntd}/g, e.qntd)
                        .replace(/\${idCarrinho}/g, e.idCarrinho);

                    $("#itensCarrinho").append(itemCarrinho);

                    // deixar botão de menos com item de excluir se quantidade for 1
                    let qtdAtual = parseInt($('#qntd-carrinho_' + e.id + '_' + e.idCarrinho).text());
                    let icon = $('#icon-menos-' + e.id + '_' + e.idCarrinho);
                    let btn = $('#btn-menos-' + e.id + '_' + e.idCarrinho);

                    if (qtdAtual == 1) {
                        icon.removeClass('fa-minus');
                        icon.addClass('fa-times');
                        btn.attr("style", "background-color: var(--color-red); border: var(--color-red);")
                    }

                    // lista os pizzaTamanho disponíveis para o item
                    // Construa o elemento select antes do loop $.each
                    let selectElement = `<select  id="selectPizzaTamanho_${e.idCarrinho}" onchange="cardapio.metodos.addTamanhoDaPizza('${e.idCarrinho}', this.value.split('_')[0]); cardapio.metodos.carregarValores()" class="select-tamanho-pizza">`;

                    // Adicione uma opção padrão ao select
                    selectElement += `<option value="0">Selecione o tamanho...</option>`;

                    // Adicione as opções baseadas no array pizzaTamanho dentro do loop
                    $.each(PIZZAS['pizzaTamanho'], (idSorvete, tamanho) => {
                        selectElement += `<option value="${tamanho.id}_${e.idCarrinho}">${tamanho.name}</option>`;
                    });

                    // Feche o elemento select
                    selectElement += `</select>`;

                    // Adicione o select ao elemento desejado
                    $("#pizzaTamanho_" + e.id + "_" + e.idCarrinho).append(selectElement)[-1];

                    $.each(PIZZAS['acrescimos'], (idCobertura, acrescimosPizza) => {
                        let acrescimos = cardapio.templates.acrescimosPizza
                            .replace(/\${id}/g, acrescimosPizza.id)
                            .replace(/\${nome}/g, acrescimosPizza.name)
                            .replace(/\${idCarrinho}/g, e.idCarrinho)
                            .replace(/\${preco}/g, acrescimosPizza.price.toFixed(2).replace('.', ','));

                        $("#acrescimosPizza_" + e.id + "_" + e.idCarrinho).append(acrescimos);

                        if (MEU_CARRINHO[i].acrescimos.some(obj => obj.id === acrescimosPizza.id)) {
                            cardapio.metodos.remarcarCheckboxes(e.idCarrinho, acrescimosPizza.id);
                        }
                    });
                    // estamos aqui

                }
                // se for lanche ou bebida as escolhar é diferente
                else if (e.id.includes("lanche") || e.id.includes("bebida")) {

                    // chama método cria os Arrays de acrescimos 
                    cardapio.metodos.criarArraysDeProdutos(i);

                    let itemCarrinho = cardapio.templates.itemCarrinho3.replace(/\${img}/g, e.img)
                        .replace(/\${nome}/g, e.name)
                        .replace(/\${dsc}/g, e.dsc)
                        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                        .replace(/\${id}/g, e.id)
                        .replace(/\${qntd}/g, e.qntd)
                        .replace(/\${idCarrinho}/g, e.idCarrinho);

                    $("#itensCarrinho").append(itemCarrinho);

                    // deixar botão de menos com item de excluir se quantidade for 1
                    let qtdAtual = parseInt($('#qntd-carrinho_' + e.id + '_' + e.idCarrinho).text());
                    let icon = $('#icon-menos-' + e.id + '_' + e.idCarrinho);
                    let btn = $('#btn-menos-' + e.id + '_' + e.idCarrinho);

                    if (qtdAtual == 1) {
                        icon.removeClass('fa-minus');
                        icon.addClass('fa-times');
                        btn.attr("style", "background-color: var(--color-red); border: var(--color-red);")
                    }


                }
                // se não for lanche ou bebida ou pizza as escolhar é diferente
                else {

                    // chama método cria os Arrays de acrescimos 
                    cardapio.metodos.criarArraysDeProdutos(i);

                    let itemCarrinho = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                        .replace(/\${nome}/g, e.name)
                        .replace(/\${dsc}/g, e.dsc)
                        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                        .replace(/\${id}/g, e.id)
                        .replace(/\${qntd}/g, e.qntd)
                        .replace(/\${idCarrinho}/g, e.idCarrinho);

                    $("#itensCarrinho").append(itemCarrinho);

                    const precoAcrescimo = ACRESCIMOS['acrescimos-comum'][0].price.toFixed(2).replace(".", ",");

                    if (e.id.includes("1l")) {
                        $('#p-' + e.idCarrinho).text(`Pode selecionar até 6 que não havera alteração no preço total, acima de 6 será cobrado R$ ${precoAcrescimo} por cada acréscimo comum adicional:`);
                    } else {
                        $('#p-' + e.idCarrinho).text(`Pode selecionar até 3 que não havera alteração no preço total, acima de 3 será cobrado R$ ${precoAcrescimo} por cada acréscimo comum adicional:`);
                    }

                    // deixar botão de menos com item de excluir se quantidade for 1
                    let qtdAtual = parseInt($('#qntd-carrinho_' + e.id + '_' + e.idCarrinho).text());
                    let icon = $('#icon-menos-' + e.id + '_' + e.idCarrinho);
                    let btn = $('#btn-menos-' + e.id + '_' + e.idCarrinho);

                    if (qtdAtual == 1) {
                        icon.removeClass('fa-minus');
                        icon.addClass('fa-times');
                        btn.attr("style", "background-color: var(--color-red); border: var(--color-red);")
                    }

                    $.each(ACRESCIMOS['acrescimos-comum'], (idAcrescimoComum, acrescimoComum) => {
                        let acrecimosComuns = cardapio.templates.acrescimoComum
                            .replace(/\${id}/g, acrescimoComum.id)
                            .replace(/\${nome}/g, acrescimoComum.name)
                            .replace(/\${idCarrinho}/g, e.idCarrinho);

                        $("#acrescimoComum_" + e.id + "_" + e.idCarrinho).append(acrecimosComuns);

                        // remarcar checkbox de acrescimo comum
                        if (MEU_CARRINHO[i].acrescimosComuns.some(obj => obj.id === acrescimoComum.id)) {
                            cardapio.metodos.remarcarCheckboxes(e.idCarrinho, acrescimoComum.id)
                        }
                    });

                    // lista os acrescimos especiais disponíveis para o item
                    $.each(ACRESCIMOS['acrescimos-especiais'], (idAcrescimoEspecial, acrescimoEspecial) => {
                        let acrecimosEspeciais = cardapio.templates.acrecimosEspecial
                            .replace(/\${id}/g, acrescimoEspecial.id)
                            .replace(/\${nome}/g, acrescimoEspecial.name)
                            .replace(/\${idCarrinho}/g, e.idCarrinho)
                            .replace(/\${preco}/g, acrescimoEspecial.price.toFixed(2).replace('.', ','));

                        $("#acrescimoEspecial_" + e.id + "_" + e.idCarrinho).append(acrecimosEspeciais);

                        // remarcar checkbox de acrescimo especial
                        if (MEU_CARRINHO[i].acrescimosEspeciais.some(obj => obj.id === acrescimoEspecial.id)) {
                            cardapio.metodos.remarcarCheckboxes(e.idCarrinho, acrescimoEspecial.id);
                        }
                    });

                }
            });

        }
        else {
            cardapio.metodos.carrinhoVazio();
        }

        cardapio.metodos.carregarValores();
    },

    // imprime o icone do carrinho vazio
    carrinhoVazio: () => {
        $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-cart"></i> <b>Seu carrinho está vazio.</b></p>');
    },

    // diminuir quantidade do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {
        let qtdAtual = parseInt($('#qntd-carrinho_' + id).text());

        if (qtdAtual > 1) {
            $('#qntd-carrinho_' + id).text(qtdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, --qtdAtual);
        }

        else {
            cardapio.metodos.removerItemCarrinho(id);
        }

        let icon = $('#icon-menos-' + id);
        let btn = $('#btn-menos-' + id);


        if (qtdAtual == 1) {
            icon.removeClass('fa-minus');
            icon.addClass('fa-times');
            btn.attr("style", "background-color: var(--color-red); border: var(--color-red);")
        } else {
            icon.addClass('fa-minus');
            icon.removeClass('fa-times');
            btn.attr("style", "background-color: var(--color-secondary); border: var(--color-secondary);")
        }

    },

    // aumentar quantidade do item no carrinho
    aumentarQuantidadeCarrinho: (id) => {
        let qtdAtual = parseInt($('#qntd-carrinho_' + id).text());
        $('#qntd-carrinho_' + id).html(qtdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, ++qtdAtual);

        let icon = $('#icon-menos-' + id);
        let btn = $('#btn-menos-' + id);


        if (qtdAtual == 1) {
            icon.removeClass('fa-minus');
            icon.addClass('fa-times');
            btn.attr("style", "background-color: var(--color-red); border: var(--color-red);")
        } else {
            icon.addClass('fa-minus');
            icon.removeClass('fa-times');
            btn.attr("style", "background-color: var(--color-secondary); border: var(--color-secondary);")
        }
    },

    // botão remover item do carrinho
    removerItemCarrinho: (id) => {
        const indice = MEU_CARRINHO.findIndex((item) => item.idCarrinho == id.split("_")[1]);

        MEU_CARRINHO.splice(indice, 1);
        cardapio.metodos.atualizarBadgeTotal();
        cardapio.metodos.atualizarQtdItensCarrinho();
        cardapio.metodos.carregarValores();
        cardapio.metodos.animacaoeRemover(id, indice);
        localStorage.setItem('meu_carrinho', JSON.stringify(MEU_CARRINHO));
    },

    animacaoeRemover: (id, indice) => {
        item = $('#item-carrinho_' + id);

        // Adicione a classe de animação
        item.addClass('animated fadeOutRight');

        item.one('animationend', function () {
            item.remove();


            if (MEU_CARRINHO.length == 0) {
                cardapio.metodos.carrinhoVazio();
            }

        });
    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj) => {
            return obj.idCarrinho == id.split("_")[1]
        });
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualiza o carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) totais do carrinho
        cardapio.metodos.carregarValores();

    },

    // Carrega os valores de Total do Carrinho
    carregarValores: () => {
        VALOR_CARRINHO = 0;
        VALOR_ENTREGA = 0;


        $('#lblPedido').text('R$ 0,00');
        $('#lblEntrega').text('R$ 0,00');
        $('#lblValorTotal').text('R$ 0,00');

        document
            .getElementById("txtBairro")
            .addEventListener("change", function () {
                var select = document.getElementById("txtBairro");
                var selectedOption = select.options[select.selectedIndex].value;

                // Taxas de entregas a depender do bairro;
                switch (selectedOption) {
                    case "Cleto":
                        VALOR_ENTREGA = 3;
                        break;
                    case "Village":
                        VALOR_ENTREGA = 8;
                        break;
                    case "Salvado Lyra":
                    case "Clima Bom":
                        VALOR_ENTREGA = 6;
                        break;
                    case "Santa Lúcia":
                        VALOR_ENTREGA = 4;
                        break;
                    case "Demais Bairros":
                        VALOR_ENTREGA = 12;
                        break;
                    default:
                        VALOR_ENTREGA = 0;
                        break;
                }

                // Atualiza o rótulo da entrega
                $("#lblEntrega").text(
                    `R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`
                );
                const valor_total = VALOR_CARRINHO + VALOR_ENTREGA;

                $("#lblValorTotal").text(
                    `R$ ${valor_total.toFixed(2).replace(".", ",")}`
                );
            });

        $.each(MEU_CARRINHO, (i, e) => {
            let VALOR_ITEM = 0;

            if (e.id != "") {

                // se for acai de 1L
                if (e.id.includes('1l')) {
                    VALOR_ITEM = parseFloat(e.price) + cardapio.metodos.calcularValorAcrescimoComum1L(e.acrescimosComuns) + cardapio.metodos.calcularValorAcrescimoEspecial(e.acrescimosEspeciais);

                }

                // se for acai for algum que tenha 0ML
                else if (e.id.includes('0ml')) {
                    VALOR_ITEM = parseFloat(e.price) + cardapio.metodos.calcularValorAcrescimoComum500ML(e.acrescimosComuns) + cardapio.metodos.calcularValorAcrescimoEspecial(e.acrescimosEspeciais);
                }

                // Se nenhuma das opções anteriores funciona
                else {
                    let acrescimoComum = 0
                    // Verifica se 'e' está definido e possui a propriedade 'pizzaTamanho'
                    if (e && e.pizzaTamanho) {
                        // Chama a função calcularValorAcrescimoComum passando 'e.pizzaTamanho' e 'e'
                        acrescimoComum = cardapio.metodos.calcularValorAcrescimoComum(e.pizzaTamanho, e);
                        // Verifica se 'e' está definido e possui a propriedade 'acrescimos'
                        let acrescimoEspecial = e && e.acrescimos ? cardapio.metodos.calcularValorAcrescimoEspecial(e.acrescimos) : 0;
                        // Calcula o VALOR_ITEM somando o preço original, os acréscimos comuns e os acréscimos especiais
                        VALOR_ITEM = (parseFloat(e.price) * acrescimoComum) + acrescimoEspecial;
                    } else {
                        // Define VALOR_ITEM como o preço original se 'e' não estiver definido ou não possuir 'pizzaTamanho'
                        VALOR_ITEM = parseFloat(e.price);
                    }
                }
            }
            // se for milkshake (desativado)
            else {
                VALOR_ITEM = parseFloat(e.price);
            }

            // mostra valor do item
            $('#preco_' + e.id + '_' + e.idCarrinho).text(`R$ ${VALOR_ITEM.toFixed(2).replace('.', ',')}`);

            // atualiza valor do carrinho com valor do item * quantidade daquele item
            VALOR_CARRINHO += parseFloat(VALOR_ITEM * e.qntd);
            // mostra total do carrinho pedidos sem o frente
            if ((i + 1) == MEU_CARRINHO.length) {
                $('#lblPedido').text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
            }
            // mostra entrega
            if ((i + 1) == MEU_CARRINHO.length) {
                $('#lblEntrega').text(`R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
            }
            // mostra total do carrinho com frente e tudo
            if ((i + 1) == MEU_CARRINHO.length) {
                const valor_total = VALOR_CARRINHO + VALOR_ENTREGA;
                $('#lblValorTotal').text(`R$ ${valor_total.toFixed(2).replace('.', ',')}`);
            }
            // salva valor do item na memória
            e.valorItem = VALOR_ITEM;
            localStorage.setItem('meu_carrinho', JSON.stringify(MEU_CARRINHO));
        });

    },

    // Escolher tamanho da pizza e substituir pelo preço atual a depender do tamanho dela
    calcularValorAcrescimoComum: (pizzaTamanho, e) => {
        let totalAcrescimoPizza = 0;

        // Obtém o valor selecionado no select
        let selectValue = $("#selectPizzaTamanho_" + e.idCarrinho).val();
        // Verifica se algum valor foi selecionado
        if (selectValue !== "0") {
            let idPizzaSelecionada = selectValue.split('_')[0]; // Obtém o primeiro elemento do array após dividir o valor pelo caractere '_'

            // Encontra o objeto correspondente ao ID da pizza no array pizzaTamanho
            let pizzaSelecionada = pizzaTamanho.find(item => item.id === idPizzaSelecionada);

            // Se encontrarmos o objeto correspondente, multiplicamos o preço da pizza pelo preço do tamanho
            if (pizzaSelecionada) {
                totalAcrescimoPizza = pizzaSelecionada.price; // Multiplicação do preço do tamanho pelo preço da pizza
            }
        }

        return totalAcrescimoPizza;
    },

    // condição para acrescimo comum personalizado 
    calcularValorAcrescimoComum500ML: (acrescimos) => {
        let totalAcrescimoComum = 0;
        // Verifica se há mais de 5 acrescimosComuns
        // if (acrescimos.length > 5) {
        $.each(acrescimos.slice(0), (i, e) => {
            // Calcula o valor dos acrescimosComuns além dos primeiros 3
            totalAcrescimoComum += parseFloat(e.price);
        });
        // }
        return totalAcrescimoComum;
    },

    // condição para acrescimo comum personalizado 
    calcularValorAcrescimoComum1L: (acrescimos) => {
        let totalAcrescimoComum = 0;
        // Verifica se há mais de 6 acrescimosComuns
        // if (acrescimos.length > 6) {
        $.each(acrescimos.slice(1), (i, e) => {
            // Calcula o valor dos acrescimosComuns além dos primeiros 3
            totalAcrescimoComum += parseFloat(e.price);
        });
        // }
        return totalAcrescimoComum;
    },

    // add acrescimo especial
    calcularValorAcrescimoEspecial: (acrescimos) => {
        let totalAcrescimoEspecial = 0;
        $.each(acrescimos, (i, e) => {
            totalAcrescimoEspecial += parseFloat(e.price);
        });
        return totalAcrescimoEspecial;
    },

    criarArraysDeProdutos: (i) => {
        // Variável Booleana para saber se existem os arrays de acrescimo do açaí
        const naoExistemOsArrays = !MEU_CARRINHO[i].hasOwnProperty('acrescimosComuns') && !MEU_CARRINHO[i].hasOwnProperty('acrescimosEspeciais');
        // se não existir os arrays cria os dois e inicializa vazio
        if (naoExistemOsArrays) {
            Object.defineProperty(MEU_CARRINHO[i], 'acrescimosComuns', {
                writable: true,
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MEU_CARRINHO[i], 'acrescimosEspeciais', {
                writable: true,
                enumerable: true,
                configurable: true
            });

            MEU_CARRINHO[i].acrescimosComuns = [];
            MEU_CARRINHO[i].acrescimosEspeciais = [];
        }
    },

    criarArrayDePizzas: (i) => {
        // Variável Booleana para saber se existem os arrays de acrescimo do açaí
        const naoExistemOsArrays = !MEU_CARRINHO[i].hasOwnProperty('pizzaTamanho') && !MEU_CARRINHO[i].hasOwnProperty('acrescimos');
        // se não existir os arrays cria os dois e inicializa vazio
        if (naoExistemOsArrays) {
            Object.defineProperty(MEU_CARRINHO[i], 'pizzaTamanho', {
                writable: true,
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MEU_CARRINHO[i], 'acrescimos', {
                writable: true,
                enumerable: true,
                configurable: true
            });
            //  raiva codigo
            MEU_CARRINHO[i].pizzaTamanho = [];
            MEU_CARRINHO[i].acrescimos = [];
        }
    },

    // adiciona um acrescimo comum ao Açaí
    addOuRemoverAcrescimoComumAcai: (idCarrinho, idAcrescimoComum) => {
        acrescimoComum = ACRESCIMOS['acrescimos-comum'].find(acrescimo => idAcrescimoComum == acrescimo.id);

        $.each(MEU_CARRINHO, function (index, item) {
            if (item.idCarrinho == idCarrinho) {

                let acrescimoExistente = item.acrescimosComuns.find(acrescimo => acrescimo.id == acrescimoComum.id);

                if (!acrescimoExistente) {
                    // Adiciona novos itens de acréscimosComuns aos itens antigos
                    item.acrescimosComuns.push(acrescimoComum);

                } else {

                    item.acrescimosComuns = item.acrescimosComuns.filter(acrescimo => acrescimo.id !== acrescimoExistente.id);

                }
                return false; // Para de percorrer assim que encontrar o item
            }
        });
    },

    // adiciona um tamanho para pizza
    addTamanhoDaPizza: (idCarrinho, idAcrescimoComum) => {
        acrescimoComum = PIZZAS['pizzaTamanho'].find(acrescimo => idAcrescimoComum == acrescimo.id);

        $.each(MEU_CARRINHO, function (index, item) {
            if (item.idCarrinho == idCarrinho) {

                let selectValue = $("#selectPizzaTamanho_" + idCarrinho).val();

                let acrescimoExistente = item.pizzaTamanho?.find(acrescimo => acrescimo.id == acrescimoComum?.id);

                // Obtém o valor selecionado no select

                if (!acrescimoExistente && selectValue !== "0") {
                    // Adiciona novo acréscimo comum ao item se não estiver presente e o valor selecionado no select for diferente de 0
                    item.pizzaTamanho.push(acrescimoComum);
                } else if (acrescimoExistente && selectValue === "0") {
                    // Remove o acréscimo comum se estiver presente e o valor selecionado no select for igual a 0
                    item.pizzaTamanho = item.pizzaTamanho.filter(acrescimo => acrescimo.id !== acrescimoExistente.id);
                }

                return false; // Para de percorrer assim que encontrar o item
            }
        });
    },

    // adiciona um acrescimo especial ao Açaí
    addOuRemoverAcrescimoEspecialAcai: (idCarrinho, idAcrescimoEspecial) => {
        acrescimoEspecial = ACRESCIMOS['acrescimos-especiais'].find(acrescimo => idAcrescimoEspecial == acrescimo.id);

        $.each(MEU_CARRINHO, function (index, item) {
            if (item.idCarrinho == idCarrinho) {
                let acrescimoExistente = item.acrescimosEspeciais.find(acrescimo => acrescimo.id == acrescimoEspecial.id);
                if (!acrescimoExistente) {
                    // Adiciona novos itens de acréscimosComuns aos itens antigos
                    item.acrescimosEspeciais.push(acrescimoEspecial);

                } else {

                    item.acrescimosEspeciais = item.acrescimosEspeciais.filter(acrescimo => acrescimo.id !== acrescimoExistente.id);

                }
                return false; // Para de percorrer assim que encontrar o item
            }
        });
    },

    // adiciona um acrescimo especial a pizza
    addOuRemoverAcrescimoEspecialPizza: (idCarrinho, idAcrescimoEspecial) => {
        acrescimoEspecial = PIZZAS['acrescimos'].find(acrescimo => idAcrescimoEspecial == acrescimo.id);

        $.each(MEU_CARRINHO, function (index, item) {
            if (item.idCarrinho == idCarrinho) {
                let acrescimoExistente = item.acrescimos.find(acrescimo => acrescimo.id == acrescimoEspecial.id);

                if (!acrescimoExistente) {
                    // Adiciona novos itens de acréscimosComuns aos itens antigos
                    item.acrescimos.push(acrescimoEspecial);
                } else {

                    item.acrescimos = item.acrescimos.filter(acrescimo => acrescimo.id !== acrescimoExistente.id);
                }
                return false; // Para de percorrer assim que encontrar o item
            }
        });
    },

    // remarcar check em todos!
    remarcarCheckboxes: (idCarrinho, idAcrescimo) => {
        let checkbox = $('#' + idAcrescimo + '_' + idCarrinho);

        checkbox.prop('checked', true);
    },


    // Aqui Voce consegue oculta com o ver acrescimo!
    mostrarAcrescimos(id, mostrar) {
        if (!mostrar) {
            $('#ver-acrescimos-up-' + id).addClass('hidden');
            $('#ver-acrescimos-down-' + id).removeClass('hidden');

            setTimeout(() => {
                $('#acrescimos-' + id).addClass('slideOutUp');
                $('#pizzaTamanho-' + id).addClass('slideOutUp');
                $('#observacao-carrinho-' + id).addClass('slideOutUp');
                setTimeout(() => {

                    $('#acrescimos-' + id).removeClass('slideOutUp');
                    $('#acrescimos-' + id).addClass('hidden');
                    $('#pizzaTamanho-' + id).removeClass('slideOutUp');
                    $('#pizzaTamanho-' + id).addClass('hidden');
                    $('#observacao-carrinho-' + id).removeClass('slideOutUp');
                    $('#observacao-carrinho-' + id).addClass('hidden');
                }, 150)

            }, 200);
        }
        else {
            $('#ver-acrescimos-down-' + id).addClass('hidden');
            $('#acrescimos-' + id).removeClass('hidden');
            $('#observacao-carrinho-' + id).removeClass('hidden');
            $('#ver-acrescimos-up-' + id).removeClass('hidden');
            $('#pizzaTamanho-' + id).removeClass('hidden');

        }
    },

    // Verificar se tamanho da pizza foi escolhido para continua....
    carregarEndereco: () => {
        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho esta vazio');
            return;
        }

        console.log(MEU_CARRINHO)

        const possuiPizza = MEU_CARRINHO.some(item => item.id.includes('pizza'));

    //  verificar se existe if para pode fazer a verificação de retorno se não vai da erro! 
        if (possuiPizza) {
            const SelectTamanho = $(`.select-tamanho-pizza`).val().trim();
            const existePizzaNoCarrinho = SelectTamanho == '0' && possuiPizza;
            if (existePizzaNoCarrinho) {
                cardapio.metodos.mensagem('Por favor escolhar um tamanho para a pizza.');
                $(`.select-tamanho-pizza`).focus();
                return;
            }
        }

        cardapio.metodos.carregarEtapa(2);
        $('#txtNome').focus()
    },

    // API viaCEP
    buscarCep: () => {
        var cep = $('#txtCEP').val().trim().replace(/\D/g, '');

        if (cep != '') {

            // expressão regular validadora de cep
            var validaCep = /^[0-9]{8}$/;

            if (validaCep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        if (dados.uf == 'AL') {
                            $('#txtEndereco').val(dados.logradouro);
                            $('#txtCidade').val(dados.localidade);
                            $('#ddlUf').val(dados.uf);
                            $('#txtNumero').focus();
                        }
                        else {
                            cardapio.metodos.mensagem('Desculpe, no momento só atendemos em Alagoas.')
                        }


                    }
                    else {
                        cardapio.metodos.mensagem('CEP não encontrado. Se necessário preencha as informações manualmente.');

                    }
                })

            }
            else {
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $('#txtCEP').focus();
            }

        }

        else {
            cardapio.metodos.mensagem('Por favor, informe o CEP.')
            $('#txtCEP').focus();
        }
    },

    // Mascara para o CEP
    mascaraCep: (event) => {
        let input = event.target;
        const valor = input.value;


        if (!valor) {
            input.value = "";
        }

        input.value = valor.replace(/\D/g, '');
        input.value = valor.replace(/(\d{5})(\d)/, '$1-$2');

        if (input.value.length == 9) {
            cardapio.metodos.buscarCep();
        }
    },

    // validação endereço antes de prosseguir para etapa 3
    resumoPedido: () => {
        let nome = $('#txtNome').val().trim();
        let cep = $('#txtCEP').val().trim();
        let endereco = $('#txtEndereco').val().trim();
        let bairro = $('#txtBairro').val().trim();
        // let observacao = $('#observacao-carrinho').val().trim();
        let cidade = $('#txtCidade').val().trim();
        let uf = $('#ddlUf').val().trim();
        let numero = $('#txtNumero').val().trim();
        let complemento = $('#txtComplemento').val().trim();

        let pagamento = $('#ddlFormaPagamento').val().trim();
        let troco = $('#ddlTroco').val().trim();

        var radioEntrega = document.getElementById("entrega");


        if (nome.length <= 3) {
            cardapio.metodos.mensagem('Por favor informe o Nome.');
            $('#txtNome').focus();
            return;
        }

        if (radioEntrega.checked) {

            if (cep.length <= 0) {
                cardapio.metodos.mensagem('Por favor informe o CEP. Caso não tenha coloque um número qualquer');
                $('#txtCEP').focus();
                return;
            }

            if (endereco.length <= 0) {
                cardapio.metodos.mensagem('Por favor informe o Endereço.');
                $('#txtEndereco').focus();
                return;
            }

            if (bairro == '0') {
                cardapio.metodos.mensagem('Por favor informe o Bairro.');
                $('#txtBairro').focus();
                return;
            }

            if (cidade.length <= 0) {
                cardapio.metodos.mensagem('Por favor informe a Cidade.');
                $('#txtCidade').focus();
                return;
            }

            if (uf == '0') {
                cardapio.metodos.mensagem('Por favor informe o Estado (UF).');
                $('#ddlUf').focus();
                return;
            }

            if (numero.length <= 0) {
                cardapio.metodos.mensagem('Por favor informe o Número.');
                $('#txtNumero').focus();
                return;
            }

        }
        if (pagamento == "0") {
            cardapio.metodos.mensagem("Por favor informe a Forma de Pagamento.");
            $("#ddlFormaPagamento").focus();
            return;
        }

        if (pagamento == "Dinheiro" && troco == "0") {
            cardapio.metodos.mensagem("Por favor informe Troco Para Quanto.");
            $("#ddlTroco").focus();
            return;
        }

        MEU_NOME = nome;

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }
        FORMA_DE_PAGAMENTO = {
            pagamento: pagamento,
            troco: troco
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();
    },

    carregarResumo: () => {
        $('#listaItensResumo').html('');
        $.each(MEU_CARRINHO, (i, e) => {

            const trueProdutosSemAcrescimo = e.id.includes("lanche") || e.id.includes("bebida");
            const trueAcai = e.id.includes("acai");

            if (trueAcai) {
                let itemCarrinhoResumo = cardapio.templates.acaiResumo.replace(/\${id}/g, e.id)
                    .replace(/\${idCarrinho}/g, e.idCarrinho)
                    .replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${preco}/g, e.valorItem.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd)
                    .replace(/\${qtdAcrescimos}/g, cardapio.metodos.qtdTotalDeAcrescimosAcai(e));


                $("#listaItensResumo").append(itemCarrinhoResumo);

                $.each(e.acrescimosComuns, (indiceAcrescimo, acrescimo) => {

                    let acrescimoComumResumo = cardapio.templates.acrescimosResumo.replace(/\${nome}/g, acrescimo.name);

                    $('#acrescimosResumo_' + e.id + '_' + e.idCarrinho).append(acrescimoComumResumo);

                });

                $.each(e.acrescimosEspeciais, (indiceAcrescimo, acrescimo) => {

                    let acrescimoEspecialResumo = cardapio.templates.acrescimosResumo.replace(/\${nome}/g, acrescimo.name);

                    $('#acrescimosResumo_' + e.id + '_' + e.idCarrinho).append(acrescimoEspecialResumo);

                });
            }
            else if (trueProdutosSemAcrescimo) {
                let itemCarrinhoResumo = cardapio.templates.ProdutoSemAcrescimoResumo.replace(/\${id}/g, e.id)
                    .replace(/\${idCarrinho}/g, e.idCarrinho)
                    .replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${preco}/g, e.valorItem.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd)
                    .replace(/\${qtdAcrescimos}/g, cardapio.metodos.qtdTotalDeAcrescimosAcai(e));


                $("#listaItensResumo").append(itemCarrinhoResumo);

            }

            else {
                let itemCarrinhoResumo = cardapio.templates.pizzaResumo.replace(/\${id}/g, e.id)
                    .replace(/\${idCarrinho}/g, e.idCarrinho)
                    .replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${preco}/g, e.valorItem.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd);


                $("#listaItensResumo").append(itemCarrinhoResumo);

                // Obtém o valor selecionado no select
                let selectValue = $("#selectPizzaTamanho_" + e.idCarrinho).val();

                // Verifica se algum valor foi selecionado
                if (selectValue !== "0") {
                    let idPizzaSelecionada = selectValue.split('_')[0]; // Obtém o primeiro elemento do array após dividir o valor pelo caractere '_'

                    // Encontra o objeto correspondente ao ID da pizza no array pizzaTamanho
                    let pizzaSelecionada = e.pizzaTamanho.find(item => item.id === idPizzaSelecionada);

                    // Verifica se o tamanho da pizza selecionado foi encontrado
                    if (pizzaSelecionada) {
                        // Exibe os detalhes apenas para o tamanho selecionado
                        let sorvetesResumo = cardapio.templates.acrescimosResumo.replace(/\${nome}/g, pizzaSelecionada.name);
                        $('#sorvetesResumo_' + e.id + '_' + e.idCarrinho).append(sorvetesResumo);
                    }
                }

                $.each(e.acrescimos, (indiceCobertura, cobertura) => {

                    let coberturaResumo = cardapio.templates.acrescimosResumo.replace(/\${nome}/g, cobertura.name);

                    $('#coberturaResumo_' + e.id + '_' + e.idCarrinho).append(coberturaResumo);

                });
            }
        });

        // Vamos add aqui uma mensagem diferente caso o cliente escolhar retirar o pedido na loja!
        // if em cima do checked entrega

        var radioEntrega = document.getElementById("entrega");
        let pagamento = $('#ddlFormaPagamento').val().trim();
        if (radioEntrega.checked) {
            $('#resumoEndereco').html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
            $('#cidadeEndereco').html(`${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} / ${MEU_ENDERECO.complemento}`)
        } else {
            $('#resumoEndereco').html(`Retirar Pedido na Loja`);
        }
        if (pagamento === "Dinheiro") {
            $('#formaPagamento').html(`${FORMA_DE_PAGAMENTO.pagamento} - ${FORMA_DE_PAGAMENTO.troco}`)
        } else {
            $('#formaPagamento').html(`${FORMA_DE_PAGAMENTO.pagamento} - Esta opção não precisa de troco`)
        }


        cardapio.metodos.finalizarPedido();
    },

    // Atualiza o link do botão de Whatsapp e envia mensagem personalizada
    finalizarPedido: () => {
        var radioEntrega = document.getElementById("entrega");
        let pagamento = $('#ddlFormaPagamento').val().trim();

        // Gerar um número aleatório de 4 dígitos
        const numeroPedido = Math.floor(Math.random() * 9000) + 1000;
        const trueFinalizarPedido = MEU_CARRINHO.length > 0 && MEU_ENDERECO != null;

        if (trueFinalizarPedido) {

            var texto = `Olá, gostaria de fazer um pedido!\n\n`;
            texto += `Nome: *${MEU_NOME}*, PN: *${numeroPedido}*\n\n `
            texto += `*Já selecionei meu pedido pelo Cardápio Digital:*`;
            texto += `\n\n*Itens do pedido:*\${itens}`;

            texto += '\n\n*Endereço de entrega:*';
            // // Vamos add aqui uma mensagem diferente caso o cliente escolhar retirar o pedido na loja!
            if (radioEntrega.checked) {
                texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
                texto += `\n${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} / ${MEU_ENDERECO.complemento}`;
            } else {
                texto += `\nEstarei indo retirar meu pedido na loja!`;
            }

            texto += '\n\n*Forma de pagamento:*';
            if (pagamento === "Dinheiro") {
                texto += `\n${FORMA_DE_PAGAMENTO.pagamento} - Vou precisa de troco para ${FORMA_DE_PAGAMENTO.troco}`;
            } else {
                texto += `\n${FORMA_DE_PAGAMENTO.pagamento}`;
            }

            texto += `\n\n*Total: R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}*`;

            var itens = '';


            $.each(MEU_CARRINHO, (i, e) => {
                let observacao = $(`#observacao-carrinho-${e.idCarrinho}`).val().trim();
                // aqui vai fica a observação de cada pedido ok,
                itens += `\n\n*${e.qntd}x ${e.name} ....... R$ ${e.valorItem.toFixed(2).replace('.', ',')}*\n*OBS: ${observacao}*\n`;


                if (e.id.includes('pizza')) {
                    const pizzaTamanho = e.pizzaTamanho;
                    const acrescimos = e.acrescimos
                    let selectValue = $("#selectPizzaTamanho_" + e.idCarrinho).val();


                    itens += '\n    *Tamanho:*\n';
                    // add o tamanho da pizza no whatsapp da pizza 

                    // Verifica se algum valor foi selecionado
                    if (selectValue !== "0") {
                        let idPizzaSelecionada = selectValue.split('_')[0]; // Obtém o primeiro elemento do array após dividir o valor pelo caractere '_'

                        // Encontra o objeto correspondente ao ID da pizza no array pizzaTamanho
                        let pizzaSelecionada = pizzaTamanho.find(item => item.id === idPizzaSelecionada);

                        // Verifica se o tamanho da pizza selecionado foi encontrado
                        if (pizzaSelecionada) {
                            // Exibe os detalhes apenas para o tamanho selecionado
                            itens += `* ${pizzaSelecionada.name}\n`;

                        }
                    }

                    itens += '\n    *Acréscimo(s):*\n';

                    maxLength = Math.max(...acrescimos.map(item => item.name.length));
                    $.each(acrescimos, (i, acre) => {
                        const dots = cardapio.metodos.gerarPontos(acrescimos, acre);
                        const formattedPrice = `R$ ${acre.price.toFixed(2).replace('.', ",")}`;
                        itens += `* ${acre.name} ${dots} ${formattedPrice}\n`;
                    });

                    itens += `\n--------------------------------------\n`;
                }
                else {

                    const acrescimosComuns = e.acrescimosComuns;

                    if (acrescimosComuns?.length > 0 && !e.id.includes("pizza")) {
                        itens += '\n    *Acréscimos Comuns:*\n';

                    }


                    $.each(acrescimosComuns, (index, acrescimo) => {

                        if (e.id.includes('1l')) {
                            if (index < 6) {
                                const dots = cardapio.metodos.gerarPontos(acrescimosComuns, acrescimo);
                                const formattedPrice = `R$ 0,00`;
                                itens += `* ${acrescimo.name} ${dots} ${formattedPrice}\n`;
                            }
                            else {
                                const dots = cardapio.metodos.gerarPontos(acrescimosComuns, acrescimo);
                                const formattedPrice = `R$ ${acrescimo.price.toFixed(2).replace('.', ",")}`;
                                itens += `* ${acrescimo.name} ${dots} ${formattedPrice}\n`;
                            }

                        } else {
                            if (index < 3) {
                                const dots = cardapio.metodos.gerarPontos(acrescimosComuns, acrescimo);
                                const formattedPrice = `R$ 0,00`;
                                itens += `* ${acrescimo.name} ${dots} ${formattedPrice}\n`;
                            }
                            else {
                                const dots = cardapio.metodos.gerarPontos(acrescimosComuns, acrescimo);
                                const formattedPrice = `R$ ${acrescimo.price.toFixed(2).replace('.', ",")}`;
                                itens += `* ${acrescimo.name} ${dots} ${formattedPrice}\n`;
                            }
                        }
                    });


                    const acrescimosEspeciais = e.acrescimosEspeciais;

                    if (acrescimosEspeciais?.length > 0) {
                        itens += '\n    *Acréscimos Especiais:*\n';
                    }
                    $.each(acrescimosEspeciais, (i, acrescimo) => {
                        const dots = cardapio.metodos.gerarPontos(acrescimosEspeciais, acrescimo);
                        const formattedPrice = `R$ ${acrescimo.price.toFixed(2).replace('.', ",")}`;
                        itens += `* ${acrescimo.name} ${dots} ${formattedPrice}\n`;
                    });

                    itens += `\n--------------------------------------\n`;
                }

                // ultimo item
                if ((i + 1) == MEU_CARRINHO.length) {
                    texto = texto.replace(/\${itens}/g, itens);

                    let encode = encodeURIComponent(texto);

                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $('#btnEtapaResumo').attr('href', URL);

                }
            });
        }

    },

    qtdTotalDeAcrescimosAcai: (itemDeCarrinho) => {
        return itemDeCarrinho.acrescimosComuns?.length + itemDeCarrinho.acrescimosEspeciais?.length;
    },

    carregarBotaoWhatsap: () => {
        $('.botao-whatsapp').attr('href', `https://wa.me/${CELULAR_EMPRESA}?text=Olá preciso de um pedido em específico, não disponível no Cardapio Digital.`)
    },

    mensagem: (texto, cor = 'red', tempo = 5500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800)
        }, tempo);
    },

    animarBadgeTotal: () => {
        let badge = $('.botao-carrinho');
        badge.removeClass('animated bounceIn')
        badge.addClass('animated rubberBand');


        badge.on('animationend', function () {
            badge.removeClass('animated rubberBand');

        });

    },

    limitarCheckboxes: (checkbox) => {
        var divAvo = checkbox.closest('.acrescimosComum');

        var checkboxesNaDiv = divAvo.querySelectorAll('input[id^="sorvete_"]:checked');

        if (checkboxesNaDiv.length > 2) {
            checkbox.checked = false;
        }
    },

    gerarPontos: (adicionais, adicional) => {
        let maxLength = Math.max(...adicionais.map(item => item.name.length));
        const espacosEntrePontos = adicional.name.length <= 7 ? 2 : 1;
        const dots = '-'.repeat((maxLength - adicional.name.length + espacosEntrePontos));
        return dots;
    },

    titleize: (element) => {
        var inputElement = element;
        var words = inputElement.value.toLowerCase().split(" ");
        for (var a = 0; a < words.length; a++) {
            var w = words[a];
            words[a] = w.charAt(0).toUpperCase() + w.slice(1);
        }
        inputElement.value = words.join(" ");
    },

    // obtém hora no formato decimal para comparação
    obterHoraDecimal: () => {
        var dataAtual = new Date();
        var horas = dataAtual.getHours();
        var minutos = dataAtual.getMinutes();

        var horaDecimal = parseFloat(`${horas}.${minutos}`);

        return horaDecimal;
    },

    // Definir dia que loja estara fechada
    lojaAbertaOuFechada: () => {
        let hora = cardapio.metodos.obterHoraDecimal();
        let dia = new Date().getDay();
        // Dia da semana de 0 a 6, onde 0 é domingo
        let segunda = 1;

        $('#container-mensagens').html('');

        if ((hora < LOJA_ABRE || hora >= LOJA_FECHA) || dia == segunda) {

            cardapio.metodos.mensagem(`Loja Fechada`, cor = "red", tempo = 10 * 60 * 1000);
            cardapio.metodos.mensagem(`Abrimos (Ter à Dom) às ${LOJA_ABRE.toFixed(2).replace(".", ":")} hrs.`, cor = "red", tempo = 15000);

            if ((hora >= (LOJA_ABRE - 1) && hora <= LOJA_ABRE) && dia != segunda) {
                cardapio.metodos.mensagem(`Agende seu pedido`, cor = "green", tempo = 20000);
            }
        }
        else {
            cardapio.metodos.mensagem("Loja aberta, faça seu pedido!", cor = 'green', tempo = 6000);
        }
    }
}

cardapio.templates = {
    item: `
    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-3 wow fadeInUp">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${nome}</b>
            </p>
            <p class="price-produto text-center">
                <b>R$ \${preco}</b>
            </p>
            <div class="add-carrinho">
           
            <span class="btn-add d-flex justify-content-center align-items-center" title="Adicionar ao Carrinho" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}');cardapio.metodos.animarBadgeTotal()">
            <p class=" pt-3">Escolher</p>
                </span>
            </div>
        </div>
    </div>
    `,
    itemCarrinho: `
    <div class="itemCarrinho" id="item-carrinho_\${id}_\${idCarrinho}">
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}"
                    alt="">
            </div>
            <div class="dados-produtos">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b  id="preco_\${id}_\${idCarrinho}">R$ \${preco}</b></p>
            </div>
           
            <div class="add-carrinho">
                <button class="btn-purple btn-sm mobile-flex   ver-acrescimos hidden" id=ver-acrescimos-down-\${idCarrinho} onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',true)">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="btn-purple btn-sm ver-acrescimos mobile-flex " id=ver-acrescimos-up-\${idCarrinho}  onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',false)">
                    <i class="fas fa-arrow-up hd"></i> 
                </button>
                <span class="btn-menos" id="btn-menos-\${id}_\${idCarrinho}" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-minus" id="icon-menos-\${id}_\${idCarrinho}"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho_\${id}_\${idCarrinho}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-plus"></i></span>
                <span class="btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-times"></i></span>

            </div>
            </div>
            <div class="div-descricao-carrinho">
            <p class=""><b>Descrição: </b>\${dsc}</p>
            </div>
            <div class="div-observacao-carrinho animated bounceInDown">
            
            <textarea id="observacao-carrinho-\${idCarrinho}" class="observacao-carrinho"  placeholder="Digite observações aqui, por exemplo: 'sem cebola'." name="Observação"></textarea>
        
            </div>

        <div class="col-12 acrescimos animated bounceInDown" id="acrescimos-\${idCarrinho}">
                <p class="title-produto"><b class="esconderTituloProduto">Acrescimos Comuns</b></p>
                <p id="p-\${idCarrinho}"></p>

                <div id="acrescimoComum_\${id}_\${idCarrinho}" class="acrescimosComum">

                </div>

                <p class="title-produto especial"><b class="esconderTituloProduto">Acrescimos Especiais</b></p>

                <div id="acrescimoEspecial_\${id}_\${idCarrinho}" class="acrescimosEspecial">

                </div>
                            
        </div>
    </div>    
    `,
    itemCarrinho2: `
    <div class="itemCarrinho" id="item-carrinho_\${id}_\${idCarrinho}">
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}"
                    alt="">
            </div>
            <div class="dados-produtos">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b id="preco_\${id}_\${idCarrinho}">R$ \${preco}</b></p>
            </div>
           
            <div class="add-carrinho">
                    <button class="btn-purple btn-sm mobile-flex ver-acrescimos  hidden" id=ver-acrescimos-down-\${idCarrinho} onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',true)">
                    <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-purple btn-sm ver-acrescimos mobile-flex " id=ver-acrescimos-up-\${idCarrinho}  onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',false)">
                    <i class="fas fa-arrow-up hd"></i> 
                </button>
                <span class="btn-menos" id="btn-menos-\${id}_\${idCarrinho}" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-minus" id="icon-menos-\${id}_\${idCarrinho}"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho_\${id}_\${idCarrinho}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-plus"></i></span>
                <span class="btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-times"></i></span>

            </div>

        </div>

        <div class="div-descricao-carrinho">
            <p class=""><b>Descrição: </b>\${dsc}</p>
            </div>
            <div class="div-observacao-carrinho animated bounceInDown">
            
            <textarea id="observacao-carrinho-\${idCarrinho}" class="observacao-carrinho "  placeholder="Digite observações aqui, por exemplo: 'sem cebola'." name="Observação"></textarea>
        
            </div>
        
        <div class="col-12 acrescimos animated bounceInDown" id="pizzaTamanho-\${idCarrinho}">
                <p class="title-produto"><b>Escolhar o Tamanho Da Pizza:</b></p>
                <div id="pizzaTamanho_\${id}_\${idCarrinho}" class="acrescimosComum">

                </div>

                <p class="title-produto acrescimos title-produto-acrescimos"><b>Acréscimo:</b></p>
                <p></p>
                <form>
                <div id="acrescimosPizza_\${id}_\${idCarrinho}" class="acrescimosComum">
                </div>
                </form>       
        </div>
    </div>    
    `,
    itemCarrinho3: `
    <div class="itemCarrinho" id="item-carrinho_\${id}_\${idCarrinho}">
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}"
                    alt="">
            </div>
            <div class="dados-produtos">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b id="preco_\${id}_\${idCarrinho}">R$ \${preco}</b></p>
            </div>
           
            <div class="add-carrinho">
                    <button class="btn-purple btn-sm mobile-flex ver-acrescimos hidden" id=ver-acrescimos-down-\${idCarrinho} onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',true)">
                    <i class="fas fa-arrow-down "></i>
                    </button>
                    <button class="btn-purple btn-sm ver-acrescimos mobile-flex " id=ver-acrescimos-up-\${idCarrinho}  onclick="cardapio.metodos.mostrarAcrescimos('\${idCarrinho}',false)">
                    <i class="fas fa-arrow-up hd"></i> 
                </button>
                <span class="btn-menos" id="btn-menos-\${id}_\${idCarrinho}" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-minus" id="icon-menos-\${id}_\${idCarrinho}"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho_\${id}_\${idCarrinho}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-plus"></i></span>
                <span class="btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}_\${idCarrinho}')"><i class="fas fa-times"></i></span>

            </div>

        </div>

        <div class="div-descricao-carrinho">
            <p class=""><b>Descrição: </b>\${dsc}</p>
            </div>
            <div class="div-observacao-carrinho animated bounceInDown">
            
            <textarea id="observacao-carrinho-\${idCarrinho}" class="observacao-carrinho"  placeholder="Digite observações aqui, por exemplo: 'sem cebola'." name="Observação"></textarea>
        
            </div>
        
    </div>    
    `,
    acrescimoComum: `
    <div class="acrescimo">
        <input type="checkbox" id="\${id}_\${idCarrinho}" onchange="cardapio.metodos.addOuRemoverAcrescimoComumAcai(\${idCarrinho}, '\${id}'); cardapio.metodos.carregarValores()">
        <label for="\${id}_\${idCarrinho}">\${nome}</label>
    </div>`,
    acrecimosEspecial: `
    <div class="acrescimo">
        <input type="checkbox" id="\${id}_\${idCarrinho}" class="checkbox-custom" onchange="cardapio.metodos.addOuRemoverAcrescimoEspecialAcai(\${idCarrinho}, '\${id}'); cardapio.metodos.carregarValores()">
        <label for="\${id}_\${idCarrinho}" class="checkbox-custom-label">\${nome} <br>R$\${preco}</label>
    </div>`,
    pizzaTamanho: `
    <div class="acrescimo">
    </div>`,
    acrescimosPizza: `
    <div class="acrescimo">
        <input type="checkbox" id="\${id}_\${idCarrinho}" class="checkbox-custom" onchange="cardapio.metodos.addOuRemoverAcrescimoEspecialPizza(\${idCarrinho}, '\${id}'); cardapio.metodos.carregarValores()">
        <label for="\${id}_\${idCarrinho}" class="checkbox-custom-label">\${nome} <br>R$\${preco}</label>
    </div>`,
    acaiResumo: `
        <div class="col-12 item-carrinho resumo" >
            <div class="img-produto-resumo">
                <img src="\${img}">
            </div>
            <div class="dados-produtos">

                <p class="title-produto-resumo">
                        <b>\${nome}</b>
                </p>

                <p class="price-produto-resumo">
                    <b>R$\${preco}</b>
                </p>
                <div class="acrescimos-resumo" id="acrescimosResumo_\${id}_\${idCarrinho}">
                    <b>Acréscimos (\${qtdAcrescimos}): </b>

                </div>

            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
    ProdutoSemAcrescimoResumo: `
        <div class="col-12 item-carrinho resumo" >
            <div class="img-produto-resumo">
                <img src="\${img}">
            </div>
            <div class="dados-produtos">

                <p class="title-produto-resumo">
                        <b>\${nome}</b>
                </p>

                <p class="price-produto-resumo">
                    <b>R$\${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
    pizzaResumo: `
        <div class="col-12 item-carrinho resumo" >
            <div class="img-produto-resumo">
                <img src="\${img}">
            </div>
            <div class="dados-produtos">

                <p class="title-produto-resumo">
                        <b>\${nome}</b>
                </p>

                <p class="price-produto-resumo">
                    <b>R$\${preco}</b>
                </p>
                <div class="acrescimos-resumo" id="sorvetesResumo_\${id}_\${idCarrinho}">
                    <b>Tamanho: </b>

                </div>

                <div class="acrescimos-resumo" id="coberturaResumo_\${id}_\${idCarrinho}">
                    <b>Acréscimo: </b>

                </div>

            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
    acrescimosResumo: `
    <div class="acrescimo">
        <b>*</b>\${nome}, 
    </div>`
}