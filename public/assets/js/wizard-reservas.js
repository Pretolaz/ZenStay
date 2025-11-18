document.addEventListener('DOMContentLoaded', () => {
    // -----
    // Elementos do DOM
    // -----
    const startWizardBtn = document.getElementById('start-reservation-wizard-btn');
    const wizardModal = document.getElementById('reservation-wizard-modal');
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const stepTitle = document.getElementById('wizard-step-title');

    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
    };
    const totalSteps = Object.keys(steps).length;

    const propertyListContainer = document.getElementById('wizard-property-list');
    const guestListContainer = document.getElementById('wizard-hospedes-list');
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    const hasPetsSlider = document.getElementById('has-pets-slider');

    // Elementos do Resumo
    const summaryImovel = document.getElementById('summary-imovel');
    const summaryHospedes = document.getElementById('summary-hospedes');
    const summaryPets = document.getElementById('summary-pets');
    const summaryPeriodo = document.getElementById('summary-periodo');
    const summaryDiarias = document.getElementById('summary-diarias');

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
        hasPets: false,
    };

    // -----
    // Funções de Inicialização e Carregamento de Dados
    // -----

    function loadInitialData() {
        imoveis = Imovel.listarTodos();
        clientes = Cliente.listarTodos();
    }

    function initializeWizard() {
        loadPropertiesStep();
        loadGuestsStep();
        setupEventListeners();
    }

    function loadPropertiesStep() {
        if (!propertyListContainer) return;
        propertyListContainer.innerHTML = '';
        imoveis.forEach(imovel => {
            const card = document.createElement('div');
            card.className = 'property-card';
            // CORREÇÃO: Usar imovel.id para consistência, já que o storage usa id
            card.dataset.imovelId = imovel.id; 
            card.innerHTML = `
                <img src="${(imovel.fotos && imovel.fotos.length > 0) ? imovel.fotos[0] : 'assets/img/placeholder.jpg'}" alt="${imovel.titulo}" class="property-card-thumbnail">
                <div class="property-card-info">
                    <div class="property-card-name">${imovel.titulo || 'Imóvel sem título'}</div>
                </div>
            `;
            card.addEventListener('click', () => handlePropertySelection(imovel.id, card));
            propertyListContainer.appendChild(card);
        });
    }

    function loadGuestsStep() {
        if (!guestListContainer) return;
        guestListContainer.innerHTML = '';
        clientes.forEach(cliente => {
            const item = document.createElement('div');
            item.className = 'guest-list-item';
            // CORREÇÃO: Usar cliente.id em vez de cliente.codigoInterno para alinhar com a classe Cliente e Storage
            item.innerHTML = `
                <input type="checkbox" id="guest-${cliente.id}" data-guest-id="${cliente.id}">
                <label for="guest-${cliente.id}">${cliente.nome}</label>
            `;
            item.querySelector('input').addEventListener('change', handleGuestSelection);
            guestListContainer.appendChild(item);
        });
    }

    // -----
    // Funções de Manipulação de Eventos (Handlers)
    // -----

    function setupEventListeners() {
        if (startWizardBtn) {
            startWizardBtn.addEventListener('click', openWizard);
        }

        if (wizardModal) {
            wizardModal.addEventListener('click', (e) => {
                if (e.target.id === 'reservation-wizard-modal') { // Fechar apenas no clique do fundo
                    closeWizard();
                }
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', goToPrevStep);
        if (nextBtn) nextBtn.addEventListener('click', goToNextStep);

        if (hasPetsSlider) hasPetsSlider.addEventListener('change', handlePetSelection);
        if (checkinInput) checkinInput.addEventListener('change', handleDateSelection);
        if (checkoutInput) checkoutInput.addEventListener('change', handleDateSelection);
    }

    function handlePropertySelection(imovelId, cardElement) {
        reservaState.imovelId = imovelId;
        document.querySelectorAll('.property-card').forEach(card => card.classList.remove('selected'));
        cardElement.classList.add('selected');
        updateSummary();
    }

    function handleGuestSelection() {
        reservaState.hospedesIds = [];
        guestListContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            // CORREÇÃO: Lê o data-guest-id que agora contém o ID correto
            reservaState.hospedesIds.push(checkbox.dataset.guestId);
        });
        updateSummary();
    }

    function handlePetSelection() {
        reservaState.hasPets = hasPetsSlider.checked;
        document.getElementById('has-pets-status').textContent = reservaState.hasPets ? 'Sim' : 'Não';
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
            currentStep = 1;
            // Reiniciar estado ao abrir
            reservaState = { imovelId: null, hospedesIds: [], checkin: null, checkout: null, hasPets: false };
            showStep(currentStep);
            updateSummary(); // Limpa o resumo
        }
    }

    function closeWizard() {
        if (wizardModal) {
            wizardModal.style.display = 'none';
        }
    }

    function showStep(stepNumber) {
        Object.values(steps).forEach(step => step.style.display = 'none');
        if (steps[stepNumber]) {
            steps[stepNumber].style.display = 'block';
        }
        updateWizardControls(stepNumber);
    }

    function goToNextStep() {
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
        const titles = { 1: 'Etapa 1: Seleção do Imóvel', 2: 'Etapa 2: Hóspedes e Pets', 3: 'Etapa 3: Período da Reserva' };
        stepTitle.textContent = titles[stepNumber] || 'Assistente de Reserva';
        prevBtn.style.display = stepNumber > 1 ? 'inline-block' : 'none';
        nextBtn.textContent = stepNumber === totalSteps ? 'Salvar Reserva' : 'Próximo';
    }

    // -----
    // Funções de Atualização da UI e Lógica de Negócio
    // -----

    function updateSummary() {
        const imovel = imoveis.find(i => i.id == reservaState.imovelId);
        summaryImovel.textContent = imovel ? imovel.titulo : '- Nenhum selecionado -';

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
            summaryHospedes.innerHTML = '<li>- Nenhum selecionado -</li>';
        }

        summaryPets.textContent = reservaState.hasPets ? 'Sim' : 'Não';

        if (reservaState.checkin && reservaState.checkout) {
            const checkinDate = new Date(reservaState.checkin);
            const checkoutDate = new Date(reservaState.checkout);
            if (!isNaN(checkinDate) && !isNaN(checkoutDate)) {
                 summaryPeriodo.textContent = `${checkinDate.toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${checkoutDate.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`;
                const diffTime = Math.abs(checkoutDate - checkinDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                summaryDiarias.textContent = diffDays > 0 ? diffDays : '0';
                document.getElementById('calculated-nights').textContent = diffDays > 0 ? diffDays : '0';
            } else {
                summaryPeriodo.textContent = '- Datas inválidas -';
            }
        } else {
            summaryPeriodo.textContent = '- Não informado -';
            summaryDiarias.textContent = '0';
        }
    }

    function saveReservation() {
        if (!reservaState.imovelId || reservaState.hospedesIds.length === 0 || !reservaState.checkin || !reservaState.checkout) {
            alert('Por favor, preencha todos os campos obrigatórios: Imóvel, Hóspedes e Período.');
            return;
        }

        const newReserva = {
            imovelId: reservaState.imovelId,
            hospedes: reservaState.hospedesIds,
            checkin: reservaState.checkin,
            checkout: reservaState.checkout,
            status: 'Confirmada',
        };
        
        try {
            Reserva.salvar(newReserva);
            alert('Reserva salva com sucesso!');
            closeWizard();
            // Aqui você pode adicionar uma função para recarregar a tabela de reservas na página principal, se existir
            if (typeof loadReservasTable === 'function') {
                loadReservasTable();
            } else {
                location.reload(); // Recarrega a página como fallback
            }
        } catch (error) {
            console.error("Erro ao salvar a reserva:", error);
            alert("Ocorreu um erro ao salvar a reserva. Consulte o console para mais detalhes.");
        }
    }
    
    // -----
    // Inicialização
    // -----
    try {
        loadInitialData();
        initializeWizard();
    } catch (error) {
        console.error("Erro ao inicializar o assistente de reservas:", error);
    }
});
