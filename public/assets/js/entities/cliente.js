class Cliente {
    // Construtor atualizado para incluir todos os campos do formulário de clientes.html
    constructor({ id, codigoPlataforma, nome, email, codPais, telefone, linkChat, idioma, observacao, dataCadastro }) {
        this.id = id;
        this.codigoPlataforma = codigoPlataforma;
        this.nome = nome;
        this.email = email;
        this.codPais = codPais;
        this.telefone = telefone;
        this.linkChat = linkChat;
        this.idioma = idioma;
        this.observacao = observacao; // Mantido como 'observacao' para corresponder ao form
        this.dataCadastro = dataCadastro;

        // Para consistência e retrocompatibilidade
        this.codigoInterno = this.id;
    }

    static listarTodos() {
        const storage = new Storage('clientes');
        const clientesData = storage.getAll();
        // Garante que mesmo dados 'nulos' do localStorage não quebrem o map
        return clientesData.map(data => new Cliente(data || {}));
    }

    static salvar(clienteData) {
        const storage = new Storage('clientes');
        
        // Se for um novo cliente (sem ID), atribui um novo ID e a data de cadastro.
        if (!clienteData.id) {
            let nextId = parseInt(localStorage.getItem('nextClienteId') || '2001');
            clienteData.id = nextId;
            clienteData.dataCadastro = new Date().toISOString();
            localStorage.setItem('nextClienteId', String(nextId + 1));
        }

        // O método 'save' da Storage class espera um objeto com um 'id'.
        storage.save(clienteData);
    }

    static buscarPorId(id) {
        const storage = new Storage('clientes');
        const data = storage.get(id);
        if (data) {
            return new Cliente(data);
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('clientes');
        storage.delete(id);
    }
}
