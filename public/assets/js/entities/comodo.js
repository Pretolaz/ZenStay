class Comodo { 
    constructor(codigo, nome, icone, objetos = []) { 
        this.codigo = codigo || Comodo.gerarNovoCodigo(); 
        this.nome = nome; 
        this.icone = icone; 
        this.objetos = objetos; // Uma lista de objetos associados a este cômodo
    } 

    // Métodos estáticos para CRUD (operações com localStorage) 
    static gerarNovoCodigo() { 
        const comodos = Comodo.listarTodos(); 
        if (comodos.length === 0) { 
            return 1; 
        } 
        const maxCodigo = Math.max(...comodos.map(c => c.codigo)); 
        return maxCodigo + 1; 
    } 

    static listarTodos() { 
        const comodosJson = localStorage.getItem('comodos'); 
        return comodosJson ? JSON.parse(comodosJson).map(c => new Comodo(c.codigo, c.nome, c.icone, c.objetos)) : []; 
    } 

    static buscarPorCodigo(codigo) { 
        return Comodo.listarTodos().find(comodo => comodo.codigo === codigo); 
    } 

    salvar() { 
        let comodos = Comodo.listarTodos(); 
        const index = comodos.findIndex(c => c.codigo === this.codigo); 

        if (index !== -1) { 
            // Atualiza existente 
            comodos[index] = this; 
        } else { 
            // Adiciona novo 
            comodos.push(this); 
        } 
        localStorage.setItem('comodos', JSON.stringify(comodos)); 
    } 

    excluir() { 
        let comodos = Comodo.listarTodos(); 
        comodos = comodos.filter(c => c.codigo !== this.codigo); 
        localStorage.setItem('comodos', JSON.stringify(comodos)); 
    }

    // Métodos para gerenciar objetos do cômodo
    gerarNovoCodigoObjeto() {
        if (this.objetos.length === 0) {
            return 1;
        }
        const maxCodigo = Math.max(...this.objetos.map(obj => obj.codigo));
        return maxCodigo + 1;
    }

    adicionarObjeto(tipo, nome, quantidade) {
        const novoObjeto = {
            codigo: this.gerarNovoCodigoObjeto(),
            tipo: tipo,
            nome: nome,
            quantidade: parseInt(quantidade)
        };
        this.objetos.push(novoObjeto);
        this.salvar(); // Salva o cômodo com o novo objeto
    }

    editarObjeto(codigoObjeto, novoTipo, novoNome, novaQuantidade) {
        const objetoIndex = this.objetos.findIndex(obj => obj.codigo === codigoObjeto);
        if (objetoIndex !== -1) {
            this.objetos[objetoIndex].tipo = novoTipo;
            this.objetos[objetoIndex].nome = novoNome;
            this.objetos[objetoIndex].quantidade = parseInt(novaQuantidade);
            this.salvar(); // Salva o cômodo com o objeto atualizado
        }
    }

    removerObjeto(codigoObjeto) {
        this.objetos = this.objetos.filter(obj => obj.codigo !== codigoObjeto);
        this.salvar(); // Salva o cômodo com o objeto removido
    }
}
