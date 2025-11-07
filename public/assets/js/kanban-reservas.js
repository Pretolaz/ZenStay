document.addEventListener('DOMContentLoaded', () => {
    const hospedesList = document.getElementById('hospedes-list');
    const imoveisList = document.getElementById('imoveis-list');
    const salvarReservasBtn = document.getElementById('salvar-reservas-btn');

    let clientesDisponiveis = []; // Hóspedes que ainda não foram "arrastados"
    let imoveisComReservasTemporarias = []; // Imóveis com hóspedes temporariamente associados

    // Função para carregar e renderizar hóspedes
    function carregarHospedes() {
        clientesDisponiveis = Cliente.listarTodos();
        hospedesList.innerHTML = '';
        clientesDisponiveis.forEach(hospede => {
            const hospedeCard = document.createElement('div');
            hospedeCard.classList.add('kanban-item', 'hospede-card');
            hospedeCard.setAttribute('draggable', true);
            hospedeCard.dataset.hospedeId = hospede.codigoInterno;
            hospedeCard.innerHTML = `
                <span>${hospede.nome}</span>
                <strong>#${hospede.codigoInterno}</strong>
            `;
            hospedesList.appendChild(hospedeCard);
        });
        addDragListeners();
    }

    // Função para carregar e renderizar imóveis
    function carregarImoveis() {
        const todosImoveis = Imovel.listarTodos();
        // Inicializa imoveisComReservasTemporarias com os imóveis existentes e suas reservas salvas
        // Para a primeira carga, assumiremos que não há reservas do kanban salvas, ou as carregaremos
        // de um formato específico se você já tiver algo em mente para o localStorage.
        // Por enquanto, vamos carregar sem reservas iniciais do kanban.
        imoveisComReservasReservasTemporarias = todosImoveis.map(imovel => ({
            ...imovel,
            hospedesAssociados: [] // Inicialmente nenhum hóspede associado no Kanban
        }));

        imoveisList.innerHTML = '';
        imoveisComReservasReservasTemporarias.forEach(imovel => {
            const imovelCard = document.createElement('div');
            imovelCard.classList.add('kanban-item', 'imovel-card');
            imovelCard.dataset.imovelId = imovel.codigo;
            imovelCard.innerHTML = `
                <h4>${imovel.apelido || imovel.nome}</h4>
                <p>${imovel.endereco}</p>
                <div class="hospedes-no-imovel">
                    <h5>Hóspedes para este imóvel:</h5>
                    <div id="hospedes-imovel-${imovel.codigo}">
                        ${imovel.hospedesAssociados.map(h => `
                            <div class="hospede-item-mini" data-hospede-id="${h.codigoInterno}">
                                <span>${h.nome}</span>
                                <button type="button" class="remove-hospede-btn" data-hospede-id="${h.codigoInterno}" data-imovel-id="${imovel.codigo}">X</button>
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
            const hospedesContainer = imovelCard.querySelector('.hospedes-no-imovel div');

            imovelCard.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessário para permitir o drop
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

                const hospedeArrastado = clientesDisponiveis.find(h => String(h.codigoInterno) === hospedeId);

                if (hospedeArrastado) {
                    // Adiciona o hóspede temporariamente ao imóvel
                    const targetImovel = imoveisComReservasReservasTemporarias.find(i => String(i.codigo) === imovelId);
                    if (targetImovel && !targetImovel.hospedesAssociados.some(h => String(h.codigoInterno) === hospedeId)) {
                        targetImovel.hospedesAssociados.push(hospedeArrastado);
                        renderizarHospedesNoImovel(imovelId);

                        // Remove o hóspede da lista de disponíveis (apenas visualmente no Kanban)
                        const draggedHospedeElement = document.querySelector(`.hospede-card[data-hospede-id="${hospedeId}"]`);
                        if (draggedHospedeElement) {
                            draggedHospedeElement.remove();
                            // remove from clientesDisponiveis array
                            clientesDisponiveis = clientesDisponiveis.filter(h => String(h.codigoInterno) !== hospedeId);
                        }
                    }
                }
            });
        });
    }

    // Função para renderizar hóspedes dentro de um card de imóvel específico
    function renderizarHospedesNoImovel(imovelId) {
        const targetImovel = imoveisComReservasReservasTemporarias.find(i => String(i.codigo) === imovelId);
        if (targetImovel) {
            const hospedesContainer = document.getElementById(`hospedes-imovel-${imovelId}`);
            hospedesContainer.innerHTML = targetImovel.hospedesAssociados.map(h => `
                <div class="hospede-item-mini" data-hospede-id="${h.codigoInterno}">
                                <span>${h.nome}</span>
                                <button type="button" class="remove-hospede-btn" data-hospede-id="${h.codigoInterno}" data-imovel-id="${imovelId}">X</button>
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

                const targetImovel = imoveisComReservasReservasTemporarias.find(i => String(i.codigo) === imovelId);
                if (targetImovel) {
                    targetImovel.hospedesAssociados = targetImovel.hospedesAssociados.filter(h => String(h.codigoInterno) !== hospedeId);
                    renderizarHospedesNoImovel(imovelId);

                    // Devolve o hóspede para a lista de disponíveis (se ele veio de lá)
                    const hospedeRetornado = Cliente.listarTodos().find(h => String(h.codigoInterno) === hospedeId);
                    if (hospedeRetornado && !clientesDisponiveis.some(h => String(h.codigoInterno) === hospedeId)) {
                        clientesDisponiveis.push(hospedeRetornado);
                        carregarHospedes(); // Recarrega a lista para mostrar o hóspede novamente
                    }
                }
            });
        });
    }

    // Função para salvar as reservas temporárias no localStorage
    salvarReservasBtn.addEventListener('click', () => {
        let reservasAtuais = JSON.parse(localStorage.getItem('reservas')) || [];
        const novasReservasKanban = [];

        imoveisComReservasReservasTemporarias.forEach(imovel => {
            imovel.hospedesAssociados.forEach(hospede => {
                // Aqui você pode definir como quer que a reserva seja salva.
                // Exemplo simplificado, pode ser expandido com datas, plataformas, etc.
                // O código interno da reserva será gerado automaticamente, se não existir
                const novaReserva = {
                    codigoInterno: null, // Será preenchido pela lógica abaixo
                    hospede: hospede.nome,
                    hospedeId: hospede.codigoInterno, // Adiciona o ID do hóspede
                    imovel: imovel.nome,
                    imovelId: imovel.codigo, // Adiciona o ID do imóvel
                    plataforma: 'Kanban', // Ou permitir escolher na UI
                    checkin: new Date().toISOString().split('T')[0], // Data atual como placeholder
                    checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Próximo dia como placeholder
                    valor: 0, // Ou permitir escolher na UI
                    status: 'Pendente', // Status inicial
                    observacao: 'Criado via Kanban'
                };
                novasReservasKanban.push(novaReserva);
            });
        });

        // Adiciona novas reservas, gerando códigos internos se necessário
        novasReservasKanban.forEach(novaReserva => {
            if (!novaReserva.codigoInterno) {
                const lastCode = reservasAtuais.length ? Math.max(...reservasAtuais.map(r => Number(r.codigoInterno) || 0)) : 6000;
                novaReserva.codigoInterno = Number(lastCode) + 1;
            }
            reservasAtuais.push(novaReserva);
        });

        localStorage.setItem('reservas', JSON.stringify(reservasAtuais));
        alert('Reservas salvas com sucesso!');

        // Opcional: Recarregar o Kanban ou limpar as associações temporárias após salvar
        carregarHospedes();
        carregarImoveis();
    });

    // Inicialização
    carregarHospedes();
    carregarImoveis();
});