class Cliente {
    constructor(id, nome, email, telefone, codPais = '+55', linkChat = '', idioma = 'Português-BR', observacao = '', dataCadastro = new Date().toISOString()) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.codPais = codPais;
        this.telefone = telefone;
        this.linkChat = linkChat;
        this.idioma = idioma;
        this.observacao = observacao;
        this.dataCadastro = dataCadastro;
    }

    // Salva o cliente no localStorage
    salvar() {
        const storage = new Storage('clientes');
        let nextId = parseInt(localStorage.getItem('nextClienteId') || '1001');

        if (!this.id) {
            this.id = nextId;
            localStorage.setItem('nextClienteId', nextId + 1);
        }

        storage.save(this);
    }

    // Lista todos os clientes
    static listarTodos() {
        const storage = new Storage('clientes');
        const clientesData = storage.getAll();
        return clientesData.map(data => new Cliente(
            data.id,
            data.nome,
            data.email,
            data.telefone,
            data.codPais,
            data.linkChat,
            data.idioma,
            data.observacao,
            data.dataCadastro
        ));
    }

    // Busca um cliente por ID
    static buscarPorId(id) {
        const storage = new Storage('clientes');
        const data = storage.get(id);
        if (data) {
            return new Cliente(
                data.id,
                data.nome,
                data.email,
                data.telefone,
                data.codPais,
                data.linkChat,
                data.idioma,
                data.observacao,
                data.dataCadastro
            );
        }
        return null;
    }

    // Exclui um cliente por ID
    static excluir(id) {
        const storage = new Storage('clientes');
        storage.delete(id);
    }
}
