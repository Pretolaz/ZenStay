
// assets/js/objetos-comodo.js

const imovelComodoNomeObjetos = document.getElementById('imovel-comodo-nome-objetos');
const formObjeto = document.getElementById('formObjeto');
const objetoIdInput = document.getElementById('objetoId');
const objetoComodoIdInput = document.getElementById('objetoComodoId');
const codigoObjetoInput = document.getElementById('codigoObjeto');
const tipoObjetoInput = document.getElementById('tipoObjeto');
const nomeObjetoInput = document.getElementById('nomeObjeto');
const quantidadeObjetoInput = document.getElementById('quantidadeObjeto');
const tabelaObjetosBody = document.querySelector('#tabelaObjetos tbody');
const cancelarObjetoBtn = document.getElementById('cancelarObjeto');

const selectImovelObjetos = document.getElementById('selectImovelObjetos');
const selectComodoObjetos = document.getElementById('selectComodoObjetos');

let currentComodoObjetos = null;

function inicializarInventario() {
    popularSelectImoveisObjetos();
    selectImovelObjetos.addEventListener('change', handleImovelSelectionChange);
    selectComodoObjetos.addEventListener('change', handleComodoSelectionChange);
    
    // Limpar seleções e tabela ao inicializar
    selectImovelObjetos.value = '';
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    tabelaObjetosBody.innerHTML = '';
    imovelComodoNomeObjetos.textContent = '';
}

function popularSelectImoveisObjetos() {
    const todosImoveis = Imovel.listarTodos();
    selectImovelObjetos.innerHTML = '<option value="">Selecione um Imóvel</option>';
    todosImoveis.forEach(imovelData => {
        // Certifique-se de que está trabalhando com uma instância de Imovel
        const imovel = new Imovel(
            imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, 
            imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca,
            imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, 
            imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos,
            imovelData.objetos
        );
        const option = document.createElement('option');
        option.value = imovel.codigo;
        option.textContent = imovel.apelido;
        selectImovelObjetos.appendChild(option);
    });
}

function handleImovelSelectionChange() {
    const codigoImovel = selectImovelObjetos.value;
    popularSelectComodosObjetos(codigoImovel);
    tabelaObjetosBody.innerHTML = '';
    imovelComodoNomeObjetos.textContent = '';
    currentComodoObjetos = null;
    objetoComodoIdInput.value = '';
    selectComodoObjetos.value = '';
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
            // Recriar a instância do Imovel para garantir acesso aos métodos
            const imovel = new Imovel(
                imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, 
                imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca,
                imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, 
                imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos,
                imovelData.objetos
            );
            const comodo = imovel.comodos.find(c => c.codigo == codigoComodo);
            if (comodo) {
                currentComodoObjetos = comodo;
                imovelComodoNomeObjetos.textContent = `${imovel.apelido} > ${comodo.nome}`;
                objetoComodoIdInput.value = comodo.codigo;
                carregarObjetosDoComodo();
            }
        }
    } else {
        tabelaObjetosBody.innerHTML = '';
        imovelComodoNomeObjetos.textContent = '';
        currentComodoObjetos = null;
        objetoComodoIdInput.value = '';
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

    const todosImoveis = Imovel.listarTodos();
    const imovelData = todosImoveis.find(i => i.codigo == codigoImovel);
    
    if (!imovelData) {
        alert('Imóvel não encontrado!');
        return;
    }
    
    const imovel = new Imovel(
        imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, 
        imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca,
        imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, 
        imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos,
        imovelData.objetos
    );

    const comodo = imovel.comodos.find(c => c.codigo == codigoComodo);
    if (!comodo) {
        alert('Cômodo não encontrado!');
        return;
    }
    
    currentComodoObjetos = comodo;

    const codigoObjeto = objetoIdInput.value ? parseInt(objetoIdInput.value) : null;
    const tipo = tipoObjetoInput.value;
    const nome = nomeObjetoInput.value;
    const quantidade = parseInt(quantidadeObjetoInput.value);

    if (codigoObjeto) {
        comodo.editarObjeto(codigoObjeto, tipo, nome, quantidade);
    } else {
        comodo.adicionarObjeto(tipo, nome, quantidade);
    }
    
    imovel.salvar();

    formObjeto.reset();
    objetoIdInput.value = '';
    codigoObjetoInput.value = '';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
    
    // Sincroniza o estado atual do cômodo e recarrega a tabela
    currentComodoObjetos = comodo;
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
            const imovel = new Imovel(
                imovelData.codigo, imovelData.apelido, imovelData.nome, imovelData.endereco, 
                imovelData.googleMapsLink, imovelData.capacidadeAdulto, imovelData.capacidadeCrianca,
                imovelData.aceitaPet, imovelData.descricao, imovelData.instrucoesGerais, 
                imovelData.instrucoesChegada, imovelData.foto, imovelData.situacao, imovelData.comodos,
                imovelData.objetos
            );
            const comodo = imovel.comodos.find(c => c.codigo == currentComodoObjetos.codigo);
            if (comodo) {
                comodo.removerObjeto(codigoObjeto);
                imovel.salvar();
                currentComodoObjetos = comodo;
                carregarObjetosDoComodo();
            }
        }
        formObjeto.reset();
        objetoIdInput.value = '';
        codigoObjetoInput.value = '';
        document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
    }
}

formObjeto.addEventListener('submit', salvarObjeto);
cancelarObjetoBtn.addEventListener('click', () => {
    formObjeto.reset();
    objetoIdInput.value = '';
    codigoObjetoInput.value = '';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
});

// Expor funções globalmente
window.inicializarInventario = inicializarInventario;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;

