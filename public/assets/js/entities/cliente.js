class Cliente {
    // O construtor espera um objeto com as propriedades do cliente
    constructor({ id, nome, email, telefone, endereco, observacoes }) {
        // O ID é o identificador principal, usado pelo storage.js
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.observacoes = observacoes;

        // Para consistência com outras entidades, podemos ter um getter para codigoInterno
        Object.defineProperty(this, 'codigoInterno', {
            get: function() { return this.id; },
            set: function(value) { this.id = value; },
            enumerable: true,
            configurable: true
        });
    }

    static listarTodos() {
        const storage = new Storage('clientes');
        const clientesData = storage.getAll();
        
        // Mapeia os dados brutos do localStorage para instâncias da classe Cliente
        // A classe Storage já retorna um array de objetos, então só precisamos instanciar
        return clientesData.map(data => new Cliente(data));
    }

    static salvar(clienteData) {
        const storage = new Storage('clientes');
        let nextId = parseInt(localStorage.getItem('nextClienteId') || '2001');

        // Se o cliente não tem um ID, é um novo cliente.
        if (!clienteData.id) {
            clienteData.id = nextId;
            localStorage.setItem('nextClienteId', String(nextId + 1));
        }

        // O método save da classe Storage espera um objeto com a propriedade 'id'.
        // clienteData já está no formato correto.
        storage.save(clienteData);
    }

    static buscarPorId(id) {
        const storage = new Storage('clientes');
        // O método get da classe Storage busca pelo 'id'
        const data = storage.get(id);
        if (data) {
            // Retorna uma nova instância de Cliente com os dados encontrados
            return new Cliente(data);
        }
        return null;
    }

    static excluir(id) {
        const storage = new Storage('clientes');
        // O método delete da classe Storage deleta pelo 'id'
        storage.delete(id);
    }
}
