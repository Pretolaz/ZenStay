document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
});

// Expose refresh function globally
window.refreshTimeline = initTimeline;

async function initTimeline() {
    const timelineView = document.getElementById('timeline-view');
    if (!timelineView) return;

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

    // Define 'today' normalized to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToShow = 30;
    const days = getDaysArray(today, daysToShow);
    const columnWidth = 50; // px (number for calc)
    const totalWidth = daysToShow * columnWidth;

    // Renderiza o cabeçalho
    const header = createTimelineHeader(days, columnWidth);
    container.appendChild(header);

    // Renderiza o corpo com as linhas dos imóveis
    const body = document.createElement('div');
    body.className = 'timeline-body';
    // Force body to have at least the width of the grid to prevent shrinking
    body.style.minWidth = `${totalWidth + 200}px`; // +200 for the sticky column

    imoveis.forEach(imovel => {
        const imovelReservas = reservas.filter(r => r.imovelId == imovel.id);
        const row = createTimelineRow(imovel, imovelReservas, days, today, clientes, columnWidth);
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

// Helper to calculate difference in days between two dates (ignoring time/DST)
function diffDays(d1, d2) {
    const u1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const u2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((u2 - u1) / (1000 * 60 * 60 * 24));
}

function createTimelineHeader(days, columnWidth) {
    const header = document.createElement('div');
    header.className = 'timeline-header';
    // Ensure header also doesn't shrink
    header.style.minWidth = `${(days.length * columnWidth) + 200}px`;

    const imoveisHeader = document.createElement('div');
    imoveisHeader.className = 'timeline-imoveis-header';
    imoveisHeader.textContent = 'Imóveis';
    header.appendChild(imoveisHeader);

    const daysContainer = document.createElement('div');
    daysContainer.className = 'timeline-days';
    // Aplica grid com largura fixa
    daysContainer.style.gridTemplateColumns = `repeat(${days.length}, ${columnWidth}px)`;

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
        if (diffDays(today, day) === 0) {
            dayEl.classList.add('today');
        }

        daysContainer.appendChild(dayEl);
    });

    header.appendChild(daysContainer);
    return header;
}

function createTimelineRow(imovel, reservas, days, timelineStart, clientes, columnWidth) {
    const row = document.createElement('div');
    row.className = 'timeline-row';

    const imovelCell = document.createElement('div');
    imovelCell.className = 'timeline-imovel-cell';
    imovelCell.textContent = imovel.titulo;
    row.appendChild(imovelCell);

    const reservasCell = document.createElement('div');
    reservasCell.className = 'timeline-reservas-cell';
    // Define o grid template com largura fixa
    reservasCell.style.gridTemplateColumns = `repeat(${days.length}, ${columnWidth}px)`;
    // Ajusta o background size para coincidir com as colunas fixas
    reservasCell.style.backgroundSize = `${columnWidth}px 100%`;

    reservas.forEach(reserva => {
        // Parse das datas (assumindo formato YYYY-MM-DD)
        const parseDate = (dateStr) => {
            const parts = dateStr.split('-');
            // Cria data local explicitamente 00:00:00
            return new Date(parts[0], parts[1] - 1, parts[2]);
        };

        const checkinNorm = parseDate(reserva.checkin);
        const checkoutNorm = parseDate(reserva.checkout);

        // Usar diffDays para cálculo seguro de dias
        const realStart = diffDays(timelineStart, checkinNorm);
        const realEnd = diffDays(timelineStart, checkoutNorm);

        // Se a reserva termina antes do início da timeline ou começa depois do fim
        if (realEnd < 0 || realStart >= days.length) {
            return;
        }

        // Lógica de Grid (1-based)
        // O span deve ir do dia do checkin até o dia do checkout (inclusive para visualização de meia diária)
        // Grid Line Start = Index + 1
        // Grid Line End = Index + 2 (para incluir a coluna do checkout)

        const gridStart = Math.max(1, realStart + 1);
        const gridEnd = Math.min(days.length + 1, realEnd + 2);

        // Se o gridStart >= gridEnd, algo está errado ou fora de visão (mas o check acima já filtra)
        if (gridStart >= gridEnd) return;

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

        // Força a barra a ficar na primeira linha do grid
        reservaBar.style.gridRow = '1';

        // Posiciona a barra na grade
        reservaBar.style.gridColumnStart = gridStart;
        reservaBar.style.gridColumnEnd = gridEnd;

        // Lógica de Margens para Meia-Diária (Hotel Style)
        // Se o checkin está dentro da visão, aplica margem esquerda (começa as 13h)
        if (realStart >= 0) {
            reservaBar.style.marginLeft = '25px'; // 50% de 50px
        }

        // Se o checkout está dentro da visão, aplica margem direita (termina as 11h)
        if (realEnd < days.length) {
            reservaBar.style.marginRight = '25px'; // 50% de 50px
        }

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

        // Add click event to open details
        reservaBar.style.cursor = 'pointer';
        reservaBar.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling if needed
            if (typeof window.openReservationDetails === 'function') {
                window.openReservationDetails(reserva);
            } else {
                console.warn('openReservationDetails function not found.');
            }
        });

        reservasCell.appendChild(reservaBar);
    });

    row.appendChild(reservasCell);
    return row;
}
