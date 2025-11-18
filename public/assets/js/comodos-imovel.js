// assets/js/comodos-imovel.js

const imovelApelidoComodos = document.getElementById('imovel-apelido-comodos');
const formComodo = document.getElementById('formComodo');
const comodoIdInput = document.getElementById('comodoId');
const codigoComodoInput = document.getElementById('codigoComodo');
const nomeComodoInput = document.getElementById('nomeComodo');
const iconeComodoInput = document.getElementById('iconeComodo');
const tabelaComodosBody = document.querySelector('#tabelaComodos tbody');
const cancelarComodoBtn = document.getElementById('cancelarComodo');
const selectImovelComodos = document.getElementById('selectImovelComodos');

let currentImovel = null; // Armazena a instância completa do imóvel selecionado

function inicializarComodos() {
    popularSelectImoveisComodos();
    selectImovelComodos.addEventListener('change', handleImovelSelectionChangeComodos);
    formComodo.addEventListener('submit', salvarComodo);
    if (cancelarComodoBtn) {
        cancelarComodoBtn.addEventListener('click', resetFormComodo);
    }
    
    const todosImoveis = Imovel.listarTodos();
    if (todosImoveis.length > 0) {
        const primeiroImovel = todosImoveis[0];
        selectImovelComodos.value = primeiroImovel.id;
        handleImovelSelectionChangeComodos();
    }
}

function popularSelectImoveisComodos() {
    const todosImoveis = Imovel.listarTodos();
    selectImovelComodos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    todosImoveis.forEach(imovel => {
        const option = document.createElement('option');
        option.value = imovel.id; // CORREÇÃO: Usar id
        option.textContent = imovel.titulo; // CORREÇÃO: Usar titulo
        selectImovelComodos.appendChild(option);
    });
}

function handleImovelSelectionChangeComodos() {
    const imovelId = selectImovelComodos.value;
    if (imovelId) {
        const imovelData = Imovel.listarTodos().find(i => i.id == imovelId); // CORREÇÃO: Buscar por id
        if (imovelData) {
            // CORREÇÃO: Usar o construtor moderno que aceita um objeto
            currentImovel = new Imovel(imovelData);
            imovelApelidoComodos.textContent = currentImovel.titulo; // CORREÇÃO: Usar titulo
            carregarComodosDoImovel();
        }
    } else {
        currentImovel = null;
        imovelApelidoComodos.textContent = '';
        tabelaComodosBody.innerHTML = '';
    }
    resetFormComodo();
}

function carregarComodosDoImovel() {
    tabelaComodosBody.innerHTML = '';
    if (currentImovel && currentImovel.comodos) {
        currentImovel.comodos.forEach(comodo => {
            const row = document.createElement('tr');
            // CORREÇÃO: Usar comodo.id e currentImovel.titulo
            row.innerHTML = `
                <td>${comodo.id}</td>
                <td>${currentImovel.titulo}</td>
                <td>${comodo.icone}</td>
                <td>${comodo.nome}</td>
                <td>
                    <button class="action-btn" onclick="editarComodo(${comodo.id})" title="Editar">✏️</button>
                    <button class="action-btn" onclick="excluirComodo(${comodo.id})" title="Excluir">🗑️</button>
                </td>
            `;
            tabelaComodosBody.appendChild(row);
        });
    }
}

function salvarComodo(e) {
    e.preventDefault();

    if (!currentImovel) {
        alert('Por favor, selecione um imóvel para adicionar ou editar um cômodo.');
        return;
    }

    const comodoId = comodoIdInput.value ? parseInt(comodoIdInput.value, 10) : null;
    const nome = nomeComodoInput.value;
    const icone = iconeComodoInput.value;

    if (comodoId) {
        currentImovel.editarComodo(comodoId, nome, icone);
    } else {
        currentImovel.adicionarComodo(nome, icone);
    }
    
    carregarComodosDoImovel();
    resetFormComodo();
}

function editarComodo(comodoId) {
    if (currentImovel) {
        // CORREÇÃO: Buscar comodo por id
        const comodo = currentImovel.comodos.find(c => c.id === comodoId);
        if (comodo) {
            comodoIdInput.value = comodo.id;
            if(codigoComodoInput) codigoComodoInput.value = comodo.id; // Atualiza campo de exibição do código
            nomeComodoInput.value = comodo.nome;
            iconeComodoInput.value = comodo.icone;
            document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar Cômodo';
            window.scrollTo(0, 0);
        }
    }
}

function excluirComodo(comodoId) {
    if (confirm('Tem certeza que deseja excluir este cômodo? Todos os objetos dentro dele também serão perdidos.')) {
        if (currentImovel) {
            // CORREÇÃO: Chamar remoção por id
            currentImovel.removerComodo(comodoId);
            carregarComodosDoImovel();
        }
    }
}

function resetFormComodo() {
    formComodo.reset();
    comodoIdInput.value = '';
    if(codigoComodoInput) codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
}

// Expõe as funções necessárias globalmente
window.gerenciarComodos = handleImovelSelectionChangeComodos;
window.inicializarComodos = inicializarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.currentImovelComodos = () => currentImovel;
