// assets/js/comodos-imovel.js

const imoveisListSection = document.getElementById('imoveis-list-section');
const comodosSection = document.getElementById('comodos-section');
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

// Função para alternar a visibilidade das seções
function toggleComodosSection(show) {
    if (show) {
        imoveisListSection.style.display = 'none';
        comodosSection.style.display = 'flex'; // Usar flex para manter o layout
    } else {
        imoveisListSection.style.display = 'flex';
        comodosSection.style.display = 'none';
        currentImovelComodos = null; // Limpa o imóvel atual ao voltar
        formComodo.reset(); // Reseta o formulário de cômodos
        comodoIdInput.value = ''; // Limpa o ID do cômodo em edição
        document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    }
}

// Função chamada ao clicar em "Gerenciar Cômodos"
function gerenciarComodos(codigoImovel) {
    const imovel = Imovel.listarTodos().find(i => i.codigo === codigoImovel);
    if (imovel) {
        currentImovelComodos = imovel;
        imovelApelidoComodos.textContent = imovel.apelido;
        comodoImovelIdInput.value = imovel.codigo; // Guarda o ID do imóvel no campo oculto
        toggleComodosSection(true);
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
        currentImovelComodos.editarComodo(codigoComodo, nome, icone);
    } else {
        // Adicionando novo cômodo
        // Gerar um novo código para o cômodo dentro do contexto do imóvel
        const novoCodigo = currentImovelComodos.comodos.length > 0 
            ? Math.max(...currentImovelComodos.comodos.map(c => c.codigo)) + 1 
            : 1;
        currentImovelComodos.adicionarComodo(novoCodigo, nome, icone); // Passa o novo código
    }

    currentImovelComodos.salvar(); // Salva o imóvel com os cômodos atualizados
    formComodo.reset();
    comodoIdInput.value = ''; // Limpa o campo de edição
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
    carregarComodosDoImovel(); // Recarrega a tabela de cômodos
}

// Preenche o formulário para edição de um cômodo
function editarComodo(codigoComodo) {
    if (currentImovelComodos) {
        const comodo = currentImovelComodos.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
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
    if (confirm('Tem certeza que deseja excluir este cômodo?')) {
        if (currentImovelComodos) {
            currentImovelComodos.removerComodo(codigoComodo);
            currentImovelComodos.salvar(); // Salva o imóvel com os cômodos atualizados
            carregarComodosDoImovel();
            formComodo.reset();
            comodoIdInput.value = '';
            document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
        }
    }
}

// Event Listeners
formComodo.addEventListener('submit', salvarComodo);
voltarParaImoveisBtn.addEventListener('click', () => toggleComodosSection(false));
cancelarComodoBtn.addEventListener('click', () => {
    formComodo.reset();
    comodoIdInput.value = '';
    codigoComodoInput.value = '';
    document.querySelector('#formComodo button[type="submit"]').textContent = '➕ Adicionar Cômodo';
});

// Certificar que a função gerenciarComodos está disponível globalmente
window.gerenciarComodos = gerenciarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
