document.addEventListener('DOMContentLoaded', () => {
    const hospedesList = document.getElementById('hospedes-list');
    const hospedeSearchInput = document.getElementById('hospede-search-input');
    
    const imoveisSelectionList = document.getElementById('imoveis-selection-list'); // Novo: Lista de seleção de imóveis
    const imovelSearchInput = document.getElementById('imovel-search-input'); // Novo: campo de pesquisa de imóveis
    
    const selectedImovelColumn = document.getElementById('selected-imovel-column');
    const selectedImovelDetails = document.getElementById('selected-imovel-details'); // Novo: Card de imóvel selecionado
    const noImovelSelectedMessage = document.getElementById('no-imovel-selected-message'); // Nova mensagem
    
    const salvarReservasBtn = document.getElementById('salvar-reservas-btn');

    let allClientes = []; 
    let clientesDisponiveis = []; 
    let allImoveis = []; // Todos os imóveis carregados inicialmente
    let selectedImovel = null; // Imóvel atualmente selecionado para reserva

    // Função para carregar e renderizar hóspedes
    function carregarHospedes(clientesToRender = clientesDisponiveis) {
        if (!hospedesList) return; // Adicionado: Verificação de existência

        hospedesList.innerHTML = '';
        clientesToRender.forEach(hospede => {
            const hospedeCard = document.createElement('div');
            hospedeCard.classList.add('kanban-item', 'hospede-card');
            hospedeCard.setAttribute('draggable', true);
            hospedeCard.dataset.hospedeId = hospede.codigoInterno;
            hospedeCard.innerHTML = `
                <div class="hospede-info">
                    <span class="icon">👤</span>
                    <span class="hospede-name">${hospede.nome}</span>
                    <span class="hospede-code">#${hospede.codigoInterno}</span>
                </div>
                <div class="hospede-contact">
                    ${hospede.telefone ? `<span class="icon">📞</span> ${hospede.telefone}` : ''}
                    ${hospede.email ? `<span class="icon">📧</span> ${hospede.email}` : ''}
                </div>
                <button type="button" class="add-hospede-to-imovel-btn" data-hospede-id="${hospede.codigoInterno}" title="Adicionar ao imóvel selecionado">➡️</button>
            `;
            hospedesList.appendChild(hospedeCard);
        });
        addDragListeners();
        addAddHospedeButtonListeners();
    }

    // Função de filtro para hóspedes
    function filterHospedes() {
        if (!hospedeSearchInput) return; // Adicionado: Verificação de existência

        const searchTerm = hospedeSearchInput.value.toLowerCase();
        const filteredHospedes = clientesDisponiveis.filter(hospede => 
            hospede.nome.toLowerCase().includes(searchTerm) || 
            String(hospede.codigoInterno).includes(searchTerm)
        );
        carregarHospedes(filteredHospedes);
    }

    if (hospedeSearchInput) { // Adicionado: Verificação de existência antes de adicionar listener
        hospedeSearchInput.addEventListener('input', filterHospedes);
    }

    // Função para carregar e renderizar imóveis na coluna de seleção
    function carregarImoveisSelection(imoveisToRender = allImoveis) {
        if (!imoveisSelectionList) return; // Adicionado: Verificação de existência

        imoveisSelectionList.innerHTML = '';
        imoveisToRender.forEach(imovel => {
            const imovelCard = document.createElement('div');
            imovelCard.classList.add('kanban-item', 'imovel-card', 'imovel-selectable');
            imovelCard.dataset.imovelId = imovel.codigo;
            imovelCard.innerHTML = `
                <div class="imovel-header">
                    ${imovel.foto ? `<img src="${imovel.foto}" alt="${imovel.apelido || imovel.nome}" class="imovel-thumbnail">` : '<span class="icon">🏠</span>'}
                    <div class="imovel-title-group">
                        <h4>${imovel.apelido || imovel.nome}</h4>
                        <p class="imovel-address">${imovel.endereco}</p>
                    </div>
                </div>
                <div class="imovel-details">
                    <span class="imovel-situacao situacao-${imovel.situacao.toLowerCase().replace(/ /g, '-')}">Situação: ${imovel.situacao}</span>
                </div>
            `;
            imovelCard.addEventListener('click', () => selectImovel(imovel.codigo));
            imoveisSelectionList.appendChild(imovelCard);
        });
        updateSelectedImovelHighlight();
    }

    // Função de filtro para imóveis
    function filterImoveis() {
        if (!imovelSearchInput) return; // Adicionado: Verificação de existência

        const searchTerm = imovelSearchInput.value.toLowerCase();
        const filteredImoveis = allImoveis.filter(imovel => 
            (imovel.apelido && imovel.apelido.toLowerCase().includes(searchTerm)) ||
            imovel.nome.toLowerCase().includes(searchTerm) || 
            imovel.endereco.toLowerCase().includes(searchTerm)
        );
        carregarImoveisSelection(filteredImoveis);
    }

    if (imovelSearchInput) { // Adicionado: Verificação de existência antes de adicionar listener
        imovelSearchInput.addEventListener('input', filterImoveis);
    }

    // Função para selecionar um imóvel
    function selectImovel(imovelId) {
        selectedImovel = allImoveis.find(i => String(i.codigo) === String(imovelId));
        if (selectedImovel) {
            // Carrega reservas existentes para este imóvel
            const reservasSalvas = JSON.parse(localStorage.getItem('reservas')) || [];
            selectedImovel.hospedesAssociados = reservasSalvas
                .filter(reserva => String(reserva.imovelId) === String(selectedImovel.codigo))
                .map(reserva => allClientes.find(cli => String(cli.codigoInterno) === String(reserva.hospedeId)))
                .filter(Boolean); // Remove nulls se hóspede não for encontrado
            
            renderizarSelectedImovelDetails();
            if (noImovelSelectedMessage) noImovelSelectedMessage.style.display = 'none'; // Adicionado: Verificação de existência
            if (selectedImovelDetails) selectedImovelDetails.style.display = 'flex'; // Mostra o card do imóvel selecionado (Adicionado: Verificação de existência)
        } else {
            if (selectedImovelDetails) selectedImovelDetails.style.display = 'none'; // Adicionado: Verificação de existência
            if (noImovelSelectedMessage) noImovelSelectedMessage.style.display = 'block'; // Adicionado: Verificação de existência
        }
        updateSelectedImovelHighlight();
    }

    // Função para destacar o imóvel selecionado na lista de seleção
    function updateSelectedImovelHighlight() {
        document.querySelectorAll('.imovel-selectable').forEach(card => {
            card.classList.remove('selected');
            if (selectedImovel && String(card.dataset.imovelId) === String(selectedImovel.codigo)) {
                card.classList.add('selected');
            }
        });
    }

    // Função para renderizar os detalhes do imóvel selecionado e seus hóspedes
    function renderizarSelectedImovelDetails() {
        if (!selectedImovel || !selectedImovelDetails) return; // Adicionado: Verificação de existência

        const situacaoClass = `situacao-${selectedImovel.situacao.toLowerCase().replace(/ /g, '-')}`;

        selectedImovelDetails.innerHTML = `
            <div class="imovel-header">
                ${selectedImovel.foto ? `<img src="${selectedImovel.foto}" alt="${selectedImovel.apelido || selectedImovel.nome}" class="imovel-thumbnail">` : '<span class="icon">🏠</span>'}
                <div class="imovel-title-group">
                    <h4>${selectedImovel.apelido || selectedImovel.nome}</h4>
                    <p class="imovel-address">${selectedImovel.endereco}</p>
                </div>
            </div>
            <div class="imovel-details">
                <span class="imovel-situacao ${situacaoClass}">Situação: ${selectedImovel.situacao}</span>
            </div>
            <div class="hospedes-no-imovel">
                <h5>Hóspedes para este imóvel:</h5>
                <div id="hospedes-imovel-${selectedImovel.codigo}" class="hospedes-container">
                    ${selectedImovel.hospedesAssociados.map(h => `
                        <div class="hospede-item-mini" data-hospede-id="${h.codigoInterno}">
                            <span>${h.nome}</span>
                            <button type="button" class="remove-hospede-btn" data-hospede-id="${h.codigoInterno}" data-imovel-id="${selectedImovel.codigo}">❌</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        addDropListenersToSelectedImovel();
        addRemoveHospedeListeners();
    }

    // Adiciona um hóspede ao imóvel selecionado (usado por drag e botão)
    function addHospedeToSelectedImovel(hospedeId) {
        if (!selectedImovel) {
            alert("Por favor, selecione um imóvel primeiro.");
            return;
        }

        const hospedeToAdd = allClientes.find(h => String(h.codigoInterno) === hospedeId);

        if (hospedeToAdd && !selectedImovel.hospedesAssociados.some(h => String(h.codigoInterno) === hospedeId)) {
            selectedImovel.hospedesAssociados.push(hospedeToAdd);
            renderizarSelectedImovelDetails();

            clientesDisponiveis = clientesDisponiveis.filter(h => String(h.codigoInterno) !== hospedeId);
            filterHospedes(); // Re-renderiza a lista de hóspedes disponíveis com o filtro atual
        }
    }

    // Função para adicionar listeners de drag a todos os cards de hóspedes
    function addDragListeners() {
        document.querySelectorAll('.hospede-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.hospedeId);
                e.target.classList.add('dragging');
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
    }

    // Função para adicionar listeners ao botão de adicionar hóspede (seta)
    function addAddHospedeButtonListeners() {
        document.querySelectorAll('.add-hospede-to-imovel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const hospedeId = e.target.dataset.hospedeId;
                addHospedeToSelectedImovel(hospedeId);
            });
        });
    }

    // Função para adicionar listeners de drop APENAS ao imóvel selecionado
    function addDropListenersToSelectedImovel() {
        const hospedesContainer = document.getElementById(`hospedes-imovel-${selectedImovel.codigo}`);
        if (!hospedesContainer) return;

        hospedesContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            hospedesContainer.classList.add('drag-over');
        });

        hospedesContainer.addEventListener('dragleave', (e) => {
            hospedesContainer.classList.remove('drag-over');
        });

        hospedesContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            hospedesContainer.classList.remove('drag-over');

            const hospedeId = e.dataTransfer.getData('text/plain');
            addHospedeToSelectedImovel(hospedeId);
        });
    }

    // Função para adicionar listeners aos botões de remover hóspede do imóvel selecionado
    function addRemoveHospedeListeners() {
        document.querySelectorAll('.remove-hospede-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const hospedeId = e.target.dataset.hospedeId;
                const imovelId = e.target.dataset.imovelId;

                if (selectedImovel && String(selectedImovel.codigo) === String(imovelId)) {
                    selectedImovel.hospedesAssociados = selectedImovel.hospedesAssociados.filter(h => String(h.codigoInterno) !== hospedeId);
                    renderizarSelectedImovelDetails();

                    const hospedeRetornado = allClientes.find(h => String(h.codigoInterno) === hospedeId);
                    if (hospedeRetornado && !clientesDisponiveis.some(h => String(h.codigoInterno) === hospedeId)) {
                        clientesDisponiveis.push(hospedeRetornado);
                        filterHospedes(); // Re-renderiza com o hóspede de volta e mantém o filtro
                    }
                }
            });
        });
    }

    // Adicionado: Verificação de existência antes de adicionar listener
    if (salvarReservasBtn) {
        salvarReservasBtn.addEventListener('click', () => {
            if (!selectedImovel || selectedImovel.hospedesAssociados.length === 0) {
                alert("Por favor, selecione um imóvel e adicione ao menos um hóspede para salvar a reserva.");
                return;
            }

            let reservasAtuais = JSON.parse(localStorage.getItem('reservas')) || [];
            const novasReservasParaImovel = [];

            selectedImovel.hospedesAssociados.forEach(hospede => {
                const reservaExistenteIndex = reservasAtuais.findIndex(res => 
                    String(res.hospedeId) === String(hospede.codigoInterno) && 
                    String(res.imovelId) === String(selectedImovel.codigo)
                );

                if (reservaExistenteIndex === -1) { 
                    const novaReserva = {
                        codigoInterno: null, 
                        hospede: hospede.nome,
                        hospedeId: hospede.codigoInterno,
                        imovel: selectedImovel.nome,
                        imovelId: selectedImovel.codigo,
                        plataforma: 'Kanban', 
                        checkin: new Date().toISOString().split('T')[0], 
                        checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
                        valor: 0,
                        status: 'Pendente',
                        observacao: 'Criado via Kanban'
                    };
                    novasReservasParaImovel.push(novaReserva);
                }
            });

            novasReservasParaImovel.forEach(novaReserva => {
                if (!novaReserva.codigoInterno) {
                    const lastCode = reservasAtuais.length ? Math.max(...reservasAtuais.map(r => Number(r.codigoInterno) || 0)) : 6000;
                    novaReserva.codigoInterno = Number(lastCode) + 1;
                }
                reservasAtuais.push(novaReserva);
            });

            // Remove quaisquer reservas antigas para o imóvel selecionado que não estão mais lá
            reservasAtuais = reservasAtuais.filter(reserva => {
                if (String(reserva.imovelId) === String(selectedImovel.codigo)) {
                    return selectedImovel.hospedesAssociados.some(h => String(h.codigoInterno) === String(reserva.hospedeId));
                }
                return true;
            });

            localStorage.setItem('reservas', JSON.stringify(reservasAtuais));
            alert('Reservas salvas com sucesso para o imóvel selecionado!');

            initializeKanban(); // Re-inicializa para limpar e recarregar tudo
        });
    }

    // Nova função para inicializar ou resetar o estado do Kanban
    function initializeKanban() {
        allClientes = Cliente.listarTodos();
        allImoveis = Imovel.listarTodos();
        selectedImovel = null; // Reseta o imóvel selecionado

        const reservasSalvas = JSON.parse(localStorage.getItem('reservas')) || [];
        const hospedesJaAssociadosIds = new Set(reservasSalvas.map(res => String(res.hospedeId)));
        
        clientesDisponiveis = allClientes.filter(hospede => !hospedesJaAssociadosIds.has(String(hospede.codigoInterno)));

        carregarHospedes(); 
        carregarImoveisSelection();
        
        if (hospedeSearchInput) hospedeSearchInput.value = ''; // Adicionado: Verificação de existência
        if (imovelSearchInput) imovelSearchInput.value = ''; // Limpa o campo de pesquisa de imóveis (Adicionado: Verificação de existência)

        if (selectedImovelDetails) selectedImovelDetails.style.display = 'none'; // Esconde os detalhes do imóvel (Adicionado: Verificação de existência)
        if (noImovelSelectedMessage) noImovelSelectedMessage.style.display = 'block'; // Mostra a mensagem (Adicionado: Verificação de existência)
    }

    // Inicialização do Kanban
    initializeKanban();
});