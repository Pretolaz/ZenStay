class Storage {
    constructor(key) {
        this.key = key;
    }

    // Retorna todos os itens do localStorage para a chave especificada
    getAll() {
        return JSON.parse(localStorage.getItem(this.key)) || [];
    }

    // Salva um item (novo ou atualizado) no localStorage
    save(item) {
        const items = this.getAll();
        // Usa == para permitir a correspondência entre string e número no ID
        const index = items.findIndex(i => i.id == item.id);

        if (index > -1) {
            // Atualiza item existente
            items[index] = item;
        } else {
            // Adiciona novo item
            items.push(item);
        }
        localStorage.setItem(this.key, JSON.stringify(items));
    }

    // Busca um item específico pelo ID (usando == para flexibilidade de tipo)
    get(id) {
        const items = this.getAll();
        return items.find(item => item.id == id) || null;
    }

    // Deleta um item pelo ID (usando == para flexibilidade de tipo)
    delete(id) {
        let items = this.getAll();
        items = items.filter(item => item.id != id);
        localStorage.setItem(this.key, JSON.stringify(items));
    }
}
