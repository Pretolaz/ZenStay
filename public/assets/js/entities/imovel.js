class Imovel {
    constructor(id, apelido, localizacao, quartos, capacidadeMaxima, foto, situacao) {
        this.id = id;
        this.apelido = apelido;
        this.localizacao = localizacao;
        this.quartos = quartos;
        this.capacidadeMaxima = capacidadeMaxima;
        this.foto = foto;
        this.situacao = situacao; // e.g., 'Livre', 'Ocupado', 'Em Manutenção'
    }

    // Salva o imóvel no localStorage
    salvar() {
        const storage = new Storage('imoveis');
        let nextId = parseInt(localStorage.getItem('nextImovelId') || '1');
        
        if (!this.id) {
            this.id = nextId;
            localStorage.setItem('nextImovelId', nextId + 1);
        }

        storage.save(this);
    }

    // Lista todos os imóveis
    static listarTodos() {
        const storage = new Storage('imoveis');
        const imoveisData = storage.getAll();
        return imoveisData.map(data => new Imovel(
            data.id,
            data.apelido,
            data.localizacao,
            data.quartos,
            data.capacidadeMaxima,
            data.foto,
            data.situacao
        ));
    }

    // Busca um imóvel por ID
    static buscarPorId(id) {
        const storage = new Storage('imoveis');
        const data = storage.get(id);
        if (data) {
            return new Imovel(
                data.id,
                data.apelido,
                data.localizacao,
                data.quartos,
                data.capacidadeMaxima,
                data.foto,
                data.situacao
            );
        }
        return null;
    }

    // Exclui um imóvel por ID
    static excluir(id) {
        const storage = new Storage('imoveis');
        storage.delete(id);
    }
}
