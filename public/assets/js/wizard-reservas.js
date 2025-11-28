import { Plataforma } from './entities/plataforma.js';
import { Imovel } from './entities/imovel.js';
import { Cliente } from './entities/cliente.js';
import { Reserva } from './entities/reserva.js';
// import { Toast } from './toast.js'; // Toast is global 
// If Toast is global (from toast.js not being a module), we might need to keep using it as global or fix it.
// Checking toast.js content next would be wise, but for now assuming it's global or I'll check it.

document.addEventListener('DOMContentLoaded', () => {
    // -----
    // Elementos do DOM
    // -----
    const startWizardBtn = document.getElementById('start-reservation-wizard-btn');
    const wizardModal = document.getElementById('reservation-wizard-modal');
    const closeWizardBtn = document.getElementById('close-wizard-btn');
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4'),
        5: document.getElementById('step-5'),
    };
    const totalSteps = Object.keys(steps).length;

    const platformListContainer = document.getElementById('wizard-platform-list');
    const propertyListContainer = document.getElementById('wizard-property-list');
    const guestListContainer = document.getElementById('wizard-hospedes-list');
    const guestSearchInput = document.getElementById('wizard-hospede-search-input');
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    const hasPetsToggle = document.getElementById('has-pets-toggle');
    const petWarningContainer = document.getElementById('pet-warning-container');

    // Elementos de Valores (Passo 5)
    const valorDiariaInput = document.getElementById('valor-diaria');
    const totalDiasDisplay = document.getElementById('total-dias-display');
    const taxaLimpezaInput = document.getElementById('taxa-limpeza');
    const taxasExtrasInput = document.getElementById('taxas-extras');
    const valorDescontoInput = document.getElementById('valor-desconto');
    const valorTotalLiquidoInput = document.getElementById('valor-total-liquido');

    // Elementos do Resumo
    const summaryPlataforma = document.getElementById('summary-plataforma');
    const summaryImovel = document.getElementById('summary-imovel');
    const summaryHospedes = document.getElementById('summary-hospedes');
    const summaryPets = document.getElementById('summary-pets');
    const summaryPeriodo = document.getElementById('summary-periodo');
    const summaryDiarias = document.getElementById('summary-diarias');
    const summaryTotalValor = document.getElementById('summary-total-valor');

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

    // Step Indicator Elements
    const stepIndicators = document.querySelectorAll('.step-item');

    // -----
    // Estado do Wizard
    // -----
    let currentStep = 1;
    let plataformas = [];
    let imoveis = [];
    let clientes = [];
    let reservaState = {
        plataformaId: null,
        imovelId: null,
        hospedesIds: [],
        checkin: null,
        checkout: null,
        hasPets: false,
        valorDiaria: 0,
        taxaLimpeza: 0,
        taxasExtras: 0,
        desconto: 0,
        valorTotal: 0
    };

    // -----
    // Funções de Inicialização e Carregamento de Dados
    // -----

    async function loadInitialData() {
        try {
            plataformas = await Plataforma.listarTodos();
            imoveis = await Imovel.listarTodos();
            clientes = await Cliente.listarTodos();
            await loadReservasTableLocal();
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
            if (typeof Toast !== 'undefined') Toast.error("Erro ao carregar dados.");
        }
    }


    function initializeWizard() {
        loadPlatformsStep();
        loadPropertiesStep();
        loadGuestsStep();
        setupEventListeners();
    }

    function loadPlatformsStep() {
        if (!platformListContainer) return;
        platformListContainer.innerHTML = '';

        if (plataformas.length === 0) {
            platformListContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Nenhuma plataforma cadastrada.</p>';
            return;
        }

        plataformas.forEach(plat => {
            const card = document.createElement('div');
            card.className = 'property-card'; // Reusing property-card style for consistency
            card.dataset.plataformaId = plat.codigoInterno;

            const logoUrl = plat.logo || 'assets/img/placeholder.jpg'; // Assuming placeholder exists or handle empty
            const logoImg = plat.logo ? `<img src="${plat.logo}" alt="${plat.nome}" class="property-card-thumbnail" style="object-fit: contain; padding: 10px; background: #fff;">` : `<div class="property-card-thumbnail" style="display:flex;align-items:center;justify-content:center;font-size:2rem;">🌐</div>`;

            card.innerHTML = `
                ${logoImg}
                <div class="property-card-info">
                    <div class="property-card-name">${plat.nome}</div>
                </div>
            `;
            card.addEventListener('click', () => handlePlatformSelection(plat.codigoInterno, card));
            platformListContainer.appendChild(card);
        });
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
        if (hasPetsToggle) hasPetsToggle.addEventListener('change', handlePetSelection);
        if (checkinInput) checkinInput.addEventListener('change', handleDateSelection);
        if (checkoutInput) checkoutInput.addEventListener('change', handleDateSelection);
        if (guestSearchInput) {
            guestSearchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = clientes.filter(c => c.nome.toLowerCase().includes(term) || (c.telefone && c.telefone.includes(term)));
                renderGuestList(filtered);
            });
        }

        // Listeners para recálculo de valores
        const valueInputs = [valorDiariaInput, taxaLimpezaInput, taxasExtrasInput, valorDescontoInput];
        valueInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', calculateTotalValues);
            }
        });
    }

    function handlePlatformSelection(plataformaId, cardElement) {
        reservaState.plataformaId = plataformaId;
        // Remove selected class from all platform cards
        if (platformListContainer) {
            platformListContainer.querySelectorAll('.property-card').forEach(card => card.classList.remove('selected'));
        }
        cardElement.classList.add('selected');
        updateSummary();
    }

    function handlePropertySelection(imovelId, cardElement) {
        reservaState.imovelId = imovelId;
        // Remove selected class from all property cards
        if (propertyListContainer) {
            propertyListContainer.querySelectorAll('.property-card').forEach(card => card.classList.remove('selected'));
        }
        cardElement.classList.add('selected');
        updateSummary();
    }

    function handleGuestSelection() {
        reservaState.hospedesIds = Array.from(guestListContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.guestId);
        updateSummary();
    }

    function handlePetSelection() {
        reservaState.hasPets = hasPetsToggle.checked;
        updateSummary();
    }

    function handleDateSelection() {
        const checkinVal = checkinInput.value;
        const checkoutVal = checkoutInput.value;

        if (checkinVal && checkoutVal) {
            const checkinDate = new Date(checkinVal);
            const checkoutDate = new Date(checkoutVal);

            if (checkinDate > checkoutDate) {
                Toast.warning('A data de check-in não pode ser posterior à data de check-out.');
                // Reset checkout to checkin + 1 day or just clear it? 
                // Let's just reset checkout to checkin + 1 day for better UX
                const nextDay = new Date(checkinDate);
                nextDay.setDate(checkinDate.getDate() + 1);
                checkoutInput.value = nextDay.toISOString().split('T')[0];
                reservaState.checkout = checkoutInput.value;
            }
        }

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

            // Default Dates
            const today = new Date();
            const checkoutDate = new Date();
            checkoutDate.setDate(today.getDate() + 3);

            const formatDate = (date) => date.toISOString().split('T')[0];
            const checkinVal = formatDate(today);
            const checkoutVal = formatDate(checkoutDate);

            reservaState = {
                plataformaId: null,
                imovelId: null,
                hospedesIds: [],
                checkin: checkinVal,
                checkout: checkoutVal,
                hasPets: false,
                valorDiaria: 0,
                taxaLimpeza: 0,
                taxasExtras: 0,
                desconto: 0,
                valorTotal: 0
            };

            if (hasPetsToggle) {
                hasPetsToggle.checked = false;
                hasPetsToggle.disabled = false;
            }
            if (petWarningContainer) petWarningContainer.style.display = 'none';

            if (checkinInput) checkinInput.value = checkinVal;
            if (checkoutInput) checkoutInput.value = checkoutVal;
            if (guestSearchInput) guestSearchInput.value = '';

            // Clear selections
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

        // Logic for Step 4 (Pets)
        if (stepNumber === 4) {
            const imovel = imoveis.find(i => i.id == reservaState.imovelId);
            if (imovel) {
                if (!imovel.aceitaPet) {
                    hasPetsToggle.checked = false;
                    hasPetsToggle.disabled = true;
                    reservaState.hasPets = false;
                    petWarningContainer.style.display = 'block';
                } else {
                    hasPetsToggle.disabled = false;
                    petWarningContainer.style.display = 'none';
                }
                updateSummary();
            }
        }

        // Logic for Step 5 (Valores)
        if (stepNumber === 5) {
            prepareValuesStep();
        }

        updateWizardControls(stepNumber);
        updateStepIndicator(stepNumber);
    }

    function goToNextStep() {
        if (currentStep === 1 && !reservaState.plataformaId) {
            Toast.warning('Por favor, selecione uma plataforma para continuar.');
            return;
        }
        if (currentStep === 2 && !reservaState.imovelId) {
            Toast.warning('Por favor, selecione um imóvel para continuar.');
            return;
        }
        if (currentStep === 3) {
            if (reservaState.hospedesIds.length === 0) {
                Toast.warning('Por favor, selecione pelo menos um hóspede.');
                return;
            }
            if (!reservaState.checkin || !reservaState.checkout) {
                Toast.warning('Por favor, defina as datas de check-in e check-out.');
                return;
            }
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

    function updateStepIndicator(stepNumber) {
        stepIndicators.forEach(indicator => {
            const step = parseInt(indicator.dataset.step);
            indicator.classList.toggle('active', step === stepNumber);
            indicator.style.opacity = step <= stepNumber ? '1' : '0.4';
        });
    }

    // -----
    // Funções de Atualização da UI e Lógica de Negócio
    // -----

    function prepareValuesStep() {
        const imovel = imoveis.find(i => i.id == reservaState.imovelId);

        // Se ainda não foi definido um valor de diária (primeira vez no passo), pega do imóvel
        if (reservaState.valorDiaria === 0 && imovel && imovel.valorDiaria) {
            reservaState.valorDiaria = parseFloat(imovel.valorDiaria);
        }

        // Atualiza inputs com o estado atual
        if (valorDiariaInput) valorDiariaInput.value = reservaState.valorDiaria || 0;
        if (taxaLimpezaInput) taxaLimpezaInput.value = reservaState.taxaLimpeza || 0;
        if (taxasExtrasInput) taxasExtrasInput.value = reservaState.taxasExtras || 0;
        if (valorDescontoInput) valorDescontoInput.value = reservaState.desconto || 0;

        calculateTotalValues();
    }

    function calculateTotalValues() {
        if (!reservaState.checkin || !reservaState.checkout) return;

        const checkinDate = new Date(reservaState.checkin);
        const checkoutDate = new Date(reservaState.checkout);

        let diffDays = 0;
        if (checkoutDate > checkinDate) {
            const diffTime = checkoutDate - checkinDate;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        if (totalDiasDisplay) totalDiasDisplay.value = diffDays;

        // Pega valores dos inputs
        const vDiaria = parseFloat(valorDiariaInput.value) || 0;
        const vLimpeza = parseFloat(taxaLimpezaInput.value) || 0;
        const vExtras = parseFloat(taxasExtrasInput.value) || 0;
        const vDesconto = parseFloat(valorDescontoInput.value) || 0;

        // Atualiza estado
        reservaState.valorDiaria = vDiaria;
        reservaState.taxaLimpeza = vLimpeza;
        reservaState.taxasExtras = vExtras;
        reservaState.desconto = vDesconto;

        // Calcula total
        const totalBruto = (vDiaria * diffDays) + vLimpeza + vExtras;
        const totalLiquido = Math.max(0, totalBruto - vDesconto);

        reservaState.valorTotal = totalLiquido;

        if (valorTotalLiquidoInput) {
            valorTotalLiquidoInput.value = totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        if (summaryTotalValor) {
            summaryTotalValor.textContent = totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    function updateSummary() {
        const plataforma = plataformas.find(p => p.codigoInterno == reservaState.plataformaId);
        if (summaryPlataforma) summaryPlataforma.textContent = plataforma ? plataforma.nome : '- Selecione -';

        const imovel = imoveis.find(i => i.id == reservaState.imovelId);
        if (summaryImovel) summaryImovel.textContent = imovel ? imovel.titulo : '- Selecione -';

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

        if (summaryPets) summaryPets.textContent = reservaState.hasPets ? 'Sim' : 'Não';

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
        if (!reservaState.plataformaId || !reservaState.imovelId || reservaState.hospedesIds.length === 0 || !reservaState.checkin || !reservaState.checkout) {
            Toast.error('Preencha todos os campos: Plataforma, Imóvel, Hóspedes e Período.');
            return;
        }

        // Validação de Conflito de Datas
        try {
            // Busca todas as reservas existentes
            const reservasExistentes = await Reserva.listarTodos();

            // Filtra reservas do mesmo imóvel
            const reservasImovel = reservasExistentes.filter(r => r.imovelId == reservaState.imovelId);

            const newCheckin = new Date(reservaState.checkin);
            const newCheckout = new Date(reservaState.checkout);

            // Verifica conflitos
            const temConflito = reservasImovel.some(reserva => {
                const existingCheckin = new Date(reserva.checkin);
                const existingCheckout = new Date(reserva.checkout);

                // Lógica de sobreposição: (StartA < EndB) && (EndA > StartB)
                // Isso permite que StartA == EndB (Checkin no dia do Checkout) e vice-versa
                return (newCheckin < existingCheckout) && (newCheckout > existingCheckin);
            });

            if (temConflito) {
                Toast.error('Já existe uma reserva para este imóvel nas datas selecionadas.');
                return;
            }

        } catch (error) {
            console.error("Erro ao validar conflitos:", error);
            Toast.error("Erro ao validar disponibilidade do imóvel.");
            return;
        }

        const newReservaData = {
            plataformaId: reservaState.plataformaId,
            imovelId: reservaState.imovelId,
            hospedes: reservaState.hospedesIds,
            checkin: reservaState.checkin,
            checkout: reservaState.checkout,
            numPets: reservaState.hasPets ? 1 : 0,
            numHospedes: reservaState.hospedesIds.length,
            status: 'Confirmada',
            dataCriacao: new Date().toISOString(),
            // Valores Financeiros
            valorDiaria: reservaState.valorDiaria,
            taxaLimpeza: reservaState.taxaLimpeza,
            taxasExtras: reservaState.taxasExtras,
            desconto: reservaState.desconto,
            valorTotal: reservaState.valorTotal
        };

        try {
            await Reserva.salvar(newReservaData);
            Toast.success('Reserva salva com sucesso!');
            closeWizard();
            await loadReservasTableLocal(); // Recarrega a tabela
            if (window.refreshTimeline) window.refreshTimeline(); // Atualiza a timeline
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
                        if (window.refreshTimeline) window.refreshTimeline(); // Atualiza a timeline
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

        // Adicionar exibição de valores no modal de detalhes se existirem
        const detailsBody = detailsModal.querySelector('.details-card-body');
        // Remove linha de valores anterior se existir para não duplicar
        const existingValuesRow = detailsBody.querySelector('.details-values-row');
        if (existingValuesRow) existingValuesRow.remove();

        if (reserva.valorTotal !== undefined) {
            const valuesRow = document.createElement('div');
            valuesRow.className = 'details-row details-values-row';
            valuesRow.style.marginTop = '15px';
            valuesRow.style.paddingTop = '15px';
            valuesRow.style.borderTop = '1px solid #eee';

            const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

            valuesRow.innerHTML = `
            <div class="details-group">
                <label>Valor Total</label>
                <p style="color: var(--primary-color); font-weight: 600;">${formatter.format(reserva.valorTotal)}</p>
            </div>
        `;
            detailsBody.appendChild(valuesRow);
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

    // Expose globally for timeline.js
    window.openReservationDetails = openReservationDetails;

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
