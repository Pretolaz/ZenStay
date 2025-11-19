class Reserva {
    constructor({ codigoInterno, anfitriaoId, imovelId, plataformaId, hospedes, checkin, checkout, numHospedes, numPets, valorTotal, status, observacoes, dataCriacao }) {
        this.codigoInterno = codigoInterno;
        this.anfitriaoId = anfitriaoId;
        this.imovelId = imovelId;
        this.plataformaId = plataformaId;
        this.hospedes = Array.isArray(hospedes) ? hospedes : []; // Garante que seja sempre um array
        this.checkin = checkin;
        this.checkout = checkout;
        this.numHospedes = numHospedes;
        this.numPets = numPets || 0;
        this.valorTotal = valorTotal;
        this.status = status;
        this.observacoes = observacoes;
        this.dataCriacao = dataCriacao || new Date().toISOString();
    }

    static listarTodos() {
        const storage = new Storage('reservas');
        const reservasData = storage.getAll();
        return reservasData.map(data => new Reserva(data));
    }

    static salvar(reservaData) {
        const storage = new Storage('reservas');
        let nextId = parseInt(localStorage.getItem('nextReservaId') || '101');

        if (!reservaData.codigoInterno) {
            reservaData.codigoInterno = nextId;
            localStorage.setItem('nextReservaId', String(nextId + 1));
        }

        storage.save(reservaData);
    }

    static buscarPorId(id) {
        const storage = new Storage('reservas');
        const data = storage.get(id);
        if (data) {
            return new Reserva(data);
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('reservas');
        storage.delete(id);
    }
}
