class Cliente {
    constructor({ codigoInterno, nome, email, telefone, endereco, observacoes }) {
        this.codigoInterno = codigoInterno;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.observacoes = observacoes;
    }

    static listarTodos() {
        const storage = new Storage('clientes');
        const clientesData = storage.getAll();
        // Mapeia os dados do localStorage para o novo formato, garantindo compatibilidade
        return clientesData.map(data => new Cliente({
            codigoInterno: data.codigoInterno || data.id, // Compatibilidade com 'id' antigo
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            endereco: data.endereco,
            observacoes: data.observacoes
        }));
    }

    static salvar(clienteData) {
        const storage = new Storage('clientes');
        let nextId = parseInt(localStorage.getItem('nextClienteId') || '2001');

        // Garante que o objeto sendo salvo tenha a propriedade correta 'codigoInterno'
        if (!clienteData.codigoInterno) {
            clienteData.codigoInterno = nextId;
            localStorage.setItem('nextClienteId', String(nextId + 1));
        }

        storage.save(clienteData, 'codigoInterno'); // Salva usando 'codigoInterno' como chave
    }

    static buscarPorId(id) {
        const storage = new Storage('clientes');
        const data = storage.get(id, 'codigoInterno');
        if (data) {
            return new Cliente(data);
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('clientes');
        storage.delete(id, 'codigoInterno');
    }
}
