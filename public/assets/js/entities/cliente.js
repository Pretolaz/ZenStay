class Cliente {
    constructor({ codigoInterno, nome, email, codPais, telefone, linkChat, idioma, observacao, dataCadastro, codigoPlataforma }) {
        // Garante a compatibilidade com dados antigos que usavam 'id'
        this.codigoInterno = codigoInterno;
        this.nome = nome;
        this.email = email;
        this.codPais = codPais;
        this.telefone = telefone;
        this.linkChat = linkChat;
        this.idioma = idioma;
        this.observacao = observacao;
        this.dataCadastro = dataCadastro || new Date().toISOString();
        this.codigoPlataforma = codigoPlataforma;
    }

    static listarTodos() {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        // Mapeia para a classe, garantindo compatibilidade com dados antigos (id vs codigoInterno)
        return clientes.map(c => new Cliente({ ...c, codigoInterno: c.codigoInterno || c.id }));
    }

    static salvar(clienteData) {
        let clientes = this.listarTodos();
        const isEditing = clienteData.index !== '' && clienteData.index !== undefined;

        if (isEditing) {
            const index = parseInt(clienteData.index, 10);
            if (index >= 0 && index < clientes.length) {
                const clienteExistente = clientes[index];
                // Mantém o código interno original e a data de cadastro
                const dadosAtualizados = { ...clienteExistente, ...clienteData };
                clientes[index] = new Cliente(dadosAtualizados);
            }
        } else {
            let nextId = parseInt(localStorage.getItem('nextClienteId') || '1001');
            clienteData.codigoInterno = nextId;
            clienteData.dataCadastro = new Date().toISOString();
            clientes.push(new Cliente(clienteData));
            localStorage.setItem('nextClienteId', String(nextId + 1));
        }

        localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    static excluir(index) {
        let clientes = this.listarTodos();
        if (index >= 0 && index < clientes.length) {
            clientes.splice(index, 1);
            localStorage.setItem('clientes', JSON.stringify(clientes));
        }
    }

    static buscarPorIndex(index) {
        const clientes = this.listarTodos();
        if (index >= 0 && index < clientes.length) {
            return clientes[index];
        }
        return null;
    }

    // Adicionando de volta a função necessária para a página de reservas
    static buscarPorId(id) {
        const clientes = this.listarTodos();
        // Usa '==' para coerção de tipo, já que o id pode ser string ou número
        return clientes.find(c => c.codigoInterno == id) || null;
    }

    static filtrarEOrdenar(termoBusca, tipoOrdenacao) {
        let clientes = this.listarTodos();

        // 1. Filtrar
        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            clientes = clientes.filter(cli =>
                (cli.nome && cli.nome.toLowerCase().includes(termo)) ||
                (cli.telefone && cli.telefone.includes(termo))
            );
        }

        // 2. Ordenar
        const match = tipoOrdenacao.match(/([a-zA-Z]+)(Asc|Desc)/);
        if (match) {
            const [_, campo, direcao] = match;
            const asc = direcao.toLowerCase() === 'asc';

            clientes.sort((a, b) => {
                let valA = a[campo] || '';
                let valB = b[campo] || '';

                // Tratamento especial para datas e números para ordenação correta
                if (campo === 'dataCadastro') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                } else if (campo === 'codigoInterno') {
                    valA = parseInt(valA, 10);
                    valB = parseInt(valB, 10);
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return asc ? -1 : 1;
                if (valA > valB) return asc ? 1 : -1;
                return 0;
            });
        }
        return clientes;
    }
}
