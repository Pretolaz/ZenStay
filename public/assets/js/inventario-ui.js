// assets/js/inventario-ui.js

// Inicialização do UI do inventário
function inicializarInventarioUI() {
    const formObjetoContainer = document.getElementById('formObjetoContainer');
    const btnNovoObjeto = document.getElementById('btnNovoObjeto');
    const cancelarObjetoBtn = document.getElementById('cancelarObjeto');
    const formObjeto = document.getElementById('formObjeto');

    // Criar o botão "Novo Objeto" se não existir
    if (!btnNovoObjeto && document.getElementById('inventario-objetos-section')) {
        const headerSection = document.querySelector('#inventario-objetos-section .imoveis-header-actions, #inventario-objetos-section .card');

        if (!headerSection.querySelector('.imoveis-header-actions')) {
            // Criar header de ações
            const headerActions = document.createElement('div');
            headerActions.className = 'imoveis-header-actions';
            headerActions.innerHTML = `
                <div class="section-title">
                    <span>📦</span> Inventário de Objetos
                </div>
                <button id="btnNovoObjeto"
                    style="background: linear-gradient(135deg, var(--accent), var(--hover-accent)); color: #fff; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 191, 166, 0.3);">
                    <span>➕</span> Novo Objeto
                </button>
            `;
            headerSection.insertBefore(headerActions, headerSection.firstChild);
        }
    }

    // Event listeners
    const newBtnNovoObjeto = document.getElementById('btnNovoObjeto');
    if (newBtnNovoObjeto) {
        newBtnNovoObjeto.addEventListener('click', () => {
            if (formObjetoContainer) {
                formObjetoContainer.style.display = 'block';
                formObjeto.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('formTitleObjeto').textContent = '➕ Adicionar Objeto';
            }
        });
    }

    if (cancelarObjetoBtn) {
        cancelarObjetoBtn.addEventListener('click', () => {
            if (formObjetoContainer) {
                formObjetoContainer.style.display = 'none';
            }
        });
    }
}

// Chamar quando a seção de inventário estiver visível
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#inventario') {
        setTimeout(inicializarInventarioUI, 100);
    }
});

// Exportar
window.inicializarInventarioUI = inicializarInventarioUI;
