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

// currentComodoObjetos será setado em imoveis.html ou via gerenciarObjetosDoComodo
let currentComodoObjetos = null; 

// Função chamada ao clicar em "Gerenciar Objetos" em um cômodo
function gerenciarObjetosDoComodo(codigoComodo) {
    const imovelAtual = window.currentImovelComodos();
    if (imovelAtual) {
        const comodo = imovelAtual.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
            currentComodoObjetos = comodo;
            imovelComodoNomeObjetos.textContent = `${imovelAtual.apelido} > ${comodo.nome}`;
            objetoComodoIdInput.value = comodo.codigo; // Guarda o ID do cômodo no campo oculto
            carregarObjetosDoComodo();
        } else {
            console.error('Cômodo não encontrado para gerenciar objetos.');
        }
    } else {
        console.error('Nenhum imóvel selecionado para gerenciar objetos.');
    }
}

// Carrega e exibe os objetos do cômodo atual na tabela
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

// Salva um novo objeto ou atualiza um existente
function salvarObjeto(e) {
    e.preventDefault();

    if (!currentComodoObjetos) {
        alert('Nenhum cômodo selecionado para adicionar objetos.');
        return;
    }

    const codigoObjeto = objetoIdInput.value ? parseInt(objetoIdInput.value) : null;
    const tipo = tipoObjetoInput.value;
    const nome = nomeObjetoInput.value;
    const quantidade = parseInt(quantidadeObjetoInput.value);

    if (codigoObjeto) {
        currentComodoObjetos.editarObjeto(codigoObjeto, tipo, nome, quantidade);
    } else {
        currentComodoObjetos.adicionarObjeto(tipo, nome, quantidade);
    }

    formObjeto.reset();
    objetoIdInput.value = ''; 
    codigoObjetoInput.value = '';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
    carregarObjetosDoComodo(); 
}

// Preenche o formulário para edição de um objeto
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

// Exclui um objeto
function excluirObjeto(codigoObjeto) {
    if (confirm('Tem certeza que deseja excluir este objeto?')) {
        if (currentComodoObjetos) {
            currentComodoObjetos.removerObjeto(codigoObjeto);
            carregarObjetosDoComodo();
            formObjeto.reset();
            objetoIdInput.value = '';
            codigoObjetoInput.value = '';
            document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
        }
    }
}

// Event Listeners
formObjeto.addEventListener('submit', salvarObjeto);
cancelarObjetoBtn.addEventListener('click', () => {
    formObjeto.reset();
    objetoIdInput.value = '';
    codigoObjetoInput.value = '';
    document.querySelector('#formObjeto button[type="submit"]').textContent = '➕ Adicionar Objeto';
});

// Expor funções globalmente
window.gerenciarObjetosDoComodo = gerenciarObjetosDoComodo;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;
window.currentComodoObjetos = currentComodoObjetos; // Expor o cômodo atual para o main script se necessário
