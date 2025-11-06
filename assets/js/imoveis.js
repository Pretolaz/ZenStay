// assets/js/imoveis.js

// Elementos do DOM
const adicionarImovelBtn = document.getElementById('adicionarImovelBtn');
const formImovelContainer = document.getElementById('formImovelContainer');
const formImovel = document.getElementById('formImovel');
const tabelaImoveis = document.querySelector('#tabelaImoveis tbody');
const imoveisCardsContainer = document.getElementById('imoveisCardsContainer');
const fotoImovelInput = document.getElementById('fotoImovel');

const imovelModal = document.getElementById('imovelModal');
const modalImovelApelido = document.getElementById('modalImovelApelido');
const modalImovelFoto = document.getElementById('modalImovelFoto');
const modalImovelNome = document.getElementById('modalImovelNome');
const modalImovelEndereco = document.getElementById('modalImovelEndereco');
const modalImovelDescricao = document.getElementById('modalImovelDescricao');

let currentEditingImovel = null;

// URL da foto do imóvel (será armazenada aqui)
let fotoImovelURL = '';

// Funções auxiliares
function mostrarFormulario() {
    formImovelContainer.style.display = 'block';
}

function ocultarFormulario() {
    formImovelContainer.style.display = 'none';
}

function limparFormulario() {
    formImovel.reset();
    currentEditingImovel = null;
    fotoImovelURL = '';
}

function mostrarModal() {
    imovelModal.style.display = 'block';
}

function fecharModal() {
    imovelModal.style.display = 'none';
}

// Lógica para mostrar/ocultar o formulário
adicionarImovelBtn.addEventListener('click', () => {
    mostrarFormulario();
});

// Lógica para carregar e exibir os cards dos imóveis
function carregarImoveis() {
    const imoveis = Imovel.listarTodos();
    imoveisCardsContainer.innerHTML = '';

    imoveis.forEach(imovel => {
        const card = document.createElement('div');
        card.classList.add('imovel-card');

        let situacaoClass = '';
        let situacaoIcon = '';
        switch (imovel.situacao) {
            case 'Liberado':
                situacaoClass = 'situacao-liberado';
                situacaoIcon = '✅';
                break;
            case 'Locado':
                situacaoClass = 'situacao-locado';
                situacaoIcon = '🔑';
                break;
            case 'Em limpeza':
                situacaoClass = 'situacao-em-limpeza';
                situacaoIcon = '🧹';
                break;
            case 'Suspenso':
                situacaoClass = 'situacao-suspenso';
                situacaoIcon = '🚫';
                break;
            case 'Inativo':
                situacaoClass = 'situacao-inativo';
                situacaoIcon = '💤';
                break;
            default:
                situacaoClass = 'situacao-inativo';
                situacaoIcon = '❓';
                break;
        }

        card.innerHTML = `
            <img src="${imovel.foto || 'assets/img/no-image.png'}" alt="${imovel.apelido}">
            <div class="imovel-card-content">
                <h3>${imovel.apelido}</h3>
                <p>${imovel.nome}</p>
                <p class="${situacaoClass}">${situacaoIcon} ${imovel.situacao}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            abrirModal(imovel);
        });

        imoveisCardsContainer.appendChild(card);
    });
}

// Lógica para abrir o modal de visualização
function abrirModal(imovel) {
    currentEditingImovel = imovel;
    modalImovelApelido.textContent = imovel.apelido;
    modalImovelFoto.src = imovel.foto || 'assets/img/no-image.png';
    modalImovelNome.textContent = `Nome: ${imovel.nome}`;
    modalImovelEndereco.textContent = `Endereço: ${imovel.endereco}`;
    modalImovelDescricao.textContent = `Descrição: ${imovel.descricao}`;
    mostrarModal();
}

// Lógica para fechar o modal
function fecharModal() {
    imovelModal.style.display = 'none';
}

// Lógica para editar o imóvel (abre o formulário com os dados)
function editarImovelModal() {
    if (currentEditingImovel) {
        mostrarFormulario();
        const imovel = currentEditingImovel;
        document.getElementById('imovelId').value = imovel.codigo;
        document.getElementById('apelido').value = imovel.apelido;
        document.getElementById('situacao').value = imovel.situacao;
        document.getElementById('nome').value = imovel.nome;
        document.getElementById('descricao').value = imovel.descricao;
        document.getElementById('endereco').value = imovel.endereco;
        document.getElementById('googleMapsLink').value = imovel.googleMapsLink;
        document.getElementById('instrucoesChegada').value = imovel.instrucoesChegada;
        fotoImovelURL = imovel.foto; // Carrega a URL da foto existente
        // Exibe a foto atual (se houver)
        if (imovel.foto) {
            // Criar uma pré-visualização da imagem
        }

        formImovelContainer.scrollIntoView({ behavior: 'smooth' }); // Scroll até o formulário
        fecharModal();
    }
}

// Lógica para excluir o imóvel (com 3 confirmações)
function excluirImovelModal() {
    if (currentEditingImovel) {
        if (confirm('Tem certeza que deseja excluir este imóvel? (1/3)')) {
            if (confirm('Esta ação é irreversível. Confirmar exclusão? (2/3)')) {
                if (confirm('Última chance! Deseja realmente excluir este imóvel? (3/3)')) {
                    const imovel = new Imovel(currentEditingImovel.codigo);
                    imovel.excluir();
                    fecharModal();
                    carregarImoveis();
                }
            }
        }
    }
}

// Lógica para salvar o imóvel
function salvarImovel(e) {
    e.preventDefault();
    const imovelId = document.getElementById('imovelId').value;

    const apelido = document.getElementById('apelido').value;
    const situacao = document.getElementById('situacao').value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const endereco = document.getElementById('endereco').value;
    const googleMapsLink = document.getElementById('googleMapsLink').value;
    const instrucoesChegada = document.getElementById('instrucoesChegada').value;

    let imovel;
    if (imovelId) {
        // Editar imóvel existente
        imovel = new Imovel(
            imovelId,
            apelido,
            situacao,
            nome,
            descricao,
            endereco,
            googleMapsLink,
            instrucoesChegada,
            fotoImovelURL, // Passa a URL da foto
        );
    } else {
        // Novo imóvel
        imovel = new Imovel(
            null,
            apelido,
            situacao,
            nome,
            descricao,
            endereco,
            googleMapsLink,
            instrucoesChegada,
            fotoImovelURL // Passa a URL da foto
        );
    }

    imovel.salvar();
    limparFormulario();
    ocultarFormulario();
    carregarImoveis();

}

// Lógica para lidar com o upload da foto
fotoImovelInput.addEventListener('change', function() {
    const file = fotoImovelInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoImovelURL = e.target.result; // Armazena a URL da foto
            // Pré-visualizar a imagem (opcional)
            // previewFoto.src = fotoImovelURL;
        }
        reader.readAsDataURL(file);
    } else {
        fotoImovelURL = ''; // Limpa a URL se nenhum arquivo for selecionado
    }
});

// Event listeners
formImovel.addEventListener('submit', salvarImovel);
window.addEventListener('DOMContentLoaded', carregarImoveis);
