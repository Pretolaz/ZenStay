// assets/js/imoveis.js

// Elementos do DOM
const adicionarImovelBtn = document.getElementById('adicionarImovelBtn');
const formImovelContainer = document.getElementById('formImovelContainer');
const formImovel = document.getElementById('formImovel');
const imoveisCardsContainer = document.getElementById('imoveisCardsContainer');
const fotoImovelInput = document.getElementById('fotoImovel');
const previewFotoImovel = document.getElementById('previewFotoImovel');

const imovelModal = document.getElementById('imovelModal');
const modalImovelApelido = document.getElementById('modalImovelApelido');
const modalImovelFoto = document.getElementById('modalImovelFoto');
const modalImovelNome = document.getElementById('modalImovelNome');
const modalImovelEndereco = document.getElementById('modalImovelEndereco');
const modalImovelDescricao = document.getElementById('modalImovelDescricao');
const modalImovelSituacao = document.getElementById('modalImovelSituacao');
const modalImovelMoveis = document.getElementById('modalImovelMoveis');
const modalImovelUtensilios = document.getElementById('modalImovelUtensilios');

let currentEditingImovel = null;
let fotoImovelURL = '';

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
    limparFormulario();
    mostrarFormulario();
    document.getElementById('formImovel').querySelector('button[type="submit"]').textContent = '💾 Salvar Imóvel';
});

// Lógica para calcular móveis e utensílios
function calcularInventario(imovel) {
    let totalMoveis = 0;
    let totalUtensilios = 0;

    if (imovel.comodos) {
        imovel.comodos.forEach(comodo => {
            if (comodo.objetos) {
                comodo.objetos.forEach(objeto => {
                    if (objeto.tipo === 'Móvel') {
                        totalMoveis += objeto.quantidade;
                    } else if (objeto.tipo === 'Utensílio') {
                        totalUtensilios += objeto.quantidade;
                    }
                });
            }
        });
    }
    return { totalMoveis, totalUtensilios };
}

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
        // Use imovel.status instead of imovel.situacao if mapped, but let's support both or use the class property
        const status = imovel.status || imovel.situacao;

        switch (status) {
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
                situacaoIcon = '';
                break;
        }

        const fotoSrc = (imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : 'https://placehold.co/300x200?text=Sem+Foto';

        const { totalMoveis, totalUtensilios } = calcularInventario(imovel);

        card.innerHTML = `
            <h3 class="imovel-card-apelido">${imovel.titulo}</h3>
            <img src="${fotoSrc}" alt="${imovel.titulo}" class="imovel-card-mini-foto">
            <div class="imovel-card-content">
                <div class="situacao-info ${situacaoClass}">
                    <span>${situacaoIcon} ${status}</span>
                </div>
                <p>Móveis: ${totalMoveis}</p>
                <p>Utensílios: ${totalUtensilios}</p>
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
    modalImovelApelido.textContent = imovel.titulo;
    modalImovelFoto.src = (imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : 'https://placehold.co/600x400?text=Sem+Foto';
    modalImovelNome.textContent = `Nome: ${imovel.nome || ''}`;
    modalImovelEndereco.textContent = `Endereço: ${imovel.endereco || ''}`;
    modalImovelDescricao.textContent = `Descrição: ${imovel.descricao || ''}`;
    modalImovelSituacao.textContent = `Situação: ${imovel.status || ''}`;

    const { totalMoveis, totalUtensilios } = calcularInventario(imovel);
    modalImovelMoveis.textContent = `Móveis: ${totalMoveis}`;
    modalImovelUtensilios.textContent = `Utensílios: ${totalUtensilios}`;

    mostrarModal();
}

// Lógica para editar o imóvel (abre o formulário com os dados)
function editarImovelModal() {
    if (currentEditingImovel) {
        mostrarFormulario();
        const imovel = currentEditingImovel;
        document.getElementById('imovelId').value = imovel.codigoInterno;
        document.getElementById('apelido').value = imovel.titulo;
        document.getElementById('situacao').value = imovel.status;
        document.getElementById('nome').value = imovel.nome || '';
        document.getElementById('descricao').value = imovel.descricao || '';
        document.getElementById('endereco').value = imovel.endereco || '';
        document.getElementById('googleMapsLink').value = imovel.googleMapsLink || '';
        document.getElementById('instrucoesChegada').value = imovel.instrucoesChegada || '';
        document.getElementById('instrucoesGerais').value = imovel.instrucoesGerais || '';
        document.getElementById('capacidadeAdulto').value = imovel.capacidadeAdulto || '';
        document.getElementById('capacidadeCrianca').value = imovel.capacidadeCrianca || '';
        document.getElementById('aceitaPet').checked = imovel.aceitaPet || false;

        fotoImovelURL = (imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : '';
        if (previewFotoImovel) {
            previewFotoImovel.src = fotoImovelURL;
            previewFotoImovel.style.display = fotoImovelURL ? 'block' : 'none';
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
                    // FIX: Use static method directly
                    Imovel.excluir(currentEditingImovel.codigoInterno);
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
    const instrucoesGerais = document.getElementById('instrucoesGerais').value;
    const capacidadeAdulto = document.getElementById('capacidadeAdulto').value;
    const capacidadeCrianca = document.getElementById('capacidadeCrianca').value;
    const aceitaPet = document.getElementById('aceitaPet').checked;

    const imovelData = {
        codigoInterno: imovelId ? parseInt(imovelId) : null,
        titulo: apelido,
        status: situacao,
        nome: nome,
        descricao: descricao,
        endereco: endereco,
        googleMapsLink: googleMapsLink,
        instrucoesChegada: instrucoesChegada,
        instrucoesGerais: instrucoesGerais,
        capacidadeAdulto: parseInt(capacidadeAdulto) || 0,
        capacidadeCrianca: parseInt(capacidadeCrianca) || 0,
        aceitaPet: aceitaPet,
        fotos: fotoImovelURL ? [fotoImovelURL] : [],
        comodos: currentEditingImovel ? currentEditingImovel.comodos : []
    };

    Imovel.salvar(imovelData);
    ocultarFormulario();
    carregarImoveis();
}

// Lógica para lidar com o upload da foto e pré-visualização
fotoImovelInput.addEventListener('change', function () {
    const file = fotoImovelInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            fotoImovelURL = e.target.result;
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
