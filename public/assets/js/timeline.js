document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
});

async function initTimeline() {
    const timelineView = document.getElementById('timeline-view');
    if (!timelineView) return;

    // As classes Imovel, Reserva e Cliente já devem estar disponíveis via window
    // pois este script é um módulo e roda após os módulos de entidade.


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
    const daysToShow = 30;
    const days = getDaysArray(today, daysToShow); // Exibe 30 dias a partir de hoje

    // Renderiza o cabeçalho
    const header = createTimelineHeader(days);
    container.appendChild(header);

    // Renderiza o corpo com as linhas dos imóveis
    const body = document.createElement('div');
    body.className = 'timeline-body';

    imoveis.forEach(imovel => {
        const imovelReservas = reservas.filter(r => r.imovelId == imovel.id);
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

        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day.getDate();

        const dayMonth = document.createElement('span');
        dayMonth.textContent = day.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

        dayEl.appendChild(dayNumber);
        dayEl.appendChild(dayMonth);

        // Destaque para hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day.getTime() === today.getTime()) {
            dayEl.style.backgroundColor = 'var(--accent)';
            dayEl.style.color = '#fff';
            dayEl.style.fontWeight = 'bold';
        }

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
    // Define o grid template dinamicamente com base no número de dias
    reservasCell.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;
    // Ajusta o background size para coincidir com as colunas
    reservasCell.style.backgroundSize = `calc(100% / ${days.length}) 100%`;

    reservas.forEach(reserva => {
        const checkin = new Date(reserva.checkin);
        const checkout = new Date(reserva.checkout);

        // Normaliza as datas para ignorar a hora (UTC safety check might be needed depending on input)
        // Assumindo input YYYY-MM-DD local
        const checkinNorm = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
        const checkoutNorm = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());

        const timelineEnd = new Date(days[days.length - 1]);
        timelineEnd.setHours(23, 59, 59, 999);

        // Verifica se a reserva está no range da timeline
        if (checkoutNorm < timelineStart || checkinNorm > timelineEnd) {
            return;
        }

        // Calcula índices baseados em dias (0-indexed)
        // Diferença em milissegundos
        const diffStart = checkinNorm - timelineStart;
        const startDayIndex = Math.floor(diffStart / (1000 * 60 * 60 * 24));

        const diffEnd = checkoutNorm - timelineStart;
        const endDayIndex = Math.floor(diffEnd / (1000 * 60 * 60 * 24));

        // Ajusta para limites da timeline
        const visibleStart = Math.max(0, startDayIndex);
        const visibleEnd = Math.min(days.length, endDayIndex);

        // Duração em dias (noites)
        let duration = visibleEnd - visibleStart;

        // Se a duração for 0 (checkin e checkout no mesmo dia visual ou erro), força 1 para visibilidade mínima se estiver dentro do range
        if (duration <= 0 && visibleStart < days.length && visibleEnd > 0) {
            // duration = 1; // Opcional: decidir se mostra algo para day-use
        }

        if (duration <= 0) return;

        let nomeHospede = 'Reserva';
        if (reserva.hospedes && reserva.hospedes.length > 0) {
            const primeiroHospede = clientes.find(c => c.id == reserva.hospedes[0]);
            if (primeiroHospede) {
                // Pega apenas o primeiro nome
                nomeHospede = primeiroHospede.nome.split(' ')[0];
            }
        }

        const reservaBar = document.createElement('div');
        reservaBar.className = 'reserva-bar';

        const content = document.createElement('div');
        content.className = 'reserva-bar-content';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'reserva-bar-name';
        nameSpan.textContent = nomeHospede;

        content.appendChild(nameSpan);
        reservaBar.appendChild(content);

        // Tooltip formatada
        const checkinStr = checkinNorm.toLocaleDateString('pt-BR');
        const checkoutStr = checkoutNorm.toLocaleDateString('pt-BR');
        reservaBar.title = `${nomeHospede}\nCheck-in: ${checkinStr}\nCheck-out: ${checkoutStr}`;

        // Posiciona a barra na grade
        // Grid lines são 1-based. 
        // Se startDayIndex é 0 (primeiro dia), gridColumnStart é 1.
        reservaBar.style.gridColumnStart = visibleStart + 1;
        reservaBar.style.gridColumnEnd = `span ${duration}`;

        reservasCell.appendChild(reservaBar);
    });

    row.appendChild(reservasCell);
    return row;
}
