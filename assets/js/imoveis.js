// assets/js/imoveis.js

// Elementos do DOM
const adicionarImovelBtn = document.getElementById('adicionarImovelBtn');
const formImovelContainer = document.getElementById('formImovelContainer');
const formImovel = document.getElementById('formImovel');
const imoveisCardsContainer = document.getElementById('imoveisCardsContainer');
const fotoImovelInput = document.getElementById('fotoImovel');
const previewFotoImovel = document.getElementById('previewFotoImovel'); // Adicionado para pré-visualização da foto

const imovelModal = document.getElementById('imovelModal');
const modalImovelApelido = document.getElementById('modalImovelApelido');
const modalImovelFoto = document.getElementById('modalImovelFoto');
const modalImovelNome = document.getElementById('modalImovelNome');
const modalImovelEndereco = document.getElementById('modalImovelEndereco');
const modalImovelDescricao = document.getElementById('modalImovelDescricao');
const modalImovelSituacao = document.getElementById('modalImovelSituacao'); // Adicionado para exibir situação no modal

let currentEditingImovel = null;
let fotoImovelURL = ''; // URL da foto do imóvel (será armazenada aqui)

// Funções auxiliares
function mostrarFormulario() {
    formImovelContainer.style.display = 'block';
    formImovel.scrollIntoView({ behavior: 'smooth' });
}

function ocultarFormulario() {
    formImovelContainer.style.display = 'none';
    limparFormulario();
}

function limparFormulario() {
    formImovel.reset();
    document.getElementById('imovelId').value = '';
    currentEditingImovel = null;
    fotoImovelURL = '';
    if (previewFotoImovel) {
        previewFotoImovel.src = '';
        previewFotoImovel.style.display = 'none';
    }
}

function mostrarModal() {
    imovelModal.style.display = 'block';
}

function fecharModal() {
    imovelModal.style.display = 'none';
}

// Lógica para mostrar/ocultar o formulário
adicionarImovelBtn.addEventListener('click', () => {
    limparFormulario(); // Limpa antes de mostrar para um novo cadastro
    mostrarFormulario();
    document.getElementById('formImovel').querySelector('button[type="submit"]').textContent = '💾 Salvar Imóvel';
});

// Lógica para carregar e exibir os cards dos imóveis
function carregarImoveis() {
    const imoveis = Imovel.listarTodos();
    imoveisCardsContainer.innerHTML = '';

    if (imoveis.length === 0) {
        imoveisCardsContainer.innerHTML = '<p style="width: 100%; text-align: center; color: var(--text-light);">Nenhum imóvel cadastrado. Clique em "Adicionar Imóvel" para começar.</p>';
        return;
    }

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

        const fotoSrc = imovel.foto || 'https://via.placeholder.com/150x100?text=Sem+Foto';

        card.innerHTML = `
            <img src="${fotoSrc}" alt="${imovel.apelido}" class="imovel-card-mini-foto">
            <div class="imovel-card-content">
                <h3>${imovel.apelido}</h3>
                <p class="imovel-card-endereco">${imovel.endereco}</p>
                <div class="situacao-info ${situacaoClass}">
                    <span>${situacaoIcon} ${imovel.situacao}</span>
                </div>
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
    modalImovelFoto.src = imovel.foto || 'https://via.placeholder.com/600x400?text=Sem+Foto';
    modalImovelNome.textContent = `Nome: ${imovel.nome}`;
    modalImovelEndereco.textContent = `Endereço: ${imovel.endereco}`;
    modalImovelDescricao.textContent = `Descrição: ${imovel.descricao}`;
    modalImovelSituacao.textContent = `Situação: ${imovel.situacao}`; // Exibe a situação no modal
    mostrarModal();
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
        fotoImovelURL = imovel.foto;
        if (previewFotoImovel) {
            previewFotoImovel.src = imovel.foto || '';
            previewFotoImovel.style.display = imovel.foto ? 'block' : 'none';
        }
        document.getElementById('formImovel').querySelector('button[type="submit"]').textContent = '💾 Salvar Alterações';
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
        imovel = new Imovel(
            parseInt(imovelId),
            apelido,
            situacao,
            nome,
            descricao,
            endereco,
            googleMapsLink,
            instrucoesChegada,
            fotoImovelURL,
            currentEditingImovel ? currentEditingImovel.comodos : [] // Mantém os cômodos ao editar
        );
    } else {
        imovel = new Imovel(
            null,
            apelido,
            situacao,
            nome,
            descricao,
            endereco,
            googleMapsLink,
            instrucoesChegada,
            fotoImovelURL
        );
    }

    imovel.salvar();
    ocultarFormulario();
    carregarImoveis();
}

// Lógica para lidar com o upload da foto e pré-visualização
fotoImovelInput.addEventListener('change', function() {
    const file = fotoImovelInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoImovelURL = e.target.result; // Armazena a URL da foto em Base64
            if (previewFotoImovel) {
                previewFotoImovel.src = fotoImovelURL;
                previewFotoImovel.style.display = 'block';
            }
        }
        reader.readAsDataURL(file);
    } else {
        fotoImovelURL = '';
        if (previewFotoImovel) {
            previewFotoImovel.src = '';
            previewFotoImovel.style.display = 'none';
        }
    }
});

// Event listeners
formImovel.addEventListener('submit', salvarImovel);

// Expor funções globalmente se necessário para outros scripts ou HTML inline
window.carregarImoveis = carregarImoveis;
window.fecharModal = fecharModal;
window.editarImovelModal = editarImovelModal;
window.excluirImovelModal = excluirImovelModal;

// Chamada inicial para carregar os imóveis quando a página estiver pronta
window.addEventListener('DOMContentLoaded', carregarImoveis);
