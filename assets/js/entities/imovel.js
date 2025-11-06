class Imovel {
    constructor(codigo, apelido, situacao, nome, descricao, endereco, googleMapsLink, instrucoesChegada, foto, comodos = []) {
        this.codigo = codigo;
        this.apelido = apelido;
        this.situacao = situacao;
        this.nome = nome;
        this.descricao = descricao;
        this.endereco = endereco;
        this.googleMapsLink = googleMapsLink;
        this.instrucoesChegada = instrucoesChegada;
        this.foto = foto || ''; // URL da foto do imóvel
        this.comodos = comodos.map(comodoData => new Comodo(comodoData.codigo, comodoData.nome, comodoData.icone));
    }

    static listarTodos() {
        const imoveisData = JSON.parse(localStorage.getItem('imoveis')) || [];
        return imoveisData.map(imovelData => new Imovel(
            imovelData.codigo,
            imovelData.apelido,
            imovelData.situacao,
            imovelData.nome,
            imovelData.descricao,
            imovelData.endereco,
            imovelData.googleMapsLink,
            imovelData.instrucoesChegada,
            imovelData.foto,
            imovelData.comodos
        ));
    }

    static salvarTodos(imoveis) {
        localStorage.setItem('imoveis', JSON.stringify(imoveis));
    }

    static proximoCodigo() {
        const imoveis = Imovel.listarTodos();
        if (imoveis.length === 0) {
            return 1;
        }
        const maxCodigo = Math.max(...imoveis.map(imovel => imovel.codigo));
        return maxCodigo + 1;
    }

    salvar() {
        let imoveis = Imovel.listarTodos();
        if (this.codigo) {
            const index = imoveis.findIndex(imovel => imovel.codigo === this.codigo);
            if (index !== -1) {
                imoveis[index] = this;
            } else {
                imoveis.push(this);
            }
        } else {
            this.codigo = Imovel.proximoCodigo();
            imoveis.push(this);
        }
        Imovel.salvarTodos(imoveis);
    }

    excluir() {
        let imoveis = Imovel.listarTodos();
        imoveis = imoveis.filter(imovel => imovel.codigo !== this.codigo);
        Imovel.salvarTodos(imoveis);
    }

    adicionarComodo(nome, icone) {
        const novoComodo = new Comodo(null, nome, icone);
        this.comodos.push(novoComodo);
        this.salvar();
    }

    editarComodo(codigoComodo, novoNome, novoIcone) {
        const comodo = this.comodos.find(c => c.codigo === codigoComodo);
        if (comodo) {
            comodo.nome = novoNome;
            comodo.icone = novoIcone;
            this.salvar();
        }
    }

    removerComodo(codigoComodo) {
        this.comodos = this.comodos.filter(c => c.codigo !== codigoComodo);
        this.salvar();
    }
}
