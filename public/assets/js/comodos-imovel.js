// assets/js/comodos-imovel.js

const imovelApelidoComodos = document.getElementById('imovel-apelido-comodos');
const formComodo = document.getElementById('formComodo');
const comodoIdInput = document.getElementById('comodoId');
const comodoImovelIdInput = document.getElementById('comodoImovelId');
const codigoComodoInput = document.getElementById('codigoComodo');
const nomeComodoInput = document.getElementById('nomeComodo');
const iconeComodoInput = document.getElementById('iconeComodo');
const tabelaComodosBody = document.querySelector('#tabelaComodos tbody');
const cancelarComodoBtn = document.getElementById('cancelarComodo');

// currentImovelComodos é setado em imoveis.html ao carregar a seção de cômodos
let currentImovelComodos = null; 
let currentEditingComodo = null; 

// Função chamada ao clicar em um cômodo na tabela (para edição ou gerenciar objetos)
function gerenciarComodos(codigoImovel) {
    const imovel = Imovel.listarTodos().find(i => i.codigo === codigoImovel);
    if (imovel) {
        currentImovelComodos = imovel;
        imovelApelidoComodos.textContent = imovel.apelido;
        comodoImovelIdInput.value = imovel.codigo; 
        carregarComodosDoImovel();
    } else {
        // console.error('Imóvel não encontrado para gerenciar cômodos.'); // Removido console.error
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
        const comodoToUpdate = currentImovelComodos.comodos.find(c => c.codigo === codigoComodo);
        if (comodoToUpdate) {
            comodoToUpdate.nome = nome;
            comodoToUpdate.icone = icone;
        }
    } else {
        const novoComodo = new Comodo(null, nome, icone);
        currentImovelComodos.comodos.push(novoComodo);
    }

    currentImovelComodos.salvar(); 
    formComodo.reset();
    comodoIdInput.value = ''; 
    codigoComodoInput.value = ''; 
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    carregarComodosDoImovel(); 
}

// Preenche o formulário para edição de um cômodo
function editarComodo(codigoComodo) {
    if (currentImovelComodos) {
        const comodo = currentImovelComodos.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
            currentEditingComodo = comodo; 
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
            currentImovelComodos.salvar(); 
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
cancelarComodoBtn.addEventListener('click', () => {
    formComodo.reset();
    comodoIdInput.value = '';
    codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    currentEditingComodo = null;
});

// Expor funções globalmente para serem acessíveis do HTML e objetos-comodo.js
window.gerenciarComodos = gerenciarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.currentImovelComodos = () => currentImovelComodos; 
window.currentEditingComodo = () => currentEditingComodo; 
