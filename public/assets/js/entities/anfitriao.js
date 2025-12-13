
import { db } from '../firebase-config.js';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    runTransaction,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class Anfitriao {
    constructor({
        codigoInterno,
        id,
        nome,
        email,
        telefone,
        observacao,
        foto,
        firestoreId
    }) {
        this.codigoInterno = codigoInterno;
        this.id = codigoInterno || id; // Fallback
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.observacao = observacao;
        this.foto = foto; // Base64 or URL
        this.firestoreId = firestoreId;
    }

    static async listarTodos() {
        try {
            const querySnapshot = await getDocs(collection(db, "anfitrioes"));
            const anfitrioes = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                anfitrioes.push(new Anfitriao({
                    ...data,
                    firestoreId: doc.id
                }));
            });
            return anfitrioes;
        } catch (error) {
            console.error("Erro ao listar anfitriões:", error);
            return [];
        }
    }

    static async salvar(anfitriaoData) {
        try {
            let dataToSave = { ...anfitriaoData };
            delete dataToSave.firestoreId; // Don't save metadata

            // Clean undefined
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });

            if (!anfitriaoData.codigoInterno) {
                // New Anfitrião: Sequential ID
                const counterRef = doc(db, "counters", "anfitrioes");

                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextId = 1; // Start from 1 or 500 as per user request history, let's start 1 for normal users

                    if (counterDoc.exists()) {
                        nextId = counterDoc.data().lastId + 1;
                    }

                    transaction.set(counterRef, { lastId: nextId });

                    dataToSave.codigoInterno = nextId;
                    dataToSave.id = nextId;

                    const newRef = doc(collection(db, "anfitrioes"));
                    transaction.set(newRef, dataToSave);
                });

            } else {
                // Update existing
                let docId = anfitriaoData.firestoreId;

                // If we don't have the docId but have the internal code, find it
                if (!docId) {
                    const q = query(collection(db, "anfitrioes"), where("codigoInterno", "==", parseInt(anfitriaoData.codigoInterno)));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        docId = querySnapshot.docs[0].id;
                    }
                }

                if (docId) {
                    const ref = doc(db, "anfitrioes", docId);
                    await updateDoc(ref, dataToSave);
                } else {
                    throw new Error("Anfitrião não encontrado para atualização.");
                }
            }
        } catch (error) {
            console.error("Erro ao salvar anfitrião:", error);
            throw error;
        }
    }

    static async excluir(id) {
        try {
            const q = query(collection(db, "anfitrioes"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, "anfitrioes", docId));
            }
        } catch (error) {
            console.error("Erro ao excluir anfitrião:", error);
            throw error;
        }
    }
}

window.Anfitriao = Anfitriao;
