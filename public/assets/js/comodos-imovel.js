// assets/js/comodos-imovel.js

const formComodo = document.getElementById('formComodo');
const formComodoContainer = document.getElementById('formComodoContainer');
const btnNovoComodo = document.getElementById('btnNovoComodo');
const emptyStateComodos = document.getElementById('emptyStateComodos');
const listaComodosContainer = document.getElementById('listaComodosContainer');
const formTitleComodo = document.getElementById('formTitleComodo');

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
        cancelarComodoBtn.addEventListener('click', () => toggleFormComodo(false));
    }

    if (btnNovoComodo) {
        btnNovoComodo.addEventListener('click', () => {
            resetFormComodo();
            toggleFormComodo(true);
        });
    }

    // Se houver imóveis, seleciona o primeiro automaticamente para facilitar
    const todosImoveis = await Imovel.listarTodos();
    if (todosImoveis.length > 0) {
        selectImovelComodos.value = todosImoveis[0].id;
        handleImovelSelectionChangeComodos();
    }
}

async function popularSelectImoveisComodos() {
    const todosImoveis = await Imovel.listarTodos();
    selectImovelComodos.innerHTML = '<option value="">Selecione um Imóvel para gerenciar</option>';
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
            currentImovel = new Imovel(imovelData);

            // UI Updates
            btnNovoComodo.style.display = 'inline-flex';
            emptyStateComodos.style.display = 'none';
            listaComodosContainer.style.display = 'block';

            carregarComodosDoImovel();
        }
    } else {
        currentImovel = null;

        // UI Updates
        btnNovoComodo.style.display = 'none';
        emptyStateComodos.style.display = 'block';
        listaComodosContainer.style.display = 'none';
        toggleFormComodo(false);
        tabelaComodosBody.innerHTML = '';
    }
}

function toggleFormComodo(show) {
    formComodoContainer.style.display = show ? 'block' : 'none';
    if (show) {
        formComodoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function carregarComodosDoImovel() {
    tabelaComodosBody.innerHTML = '';
    if (currentImovel && currentImovel.comodos && currentImovel.comodos.length > 0) {
        currentImovel.comodos.forEach(comodo => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            row.style.transition = 'background 0.2s';
            row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.02)');
            row.addEventListener('mouseleave', () => row.style.background = 'transparent');

            row.innerHTML = `
                <td style="padding: 15px; font-size: 1.5rem;">${comodo.icone}</td>
                <td style="padding: 15px; font-weight: 500; color: var(--text);">${comodo.nome}</td>
                <td style="padding: 15px; opacity: 0.7;">#${comodo.id}</td>
                <td style="padding: 15px; text-align: right;">
                    <button class="action-btn" onclick="editarComodo(${comodo.id})" title="Editar" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; margin-right: 10px;">✏️</button>
                    <button class="action-btn" onclick="excluirComodo(${comodo.id})" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">🗑️</button>
                </td>
            `;
            tabelaComodosBody.appendChild(row);
        });
    } else {
        tabelaComodosBody.innerHTML = '<tr><td colspan="4" style="padding: 30px; text-align: center; opacity: 0.6;">Nenhum cômodo cadastrado neste imóvel.</td></tr>';
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
        toggleFormComodo(false);
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

            formTitleComodo.textContent = '✏️ Editar Cômodo';
            document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar Alterações';

            toggleFormComodo(true);
        }
    }
}

async function excluirComodo(comodoId) {
    // Substituindo confirm nativo por Toast com ação seria ideal, mas por simplicidade e segurança imediata:
    // Vamos usar um confirm customizado ou manter o nativo por enquanto, mas o usuário pediu "padrão de alertas do projeto que é toasts".
    // Como Toast geralmente é informativo, para confirmação precisamos de um modal ou usar o confirm nativo com estilo se possível.
    // O projeto não tem um "Toast Confirm". Vou usar o confirm nativo mas exibir o resultado com Toast, conforme feito anteriormente.

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
    formTitleComodo.textContent = '➕ Adicionar Cômodo';
    document.querySelector('#formComodo button[type="submit"]').textContent = '💾 Salvar';
}

// Expõe as funções necessárias globalmente
window.gerenciarComodos = handleImovelSelectionChangeComodos;
window.inicializarComodos = inicializarComodos;
window.editarComodo = editarComodo;
window.excluirComodo = excluirComodo;
window.currentImovelComodos = () => currentImovel;
window.addEventListener('DOMContentLoaded', inicializarComodos);
