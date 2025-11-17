
// assets/js/objetos-comodo.js

// Declarar variáveis no escopo do módulo
let imovelComodoNomeObjetos, formObjeto, objetoIdInput, objetoComodoIdInput, codigoObjetoInput, 
    tipoObjetoInput, nomeObjetoInput, quantidadeObjetoInput, tabelaObjetosBody, 
    cancelarObjetoBtn, selectImovelObjetos, selectComodoObjetos;

let currentComodoObjetos = null;

// Função de inicialização para a seção de inventário
function inicializarInventario() {
    // Atribuir elementos do DOM somente quando a função é chamada
    imovelComodoNomeObjetos = document.getElementById('imovel-comodo-nome-objetos');
    formObjeto = document.getElementById('formObjeto');
    objetoIdInput = document.getElementById('objetoId');
    objetoComodoIdInput = document.getElementById('objetoComodoId');
    codigoObjetoInput = document.getElementById('codigoObjeto');
    tipoObjetoInput = document.getElementById('tipoObjeto');
    nomeObjetoInput = document.getElementById('nomeObjeto');
    quantidadeObjetoInput = document.getElementById('quantidadeObjeto');
    tabelaObjetosBody = document.querySelector('#tabelaObjetos tbody');
    cancelarObjetoBtn = document.getElementById('cancelarObjeto');
    selectImovelObjetos = document.getElementById('selectImovelObjetos');
    selectComodoObjetos = document.getElementById('selectComodoObjetos');

    // Configurar listeners de eventos
    selectImovelObjetos.addEventListener('change', handleImovelSelectionChange);
    selectComodoObjetos.addEventListener('change', handleComodoSelectionChange);
    formObjeto.addEventListener('submit', salvarObjeto);
    cancelarObjetoBtn.addEventListener('click', resetFormObjeto);

    // Lógica de inicialização
    popularSelectImoveisObjetos();
    resetInventario();
}

function resetInventario() {
    if (selectImovelObjetos) selectImovelObjetos.value = '';
    if (selectComodoObjetos) selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    if (tabelaObjetosBody) tabelaObjetosBody.innerHTML = '';
    if (imovelComodoNomeObjetos) imovelComodoNomeObjetos.textContent = '';
    resetFormObjeto();
}

function popularSelectImoveisObjetos() {
    const todosImoveis = Imovel.listarTodos();
    selectImovelObjetos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    todosImoveis.forEach(imovelData => {
        const option = document.createElement('option');
        option.value = imovelData.codigo;
        option.textContent = imovelData.apelido;
        selectImovelObjetos.appendChild(option);
    });
}

function handleImovelSelectionChange() {
    const codigoImovel = selectImovelObjetos.value;
    popularSelectComodosObjetos(codigoImovel);
    tabelaObjetosBody.innerHTML = '';
    imovelComodoNomeObjetos.textContent = '';
    currentComodoObjetos = null;
    if(objetoComodoIdInput) objetoComodoIdInput.value = '';
    if(selectComodoObjetos) selectComodoObjetos.value = '';
}

function popularSelectComodosObjetos(codigoImovel) {
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    if (codigoImovel) {
        const imovel = Imovel.listarTodos().find(i => i.codigo == codigoImovel);
        if (imovel && imovel.comodos) {
            imovel.comodos.forEach(comodo => {
                const option = document.createElement('option');
                option.value = comodo.codigo;
                option.textContent = comodo.nome;
                selectComodoObjetos.appendChild(option);
            });
        }
    }
}

function handleComodoSelectionChange() {
    const codigoComodo = selectComodoObjetos.value;
    const codigoImovel = selectImovelObjetos.value;

    if (codigoComodo && codigoImovel) {
        const imovelData = Imovel.listarTodos().find(i => i.codigo == codigoImovel);
        if (imovelData) {
            const comodoData = imovelData.comodos.find(c => c.codigo == codigoComodo);
            if (comodoData) {
                currentComodoObjetos = new Comodo(comodoData.codigo, comodoData.nome, comodoData.icone, comodoData.objetos);
                imovelComodoNomeObjetos.textContent = `${imovelData.apelido} > ${currentComodoObjetos.nome}`;
                objetoComodoIdInput.value = currentComodoObjetos.codigo;
                carregarObjetosDoComodo();
            }
        }
    } else {
        tabelaObjetosBody.innerHTML = '';
        imovelComodoNomeObjetos.textContent = '';
        currentComodoObjetos = null;
        if(objetoComodoIdInput) objetoComodoIdInput.value = '';
    }
}

function carregarObjetosDoComodo() {
    tabelaObjetosBody.innerHTML = '';
    if (currentComodoObjetos && currentComodoObjetos.objetos) {
        currentComodoObjetos.objetos.forEach(objeto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${objeto.codigo}</td>
                <td>${objeto.tipo}</td>
                <td>${objeto.nome}</td>
                <td>${objeto.quantidade}</td>
                <td>
                    <button class="action-btn" onclick="editarObjeto(${objeto.codigo})" title="Editar">✏️</button>
                    <button class="action-btn" onclick="excluirObjeto(${objeto.codigo})" title="Excluir">🗑️</button>
                </td>
            `;
            tabelaObjetosBody.appendChild(row);
        });
    }
}

function salvarObjeto(e) {
    e.preventDefault();

    const codigoImovel = selectImovelObjetos.value;
    const codigoComodo = selectComodoObjetos.value;

    if (!codigoImovel || !codigoComodo) {
        alert('Por favor, selecione um imóvel e um cômodo para adicionar objetos.');
        return;
    }

    const imovel = Imovel.listarTodos().find(i => i.codigo == codigoImovel);
    if (!imovel) {
        alert('Imóvel não encontrado!');
        return;
    }

    const comodo = imovel.comodos.find(c => c.codigo == codigoComodo);
    if (!comodo) {
        alert('Cômodo não encontrado!');
        return;
    }
    
    const imovelInstance = new Imovel(...Object.values(imovel));

    const codigoObjeto = objetoIdInput.value ? parseInt(objetoIdInput.value) : null;
    const tipo = tipoObjetoInput.value;
    const nome = nomeObjetoInput.value;
    const quantidade = parseInt(quantidadeObjetoInput.value);

    const comodoInstance = imovelInstance.comodos.find(c => c.codigo == codigoComodo);

    if (codigoObjeto) {
        comodoInstance.editarObjeto(codigoObjeto, tipo, nome, quantidade);
    } else {
        comodoInstance.adicionarObjeto(tipo, nome, quantidade);
    }
    
    imovelInstance.salvar();

    resetFormObjeto();
    currentComodoObjetos = comodoInstance; 
    carregarObjetosDoComodo();
}

function editarObjeto(codigoObjeto) {
    if (currentComodoObjetos) {
        const objeto = currentComodoObjetos.objetos.find(obj => obj.codigo === codigoObjeto);
        if (objeto) {
            objetoIdInput.value = objeto.codigo;
            codigoObjetoInput.value = objeto.codigo;
            tipoObjetoInput.value = objeto.tipo;
            nomeObjetoInput.value = objeto.nome;
            quantidadeObjetoInput.value = objeto.quantidade;
            document.querySelector('#formObjeto button[type="submit"]').textContent = '💾 Salvar Objeto';
        }
    }
}

function excluirObjeto(codigoObjeto) {
    if (confirm('Tem certeza que deseja excluir este objeto?')) {
        const codigoImovel = selectImovelObjetos.value;
        const imovelData = Imovel.listarTodos().find(i => i.codigo == codigoImovel);
        if (imovelData) {
            const imovel = new Imovel(...Object.values(imovelData));
            const comodo = imovel.comodos.find(c => c.codigo == currentComodoObjetos.codigo);
            if (comodo) {
                comodo.removerObjeto(codigoObjeto);
                imovel.salvar();
                currentComodoObjetos = comodo;
                carregarObjetosDoComodo();
            }
        }
        resetFormObjeto();
    }
}

function resetFormObjeto() {
    if (!formObjeto) return;
    formObjeto.reset();
    objetoIdInput.value = '';
    codigoObjetoInput.value = '';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
}

// Expor funções globalmente
window.inicializarInventario = inicializarInventario;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;
