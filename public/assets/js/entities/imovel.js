class Imovel {
    constructor({
        codigoInterno,
        anfitriaoId,
        titulo,
        nome,
        tipo,
        endereco,
        googleMapsLink,
        comodos,
        capacidade,
        capacidadeAdulto,
        capacidadeCrianca,
        aceitaPet,
        fotos,
        status,
        valorDiaria,
        observacoes,
        descricao,
        instrucoesGerais,
        instrucoesChegada
    }) {
        this.codigoInterno = codigoInterno;
        this.id = codigoInterno;
        this.anfitriaoId = anfitriaoId;
        this.titulo = titulo; // Apelido
        this.nome = nome;
        this.tipo = tipo;
        this.endereco = endereco;
        this.googleMapsLink = googleMapsLink;
        this.comodos = Array.isArray(comodos) ? comodos : [];
        this.capacidade = capacidade;
        this.capacidadeAdulto = capacidadeAdulto;
        this.capacidadeCrianca = capacidadeCrianca;
        this.aceitaPet = aceitaPet;
        this.fotos = Array.isArray(fotos) ? fotos : [];
        this.status = status;
        this.valorDiaria = valorDiaria;
        this.observacoes = observacoes;
        this.descricao = descricao;
        this.instrucoesGerais = instrucoesGerais;
        this.instrucoesChegada = instrucoesChegada;
    }

    static listarTodos() {
        const storage = new Storage('imoveis');
        const imoveisData = storage.getAll();
        return imoveisData.map(data => new Imovel({
            codigoInterno: data.codigoInterno || data.id,
            anfitriaoId: data.anfitriaoId,
            titulo: data.titulo || data.apelido,
            nome: data.nome,
            tipo: data.tipo,
            endereco: data.endereco || data.localizacao,
            googleMapsLink: data.googleMapsLink,
            comodos: data.comodos || [],
            capacidade: data.capacidade || data.capacidadeMaxima,
            capacidadeAdulto: data.capacidadeAdulto,
            capacidadeCrianca: data.capacidadeCrianca,
            aceitaPet: data.aceitaPet,
            fotos: data.fotos || (data.foto ? [data.foto] : []),
            status: data.status || data.situacao,
            valorDiaria: data.valorDiaria,
            observacoes: data.observacoes,
            descricao: data.descricao,
            instrucoesGerais: data.instrucoesGerais,
            instrucoesChegada: data.instrucoesChegada
        }));
    }

    static salvar(imovelData) {
        const storage = new Storage('imoveis');
        let nextId = parseInt(localStorage.getItem('nextImovelId') || '1001');

        if (!imovelData.codigoInterno) {
            imovelData.codigoInterno = nextId;
            localStorage.setItem('nextImovelId', String(nextId + 1));
        }

        // Ensure id is also saved for compatibility
        imovelData.id = imovelData.codigoInterno;

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
                nome: data.nome,
                tipo: data.tipo,
                endereco: data.endereco || data.localizacao,
                googleMapsLink: data.googleMapsLink,
                comodos: data.comodos || [],
                capacidade: data.capacidade || data.capacidadeMaxima,
                capacidadeAdulto: data.capacidadeAdulto,
                capacidadeCrianca: data.capacidadeCrianca,
                aceitaPet: data.aceitaPet,
                fotos: data.fotos || (data.foto ? [data.foto] : []),
                status: data.status || data.situacao,
                valorDiaria: data.valorDiaria,
                observacoes: data.observacoes,
                descricao: data.descricao,
                instrucoesGerais: data.instrucoesGerais,
                instrucoesChegada: data.instrucoesChegada
            });
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('imoveis');
        storage.delete(id);
    }
}
