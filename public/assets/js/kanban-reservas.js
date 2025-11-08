document.addEventListener('DOMContentLoaded', () => {
    const hospedesList = document.getElementById('hospedes-list');
    const imoveisList = document.getElementById('imoveis-list');
    const salvarReservasBtn = document.getElementById('salvar-reservas-btn');
    const hospedeSearchInput = document.getElementById('hospede-search-input'); // Novo: campo de pesquisa

    let allClientes = []; // Todos os hóspedes carregados inicialmente
    let clientesDisponiveis = []; // Hóspedes que ainda não foram "arrastados" (subconjunto de allClientes)
    let imoveisComReservasTemporarias = []; // Imóveis com hóspedes temporariamente associados

    // Função para carregar e renderizar hóspedes
    // Recebe uma lista opcional de clientes para renderizar (para a pesquisa)
    function carregarHospedes(clientesToRender = clientesDisponiveis) {
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
            `;
            hospedesList.appendChild(hospedeCard);
        });
        addDragListeners();
    }

    // Função de filtro para hóspedes
    function filterHospedes() {
        const searchTerm = hospedeSearchInput.value.toLowerCase();
        const filteredHospedes = clientesDisponiveis.filter(hospede => 
            hospede.nome.toLowerCase().includes(searchTerm) || 
            String(hospede.codigoInterno).includes(searchTerm)
        );
        carregarHospedes(filteredHospedes);
    }

    // Event listener para o campo de pesquisa
    hospedeSearchInput.addEventListener('input', filterHospedes);

    // Função para carregar e renderizar imóveis
    function carregarImoveis() {
        const todosImoveis = Imovel.listarTodos();
        
        let reservasSalvas = JSON.parse(localStorage.getItem('reservas')) || [];

        imoveisComReservasTemporarias = todosImoveis.map(imovel => {
            const hospedesJaReservados = reservasSalvas
                .filter(reserva => String(reserva.imovelId) === String(imovel.codigo))
                .map(reserva => allClientes.find(cli => String(cli.codigoInterno) === String(reserva.hospedeId)))
                .filter(Boolean); 

            return {
                ...imovel,
                hospedesAssociados: hospedesJaReservados
            };
        });

        imoveisList.innerHTML = '';
        imoveisComReservasTemporarias.forEach(imovel => {
            const imovelCard = document.createElement('div');
            imovelCard.classList.add('kanban-item', 'imovel-card');
            imovelCard.dataset.imovelId = imovel.codigo;

            const situacaoClass = `situacao-${imovel.situacao.toLowerCase().replace(/ /g, '-')}`;

            imovelCard.innerHTML = `
                <div class="imovel-header">
                    ${imovel.foto ? `<img src="${imovel.foto}" alt="${imovel.apelido || imovel.nome}" class="imovel-thumbnail">` : '<span class="icon">🏠</span>'}
                    <div class="imovel-title-group">
                        <h4>${imovel.apelido || imovel.nome}</h4>
                        <p class="imovel-address">${imovel.endereco}</p>
                    </div>
                </div>
                <div class="imovel-details">
                    <span class="imovel-situacao ${situacaoClass}">Situação: ${imovel.situacao}</span>
                </div>
                <div class="hospedes-no-imovel">
                    <h5>Hóspedes para este imóvel:</h5>
                    <div id="hospedes-imovel-${imovel.codigo}" class="hospedes-container">
                        ${imovel.hospedesAssociados.map(h => `
                            <div class="hospede-item-mini" data-hospede-id="${h.codigoInterno}">
                                <span>${h.nome}</span>
                                <button type="button" class="remove-hospede-btn" data-hospede-id="${h.codigoInterno}" data-imovel-id="${imovel.codigo}">❌</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            imoveisList.appendChild(imovelCard);
        });
        addDropListeners();
        addRemoveHospedeListeners();
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

    // Função para adicionar listeners de drop aos cards de imóveis
    function addDropListeners() {
        document.querySelectorAll('.imovel-card').forEach(imovelCard => {
            const hospedesContainer = imovelCard.querySelector('.hospedes-container');

            imovelCard.addEventListener('dragover', (e) => {
                e.preventDefault(); 
                hospedesContainer.classList.add('drag-over');
            });

            imovelCard.addEventListener('dragleave', (e) => {
                hospedesContainer.classList.remove('drag-over');
            });

            imovelCard.addEventListener('drop', (e) => {
                e.preventDefault();
                hospedesContainer.classList.remove('drag-over');

                const hospedeId = e.dataTransfer.getData('text/plain');
                const imovelId = imovelCard.dataset.imovelId;

                // Busca o hóspede na lista completa (allClientes)
                const hospedeArrastado = allClientes.find(h => String(h.codigoInterno) === hospedeId);

                if (hospedeArrastado) {
                    const targetImovel = imoveisComReservasTemporarias.find(i => String(i.codigo) === imovelId);
                    if (targetImovel && !targetImovel.hospedesAssociados.some(h => String(h.codigoInterno) === hospedeId)) {
                        targetImovel.hospedesAssociados.push(hospedeArrastado);
                        renderizarHospedesNoImovel(imovelId);

                        // Remove o hóspede da lista de disponíveis (visualmente e do array)
                        clientesDisponiveis = clientesDisponiveis.filter(h => String(h.codigoInterno) !== hospedeId);
                        filterHospedes(); // Re-renderiza a lista de hóspedes disponíveis com o filtro atual
                    }
                }
            });
        });
    }

    // Função para renderizar hóspedes dentro de um card de imóvel específico
    function renderizarHospedesNoImovel(imovelId) {
        const targetImovel = imoveisComReservasTemporarias.find(i => String(i.codigo) === imovelId);
        if (targetImovel) {
            const hospedesContainer = document.getElementById(`hospedes-imovel-${imovelId}`);
            hospedesContainer.innerHTML = targetImovel.hospedesAssociados.map(h => `
                <div class="hospede-item-mini" data-hospede-id="${h.codigoInterno}">
                    <span>${h.nome}</span>
                    <button type="button" class="remove-hospede-btn" data-hospede-id="${h.codigoInterno}" data-imovel-id="${imovelId}">❌</button>
                </div>
            `).join('');
            addRemoveHospedeListeners();
        }
    }

    // Função para adicionar listeners aos botões de remover hóspede
    function addRemoveHospedeListeners() {
        document.querySelectorAll('.remove-hospede-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const hospedeId = e.target.dataset.hospedeId;
                const imovelId = e.target.dataset.imovelId;

                const targetImovel = imoveisComReservasTemporarias.find(i => String(i.codigo) === imovelId);
                if (targetImovel) {
                    targetImovel.hospedesAssociados = targetImovel.hospedesAssociados.filter(h => String(h.codigoInterno) !== hospedeId);
                    renderizarHospedesNoImovel(imovelId);

                    // Devolve o hóspede para a lista de disponíveis se ele não estiver em nenhum outro imóvel e ainda não estiver em clientesDisponiveis
                    const hospedeRetornado = allClientes.find(h => String(h.codigoInterno) === hospedeId);
                    const isHospedeInAnyOtherImovel = imoveisComReservasTemporarias.some(imovel => 
                        imovel.codigo !== targetImovel.codigo && // Verifica em outros imóveis
                        imovel.hospedesAssociados.some(h => String(h.codigoInterno) === hospedeId)
                    );

                    if (hospedeRetornado && !clientesDisponiveis.some(h => String(h.codigoInterno) === hospedeId) && !isHospedeInAnyOtherImovel) {
                        clientesDisponiveis.push(hospedeRetornado);
                        filterHospedes(); // Re-renderiza com o hóspede de volta e mantém o filtro
                    }
                }
            });
        });
    }

    // Função para salvar as reservas temporárias no localStorage
    salvarReservasBtn.addEventListener('click', () => {
        let reservasAtuais = JSON.parse(localStorage.getItem('reservas')) || [];
        const novasReservasKanban = [];

        imoveisComReservasTemporarias.forEach(imovel => {
            imovel.hospedesAssociados.forEach(hospede => {
                const reservaExistenteIndex = reservasAtuais.findIndex(res => 
                    String(res.hospedeId) === String(hospede.codigoInterno) && 
                    String(res.imovelId) === String(imovel.codigo)
                );

                if (reservaExistenteIndex === -1) { 
                    const novaReserva = {
                        codigoInterno: null, 
                        hospede: hospede.nome,
                        hospedeId: hospede.codigoInterno,
                        imovel: imovel.nome,
                        imovelId: imovel.codigo,
                        plataforma: 'Kanban', 
                        checkin: new Date().toISOString().split('T')[0], 
                        checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
                        valor: 0,
                        status: 'Pendente',
                        observacao: 'Criado via Kanban'
                    };
                    novasReservasKanban.push(novaReserva);
                }
            });
        });

        novasReservasKanban.forEach(novaReserva => {
            if (!novaReserva.codigoInterno) {
                const lastCode = reservasAtuais.length ? Math.max(...reservasAtuais.map(r => Number(r.codigoInterno) || 0)) : 6000;
                novaReserva.codigoInterno = Number(lastCode) + 1;
            }
            reservasAtuais.push(novaReserva);
        });

        localStorage.setItem('reservas', JSON.stringify(reservasAtuais));
        alert('Reservas salvas com sucesso!');

        // Recarrega o Kanban para refletir as reservas salvas e hóspedes disponíveis corretamente
        initializeKanban(); // Nova função de inicialização
    });

    // Nova função para inicializar ou resetar o estado do Kanban
    function initializeKanban() {
        allClientes = Cliente.listarTodos();
        
        // Filtra os clientes que já estão associados a imóveis em reservas salvas ou temporárias
        const reservasSalvas = JSON.parse(localStorage.getItem('reservas')) || [];
        const hospedesJaAssociadosIds = new Set();

        reservasSalvas.forEach(reserva => hospedesJaAssociadosIds.add(String(reserva.hospedeId)));
        
        // Popula clientesDisponiveis com base em allClientes, excluindo os já associados
        clientesDisponiveis = allClientes.filter(hospede => !hospedesJaAssociadosIds.has(String(hospede.codigoInterno)));

        carregarHospedes(); // Carrega inicialmente sem filtro
        carregarImoveis();
        hospedeSearchInput.value = ''; // Limpa o campo de pesquisa na inicialização/recarregamento
    }

    // Inicialização do Kanban
    initializeKanban();
});