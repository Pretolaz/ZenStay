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

class Reserva {
    constructor({ codigoInterno, anfitriaoId, imovelId, plataformaId, hospedes, checkin, checkout, numHospedes, numPets, valorTotal, status, observacoes, dataCriacao, firestoreId }) {
        this.codigoInterno = codigoInterno;
        this.id = codigoInterno;
        this.anfitriaoId = anfitriaoId;
        this.imovelId = imovelId;
        this.plataformaId = plataformaId;
        this.hospedes = Array.isArray(hospedes) ? hospedes : []; // Garante que seja sempre um array
        this.checkin = checkin;
        this.checkout = checkout;
        this.numHospedes = numHospedes;
        this.numPets = numPets || 0;
        this.valorTotal = valorTotal;
        this.status = status;
        this.observacoes = observacoes;
        this.dataCriacao = dataCriacao || new Date().toISOString();
        this.firestoreId = firestoreId;
    }

    static async listarTodos() {
        try {
            const querySnapshot = await getDocs(collection(db, "reservas"));
            const reservas = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reservas.push(new Reserva({
                    ...data,
                    firestoreId: doc.id,
                    codigoInterno: data.codigoInterno || data.id
                }));
            });
            return reservas;
        } catch (error) {
            console.error("Erro ao listar reservas:", error);
            return [];
        }
    }

    static async salvar(reservaData) {
        try {
            // Prepare data for Firestore
            let dataToSave = { ...reservaData };
            delete dataToSave.firestoreId; // Don't save the ID as a field

            // Remove undefined values
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });

            if (!reservaData.codigoInterno) {
                // Nova reserva: Gerar ID sequencial (1000+)
                const counterRef = doc(db, "counters", "reservas");

                await runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextId = 1000;

                    if (counterDoc.exists()) {
                        nextId = counterDoc.data().lastId + 1;
                    }

                    transaction.set(counterRef, { lastId: nextId });

                    dataToSave.codigoInterno = nextId;
                    dataToSave.id = nextId;
                    dataToSave.dataCriacao = new Date().toISOString();

                    const newReservaRef = doc(collection(db, "reservas"));
                    transaction.set(newReservaRef, dataToSave);
                });

            } else {
                // Atualizar reserva existente
                let docId = reservaData.firestoreId;

                if (!docId) {
                    const q = query(collection(db, "reservas"), where("codigoInterno", "==", parseInt(reservaData.codigoInterno)));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        docId = querySnapshot.docs[0].id;
                    }
                }

                if (docId) {
                    const reservaRef = doc(db, "reservas", docId);
                    await updateDoc(reservaRef, dataToSave);
                } else {
                    console.error("Reserva não encontrada para atualização");
                    throw new Error("Reserva não encontrada.");
                }
            }
        } catch (error) {
            console.error("Erro ao salvar reserva:", error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const q = query(collection(db, "reservas"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return new Reserva({
                    ...data,
                    firestoreId: doc.id,
                    codigoInterno: data.codigoInterno || data.id
                });
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar reserva:", error);
            return null;
        }
    }

    static async excluir(id) {
        try {
            const q = query(collection(db, "reservas"), where("codigoInterno", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, "reservas", docId));
            }
        } catch (error) {
            console.error("Erro ao excluir reserva:", error);
            throw error;
        }
    }
}

export { Reserva };

