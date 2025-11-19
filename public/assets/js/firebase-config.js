// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Substitua os valores abaixo pelas configurações do seu projeto Firebase
// Você encontra essas informações no Console do Firebase > Configurações do Projeto > Geral > Seus aplicativos
const firebaseConfig = {
    apiKey: "AIzaSyAaBikY4ohM0jDaAzdXyzDoJdt-087Nwgc",
    authDomain: "zenstay-d0ac5.firebaseapp.com",
    projectId: "zenstay-d0ac5",
    storageBucket: "zenstay-d0ac5.firebasestorage.app",
    messagingSenderId: "163273504338",
    appId: "1:163273504338:web:b83a5a6f8cb91ca87dd18b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
