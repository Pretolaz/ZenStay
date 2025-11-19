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

class Cliente {
    constructor({ id, codigoPlataforma, nome, email, codPais, telefone, linkChat, idioma, observacao, dataCadastro, firestoreId }) {
        this.id = id;
        this.codigoPlataforma = codigoPlataforma;
        this.nome = nome;
        this.email = email;
        this.codPais = codPais;
        this.telefone = telefone;
        this.linkChat = linkChat;
        this.idioma = idioma;
        this.observacao = observacao;
        this.dataCadastro = dataCadastro;
        this.codigoInterno = this.id;
        this.firestoreId = firestoreId;
    }

    static async listarTodos() {
        try {
            const querySnapshot = await getDocs(collection(db, "clientes"));
            const clientes = [];
            querySnapshot.forEach((doc) => {
                clientes.push(new Cliente({ ...doc.data(), firestoreId: doc.id }));
            });
            return clientes;
        } catch (error) {
            console.error("Erro ao listar clientes:", error);
            return [];
        }
    }

    static async salvar(clienteData) {
        try {
            if (!clienteData.id) {
                // Novo cliente: Gerar ID sequencial usando transação para segurança
                const counterRef = doc(db, "counters", "clientes");

                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextId = 2001;

                    if (counterDoc.exists()) {
                        nextId = counterDoc.data().lastId + 1;
                    }

                    transaction.set(counterRef, { lastId: nextId });

                    clienteData.id = nextId;
                    clienteData.dataCadastro = new Date().toISOString();

                    const newClienteRef = doc(collection(db, "clientes"));
                    transaction.set(newClienteRef, clienteData);
                });

            } else {
                // Atualizar cliente existente
                // Primeiro precisamos encontrar o ID do documento no Firestore
                // Se o objeto clienteData já tiver firestoreId, usamos ele.
                // Caso contrário, buscamos pelo ID numérico.

                let docId = clienteData.firestoreId;

                if (!docId) {
                    const q = query(collection(db, "clientes"), where("id", "==", parseInt(clienteData.id)));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        docId = querySnapshot.docs[0].id;
                    }
                }

                if (docId) {
                    const clienteRef = doc(db, "clientes", docId);
                    await updateDoc(clienteRef, clienteData);
                } else {
                    console.error("Cliente não encontrado para atualização");
                }
            }
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const q = query(collection(db, "clientes"), where("id", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return new Cliente({ ...doc.data(), firestoreId: doc.id });
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar cliente:", error);
            return null;
        }
    }

    static async excluir(id) {
        try {
            const q = query(collection(db, "clientes"), where("id", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, "clientes", docId));
            }
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            throw error;
        }
    }
}

// Expor a classe globalmente para ser usada no HTML
window.Cliente = Cliente;
