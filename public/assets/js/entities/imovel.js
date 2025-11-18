class Imovel {
    constructor({ codigoInterno, anfitriaoId, titulo, tipo, endereco, comodos, capacidade, fotos, status, valorDiaria, observacoes }) {
        this.codigoInterno = codigoInterno;
        this.anfitriaoId = anfitriaoId;
        this.titulo = titulo; // Apelido ou título descritivo do imóvel
        this.tipo = tipo; // Ex: Casa, Apartamento, Cabana
        this.endereco = endereco; // Objeto ou string com o endereço
        this.comodos = Array.isArray(comodos) ? comodos : []; // Garante que seja um array
        this.capacidade = capacidade; // Número máximo de hóspedes
        this.fotos = Array.isArray(fotos) ? fotos : []; // Garante que seja um array
        this.status = status; // Ex: Disponível, Ocupado, Manutenção
        this.valorDiaria = valorDiaria;
        this.observacoes = observacoes;
    }

    static listarTodos() {
        const storage = new Storage('imoveis');
        const imoveisData = storage.getAll();
        // Mapeia os dados do localStorage para o novo formato, garantindo compatibilidade
        return imoveisData.map(data => new Imovel({
            codigoInterno: data.codigoInterno || data.id,
            anfitriaoId: data.anfitriaoId,
            titulo: data.titulo || data.apelido,
            tipo: data.tipo,
            endereco: data.endereco || data.localizacao,
            comodos: data.comodos || [],
            capacidade: data.capacidade || data.capacidadeMaxima,
            fotos: data.fotos || (data.foto ? [data.foto] : []), // Transforma 'foto' em 'fotos' se necessário
            status: data.status || data.situacao,
            valorDiaria: data.valorDiaria,
            observacoes: data.observacoes
        }));
    }

    static salvar(imovelData) {
        const storage = new Storage('imoveis');
        let nextId = parseInt(localStorage.getItem('nextImovelId') || '1001');

        if (!imovelData.codigoInterno) {
            imovelData.codigoInterno = nextId;
            localStorage.setItem('nextImovelId', String(nextId + 1));
        }

        storage.save(imovelData);
    }

    static buscarPorId(id) {
        const storage = new Storage('imoveis');
        const data = storage.get(id);
        if (data) {
            return new Imovel({
                codigoInterno: data.codigoInterno || data.id,
                anfitriaoId: data.anfitriaoId,
                titulo: data.titulo || data.apelido,
                tipo: data.tipo,
                endereco: data.endereco || data.localizacao,
                comodos: data.comodos || [],
                capacidade: data.capacidade || data.capacidadeMaxima,
                fotos: data.fotos || (data.foto ? [data.foto] : []), 
                status: data.status || data.situacao,
                valorDiaria: data.valorDiaria,
                observacoes: data.observacoes
            });
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('imoveis');
        storage.delete(id);
    }
}
