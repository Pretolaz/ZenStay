// assets/js/objetos-comodo.js

// Escopo do módulo para as variáveis principais
let tabelaObjetosBody, formObjeto, objetoIdInput, codigoObjetoInput, 
    tipoObjetoInput, nomeObjetoInput, quantidadeObjetoInput, 
    cancelarObjetoBtn, selectImovelObjetos, selectComodoObjetos;

let allObjects = [];
let sortState = { key: 'id', ascending: true };

function inicializarInventario() {
    // Atribuição de elementos do DOM
    tabelaObjetosBody = document.querySelector('#tabelaObjetos tbody');
    formObjeto = document.getElementById('formObjeto');
    objetoIdInput = document.getElementById('objetoId');
    codigoObjetoInput = document.getElementById('codigoObjeto');
    tipoObjetoInput = document.getElementById('tipoObjeto');
    nomeObjetoInput = document.getElementById('nomeObjeto');
    quantidadeObjetoInput = document.getElementById('quantidadeObjeto');
    cancelarObjetoBtn = document.getElementById('cancelarObjeto');
    selectImovelObjetos = document.getElementById('selectImovelObjetos');
    selectComodoObjetos = document.getElementById('selectComodoObjetos');

    // Listeners de eventos
    selectImovelObjetos.addEventListener('change', () => popularSelectComodosObjetos(selectImovelObjetos.value));
    formObjeto.addEventListener('submit', salvarObjeto);
    cancelarObjetoBtn.addEventListener('click', resetFormObjeto);
    document.querySelectorAll('#tabelaObjetos th[data-sort-key]').forEach(header => {
        header.addEventListener('click', () => handleSort(header.dataset.sortKey));
    });

    // Inicialização da UI
    popularSelectImoveisObjetos();
    loadAndRenderAllObjects();
    resetFormObjeto();
}

function loadAndRenderAllObjects() {
    const imoveis = Imovel.listarTodos();
    allObjects = [];
    imoveis.forEach(imovel => {
        if (imovel.comodos) {
            imovel.comodos.forEach(comodo => {
                if (comodo.objetos) {
                    comodo.objetos.forEach(objeto => {
                        allObjects.push({
                            ...objeto,
                            imovelId: imovel.id, // CORREÇÃO
                            imovelTitulo: imovel.titulo, // CORREÇÃO
                            comodoId: comodo.id, // CORREÇÃO
                            comodoNome: comodo.nome
                        });
                    });
                }
            });
        }
    });
    renderTable();
}

function handleSort(key) {
    if (sortState.key === key) {
        sortState.ascending = !sortState.ascending;
    } else {
        sortState.key = key;
        sortState.ascending = true;
    }
    renderTable();
}

function renderTable() {
    const sortedObjects = [...allObjects].sort((a, b) => {
        // Tratamento especial para ordenação numérica vs. alfabética
        const valA = (typeof a[sortState.key] === 'string') ? a[sortState.key].toLowerCase() : a[sortState.key];
        const valB = (typeof b[sortState.key] === 'string') ? b[sortState.key].toLowerCase() : b[sortState.key];

        if (valA < valB) return sortState.ascending ? -1 : 1;
        if (valA > valB) return sortState.ascending ? 1 : -1;
        return 0;
    });

    tabelaObjetosBody.innerHTML = '';
    sortedObjects.forEach(obj => {
        const row = document.createElement('tr');
        // CORREÇÃO: Usar `id` do objeto e `imovelTitulo`
        row.innerHTML = `
            <td>${obj.id}</td>
            <td>${obj.imovelTitulo}</td>
            <td>${obj.comodoNome}</td>
            <td>${obj.tipo}</td>
            <td>${obj.nome}</td>
            <td>${obj.quantidade}</td>
            <td>
                <button class="action-btn" onclick="editarObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Editar">✏️</button>
                <button class="action-btn" onclick="excluirObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Excluir">🗑️</button>
            </td>
        `;
        tabelaObjetosBody.appendChild(row);
    });

    document.querySelectorAll('#tabelaObjetos th[data-sort-key] span').forEach(span => span.textContent = '');
    const activeHeader = document.querySelector(`#tabelaObjetos th[data-sort-key='${sortState.key}'] span`);
    if (activeHeader) {
        activeHeader.textContent = sortState.ascending ? ' ▲' : ' ▼';
    }
}

function popularSelectImoveisObjetos() {
    selectImovelObjetos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    Imovel.listarTodos().forEach(imovel => {
        const option = document.createElement('option');
        option.value = imovel.id; // CORREÇÃO
        option.textContent = imovel.titulo; // CORREÇÃO
        selectImovelObjetos.appendChild(option);
    });
}

function popularSelectComodosObjetos(imovelId) {
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    if (!imovelId) return;
    const imovel = Imovel.listarTodos().find(i => i.id == imovelId); // CORREÇÃO
    if (imovel && imovel.comodos) {
        imovel.comodos.forEach(comodo => {
            const option = document.createElement('option');
            option.value = comodo.id; // CORREÇÃO
            option.textContent = comodo.nome;
            selectComodoObjetos.appendChild(option);
        });
    }
}

function salvarObjeto(e) {
    e.preventDefault();
    const imovelId = selectImovelObjetos.value;
    const comodoId = selectComodoObjetos.value;
    const objetoId = objetoIdInput.value ? parseInt(objetoIdInput.value) : null;

    if (!imovelId || !comodoId) {
        alert('Por favor, selecione um imóvel e um cômodo.');
        return;
    }

    const imovelData = Imovel.listarTodos().find(i => i.id == imovelId); // CORREÇÃO
    if (!imovelData) return;

    const imovel = new Imovel(imovelData); // CORREÇÃO: Construtor moderno
    const comodo = imovel.comodos.find(c => c.id == comodoId); // CORREÇÃO
    if (!comodo) return;

    const tipo = tipoObjetoInput.value;
    const nome = nomeObjetoInput.value;
    const quantidade = parseInt(quantidadeObjetoInput.value, 10);

    imovel.salvarObjeto(comodo.id, { id: objetoId, tipo, nome, quantidade });

    loadAndRenderAllObjects();
    resetFormObjeto();
}

function editarObjeto(imovelId, comodoId, objetoId) {
    const imovelData = Imovel.listarTodos().find(i => i.id === imovelId);
    if (!imovelData || !imovelData.comodos) return;
    
    const comodoData = imovelData.comodos.find(c => c.id === comodoId);
    if (!comodoData || !comodoData.objetos) return;

    const objeto = comodoData.objetos.find(o => o.id === objetoId); // CORREÇÃO
    if (!objeto) return;

    selectImovelObjetos.value = imovelId;
    popularSelectComodosObjetos(imovelId);
    selectComodoObjetos.value = comodoId;
    objetoIdInput.value = objeto.id; // CORREÇÃO
    if (codigoObjetoInput) codigoObjetoInput.value = objeto.id; // CORREÇÃO
    tipoObjetoInput.value = objeto.tipo;
    nomeObjetoInput.value = objeto.nome;
    quantidadeObjetoInput.value = objeto.quantidade;

    document.querySelector('#formObjeto button[type="submit"]').textContent = '💾 Salvar Objeto';
    window.scrollTo(0, 0);
}

function excluirObjeto(imovelId, comodoId, objetoId) {
    if (!confirm('Tem certeza que deseja excluir este objeto?')) return;

    const imovelData = Imovel.listarTodos().find(i => i.id === imovelId); // CORREÇÃO
    if (!imovelData) return;

    const imovel = new Imovel(imovelData); // CORREÇÃO: Construtor moderno
    imovel.removerObjeto(comodoId, objetoId); // Método mais direto se existir
    
    loadAndRenderAllObjects();
    resetFormObjeto();
}

function resetFormObjeto() {
    formObjeto.reset();
    objetoIdInput.value = '';
    if (codigoObjetoInput) codigoObjetoInput.value = '';
    selectImovelObjetos.value = '';
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
}

// Expor funções globais
window.inicializarInventario = inicializarInventario;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;
