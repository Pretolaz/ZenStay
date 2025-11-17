
document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento de IDs para seus respectivos objetos para fácil acesso
    const anfitrioes = Anfitriao.listarTodos().reduce((acc, obj) => ({ ...acc, [obj.codigoInterno]: obj }), {});
    const imoveis = Imovel.listarTodos().reduce((acc, obj) => ({ ...acc, [obj.codigoInterno]: obj }), {});
    const plataformas = Plataforma.listarTodos().reduce((acc, obj) => ({ ...acc, [obj.codigoInterno]: obj }), {});

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const step4 = document.getElementById('step-4');
    const step5 = document.getElementById('step-5');

    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const nextToStep4 = document.getElementById('next-to-step-4');
    const nextToStep5 = document.getElementById('next-to-step-5');

    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    const backToStep3 = document.getElementById('back-to-step-3');
    const backToStep4 = document.getElementById('back-to-step-4');

    const saveReserva = document.getElementById('save-reserva');

    const formSteps = [step1, step2, step3, step4, step5];
    let currentStep = 0;

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });
        currentStep = stepIndex;
    }

    // Navegação
    nextToStep2.addEventListener('click', () => showStep(1));
    nextToStep3.addEventListener('click', () => showStep(2));
    nextToStep4.addEventListener('click', () => showStep(3));
    nextToStep5.addEventListener('click', () => {
        updateResumo();
        showStep(4);
    });

    backToStep1.addEventListener('click', () => showStep(0));
    backToStep2.addEventListener('click', () => showStep(1));
    backToStep3.addEventListener('click', () => showStep(2));
    backToStep4.addEventListener('click', () => showStep(3));

    // ---- INICIALIZAÇÃO E MANIPULAÇÃO DOS DADOS ----

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
        observacoes: document.getElementById('reserva-observacoes')
    };

    // Carregar selects
    function loadSelectOptions(element, data, placeholder, keyField = 'codigoInterno', valueField = 'nome') {
        element.innerHTML = `<option value="">${placeholder}</option>`;
        data.forEach(item => {
            element.innerHTML += `<option value="${item[keyField]}">${item[valueField]}</option>`;
        });
    }

    loadSelectOptions(reservaForm.anfitriao, Object.values(anfitrioes), 'Selecione um anfitrião');
    loadSelectOptions(reservaForm.imovel, Object.values(imoveis), 'Selecione um imóvel', 'codigoInterno', 'titulo');
    loadSelectOptions(reservaForm.plataforma, Object.values(plataformas), 'Selecione uma plataforma');

    // Inicializar Select2 para hospedes
    const hospedesSelect = $(reservaForm.hospedes).select2({
        placeholder: 'Selecione ou adicione hóspedes',
        width: '100%',
        data: Cliente.listarTodos().map(c => ({ id: c.codigoInterno, text: c.nome }))
    });

    // Atualizar resumo
    function updateResumo() {
        const anfitriaoId = reservaForm.anfitriao.value;
        const imovelId = reservaForm.imovel.value;
        const plataformaId = reservaForm.plataforma.value;
        const hospedesIds = $(reservaForm.hospedes).val() || [];

        const hospedesNomes = hospedesIds.map(id => Cliente.buscarPorId(id)?.nome || 'Hóspede desconhecido').join(', ');

        document.getElementById('resumo-anfitriao').textContent = anfitrioes[anfitriaoId]?.nome || 'Não selecionado';
        document.getElementById('resumo-imovel').textContent = imoveis[imovelId]?.titulo || 'Não selecionado';
        document.getElementById('resumo-plataforma').textContent = plataformas[plataformaId]?.nome || 'Não selecionado';
        document.getElementById('resumo-hospedes').textContent = hospedesNomes || 'Nenhum';
        document.getElementById('resumo-checkin').textContent = reservaForm.checkin.value ? new Date(reservaForm.checkin.value + 'T00:00:00').toLocaleDateString() : 'Não definido';
        document.getElementById('resumo-checkout').textContent = reservaForm.checkout.value ? new Date(reservaForm.checkout.value + 'T00:00:00').toLocaleDateString() : 'Não definido';
        document.getElementById('resumo-num-hospedes').textContent = reservaForm.numHospedes.value || 'Não definido';
        document.getElementById('resumo-valor').textContent = `R$ ${parseFloat(reservaForm.valorTotal.value || 0).toFixed(2)}`;
        document.getElementById('resumo-status').textContent = reservaForm.status.options[reservaForm.status.selectedIndex]?.text || 'Não definido';
        document.getElementById('resumo-observacoes').textContent = reservaForm.observacoes.value || 'Nenhuma';
    }

    // Salvar reserva
    saveReserva.addEventListener('click', () => {
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

        // Validação simples
        if (!reservaData.imovelId || !reservaData.checkin || !reservaData.checkout || reservaData.hospedes.length === 0) {
            alert('Por favor, preencha pelo menos Imóvel, Hóspedes, Check-in e Check-out.');
            return;
        }

        Reserva.salvar(reservaData);

        // Resetar e fechar o modal/wizard
        document.getElementById('form-reserva').reset();
        hospedesSelect.val(null).trigger('change');
        showStep(0);
        document.getElementById('wizard-reserva-modal').style.display = 'none';

        loadReservasTable();
    });


    // Cancelar/Fechar Wizard
    document.getElementById('close-wizard').addEventListener('click', () => {
        document.getElementById('wizard-reserva-modal').style.display = 'none';
    });
    document.getElementById('cancel-reserva').addEventListener('click', () => {
        document.getElementById('wizard-reserva-modal').style.display = 'none';
    });


    // Abrir o modal do wizard
    document.getElementById('add-reserva-btn').addEventListener('click', () => {
        document.getElementById('form-reserva').reset();
        hospedesSelect.val(null).trigger('change');
        showStep(0);
        document.getElementById('wizard-reserva-modal').style.display = 'flex';
    });

    showStep(0); 
});


function formatarData(dataString) {
    if (!dataString) return '-';
    // Adiciona T00:00:00 para evitar problemas de fuso horário
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');
}

// Carregar e popular a tabela de reservas
function loadReservasTable() {
    const tabelaReservas = document.querySelector('#tabelaReservas tbody');
    const reservas = Reserva.listarTodas();
    
    const imoveis = Imovel.listarTodos().reduce((acc, obj) => ({ ...acc, [obj.codigoInterno]: obj }), {});

    tabelaReservas.innerHTML = ''; 

    reservas.forEach(reserva => {
        const row = document.createElement('tr');

        // Certifique-se de que reserva.hospedes é sempre um array
        const hospedesIds = Array.isArray(reserva.hospedes) ? reserva.hospedes : [];
        const nomesHospedes = hospedesIds.map(hospedeId => {
            const hospede = Cliente.buscarPorId(hospedeId);
            return hospede ? hospede.nome : 'Hóspede não encontrado';
        }).join(', ');

        const imovel = imoveis[reserva.imovelId];

        row.innerHTML = `
            <td>${reserva.codigoInterno}</td>
            <td>${imovel ? imovel.titulo : 'Imóvel não encontrado'}</td>
            <td>${nomesHospedes}</td>
            <td>${formatarData(reserva.checkin)}</td>
            <td>${formatarData(reserva.checkout)}</td>
            <td>${reserva.numHospedes}</td>
            <td>R$ ${parseFloat(reserva.valorTotal || 0).toFixed(2)}</td>
            <td><span class="status status-${reserva.status.toLowerCase()}">${reserva.status}</span></td>
            <td>
                <button class="action-btn" title="Editar">✏️</button>
                <button class="action-btn" title="Excluir" onclick="excluirReserva(${reserva.codigoInterno})">🗑️</button>
            </td>
        `;
        tabelaReservas.appendChild(row);
    });
}

function excluirReserva(codigoInterno) {
    if (confirm(`Tem certeza que deseja excluir a reserva #${codigoInterno}?`)) {
        Reserva.excluir(codigoInterno);
        loadReservasTable();
    }
}

// Carregar a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', loadReservasTable);


