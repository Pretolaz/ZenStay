document.addEventListener('DOMContentLoaded', () => {
    const startWizardBtn = document.getElementById('start-reservation-wizard-btn');
    const reservationWizardModal = document.getElementById('reservation-wizard-modal');
    const wizardCancelBtn = document.createElement('button');
    wizardCancelBtn.classList.add('btn', 'cancel');
    wizardCancelBtn.textContent = 'Cancelar';

    const wizardStepTitles = {
        1: 'Etapa 1: Seleção do Imóvel',
        2: 'Etapa 2: Seleção de Hóspedes e Pets',
        3: 'Etapa 3: Seleção de Período (Datas)'
    };

    let currentStep = 1;
    const totalSteps = 3;
    let reservationData = {
        imovel: null,
        hospedes: [],
        hasPets: false,
        checkinDate: null,
        checkoutDate: null,
        noites: 0
    };

    // Elements
    const wizardStepTitle = document.getElementById('wizard-step-title');
    const wizardStepContent = document.getElementById('wizard-step-content');
    const wizardPrevBtn = document.getElementById('wizard-prev-btn');
    const wizardNextBtn = document.getElementById('wizard-next-btn');

    // Summary Elements
    const summaryImovel = document.getElementById('summary-imovel');
    const summaryHospedes = document.getElementById('summary-hospedes');
    const summaryPets = document.getElementById('summary-pets');
    const summaryPeriodo = document.getElementById('summary-periodo');
    const summaryDiarias = document.getElementById('summary-diarias');

    // Step 1 Elements
    const wizardPropertyList = document.getElementById('wizard-property-list');
    const propertyListAlertContainer = document.getElementById('property-list-alert-container');
    let allProperties = [];

    // Step 2 Elements
    const wizardHospedeSearchInput = document.getElementById('wizard-hospede-search-input');
    const wizardHospedesList = document.getElementById('wizard-hospedes-list');
    const addNewGuestBtn = document.getElementById('add-new-guest-btn');
    const hasPetsSlider = document.getElementById('has-pets-slider');
    const hasPetsStatus = document.getElementById('has-pets-status');
    const guestSelectionAlertContainer = document.getElementById('guest-selection-alert-container');
    let allGuests = [];

    // Step 3 Elements
    const checkinDateInput = document.getElementById('checkin-date');
    const checkoutDateInput = document.getElementById('checkout-date');
    const calculatedNights = document.getElementById('calculated-nights');
    const dateSelectionAlertContainer = document.getElementById('date-selection-alert-container');

    // Table Elements
    const reservasTableBody = document.getElementById('reservas-table-body');

    const showAlert = (container, message, type = 'error') => {
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        container.style.display = 'block';
    };

    const hideAlert = (container) => {
        container.innerHTML = '';
        container.style.display = 'none';
    };

    const updateWizardUI = () => {
        wizardStepTitle.textContent = wizardStepTitles[currentStep];

        document.querySelectorAll('.wizard-step').forEach(step => {
            step.style.display = 'none';
        });
        document.getElementById(`step-${currentStep}`).style.display = 'block';

        wizardPrevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        wizardNextBtn.textContent = currentStep < totalSteps ? 'Próximo' : 'Finalizar Reserva';

        if (currentStep === 1 && !document.querySelector('.wizard-navigation .cancel')) {
            wizardPrevBtn.parentNode.insertBefore(wizardCancelBtn, wizardPrevBtn);
        } else if (currentStep !== 1) {
            if (document.querySelector('.wizard-navigation .cancel')) {
                wizardCancelBtn.remove();
            }
        }

        validateCurrentStep();
        updateSummary();
    };

    const updateSummary = () => {
        summaryImovel.textContent = reservationData.imovel ? `${reservationData.imovel.apelido} (${reservationData.imovel.situacao})` : '- Nenhum selecionado -';

        summaryHospedes.innerHTML = '';
        if (reservationData.hospedes.length > 0) {
            reservationData.hospedes.forEach(hospede => {
                const li = document.createElement('li');
                li.textContent = hospede.nome;
                summaryHospedes.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '- Nenhum selecionado -';
            summaryHospedes.appendChild(li);
        }

        summaryPets.textContent = reservationData.hasPets ? 'Sim' : 'Não';

        if (reservationData.checkinDate && reservationData.checkoutDate) {
            const checkin = new Date(reservationData.checkinDate).toLocaleDateString();
            const checkout = new Date(reservationData.checkoutDate).toLocaleDateString();
            summaryPeriodo.textContent = `${checkin} a ${checkout}`;
        } else {
            summaryPeriodo.textContent = '- Não informado -';
        }
        summaryDiarias.textContent = reservationData.noites > 0 ? reservationData.noites : '- 0 -';
    };

    const validateCurrentStep = () => {
        let isValid = true;
        hideAlert(propertyListAlertContainer);
        hideAlert(guestSelectionAlertContainer);
        hideAlert(dateSelectionAlertContainer);

        if (currentStep === 1) {
            if (!reservationData.imovel) {
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (reservationData.hospedes.length === 0) {
                showAlert(guestSelectionAlertContainer, 'Selecione pelo menos um hóspede.', 'warning');
                isValid = false;
            } else if (reservationData.imovel && reservationData.hospedes.length > reservationData.imovel.capacidadeMaxima) {
                showAlert(guestSelectionAlertContainer, `O número de hóspedes (${reservationData.hospedes.length}) excede a capacidade máxima do imóvel (${reservationData.imovel.capacidadeMaxima}).`, 'error');
                isValid = false;
            }
        } else if (currentStep === 3) {
            if (!reservationData.checkinDate || !reservationData.checkoutDate) {
                showAlert(dateSelectionAlertContainer, 'Por favor, selecione as datas de entrada e saída.', 'warning');
                isValid = false;
            } else if (new Date(reservationData.checkinDate) >= new Date(reservationData.checkoutDate)) {
                showAlert(dateSelectionAlertContainer, 'A data de saída deve ser posterior à data de entrada.', 'error');
                isValid = false;
            }
        }
        wizardNextBtn.disabled = !isValid;
        return isValid;
    };

    const loadPropertiesForWizard = () => {
        const imoveis = Imovel.listarTodos();
        allProperties = imoveis;
        wizardPropertyList.innerHTML = '';
        if (imoveis.length === 0) {
            wizardPropertyList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Nenhum imóvel cadastrado.</p>';
            return;
        }

        imoveis.forEach(imovel => {
            const card = document.createElement('div');
            card.classList.add('property-card');
            if (reservationData.imovel && reservationData.imovel.id === imovel.id) {
                card.classList.add('selected');
            }
            card.innerHTML = `
                <img src="${imovel.foto || 'https://via.placeholder.com/100x80?text=Imovel'}" alt="${imovel.apelido}" class="property-card-thumbnail">
                <div class="property-card-info">
                    <div class="property-card-name">${imovel.apelido}</div>
                    <div class="property-card-status ${imovel.situacao}">${imovel.situacao}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.property-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                reservationData.imovel = imovel;
                validateCurrentStep();
                updateSummary();
            });
            wizardPropertyList.appendChild(card);
        });
    };

    const loadGuestsForWizard = () => {
        const clientes = Cliente.listarTodos();
        allGuests = clientes;
        renderFilteredGuests();

        hasPetsSlider.checked = reservationData.hasPets;
        hasPetsStatus.textContent = reservationData.hasPets ? 'Sim' : 'Não';
    };

    const renderFilteredGuests = (searchTerm = '') => {
        wizardHospedesList.innerHTML = '';
        const filteredGuests = allGuests.filter(guest =>
            guest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.telefone.includes(searchTerm)
        );

        if (filteredGuests.length === 0) {
            wizardHospedesList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Nenhum hóspede encontrado.</p>';
            return;
        }

        filteredGuests.forEach(guest => {
            const guestItem = document.createElement('div');
            guestItem.classList.add('guest-list-item');
            const isSelected = reservationData.hospedes.some(h => h.id === guest.id);
            guestItem.innerHTML = `
                <input type="checkbox" id="guest-${guest.id}" value="${guest.id}" ${isSelected ? 'checked' : ''}>
                <label for="guest-${guest.id}">${guest.nome} (${guest.telefone})</label>
            `;
            const checkbox = guestItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    reservationData.hospedes.push(guest);
                } else {
                    reservationData.hospedes = reservationData.hospedes.filter(h => h.id !== guest.id);
                }
                validateCurrentStep();
                updateSummary();
            });
            wizardHospedesList.appendChild(guestItem);
        });
    };

    wizardHospedeSearchInput.addEventListener('input', (e) => {
        renderFilteredGuests(e.target.value);
    });

    addNewGuestBtn.addEventListener('click', () => {
        alert('Funcionalidade para adicionar novo hóspede será implementada em breve.');
    });

    hasPetsSlider.addEventListener('change', (e) => {
        reservationData.hasPets = e.target.checked;
        hasPetsStatus.textContent = reservationData.hasPets ? 'Sim' : 'Não';
        updateSummary();
    });

    const calculateNights = () => {
        const checkin = checkinDateInput.value;
        const checkout = checkoutDateInput.value;

        if (checkin && checkout) {
            const startDate = new Date(checkin);
            const endDate = new Date(checkout);

            if (endDate > startDate) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                reservationData.noites = diffDays;
                calculatedNights.textContent = diffDays;
            } else {
                reservationData.noites = 0;
                calculatedNights.textContent = '0';
            }
        } else {
            reservationData.noites = 0;
            calculatedNights.textContent = '0';
        }
        validateCurrentStep();
        updateSummary();
    };

    checkinDateInput.addEventListener('change', (e) => {
        reservationData.checkinDate = e.target.value;
        calculateNights();
    });

    checkoutDateInput.addEventListener('change', (e) => {
        reservationData.checkoutDate = e.target.value;
        calculateNights();
    });

    wizardNextBtn.addEventListener('click', () => {
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep < totalSteps) {
            currentStep++;
            updateWizardUI();
            if (currentStep === 2) {
                loadGuestsForWizard();
            }
        } else {
            const newReserva = new Reserva(
                null, // id
                reservationData.imovel.id,
                reservationData.hospedes.map(h => h.id),
                reservationData.checkinDate,
                reservationData.checkoutDate,
                'Confirmada' // status
            );
            newReserva.salvar();
            loadReservasTable();
            closeWizard();
        }
    });

    wizardPrevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizardUI();
        }
    });

    wizardCancelBtn.addEventListener('click', () => {
        closeWizard();
    });

    const closeWizard = () => {
        reservationWizardModal.style.display = 'none';
    };

    startWizardBtn.addEventListener('click', () => {
        reservationWizardModal.style.display = 'flex';
        currentStep = 1;
        reservationData = {
            imovel: null,
            hospedes: [],
            hasPets: false,
            checkinDate: null,
            checkoutDate: null,
            noites: 0
        };
        loadPropertiesForWizard();
        updateWizardUI();
    });

    function loadReservasTable() {
        const reservas = Reserva.listarTodas();
        reservasTableBody.innerHTML = '';

        if (reservas.length === 0) {
            reservasTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        reservas.forEach(reserva => {
            const imovel = Imovel.buscarPorId(reserva.idImovel);
            const hospedes = (reserva.idsHospedes || []).map(idCliente => Cliente.buscarPorId(idCliente));
            
            // Corrige o problema de "Invalid Date" tratando a data como UTC.
            const checkinDate = new Date(reserva.dataCheckin + 'T00:00:00');
            const checkoutDate = new Date(reserva.dataCheckout + 'T00:00:00');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${imovel ? imovel.apelido : 'Imóvel não encontrado'}</td>
                <td>${checkinDate.toLocaleDateString()}</td>
                <td>${checkoutDate.toLocaleDateString()}</td>
                <td>${hospedes.map(h => h ? h.nome : 'Hóspede não encontrado').join(', ')}</td>
                <td><span class="status ${reserva.status.toLowerCase()}">${reserva.status}</span></td>
                <td>
                    <button class="btn-action" onclick="alert('Editar reserva ${reserva.id}')">✏️</button>
                    <button class="btn-action" onclick="alert('Excluir reserva ${reserva.id}')">🗑️</button>
                </td>
            `;
            reservasTableBody.appendChild(row);
        });
    }

    reservationWizardModal.style.display = 'none';
    loadReservasTable();
});
