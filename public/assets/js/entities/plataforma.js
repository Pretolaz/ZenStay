import { db } from '../firebase-config.js';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class Plataforma {
    constructor({ codigoInterno, nome, url, contato, observacao, logo, firestoreId }) {
        this.codigoInterno = codigoInterno;
        this.nome = nome;
        this.url = url;
        this.contato = contato;
        this.observacao = observacao;
        this.logo = logo; // URL or Base64 string
        this.firestoreId = firestoreId;
    }

    static async listarTodos() {
        try {
            const querySnapshot = await getDocs(collection(db, "plataformas"));
            const plataformas = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                plataformas.push(new Plataforma({
                    ...data,
                    firestoreId: doc.id
                }));
            });
            // Sort by codigoInterno
            return plataformas.sort((a, b) => a.codigoInterno - b.codigoInterno);
        } catch (error) {
            console.error("Erro ao listar plataformas:", error);
            return [];
        }
    }

    static async salvar(plataformaData) {
        try {
            const dataToSave = { ...plataformaData };
            delete dataToSave.firestoreId;

            // Remove undefined values
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });

            if (!plataformaData.codigoInterno) {
                // Nova plataforma: Gerar ID sequencial
                const counterRef = doc(db, "counters", "plataformas");

                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextId = 1; // Default start for platforms

                    if (counterDoc.exists()) {
                        nextId = counterDoc.data().lastId + 1;
                    }

                    transaction.set(counterRef, { lastId: nextId });

                    dataToSave.codigoInterno = nextId;
                    plataformaData.codigoInterno = nextId;

                    const newRef = doc(collection(db, "plataformas"));
                    transaction.set(newRef, dataToSave);
                });
            } else {
                // Atualizar existente
                let docId = plataformaData.firestoreId;

                if (!docId) {
                    const q = query(collection(db, "plataformas"), where("codigoInterno", "==", parseInt(plataformaData.codigoInterno)));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        docId = querySnapshot.docs[0].id;
                    }
                }

                if (docId) {
                    const ref = doc(db, "plataformas", docId);
                    await updateDoc(ref, dataToSave);
                } else {
                    throw new Error("Plataforma não encontrada para atualização.");
                }
            }
        } catch (error) {
            console.error("Erro ao salvar plataforma:", error);
            throw error;
        }
    }

    static async excluir(id) {
        try {
            // id here is codigoInterno
            const q = query(collection(db, "plataformas"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, "plataformas", docId));
            }
        } catch (error) {
            console.error("Erro ao excluir plataforma:", error);
            throw error;
        }
    }
}

window.Plataforma = Plataforma;
