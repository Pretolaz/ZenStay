import { db } from '../firebase-config.js';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const reservasCollection = collection(db, 'reservas');

class Reserva {
    constructor({ id, codigoInterno, anfitriaoId, imovelId, plataformaId, hospedes, checkin, checkout, numHospedes, numPets, valorTotal, status, observacoes, dataCriacao }) {
        this.id = id;
        this.codigoInterno = codigoInterno || id;
        this.anfitriaoId = anfitriaoId;
        this.imovelId = imovelId;
        this.plataformaId = plataformaId;
        this.hospedes = Array.isArray(hospedes) ? hospedes : [];
        this.checkin = checkin;
        this.checkout = checkout;
        this.numHospedes = numHospedes;
        this.numPets = numPets || 0;
        this.valorTotal = valorTotal;
        this.status = status;
        this.observacoes = observacoes;
        this.dataCriacao = dataCriacao || new Date().toISOString();
    }

    static async listarTodos() {
        try {
            const snapshot = await getDocs(reservasCollection);
            const reservas = snapshot.docs.map(doc => new Reserva({ id: doc.id, ...doc.data() }));
            return reservas;
        } catch (error) {
            console.error("Erro ao listar reservas do Firestore:", error);
            return [];
        }
    }

    static async salvar(reservaData) {
        try {
            // Se não tem ID, é uma nova reserva. Geramos um ID.
            const docRef = reservaData.id ? doc(reservasCollection, String(reservaData.id)) : doc(reservasCollection);
            
            // Garante que o objeto a ser salvo tenha o ID
            const dataToSave = {
                ...reservaData,
                id: docRef.id,
                codigoInterno: reservaData.codigoInterno || docRef.id
            };

            await setDoc(docRef, dataToSave);
            console.log("Reserva salva com sucesso no Firestore com ID: ", docRef.id);
            return dataToSave; // Retorna o objeto salvo com o ID
        } catch (error) {
            console.error("Erro ao salvar reserva no Firestore:", error);
            throw error; // Lança o erro para ser tratado no wizard
        }
    }

    static async buscarPorId(id) {
        try {
            const docRef = doc(reservasCollection, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return new Reserva({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.log("Nenhuma reserva encontrada com o ID:", id);
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar reserva no Firestore:", error);
            return null;
        }
    }

    static async excluir(id) {
        try {
            const docRef = doc(reservasCollection, String(id));
            await deleteDoc(docRef);
            console.log("Reserva excluída com sucesso do Firestore.");
        } catch (error) {
            console.error("Erro ao excluir reserva do Firestore:", error);
            throw error;
        }
    }
}

// Disponibiliza a classe no escopo global para que o HTML possa usá-la
window.Reserva = Reserva;
