document.addEventListener('DOMContentLoaded', () => {
    // -----
    // Elementos do DOM
    // -----
    const startWizardBtn = document.getElementById('start-reservation-wizard-btn');
    const wizardModal = document.getElementById('reservation-wizard-modal');
    const closeWizardBtn = document.getElementById('close-wizard-btn');
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    // Step Indicator Elements
    const stepIndicators = document.querySelectorAll('.step-item');

    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
    };
    const totalSteps = Object.keys(steps).length;

    const propertyListContainer = document.getElementById('wizard-property-list');
    const guestListContainer = document.getElementById('wizard-hospedes-list');
    const guestSearchInput = document.getElementById('wizard-hospede-search-input');
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    const numPetsSlider = document.getElementById('num-pets-slider');
    const numPetsDisplay = document.getElementById('num-pets-display');

    // Elementos do Resumo
    const summaryImovel = document.getElementById('summary-imovel');
    const summaryHospedes = document.getElementById('summary-hospedes');
    const summaryPets = document.getElementById('summary-pets');
    const summaryPeriodo = document.getElementById('summary-periodo');
    const summaryDiarias = document.getElementById('summary-diarias');

    // Elementos do Modal de Detalhes
    const detailsModal = document.getElementById('reservation-details-modal');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const detailsImovelFoto = document.getElementById('details-imovel-foto');
    const detailsImovelTitulo = document.getElementById('details-imovel-titulo');
    const detailsStatus = document.getElementById('details-status');
    const detailsCodigo = document.getElementById('details-codigo');
    const detailsHospedes = document.getElementById('details-hospedes');
    const detailsCheckin = document.getElementById('details-checkin');
    const detailsCheckout = document.getElementById('details-checkout');
    const detailsPets = document.getElementById('details-pets');
    const detailsDiarias = document.getElementById('details-diarias');

    // -----
    // Estado do Wizard
    // -----
    let currentStep = 1;
    let imoveis = [];
    let clientes = [];
    let reservaState = {
        imovelId: null,
        hospedesIds: [],
        checkin: null,
        checkout: null,
        numPets: 0,
    };

    // -----
    // Funções de Inicialização e Carregamento de Dados
    // -----

    async function loadInitialData() {
        // Adiciona um 'await' e assume que as outras classes também serão assíncronas
        if (typeof Imovel !== 'undefined' && typeof Imovel.listarTodos === 'function') {
            // Mocking async behavior for Imovel and Cliente if they are not async yet
            imoveis = await (Imovel.listarTodos().then ? Imovel.listarTodos() : Promise.resolve(Imovel.listarTodos()));
        }
        if (typeof Cliente !== 'undefined' && typeof Cliente.listarTodos === 'function') {
            clientes = await (Cliente.listarTodos().then ? Cliente.listarTodos() : Promise.resolve(Cliente.listarTodos()));
        }

        // A função de carregar a tabela agora é assíncrona
        await loadReservasTableLocal();
    }


    function initializeWizard() {
        loadPropertiesStep();
        loadGuestsStep();
        setupEventListeners();
    }

    function loadPropertiesStep() {
        if (!propertyListContainer) return;
        propertyListContainer.innerHTML = '';

        if (imoveis.length === 0) {
            propertyListContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Nenhum imóvel cadastrado.</p>';
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.dataset.imovelId = imovel.id;

            const fotoUrl = (imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : 'assets/img/placeholder.jpg';

            card.innerHTML = `
                <img src="${fotoUrl}" alt="${imovel.titulo}" class="property-card-thumbnail">
                <div class="property-card-info">
                    <div class="property-card-name">${imovel.titulo || 'Imóvel sem título'}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${imovel.cidade || ''} - ${imovel.estado || ''}</div>
                </div>
            `;
            card.addEventListener('click', () => handlePropertySelection(imovel.id, card));
            propertyListContainer.appendChild(card);
        });
    }

    function loadGuestsStep() {
        if (!guestListContainer) return;
        renderGuestList(clientes);
    }

    function renderGuestList(listaClientes) {
        guestListContainer.innerHTML = '';

        if (listaClientes.length === 0) {
            guestListContainer.innerHTML = '<p style="text-align: center; padding: 10px; color: #888;">Nenhum hóspede encontrado.</p>';
            return;
        }

        listaClientes.forEach(cliente => {
            const item = document.createElement('div');
            item.className = 'guest-list-item';

            const isChecked = reservaState.hospedesIds.includes(String(cliente.id)) ? 'checked' : '';

            item.innerHTML = `
                <input type="checkbox" id="guest-${cliente.id}" data-guest-id="${cliente.id}" ${isChecked}>
                <label for="guest-${cliente.id}" style="cursor: pointer; flex: 1;">${cliente.nome}</label>
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', handleGuestSelection);
            guestListContainer.appendChild(item);
        });
    }

    // -----
    // Funções de Manipulação de Eventos (Handlers)
    // -----

    function setupEventListeners() {
        if (startWizardBtn) startWizardBtn.addEventListener('click', openWizard);
        if (closeWizardBtn) closeWizardBtn.addEventListener('click', closeWizard);
        if (wizardModal) wizardModal.addEventListener('click', (e) => { if (e.target === wizardModal) closeWizard(); });
        if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeReservationDetails);
        if (detailsModal) detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeReservationDetails(); });
        if (prevBtn) prevBtn.addEventListener('click', goToPrevStep);
        if (nextBtn) nextBtn.addEventListener('click', goToNextStep);
        if (numPetsSlider) numPetsSlider.addEventListener('input', handlePetSelection);
        if (checkinInput) checkinInput.addEventListener('change', handleDateSelection);
        if (checkoutInput) checkoutInput.addEventListener('change', handleDateSelection);
        if (guestSearchInput) {
            guestSearchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = clientes.filter(c => c.nome.toLowerCase().includes(term) || (c.telefone && c.telefone.includes(term)));
                renderGuestList(filtered);
            });
        }
    }

    function handlePropertySelection(imovelId, cardElement) {
        reservaState.imovelId = imovelId;
        document.querySelectorAll('.property-card').forEach(card => card.classList.remove('selected'));
        cardElement.classList.add('selected');
        updateSummary();
    }

    function handleGuestSelection() {
        reservaState.hospedesIds = Array.from(guestListContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.guestId);
        updateSummary();
    }

    function handlePetSelection() {
        reservaState.numPets = parseInt(numPetsSlider.value);
        if(numPetsDisplay) numPetsDisplay.textContent = reservaState.numPets;
        updateSummary();
    }

    function handleDateSelection() {
        reservaState.checkin = checkinInput.value;
        reservaState.checkout = checkoutInput.value;
        updateSummary();
    }

    // -----
    // Funções de Controle do Wizard (Abrir/Fechar/Navegar)
    // -----

    function openWizard() {
        if (wizardModal) {
            wizardModal.style.display = 'flex';
            setTimeout(() => wizardModal.style.opacity = '1', 10);
            currentStep = 1;
            reservaState = { imovelId: null, hospedesIds: [], checkin: null, checkout: null, numPets: 0 };
            if (numPetsSlider) numPetsSlider.value = 0;
            if (numPetsDisplay) numPetsDisplay.textContent = '0';
            if (checkinInput) checkinInput.value = '';
            if (checkoutInput) checkoutInput.value = '';
            if (guestSearchInput) guestSearchInput.value = '';
            document.querySelectorAll('.property-card.selected').forEach(c => c.classList.remove('selected'));
            document.querySelectorAll('.guest-list-item input:checked').forEach(c => c.checked = false);
            showStep(currentStep);
            updateSummary();
        }
    }

    function closeWizard() {
        if (wizardModal) {
            wizardModal.style.opacity = '0';
            setTimeout(() => { wizardModal.style.display = 'none'; }, 300);
        }
    }

    function showStep(stepNumber) {
        Object.values(steps).forEach(step => { if (step) step.style.display = 'none'; });
        if (steps[stepNumber]) {
            steps[stepNumber].style.display = 'block';
            steps[stepNumber].style.opacity = 0;
            setTimeout(() => steps[stepNumber].style.opacity = 1, 50);
        }
        updateWizardControls(stepNumber);
        updateStepIndicator(stepNumber);
    }

    function updateStepIndicator(stepNumber) {
        stepIndicators.forEach(indicator => {
            const step = parseInt(indicator.dataset.step);
            indicator.classList.toggle('active', step === stepNumber);
            indicator.style.opacity = step <= stepNumber ? '1' : '0.4';
        });
    }

    function goToNextStep() {
        if (currentStep === 1 && !reservaState.imovelId) {
            Toast.warning('Por favor, selecione um imóvel para continuar.');
            return;
        }
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        } else {
            saveReservation();
        }
    }

    function goToPrevStep() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    }

    function updateWizardControls(stepNumber) {
        if (prevBtn) prevBtn.style.display = stepNumber > 1 ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.textContent = stepNumber === totalSteps ? 'Salvar Reserva' : 'Continuar';
    }

    // -----
    // Funções de Atualização da UI e Lógica de Negócio
    // -----

    function updateSummary() {
        const imovel = imoveis.find(i => i.id == reservaState.imovelId);
        if(summaryImovel) summaryImovel.textContent = imovel ? imovel.titulo : '- Selecione -';

        if (summaryHospedes) {
            summaryHospedes.innerHTML = '';
            if (reservaState.hospedesIds.length > 0) {
                reservaState.hospedesIds.forEach(id => {
                    const cliente = clientes.find(c => c.id == id);
                    if (cliente) {
                        const li = document.createElement('li');
                        li.textContent = cliente.nome;
                        summaryHospedes.appendChild(li);
                    }
                });
            } else {
                summaryHospedes.innerHTML = '<li>- Selecione -</li>';
            }
        }

        if(summaryPets) summaryPets.textContent = reservaState.numPets > 0 ? `${reservaState.numPets} pet(s)` : 'Não';

        if (summaryPeriodo && summaryDiarias) {
            if (reservaState.checkin && reservaState.checkout) {
                const checkinDate = new Date(reservaState.checkin);
                const checkoutDate = new Date(reservaState.checkout);
                const checkinStr = checkinDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                const checkoutStr = checkoutDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                if (checkoutDate > checkinDate) {
                    summaryPeriodo.textContent = `${checkinStr} a ${checkoutStr}`;
                    const diffTime = checkoutDate - checkinDate;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    summaryDiarias.textContent = diffDays;
                } else {
                    summaryPeriodo.textContent = 'Datas inválidas';
                    summaryDiarias.textContent = '0';
                }
            } else {
                summaryPeriodo.textContent = '- Defina as datas -';
                summaryDiarias.textContent = '0';
            }
        }
    }

    async function saveReservation() {
        if (!reservaState.imovelId || reservaState.hospedesIds.length === 0 || !reservaState.checkin || !reservaState.checkout) {
            Toast.error('Preencha todos os campos: Imóvel, Hóspedes e Período.');
            return;
        }

        const newReservaData = {
            imovelId: reservaState.imovelId,
            hospedes: reservaState.hospedesIds,
            checkin: reservaState.checkin,
            checkout: reservaState.checkout,
            numPets: reservaState.numPets,
            status: 'Confirmada',
            dataCriacao: new Date().toISOString(),
        };

        try {
            await Reserva.salvar(newReservaData);
            Toast.success('Reserva salva com sucesso!');
            closeWizard();
            await loadReservasTableLocal(); // Recarrega a tabela
        } catch (error) {
            console.error("Erro ao salvar a reserva:", error);
            Toast.error("Ocorreu um erro ao salvar a reserva.");
        }
    }

    async function loadReservasTableLocal() {
        const tbody = document.getElementById('reservas-table-body');
        if (!tbody) return;

        const reservas = await Reserva.listarTodos();
        tbody.innerHTML = '';

        if (reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        reservas.forEach(reserva => {
            const imovel = imoveis.find(i => i.id == reserva.imovelId);
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.title = 'Clique para ver detalhes';

            const checkin = new Date(reserva.checkin).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const checkout = new Date(reserva.checkout).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            let hospedesTexto = '0';
            if (reserva.hospedes && reserva.hospedes.length > 0) {
                const primeiroHospede = clientes.find(c => c.id == reserva.hospedes[0]);
                const nomePrimeiro = primeiroHospede ? primeiroHospede.nome.split(' ')[0] : '...';
                const extras = reserva.hospedes.length - 1;
                hospedesTexto = extras > 0 ? `${nomePrimeiro} (+${extras})` : nomePrimeiro;
            }

            tr.innerHTML = `
                <td>${imovel ? imovel.titulo : 'Imóvel removido'}</td>
                <td>${checkin}</td>
                <td>${checkout}</td>
                <td>${hospedesTexto}</td>
                <td><span class="status-badge ${reserva.status ? reserva.status.toLowerCase() : ''}">${reserva.status || 'Pendente'}</span></td>
                <td>
                    <button class="btn-icon delete-btn" data-id="${reserva.id}">🗑️</button>
                </td>
            `;

            tr.addEventListener('click', () => openReservationDetails(reserva));
            tbody.appendChild(tr);
        });

        // Adiciona event listener para os botões de deletar
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                if (confirm('Tem certeza que deseja excluir esta reserva?')) {
                    try {
                        await Reserva.excluir(id);
                        Toast.success('Reserva excluída com sucesso.');
                        await loadReservasTableLocal(); // Recarrega
                    } catch (error) {
                        console.error('Erro ao excluir reserva:', error);
                        Toast.error('Falha ao excluir reserva.');
                    }
                }
            });
        });
    }


    function openReservationDetails(reserva) {
        if (!detailsModal) return;

        const imovel = imoveis.find(i => i.id == reserva.imovelId);

        if (detailsImovelFoto) detailsImovelFoto.src = (imovel && imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : 'assets/img/placeholder.jpg';
        if (detailsImovelTitulo) detailsImovelTitulo.textContent = imovel ? imovel.titulo : 'Imóvel não encontrado';
        if (detailsStatus) {
            detailsStatus.textContent = reserva.status || 'Pendente';
            detailsStatus.className = `status-badge ${reserva.status ? reserva.status.toLowerCase() : ''}`;
        }
        if (detailsCodigo) detailsCodigo.textContent = `#${reserva.codigoInterno || reserva.id}`;

        if (detailsHospedes) {
            if (reserva.hospedes && reserva.hospedes.length > 0) {
                const primeiroHospede = clientes.find(c => c.id == reserva.hospedes[0]);
                const nomePrimeiro = primeiroHospede ? primeiroHospede.nome.split(' ')[0] : '...';
                const extras = reserva.hospedes.length - 1;
                detailsHospedes.textContent = extras > 0 ? `${nomePrimeiro} (+${extras})` : nomePrimeiro;
            } else {
                detailsHospedes.textContent = 'Nenhum';
            }
        }

        if (detailsCheckin) detailsCheckin.textContent = new Date(reserva.checkin).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        if (detailsCheckout) detailsCheckout.textContent = new Date(reserva.checkout).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        if (detailsPets) detailsPets.textContent = reserva.numPets;

        if (detailsDiarias) {
            const checkinDate = new Date(reserva.checkin);
            const checkoutDate = new Date(reserva.checkout);
            if (checkoutDate > checkinDate) {
                const diffTime = Math.abs(checkoutDate - checkinDate);
                detailsDiarias.textContent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                detailsDiarias.textContent = 0;
            }
        }

        detailsModal.style.display = 'flex';
        setTimeout(() => detailsModal.style.opacity = '1', 10);
    }

    function closeReservationDetails() {
        if (detailsModal) {
            detailsModal.style.opacity = '0';
            setTimeout(() => { detailsModal.style.display = 'none'; }, 300);
        }
    }

    // -----
    // Inicialização
    // -----
    async function init() {
        try {
            await loadInitialData();
            initializeWizard();
        } catch (error) {
            console.error("Erro ao inicializar o assistente de reservas:", error);
            // Opcional: Mostrar um toast de erro para o usuário
            if (typeof Toast !== 'undefined' && typeof Toast.error === 'function') {
                Toast.error("Erro ao carregar dados iniciais.");
            }
        }
    }

    init();
});
