
class Imovel {
    constructor(
        codigo, apelido, nome, endereco, googleMapsLink, 
        capacidadeAdulto, capacidadeCrianca, aceitaPet, 
        descricao, instrucoesGerais, instrucoesChegada, 
        foto, situacao, comodos = []
    ) {
        this.codigo = codigo;
        this.apelido = apelido;
        this.nome = nome;
        this.endereco = endereco;
        this.googleMapsLink = googleMapsLink;
        this.capacidadeAdulto = capacidadeAdulto;
        this.capacidadeCrianca = capacidadeCrianca;
        this.aceitaPet = aceitaPet;
        this.descricao = descricao;
        this.instrucoesGerais = instrucoesGerais;
        this.instrucoesChegada = instrucoesChegada;
        this.foto = foto || '';
        this.situacao = situacao;
        
        // Garante que os cômodos sejam instâncias da classe Comodo
        this.comodos = comodos ? comodos.map(c => new Comodo(c.codigo, c.nome, c.icone, c.objetos)) : [];
    }

    static listarTodos() {
        const imoveisData = JSON.parse(localStorage.getItem('imoveis')) || [];
        // Mapeia os dados brutos para instâncias da classe Imovel, garantindo a ordem correta dos parâmetros
        return imoveisData.map(data => new Imovel(
            data.codigo, data.apelido, data.nome, data.endereco, data.googleMapsLink,
            data.capacidadeAdulto, data.capacidadeCrianca, data.aceitaPet, data.descricao,
            data.instrucoesGerais, data.instrucoesChegada, data.foto, data.situacao, data.comodos
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
        const maxCodigo = Math.max(...imoveis.map(imovel => imovel.codigo || 0));
        return maxCodigo + 1;
    }

    salvar() {
        const imoveis = Imovel.listarTodos();
        const index = imoveis.findIndex(imovel => imovel.codigo === this.codigo);
        
        if (index !== -1) {
            imoveis[index] = this; // Atualiza imóvel existente
        } else {
            this.codigo = this.codigo || Imovel.proximoCodigo();
            imoveis.push(this); // Adiciona novo imóvel
        }
        Imovel.salvarTodos(imoveis);
    }

    excluir() {
        let imoveis = Imovel.listarTodos();
        imoveis = imoveis.filter(imovel => imovel.codigo !== this.codigo);
        Imovel.salvarTodos(imoveis);
    }

    // Gera um código único para um cômodo DENTRO deste imóvel
    proximoCodigoComodo() {
        if (!this.comodos || this.comodos.length === 0) {
            return 1;
        }
        const maxCodigo = Math.max(...this.comodos.map(c => c.codigo || 0));
        return maxCodigo + 1;
    }

    adicionarComodo(nome, icone) {
        const novoCodigo = this.proximoCodigoComodo(); // Gera código único
        const novoComodo = new Comodo(novoCodigo, nome, icone);
        if (!this.comodos) {
            this.comodos = [];
        }
        this.comodos.push(novoComodo);
        this.salvar(); // Salva o imóvel inteiro com o novo cômodo
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
        if (!this.comodos) return;
        this.comodos = this.comodos.filter(c => c.codigo !== codigoComodo);
        this.salvar();
    }
}
