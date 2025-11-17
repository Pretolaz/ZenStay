document.addEventListener('DOMContentLoaded', () => {
    // ---- ELEMENTOS DO DOM ----
    const modal = document.getElementById('wizard-reserva-modal');
    const form = document.getElementById('form-reserva');
    const addReservaBtn = document.getElementById('add-reserva-btn');
    const closeWizardBtn = document.getElementById('close-wizard');
    const cancelReservaBtn = document.getElementById('cancel-reserva');
    const tabelaReservas = document.querySelector('#tabelaReservas tbody');

    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4'),
        document.getElementById('step-5'),
    ];

    const nextButtons = {
        step1: document.getElementById('next-to-step-2'),
        step2: document.getElementById('next-to-step-3'),
        step3: document.getElementById('next-to-step-4'),
        step4: document.getElementById('next-to-step-5'),
    };

    const backButtons = {
        step2: document.getElementById('back-to-step-1'),
        step3: document.getElementById('back-to-step-2'),
        step4: document.getElementById('back-to-step-3'),
        step5: document.querySelector('.wizard-footer button[id^="back-to-step-4"]'), // Selector mais robusto
    };
    
    const saveReservaBtn = document.getElementById('save-reserva');

    const reservaForm = {
        anfitriao: document.getElementById('reserva-anfitriao'),
        imovel: document.getElementById('reserva-imovel'),
        plataforma: document.getElementById('reserva-plataforma'),
        hospedes: document.getElementById('reserva-hospedes'),
        checkin: document.getElementById('reserva-checkin'),
        checkout: document.getElementById('reserva-checkout'),
        numHospedes: document.getElementById('reserva-num-hospedes'),
        valorTotal: document.getElementById('reserva-valor-total'),
        status: document.getElementById('reserva-status'),
        observacoes: document.getElementById('reserva-observacoes'),
    };

    // ---- ESTADO E DADOS ----
    let currentStep = 0;
    let anfitrioes, imoveis, plataformas, clientes;

    // ---- FUNÇÕES ----

    function loadInitialData() {
        anfitrioes = Anfitriao.listarTodos();
        imoveis = Imovel.listarTodos();
        plataformas = Plataforma.listarTodos();
        clientes = Cliente.listarTodos();
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });

        // Controla a visibilidade dos botões de navegação
        Object.values(nextButtons).forEach(btn => btn.style.display = 'none');
        Object.values(backButtons).forEach(btn => btn.style.display = 'none');
        saveReservaBtn.style.display = 'none';

        if (stepIndex > 0) {
            const backBtn = backButtons[`step${stepIndex + 1}`];
            if(backBtn) backBtn.style.display = 'inline-block';
        }

        if (stepIndex < steps.length - 1) {
            nextButtons[`step${stepIndex + 1}`].style.display = 'inline-block';
        } else {
            saveReservaBtn.style.display = 'inline-block';
        }
        
        currentStep = stepIndex;
    }
    
    function loadSelectOptions(element, data, placeholder, keyField = 'codigoInterno', valueField = 'nome') {
        if (!element) return;
        element.innerHTML = `<option value="">${placeholder}</option>`;
        data.forEach(item => {
            element.innerHTML += `<option value="${item[keyField]}">${item[valueField]}</option>`;
        });
    }

    function initializeWizard() {
        loadSelectOptions(reservaForm.anfitriao, anfitrioes, 'Selecione um anfitrião');
        loadSelectOptions(reservaForm.imovel, imoveis, 'Selecione um imóvel', 'codigoInterno', 'titulo');
        loadSelectOptions(reservaForm.plataforma, plataformas, 'Selecione uma plataforma');

        $(reservaForm.hospedes).select2({
            placeholder: 'Selecione ou adicione hóspedes',
            width: '100%',
            dropdownParent: $('#step-2'), // Garante que o dropdown apareça dentro do modal
            data: clientes.map(c => ({ id: c.codigoInterno, text: c.nome }))
        });
    }

    function updateResumo() {
        const anfitriaoId = reservaForm.anfitriao.value;
        const imovelId = reservaForm.imovel.value;
        const plataformaId = reservaForm.plataforma.value;
        const hospedesIds = $(reservaForm.hospedes).val() || [];

        const hospedesNomes = hospedesIds.map(id => {
            const cliente = Cliente.buscarPorId(id);
            return cliente ? cliente.nome : 'Hóspede desconhecido';
        }).join(', ');

        // Usando .textContent para segurança
        document.getElementById('resumo-anfitriao').textContent = anfitrioes.find(a => a.codigoInterno == anfitriaoId)?.nome || 'N/A';
        document.getElementById('resumo-imovel').textContent = imoveis.find(i => i.codigoInterno == imovelId)?.titulo || 'N/A';
        document.getElementById('resumo-plataforma').textContent = plataformas.find(p => p.codigoInterno == plataformaId)?.nome || 'N/A';
        document.getElementById('resumo-hospedes').textContent = hospedesNomes || 'Nenhum';
        document.getElementById('resumo-checkin').textContent = reservaForm.checkin.value ? formatarData(reservaForm.checkin.value) : 'N/A';
        document.getElementById('resumo-checkout').textContent = reservaForm.checkout.value ? formatarData(reservaForm.checkout.value) : 'N/A';
        document.getElementById('resumo-num-hospedes').textContent = reservaForm.numHospedes.value || 'N/A';
        document.getElementById('resumo-valor').textContent = `R$ ${parseFloat(reservaForm.valorTotal.value || 0).toFixed(2)}`;
        document.getElementById('resumo-status').textContent = reservaForm.status.options[reservaForm.status.selectedIndex]?.text || 'N/A';
        document.getElementById('resumo-observacoes').textContent = reservaForm.observacoes.value || 'Nenhuma';
    }

    function openModal() {
        form.reset();
        $(reservaForm.hospedes).val(null).trigger('change');
        showStep(0);
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function handleSave() {
        const reservaData = {
            anfitriaoId: reservaForm.anfitriao.value,
            imovelId: reservaForm.imovel.value,
            plataformaId: reservaForm.plataforma.value,
            hospedes: $(reservaForm.hospedes).val() || [],
            checkin: reservaForm.checkin.value,
            checkout: reservaForm.checkout.value,
            numHospedes: reservaForm.numHospedes.value,
            valorTotal: reservaForm.valorTotal.value,
            status: reservaForm.status.value,
            observacoes: reservaForm.observacoes.value
        };

        if (!reservaData.imovelId || !reservaData.checkin || !reservaData.checkout || reservaData.hospedes.length === 0) {
            alert('Por favor, preencha pelo menos Imóvel, Hóspedes, Check-in e Check-out.');
            return;
        }

        Reserva.salvar(reservaData);
        closeModal();
        loadReservasTable();
    }

    function formatarData(dataString) {
        if (!dataString) return '-';
        return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    function loadReservasTable() {
        if (!tabelaReservas) return;
        const reservas = Reserva.listarTodos();
        const imoveisMap = imoveis.reduce((acc, obj) => ({ ...acc, [obj.codigoInterno]: obj }), {});

        tabelaReservas.innerHTML = ''; 

        reservas.forEach(reserva => {
            const row = document.createElement('tr');
            const hospedesIds = Array.isArray(reserva.hospedes) ? reserva.hospedes : [];
            const nomesHospedes = hospedesIds.map(hospedeId => Cliente.buscarPorId(hospedeId)?.nome || 'Não encontrado').join(', ');
            const imovel = imoveisMap[reserva.imovelId];

            row.innerHTML = `
                <td>${reserva.codigoInterno}</td>
                <td>${imovel ? imovel.titulo : 'Não encontrado'}</td>
                <td>${nomesHospedes}</td>
                <td>${formatarData(reserva.checkin)}</td>
                <td>${formatarData(reserva.checkout)}</td>
                <td>${reserva.numHospedes}</td>
                <td>R$ ${parseFloat(reserva.valorTotal || 0).toFixed(2)}</td>
                <td><span class="status status-${String(reserva.status).toLowerCase()}">${reserva.status}</span></td>
                <td>
                    <button class="action-btn" title="Editar">✏️</button>
                    <button class="action-btn" title="Excluir" onclick="excluirReserva(${reserva.codigoInterno})">🗑️</button>
                </td>
            `;
            tabelaReservas.appendChild(row);
        });
    }

    window.excluirReserva = function(codigoInterno) {
        if (confirm(`Tem certeza que deseja excluir a reserva #${codigoInterno}?`)) {
            Reserva.excluir(codigoInterno);
            loadReservasTable();
        }
    }

    // ---- EVENT LISTENERS ----
    addReservaBtn.addEventListener('click', openModal);
    closeWizardBtn.addEventListener('click', closeModal);
    cancelReservaBtn.addEventListener('click', closeModal);
    saveReservaBtn.addEventListener('click', handleSave);

    nextButtons.step1.addEventListener('click', () => showStep(1));
    nextButtons.step2.addEventListener('click', () => showStep(2));
    nextButtons.step3.addEventListener('click', () => showStep(3));
    nextButtons.step4.addEventListener('click', () => {
        updateResumo();
        showStep(4);
    });

    backButtons.step2.addEventListener('click', () => showStep(0));
    backButtons.step3.addEventListener('click', () => showStep(1));
    backButtons.step4.addEventListener('click', () => showStep(2));

    // ---- INICIALIZAÇÃO ----
    loadInitialData();
    initializeWizard();
    loadReservasTable();
});