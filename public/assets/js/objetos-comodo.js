
// assets/js/objetos-comodo.js

// Escopo do módulo para as variáveis principais
let tabelaObjetosBody, formObjeto, objetoIdInput, codigoObjetoInput, 
    tipoObjetoInput, nomeObjetoInput, quantidadeObjetoInput, 
    cancelarObjetoBtn, selectImovelObjetos, selectComodoObjetos;

let allObjects = [];
let sortState = { key: 'codigo', ascending: true };

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
                            imovelId: imovel.codigo,
                            imovelApelido: imovel.apelido,
                            comodoId: comodo.codigo,
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
    // Ordena a lista de objetos
    const sortedObjects = [...allObjects].sort((a, b) => {
        const valA = a[sortState.key];
        const valB = b[sortState.key];

        if (valA < valB) return sortState.ascending ? -1 : 1;
        if (valA > valB) return sortState.ascending ? 1 : -1;
        return 0;
    });

    tabelaObjetosBody.innerHTML = '';
    sortedObjects.forEach(obj => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${obj.codigo}</td>
            <td>${obj.imovelApelido}</td>
            <td>${obj.comodoNome}</td>
            <td>${obj.tipo}</td>
            <td>${obj.nome}</td>
            <td>${obj.quantidade}</td>
            <td>
                <button class="action-btn" onclick="editarObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.codigo})" title="Editar">✏️</button>
                <button class="action-btn" onclick="excluirObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.codigo})" title="Excluir">🗑️</button>
            </td>
        `;
        tabelaObjetosBody.appendChild(row);
    });

    // Atualiza os indicadores de ordenação no cabeçalho
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
        option.value = imovel.codigo;
        option.textContent = imovel.apelido;
        selectImovelObjetos.appendChild(option);
    });
}

function popularSelectComodosObjetos(imovelId) {
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    if (!imovelId) return;
    const imovel = Imovel.listarTodos().find(i => i.codigo == imovelId);
    if (imovel && imovel.comodos) {
        imovel.comodos.forEach(comodo => {
            const option = document.createElement('option');
            option.value = comodo.codigo;
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
        alert('Por favor, selecione um imóvel and um cômodo.');
        return;
    }

    const imovelData = Imovel.listarTodos().find(i => i.codigo == imovelId);
    if (!imovelData) return;

    // Use o construtor correto para recriar a instância do Imovel
    const imovel = new Imovel(imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca, imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos);
    const comodo = imovel.comodos.find(c => c.codigo == comodoId);
    if (!comodo) return;

    const tipo = tipoObjetoInput.value;
    const nome = nomeObjetoInput.value;
    const quantidade = parseInt(quantidadeObjetoInput.value, 10);

    if (objetoId) {
        comodo.editarObjeto(objetoId, tipo, nome, quantidade);
    } else {
        comodo.adicionarObjeto(tipo, nome, quantidade);
    }

    imovel.salvar();
    loadAndRenderAllObjects(); // Recarrega e renderiza todos os objetos
    resetFormObjeto();
}

function editarObjeto(imovelId, comodoId, objetoId) {
    const imovelData = Imovel.listarTodos().find(i => i.codigo === imovelId);
    if (!imovelData || !imovelData.comodos) return;
    
    const comodoData = imovelData.comodos.find(c => c.codigo === comodoId);
    if (!comodoData || !comodoData.objetos) return;

    const objeto = comodoData.objetos.find(o => o.codigo === objetoId);
    if (!objeto) return;

    // Preenche os selects e o formulário
    selectImovelObjetos.value = imovelId;
    popularSelectComodosObjetos(imovelId);
    selectComodoObjetos.value = comodoId;
    objetoIdInput.value = objeto.codigo;
    codigoObjetoInput.value = objeto.codigo;
    tipoObjetoInput.value = objeto.tipo;
    nomeObjetoInput.value = objeto.nome;
    quantidadeObjetoInput.value = objeto.quantidade;

    document.querySelector('#formObjeto button[type="submit"]').textContent = '💾 Salvar Objeto';
    window.scrollTo(0, 0); // Foco no formulário
}

function excluirObjeto(imovelId, comodoId, objetoId) {
    if (!confirm('Tem certeza que deseja excluir este objeto?')) return;

    const imovelData = Imovel.listarTodos().find(i => i.codigo === imovelId);
    if (!imovelData) return;

    // Recria a instância do Imovel para usar seus métodos
    const imovel = new Imovel(imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca, imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos);
    const comodo = imovel.comodos.find(c => c.codigo === comodoId);

    if (comodo) {
        comodo.removerObjeto(objetoId);
        imovel.salvar();
    }
    
    loadAndRenderAllObjects();
    resetFormObjeto();
}

function resetFormObjeto() {
    formObjeto.reset();
    objetoIdInput.value = '';
    codigoObjetoInput.value = '';
    selectImovelObjetos.value = '';
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
}

// Expor funções globais
window.inicializarInventario = inicializarInventario;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;
