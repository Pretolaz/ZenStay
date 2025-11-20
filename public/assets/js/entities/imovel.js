import { db } from '../firebase-config.js';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class Imovel {
    constructor({
        codigoInterno,
        anfitriaoId,
        titulo,
        nome,
        tipo,
        endereco,
        googleMapsLink,
        comodos,
        capacidade,
        capacidadeAdulto,
        capacidadeCrianca,
        aceitaPet,
        fotos,
        status,
        valorDiaria,
        observacoes,
        descricao,
        instrucoesGerais,
        instrucoesChegada,
        firestoreId
    }) {
        this.codigoInterno = codigoInterno;
        this.id = codigoInterno;
        this.anfitriaoId = anfitriaoId;
        this.titulo = titulo; // Apelido
        this.nome = nome;
        this.tipo = tipo;
        this.endereco = endereco;
        this.googleMapsLink = googleMapsLink;
        this.comodos = Array.isArray(comodos) ? comodos : [];
        this.capacidade = capacidade;
        this.capacidadeAdulto = capacidadeAdulto;
        this.capacidadeCrianca = capacidadeCrianca;
        this.aceitaPet = aceitaPet;
        this.fotos = Array.isArray(fotos) ? fotos : [];
        this.status = status;
        this.valorDiaria = valorDiaria;
        this.observacoes = observacoes;
        this.descricao = descricao;
        this.instrucoesGerais = instrucoesGerais;
        this.instrucoesChegada = instrucoesChegada;
        this.firestoreId = firestoreId;
    }

    static async listarTodos() {
        try {
            const querySnapshot = await getDocs(collection(db, "imoveis"));
            const imoveis = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                imoveis.push(new Imovel({
                    ...data,
                    firestoreId: doc.id,
                    // Mapeamento de compatibilidade caso o banco tenha campos antigos
                    codigoInterno: data.codigoInterno || data.id,
                    titulo: data.titulo || data.apelido,
                    endereco: data.endereco || data.localizacao,
                    comodos: data.comodos || [],
                    capacidade: data.capacidade || data.capacidadeMaxima,
                    fotos: data.fotos || (data.foto ? [data.foto] : []),
                    status: data.status || data.situacao
                }));
            });
            return imoveis;
        } catch (error) {
            console.error("Erro ao listar imóveis:", error);
            return [];
        }
    }

    static async salvar(imovelData) {
        try {
            // Prepare data for Firestore (remove undefined/custom types if needed)
            // Spread instance properties to a plain object
            let dataToSave = { ...imovelData };

            // Remove firestoreId from the data to be saved (it's the doc ID)
            delete dataToSave.firestoreId;

            // Helper to remove undefined values recursively or flatly
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });

            if (!imovelData.codigoInterno) {
                // Novo imóvel: Gerar ID sequencial (1001+)
                const counterRef = doc(db, "counters", "imoveis");

                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextId = 1001;

                    if (counterDoc.exists()) {
                        nextId = counterDoc.data().lastId + 1;
                    }

                    transaction.set(counterRef, { lastId: nextId });

                    dataToSave.codigoInterno = nextId;
                    dataToSave.id = nextId; // Manter compatibilidade
                    imovelData.codigoInterno = nextId; // Update the passed object too
                    imovelData.id = nextId;

                    const newImovelRef = doc(collection(db, "imoveis"));
                    transaction.set(newImovelRef, dataToSave);
                });

            } else {
                // Atualizar imóvel existente
                let docId = imovelData.firestoreId;

                if (!docId) {
                    const q = query(collection(db, "imoveis"), where("codigoInterno", "==", parseInt(imovelData.codigoInterno)));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        docId = querySnapshot.docs[0].id;
                    }
                }

                if (docId) {
                    const imovelRef = doc(db, "imoveis", docId);
                    await updateDoc(imovelRef, dataToSave);
                } else {
                    console.error("Imóvel não encontrado para atualização");
                    throw new Error("Imóvel não encontrado.");
                }
            }
        } catch (error) {
            console.error("Erro ao salvar imóvel:", error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const q = query(collection(db, "imoveis"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return new Imovel({
                    ...data,
                    firestoreId: doc.id,
                    codigoInterno: data.codigoInterno || data.id,
                    titulo: data.titulo || data.apelido,
                    endereco: data.endereco || data.localizacao,
                    comodos: data.comodos || [],
                    capacidade: data.capacidade || data.capacidadeMaxima,
                    fotos: data.fotos || (data.foto ? [data.foto] : []),
                    status: data.status || data.situacao
                });
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar imóvel:", error);
            return null;
        }
    }

    static async excluir(id) {
        try {
            const q = query(collection(db, "imoveis"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, "imoveis", docId));
            }
        } catch (error) {
            console.error("Erro ao excluir imóvel:", error);
            throw error;
        }
    }

    // Métodos de Instância para Gerenciamento de Cômodos
    async adicionarComodo(nome, icone) {
        const newId = this.comodos.length > 0 ? Math.max(...this.comodos.map(c => c.id)) + 1 : 1;
        this.comodos.push({ id: newId, nome, icone, objetos: [] });
        await Imovel.salvar(this);
    }

    async editarComodo(id, nome, icone) {
        const comodo = this.comodos.find(c => c.id === id);
        if (comodo) {
            comodo.nome = nome;
            comodo.icone = icone;
            await Imovel.salvar(this);
        }
    }

    async removerComodo(id) {
        this.comodos = this.comodos.filter(c => c.id !== id);
        await Imovel.salvar(this);
    }

    async salvarObjeto(comodoId, objetoData) {
        const comodo = this.comodos.find(c => c.id === comodoId);
        if (comodo) {
            if (!comodo.objetos) comodo.objetos = [];

            if (objetoData.id) {
                // Edit
                const index = comodo.objetos.findIndex(o => o.id === objetoData.id);
                if (index !== -1) {
                    // Preserve the original ID, but update other fields
                    comodo.objetos[index] = { ...comodo.objetos[index], ...objetoData, id: comodo.objetos[index].id };
                }
            } else {
                // Add
                const newId = comodo.objetos.length > 0 ? Math.max(...comodo.objetos.map(o => o.id)) + 1 : 1;
                objetoData.id = newId;
                comodo.objetos.push(objetoData);
            }
            await Imovel.salvar(this);
        }
    }

    async removerObjeto(comodoId, objetoId) {
        const comodo = this.comodos.find(c => c.id === comodoId);
        if (comodo && comodo.objetos) {
            comodo.objetos = comodo.objetos.filter(o => o.id !== objetoId);
            await Imovel.salvar(this);
        }
    }
}

window.Imovel = Imovel;
