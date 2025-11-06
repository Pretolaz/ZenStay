// assets/js/comodos-imovel.js

const imoveisListSection = document.getElementById('imoveis-list-section');
const comodosSection = document.getElementById('comodos-section');
const objetosSection = document.getElementById('objetos-section'); // Nova seção

const imovelApelidoComodos = document.getElementById('imovel-apelido-comodos');
const formComodo = document.getElementById('formComodo');
const comodoIdInput = document.getElementById('comodoId');
const comodoImovelIdInput = document.getElementById('comodoImovelId');
const codigoComodoInput = document.getElementById('codigoComodo');
const nomeComodoInput = document.getElementById('nomeComodo');
const iconeComodoInput = document.getElementById('iconeComodo');
const tabelaComodosBody = document.querySelector('#tabelaComodos tbody');
const voltarParaImoveisBtn = document.getElementById('voltarParaImoveis');
const cancelarComodoBtn = document.getElementById('cancelarComodo');

let currentImovelComodos = null; // Armazena o objeto Imovel cujos cômodos estão sendo gerenciados
let currentEditingComodo = null; // Armazena o objeto Comodo que está sendo editado (ou nulo)

// Função para alternar a visibilidade das seções
function toggleSection(sectionToShow) {
    imoveisListSection.style.display = 'none';
    comodosSection.style.display = 'none';
    objetosSection.style.display = 'none';

    if (sectionToShow === 'imoveis') {
        imoveisListSection.style.display = 'flex';
        currentImovelComodos = null;
        currentEditingComodo = null;
        formComodo.reset();
        comodoIdInput.value = '';
        document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    } else if (sectionToShow === 'comodos') {
        comodosSection.style.display = 'flex';
        currentEditingComodo = null;
        formComodo.reset();
        comodoIdInput.value = '';
        document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    } else if (sectionToShow === 'objetos') {
        objetosSection.style.display = 'flex';
    }
}

// Função chamada ao clicar em "Gerenciar Cômodos"
function gerenciarComodos(codigoImovel) {
    const imovel = Imovel.listarTodos().find(i => i.codigo === codigoImovel);
    if (imovel) {
        currentImovelComodos = imovel;
        imovelApelidoComodos.textContent = imovel.apelido;
        comodoImovelIdInput.value = imovel.codigo; // Guarda o ID do imóvel no campo oculto
        toggleSection('comodos');
        carregarComodosDoImovel();
    } else {
        console.error('Imóvel não encontrado para gerenciar cômodos.');
    }
}

// Carrega e exibe os cômodos do imóvel atual na tabela
function carregarComodosDoImovel() {
    tabelaComodosBody.innerHTML = '';
    if (currentImovelComodos && currentImovelComodos.comodos) {
        currentImovelComodos.comodos.forEach(comodo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${comodo.codigo}</td>
                <td>${comodo.icone}</td>
                <td>${comodo.nome}</td>
                <td>
                    <button class="action-btn" onclick="editarComodo(${comodo.codigo})" title="Editar">✏️</button>
                    <button class="action-btn" onclick="gerenciarObjetosDoComodo(${comodo.codigo})" title="Gerenciar Objetos">📦</button>
                    <button class="action-btn" onclick="excluirComodo(${comodo.codigo})" title="Excluir">🗑️</button>
                </td>
            `;
            tabelaComodosBody.appendChild(row);
        });
    }
}

// Salva um novo cômodo ou atualiza um existente
function salvarComodo(e) {
    e.preventDefault();

    if (!currentImovelComodos) {
        alert('Nenhum imóvel selecionado para adicionar cômodos.');
        return;
    }

    const codigoComodo = comodoIdInput.value ? parseInt(comodoIdInput.value) : null;
    const nome = nomeComodoInput.value;
    const icone = iconeComodoInput.value;

    if (codigoComodo) {
        // Editando cômodo existente
        const comodoToUpdate = currentImovelComodos.comodos.find(c => c.codigo === codigoComodo);
        if (comodoToUpdate) {
            comodoToUpdate.nome = nome;
            comodoToUpdate.icone = icone;
        }
    } else {
        // Adicionando novo cômodo
        // O código do cômodo é gerado pelo próprio Comodo na sua construção, ou seja, se for nulo ele gera
        const novoComodo = new Comodo(null, nome, icone);
        currentImovelComodos.comodos.push(novoComodo);
    }

    currentImovelComodos.salvar(); // Salva o imóvel com os cômodos atualizados
    formComodo.reset();
    comodoIdInput.value = ''; // Limpa o campo de edição
    codigoComodoInput.value = ''; // Limpa o código do cômodo (se houver)
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    carregarComodosDoImovel(); // Recarrega a tabela de cômodos
}

// Preenche o formulário para edição de um cômodo
function editarComodo(codigoComodo) {
    if (currentImovelComodos) {
        const comodo = currentImovelComodos.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
            currentEditingComodo = comodo; // Define o cômodo que está sendo editado
            comodoIdInput.value = comodo.codigo;
            codigoComodoInput.value = comodo.codigo;
            nomeComodoInput.value = comodo.nome;
            iconeComodoInput.value = comodo.icone;
            document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar Cômodo';
        }
    }
}

// Exclui um cômodo
function excluirComodo(codigoComodo) {
    if (confirm('Tem certeza que deseja excluir este cômodo e todos os seus objetos associados?')) {
        if (currentImovelComodos) {
            currentImovelComodos.comodos = currentImovelComodos.comodos.filter(c => c.codigo !== codigoComodo);
            currentImovelComodos.salvar(); // Salva o imóvel com os cômodos atualizados
            carregarComodosDoImovel();
            formComodo.reset();
            comodoIdInput.value = '';
            codigoComodoInput.value = '';
            document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
        }
    }
}

// Event Listeners
formComodo.addEventListener('submit', salvarComodo);
voltarParaImoveisBtn.addEventListener('click', () => toggleSection('imoveis'));
cancelarComodoBtn.addEventListener('click', () => {
    formComodo.reset();
    comodoIdInput.value = '';
    codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    currentEditingComodo = null;
});

// Expor funções globalmente para serem acessíveis do HTML
window.gerenciarComodos = gerenciarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.toggleSection = toggleSection; // Expor para objetos-comodo.js
window.currentImovelComodos = () => currentImovelComodos; // Expor para objetos-comodo.js
window.currentEditingComodo = () => currentEditingComodo; // Expor para objetos-comodo.js
