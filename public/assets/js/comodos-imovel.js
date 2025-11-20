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

async function inicializarComodos() {
    await popularSelectImoveisComodos();
    selectImovelComodos.addEventListener('change', handleImovelSelectionChangeComodos);
    formComodo.addEventListener('submit', salvarComodo);
    if (cancelarComodoBtn) {
        cancelarComodoBtn.addEventListener('click', resetFormComodo);
    }

    const todosImoveis = await Imovel.listarTodos();
    if (todosImoveis.length > 0) {
        const primeiroImovel = todosImoveis[0];
        selectImovelComodos.value = primeiroImovel.id;
        handleImovelSelectionChangeComodos();
    }
}

async function popularSelectImoveisComodos() {
    const todosImoveis = await Imovel.listarTodos();
    selectImovelComodos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    todosImoveis.forEach(imovel => {
        const option = document.createElement('option');
        option.value = imovel.id;
        option.textContent = imovel.titulo;
        selectImovelComodos.appendChild(option);
    });
}

async function handleImovelSelectionChangeComodos() {
    const imovelId = selectImovelComodos.value;
    if (imovelId) {
        const todosImoveis = await Imovel.listarTodos();
        const imovelData = todosImoveis.find(i => i.id == imovelId);
        if (imovelData) {
            currentImovel = new Imovel(imovelData); // Ensure it's an instance
            imovelApelidoComodos.textContent = currentImovel.titulo;
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

async function salvarComodo(e) {
    e.preventDefault();

    if (!currentImovel) {
        Toast.warning('Por favor, selecione um imóvel para adicionar ou editar um cômodo.');
        return;
    }

    const comodoId = comodoIdInput.value ? parseInt(comodoIdInput.value, 10) : null;
    const nome = nomeComodoInput.value;
    const icone = iconeComodoInput.value;

    try {
        if (comodoId) {
            await currentImovel.editarComodo(comodoId, nome, icone);
            Toast.success("Cômodo atualizado com sucesso!");
        } else {
            await currentImovel.adicionarComodo(nome, icone);
            Toast.success("Cômodo adicionado com sucesso!");
        }

        carregarComodosDoImovel();
        resetFormComodo();
    } catch (error) {
        Toast.error("Erro ao salvar cômodo: " + error.message);
    }
}

function editarComodo(comodoId) {
    if (currentImovel) {
        const comodo = currentImovel.comodos.find(c => c.id === comodoId);
        if (comodo) {
            comodoIdInput.value = comodo.id;
            if (codigoComodoInput) codigoComodoInput.value = comodo.id;
            nomeComodoInput.value = comodo.nome;
            iconeComodoInput.value = comodo.icone;
            document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar Cômodo';
            window.scrollTo(0, 0);
        }
    }
}

async function excluirComodo(comodoId) {
    if (confirm('Tem certeza que deseja excluir este cômodo? Todos os objetos dentro dele também serão perdidos.')) {
        if (currentImovel) {
            try {
                await currentImovel.removerComodo(comodoId);
                Toast.success("Cômodo excluído com sucesso!");
                carregarComodosDoImovel();
            } catch (error) {
                Toast.error("Erro ao excluir cômodo: " + error.message);
            }
        }
    }
}

function resetFormComodo() {
    formComodo.reset();
    comodoIdInput.value = '';
    if (codigoComodoInput) codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
}

// Expõe as funções necessárias globalmente
window.gerenciarComodos = handleImovelSelectionChangeComodos;
window.inicializarComodos = inicializarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.currentImovelComodos = () => currentImovel;
window.addEventListener('DOMContentLoaded', inicializarComodos);
