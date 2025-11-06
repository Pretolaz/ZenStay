class Comodo { 
    constructor(codigo, nome, icone) { 
        this.codigo = codigo || Comodo.gerarNovoCodigo(); 
        this.nome = nome; 
        this.icone = icone; 
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
        return comodosJson ? JSON.parse(comodosJson).map(c => new Comodo(c.codigo, c.nome, c.icone)) : []; 
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
}
