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
            numPets: reservaState.numPets,
            status: 'Confirmada',
            dataCriacao: new Date().toISOString(),
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
