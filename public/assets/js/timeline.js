document.addEventListener('DOMContentLoaded', () => {
    // Adferre o início para garantir que o Firestore esteja pronto
    setTimeout(initTimeline, 500); 
});

async function initTimeline() {
    const timelineView = document.getElementById('timeline-view');
    if (!timelineView) return;

    // Depende do `db` do firebase-config.js e das classes de entidade
    // Certifique-se de que eles estão disponíveis no escopo global
    if (typeof db === 'undefined' || typeof Imovel === 'undefined' || typeof Reserva === 'undefined' || typeof Cliente === 'undefined') {
        console.error("Firestore (db) ou classes de entidade (Imovel, Reserva, Cliente) não estão definidas. A timeline não pode ser carregada.");
        return;
    }

    try {
        const imoveis = await Imovel.listarTodos();
        const reservas = await Reserva.listarTodos();
        const clientes = await Cliente.listarTodos();
        
        renderTimeline(timelineView, imoveis, reservas, clientes);
    } catch (error) {
        console.error("Erro ao carregar dados para a timeline:", error);
        timelineView.innerHTML = "<p>Ocorreu um erro ao carregar a linha do tempo.</p>";
    }
}

function renderTimeline(container, imoveis, reservas, clientes) {
    container.innerHTML = ''; // Limpa o conteúdo anterior

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = getDaysArray(today, 30); // Exibe 30 dias a partir de hoje

    // Renderiza o cabeçalho
    const header = createTimelineHeader(days);
    container.appendChild(header);

    // Renderiza o corpo com as linhas dos imóveis
    const body = document.createElement('div');
    body.className = 'timeline-body';

    imoveis.forEach(imovel => {
        const imovelReservas = reservas.filter(r => r.imovelId === imovel.id);
        const row = createTimelineRow(imovel, imovelReservas, days, today, clientes);
        body.appendChild(row);
    });

    container.appendChild(body);
}

function getDaysArray(start, count) {
    const days = [];
    let currentDate = new Date(start);
    for (let i = 0; i < count; i++) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
}

function createTimelineHeader(days) {
    const header = document.createElement('div');
    header.className = 'timeline-header';

    const imoveisHeader = document.createElement('div');
    imoveisHeader.className = 'timeline-imoveis-header';
    imoveisHeader.textContent = 'Imóveis';
    header.appendChild(imoveisHeader);

    const daysContainer = document.createElement('div');
    daysContainer.className = 'timeline-days';

    days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'timeline-day';
        dayEl.innerHTML = `${day.getDate()}<br>${day.toLocaleDateString('pt-BR', { month: 'short' })}`;
        daysContainer.appendChild(dayEl);
    });

    header.appendChild(daysContainer);
    return header;
}

function createTimelineRow(imovel, reservas, days, timelineStart, clientes) {
    const row = document.createElement('div');
    row.className = 'timeline-row';

    const imovelCell = document.createElement('div');
    imovelCell.className = 'timeline-imovel-cell';
    imovelCell.textContent = imovel.titulo;
    row.appendChild(imovelCell);

    const reservasCell = document.createElement('div');
    reservasCell.className = 'timeline-reservas-cell';
    reservasCell.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;

    reservas.forEach(reserva => {
        const checkin = new Date(reserva.checkin);
        const checkout = new Date(reserva.checkout);
        
        // Normaliza as datas para ignorar a hora
        checkin.setHours(0, 0, 0, 0);
        checkout.setHours(0, 0, 0, 0);

        const timelineEnd = new Date(days[days.length - 1]);

        // Verifica se a reserva está no range da timeline
        if (checkout < timelineStart || checkin > timelineEnd) {
            return; // Pula para a próxima reserva
        }

        const startDayIndex = Math.max(0, (checkin - timelineStart) / (1000 * 60 * 60 * 24));
        const endDayIndex = Math.min(days.length, (checkout - timelineStart) / (1000 * 60 * 60 * 24));
        
        const duration = endDayIndex - startDayIndex;

        if (duration <= 0) return;

        let nomeHospede = 'Reserva';
        if (reserva.hospedes && reserva.hospedes.length > 0) {
            const primeiroHospede = clientes.find(c => c.id == reserva.hospedes[0]);
            if (primeiroHospede) {
                nomeHospede = primeiroHospede.nome;
            }
        }

        const reservaBar = document.createElement('div');
        reservaBar.className = 'reserva-bar';
        reservaBar.textContent = nomeHospede;
        reservaBar.title = `Reserva: ${nomeHospede}\nCheck-in: ${reserva.checkin}\nCheck-out: ${reserva.checkout}`;
        
        // Posiciona a barra na grade
        reservaBar.style.gridColumnStart = Math.floor(startDayIndex) + 1;
        reservaBar.style.gridColumnEnd = `span ${Math.ceil(duration)}`;

        reservasCell.appendChild(reservaBar);
    });

    row.appendChild(reservasCell);
    return row;
}
