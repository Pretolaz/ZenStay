document.addEventListener('DOMContentLoaded', () => {
    try {
        loadDashboard();
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
});

function loadDashboard() {
    // Carregar dados
    const imoveis = Imovel.listarTodos();
    const reservas = Reserva.listarTodos();
    const clientes = Cliente.listarTodos();

    // Atualizar Estatísticas
    updateStats(imoveis, reservas, clientes);

    // Atualizar Atividade Recente
    updateUpcomingActivity(reservas, imoveis);
}

function updateStats(imoveis, reservas, clientes) {
    // Total Imóveis
    document.getElementById('stat-imoveis').textContent = imoveis.length;

    // Reservas Ativas (Hoje entre checkin e checkout)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const reservasAtivas = reservas.filter(r => {
        const checkin = new Date(r.checkin);
        const checkout = new Date(r.checkout);
        return r.status !== 'Cancelada' && checkin <= hoje && checkout >= hoje;
    });
    document.getElementById('stat-reservas-ativas').textContent = reservasAtivas.length;

    // Total Hóspedes
    document.getElementById('stat-hospedes').textContent = clientes.length;

    // Próximos Check-ins (Próximos 7 dias)
    const nextWeek = new Date(hoje);
    nextWeek.setDate(hoje.getDate() + 7);
    
    const proximosCheckins = reservas.filter(r => {
        const checkin = new Date(r.checkin);
        return r.status !== 'Cancelada' && checkin >= hoje && checkin <= nextWeek;
    });
    document.getElementById('stat-checkins').textContent = proximosCheckins.length;
}

function updateUpcomingActivity(reservas, imoveis) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar eventos relevantes (Check-ins e Check-outs futuros ou hoje)
    let eventos = [];

    reservas.forEach(r => {
        if (r.status === 'Cancelada') return;

        const checkin = new Date(r.checkin);
        const checkout = new Date(r.checkout);
        const imovel = imoveis.find(i => i.id == r.imovelId || i.codigoInterno == r.imovelId);
        const nomeImovel = imovel ? imovel.titulo : 'Imóvel Desconhecido';

        // Check-in
        if (checkin >= hoje) {
            eventos.push({
                tipo: 'Check-in',
                data: checkin,
                imovel: nomeImovel,
                reserva: r
            });
        }

        // Check-out
        if (checkout >= hoje) {
            eventos.push({
                tipo: 'Check-out',
                data: checkout,
                imovel: nomeImovel,
                reserva: r
            });
        }
    });

    // Ordenar por data
    eventos.sort((a, b) => a.data - b.data);

    // Pegar os próximos 5
    const proximosEventos = eventos.slice(0, 5);

    if (proximosEventos.length === 0) {
        activityList.innerHTML = '<div class="empty-state">Nenhuma atividade prevista para os próximos dias.</div>';
        return;
    }

    proximosEventos.forEach(evento => {
        const dia = evento.data.getDate();
        const mes = evento.data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-date">
                <span>${dia}</span>
                <small>${mes}</small>
            </div>
            <div class="activity-details">
                <h4>${evento.tipo} - ${evento.imovel}</h4>
                <p>Reserva #${evento.reserva.codigoInterno}</p>
            </div>
        `;
        activityList.appendChild(item);
    });
}
