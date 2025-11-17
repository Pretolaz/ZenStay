
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
    cancelarComodoBtn.addEventListener('click', resetFormComodo);
    
    // Tenta carregar o primeiro imóvel da lista, se houver
    const todosImoveis = Imovel.listarTodos();
    if (todosImoveis.length > 0) {
        const primeiroImovel = todosImoveis[0];
        selectImovelComodos.value = primeiroImovel.codigo;
        handleImovelSelectionChangeComodos(); // Dispara a lógica de seleção
    }
}

function popularSelectImoveisComodos() {
    const todosImoveis = Imovel.listarTodos();
    selectImovelComodos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    todosImoveis.forEach(imovel => {
        const option = document.createElement('option');
        option.value = imovel.codigo;
        option.textContent = imovel.apelido;
        selectImovelComodos.appendChild(option);
    });
}

function handleImovelSelectionChangeComodos() {
    const codigoImovel = selectImovelComodos.value;
    if (codigoImovel) {
        const imovelData = Imovel.listarTodos().find(i => i.codigo == codigoImovel);
        if (imovelData) {
            // Cria uma instância completa do Imovel para ter acesso aos seus métodos
            currentImovel = new Imovel(
                imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, 
                imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca, 
                imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, 
                imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos
            );
            imovelApelidoComodos.textContent = currentImovel.apelido;
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
                <td>${comodo.codigo}</td>
                <td>${currentImovel.apelido}</td>
                <td>${comodo.icone}</td>
                <td>${comodo.nome}</td>
                <td>
                    <button class="action-btn" onclick="editarComodo(${comodo.codigo})" title="Editar">✏️</button>
                    <button class="action-btn" onclick="excluirComodo(${comodo.codigo})" title="Excluir">🗑️</button>
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

    const codigoComodo = comodoIdInput.value ? parseInt(comodoIdInput.value, 10) : null;
    const nome = nomeComodoInput.value;
    const icone = iconeComodoInput.value;

    if (codigoComodo) {
        currentImovel.editarComodo(codigoComodo, nome, icone);
    } else {
        currentImovel.adicionarComodo(nome, icone);
    }
    
    // Após salvar, o `currentImovel` foi modificado e salvo no localStorage.
    // Recarregamos a tabela para refletir as mudanças.
    carregarComodosDoImovel();
    resetFormComodo();
}

function editarComodo(codigoComodo) {
    if (currentImovel) {
        const comodo = currentImovel.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
            comodoIdInput.value = comodo.codigo;
            codigoComodoInput.value = comodo.codigo;
            nomeComodoInput.value = comodo.nome;
            iconeComodoInput.value = comodo.icone;
            document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar Cômodo';
            window.scrollTo(0, 0); // Rola a página para o topo para focar no formulário
        }
    }
}

function excluirComodo(codigoComodo) {
    if (confirm('Tem certeza que deseja excluir este cômodo? Todos os objetos dentro dele também serão perdidos.')) {
        if (currentImovel) {
            currentImovel.removerComodo(codigoComodo);
            carregarComodosDoImovel(); // Recarrega a tabela
        }
    }
}

function resetFormComodo() {
    formComodo.reset();
    comodoIdInput.value = '';
    codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
}

// Expõe as funções necessárias globalmente
window.gerenciarComodos = handleImovelSelectionChangeComodos; // Reutiliza a lógica de seleção
window.inicializarComodos = inicializarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.currentImovelComodos = () => currentImovel;
