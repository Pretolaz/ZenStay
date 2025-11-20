import { Imovel } from './entities/imovel.js';
import { db, app } from './firebase-config.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const storage = getStorage(app);

async function uploadFile(file, path) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}
// assets/js/objetos-comodo.js

// Escopo do módulo para as variáveis principais
let tabelaObjetosBody, formObjeto, objetoIdInput,
    tipoObjetoInput, nomeObjetoInput, quantidadeObjetoInput,
    cancelarObjetoBtn, selectImovelObjetos, selectComodoObjetos,
    fotoObjetoInput, previewObjeto, btnCamera, cameraStream,
    cameraCanvas, btnCapture;

let allObjects = [];
let sortState = { key: 'id', ascending: true };
let currentImageFile = null;
let activeStream = null;

async function inicializarInventario() {
    // Atribuição de elementos do DOM
    tabelaObjetosBody = document.querySelector('#tabelaObjetos tbody');
    formObjeto = document.getElementById('formObjeto');
    objetoIdInput = document.getElementById('objetoId');
    tipoObjetoInput = document.getElementById('tipoObjeto');
    nomeObjetoInput = document.getElementById('nomeObjeto');
    quantidadeObjetoInput = document.getElementById('quantidadeObjeto');
    cancelarObjetoBtn = document.getElementById('cancelarObjeto');
    selectImovelObjetos = document.getElementById('selectImovelObjetos');
    selectComodoObjetos = document.getElementById('selectComodoObjetos');
    fotoObjetoInput = document.getElementById('fotoObjeto');
    previewObjeto = document.getElementById('previewObjeto');
    btnCamera = document.getElementById('btnCamera');
    cameraStream = document.getElementById('cameraStream');
    cameraCanvas = document.getElementById('cameraCanvas');
    btnCapture = document.getElementById('btnCapture');

    const formObjetoContainer = document.getElementById('formObjetoContainer');

    // Listeners de eventos
    selectImovelObjetos.addEventListener('change', () => popularSelectComodosObjetos(selectImovelObjetos.value));
    formObjeto.addEventListener('submit', salvarObjeto);
    cancelarObjetoBtn.addEventListener('click', resetFormObjeto);
    fotoObjetoInput.addEventListener('change', handleFileSelect);
    btnCamera.addEventListener('click', openCamera);
    btnCapture.addEventListener('click', captureImage);

    document.querySelectorAll('#tabelaObjetos th[data-sort-key]').forEach(header => {
        header.addEventListener('click', () => handleSort(header.dataset.sortKey));
    });

    // Inicialização da UI
    await popularSelectImoveisObjetos();
    await loadAndRenderAllObjects();
    resetFormObjeto();
}

async function loadAndRenderAllObjects() {
    try {
        const imoveis = await Imovel.listarTodos();
        allObjects = [];
        imoveis.forEach(imovel => {
            if (imovel.comodos) {
                imovel.comodos.forEach(comodo => {
                    if (comodo.objetos) {
                        comodo.objetos.forEach(objeto => {
                            allObjects.push({
                                ...objeto,
                                imovelId: imovel.id,
                                imovelTitulo: imovel.titulo,
                                comodoId: comodo.id,
                                comodoNome: comodo.nome
                            });
                        });
                    }
                });
            }
        });
        renderTable();
    } catch (error) {
        console.error("Erro ao carregar objetos:", error);
        Toast.error("Erro ao carregar inventário.");
    }
}

function handleSort(key) {
    if (sortState.key === key) {
        sortState.ascending = !sortState.ascending;
    } else {
        sortState.key = key;
        sortState.ascending = true;
    }
    renderTable();
}

function renderTable() {
    const sortedObjects = [...allObjects].sort((a, b) => {
        const valA = (typeof a[sortState.key] === 'string') ? a[sortState.key].toLowerCase() : a[sortState.key];
        const valB = (typeof b[sortState.key] === 'string') ? b[sortState.key].toLowerCase() : b[sortState.key];
        if (valA < valB) return sortState.ascending ? -1 : 1;
        if (valA > valB) return sortState.ascending ? 1 : -1;
        return 0;
    });

    tabelaObjetosBody.innerHTML = '';
    sortedObjects.forEach(obj => {
        const row = document.createElement('tr');
        const imageUrl = obj.fotoUrl || 'https://placehold.co/100x100?text=N/A';
        row.innerHTML = `
            <td><img src="${imageUrl}" alt="${obj.nome}" class="inventory-item-image"></td>
            <td>${obj.id}</td>
            <td>${obj.imovelTitulo}</td>
            <td>${obj.comodoNome}</td>
            <td>${obj.tipo}</td>
            <td>${obj.nome}</td>
            <td>${obj.quantidade}</td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" onclick="editarObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Editar">✏️</button>
                <button class="action-btn delete-btn" onclick="excluirObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Excluir">🗑️</button>
            </td>
        `;
        tabelaObjetosBody.appendChild(row);
    });

    document.querySelectorAll('#tabelaObjetos th[data-sort-key] span').forEach(span => span.textContent = '');
    const activeHeader = document.querySelector(`#tabelaObjetos th[data-sort-key='${sortState.key}'] span`);
    if (activeHeader) {
        activeHeader.textContent = sortState.ascending ? ' ▲' : ' ▼';
    }
}

async function popularSelectImoveisObjetos() {
    try {
        const imoveis = await Imovel.listarTodos();
        selectImovelObjetos.innerHTML = '<option value="">Selecione um Imóvel</option>';
        imoveis.forEach(imovel => {
            const option = document.createElement('option');
            option.value = imovel.id;
            option.textContent = imovel.titulo;
            selectImovelObjetos.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
    }
}

async function popularSelectComodosObjetos(imovelId) {
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    if (!imovelId) return;
    try {
        const imoveis = await Imovel.listarTodos();
        const imovel = imoveis.find(i => i.id == imovelId);
        if (imovel && imovel.comodos) {
            imovel.comodos.forEach(comodo => {
                const option = document.createElement('option');
                option.value = comodo.id;
                option.textContent = comodo.nome;
                selectComodoObjetos.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar cômodos:", error);
    }
}

async function salvarObjeto(e) {
    e.preventDefault();
    const imovelId = parseInt(selectImovelObjetos.value);
    const comodoId = parseInt(selectComodoObjetos.value);
    const objetoId = objetoIdInput.value ? parseInt(objetoIdInput.value) : null;

    if (!imovelId || !comodoId) {
        Toast.warning('Por favor, selecione um imóvel e um cômodo.');
        return;
    }

    try {
        let fotoUrl = document.getElementById('previewObjeto').src;
        if (currentImageFile) {
            const path = `inventario/${imovelId}_${comodoId}_${Date.now()}`;
            fotoUrl = await uploadFile(currentImageFile, path);
        }

        const imoveis = await Imovel.listarTodos();
        const imovelData = imoveis.find(i => i.id == imovelId);
        if (!imovelData) return;

        const imovel = new Imovel(imovelData);
        const objetoData = {
            id: objetoId,
            tipo: tipoObjetoInput.value,
            nome: nomeObjetoInput.value,
            quantidade: parseInt(quantidadeObjetoInput.value, 10),
            fotoUrl: fotoUrl.startsWith('https://') ? fotoUrl : null
        };

        await imovel.salvarObjeto(comodoId, objetoData);
        Toast.success("Objeto salvo com sucesso!");

        await loadAndRenderAllObjects();
        resetFormObjeto();
    } catch (error) {
        Toast.error("Erro ao salvar objeto: " + error.message);
    }
}

async function editarObjeto(imovelId, comodoId, objetoId) {
    try {
        const imoveis = await Imovel.listarTodos();
        const imovelData = imoveis.find(i => i.id === imovelId);
        if (!imovelData || !imovelData.comodos) return;

        const comodoData = imovelData.comodos.find(c => c.id === comodoId);
        if (!comodoData || !comodoData.objetos) return;

        const objeto = comodoData.objetos.find(o => o.id === objetoId);
        if (!objeto) return;

        resetFormObjeto();
        selectImovelObjetos.value = imovelId;
        await popularSelectComodosObjetos(imovelId);
        selectComodoObjetos.value = comodoId;
        objetoIdInput.value = objeto.id;
        tipoObjetoInput.value = objeto.tipo;
        nomeObjetoInput.value = objeto.nome;
        quantidadeObjetoInput.value = objeto.quantidade;
        previewObjeto.src = objeto.fotoUrl || 'https://placehold.co/300x200?text=Sem+Imagem';

        document.getElementById('formTitleObjeto').textContent = '✏️ Editar Objeto';
        formObjeto.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Erro ao carregar objeto para edição:", error);
        Toast.error("Erro ao carregar objeto para edição.");
    }
}

async function excluirObjeto(imovelId, comodoId, objetoId) {
    if (!confirm('Tem certeza que deseja excluir este objeto?')) return;

    try {
        const imoveis = await Imovel.listarTodos();
        const imovelData = imoveis.find(i => i.id === imovelId);
        if (!imovelData) return;

        const imovel = new Imovel(imovelData);
        await imovel.removerObjeto(comodoId, objetoId);
        Toast.success("Objeto excluído com sucesso!");

        await loadAndRenderAllObjects();
        resetFormObjeto();
    } catch (error) {
        Toast.error("Erro ao excluir objeto: " + error.message);
    }
}

function resetFormObjeto() {
    formObjeto.reset();
    objetoIdInput.value = '';
    selectImovelObjetos.value = '';
    selectComodoObjetos.innerHTML = '<option value="">Selecione um Cômodo</option>';
    previewObjeto.src = 'https://placehold.co/300x200?text=Sem+Imagem';
    currentImageFile = null;
    fotoObjetoInput.value = '';
    stopCamera();
    document.getElementById('formTitleObjeto').textContent = '➕ Adicionar Objeto';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewObjeto.src = e.target.result;
            currentImageFile = file;
        };
        reader.readAsDataURL(file);
        stopCamera();
    }
}

async function openCamera() {
    stopCamera();
    try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        cameraStream.srcObject = activeStream;
        cameraStream.style.display = 'block';
        btnCapture.style.display = 'block';
        previewObjeto.style.display = 'none';
    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        Toast.error("Não foi possível acessar a câmera.");
    }
}

function stopCamera() {
    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
    }
    cameraStream.style.display = 'none';
    btnCapture.style.display = 'none';
    previewObjeto.style.display = 'block';
}

function captureImage() {
    cameraCanvas.width = cameraStream.videoWidth;
    cameraCanvas.height = cameraStream.videoHeight;
    const context = cameraCanvas.getContext('2d');
    context.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);

    previewObjeto.src = cameraCanvas.toDataURL('image/webp');
    cameraCanvas.toBlob(blob => {
        currentImageFile = new File([blob], "capture.webp", { type: "image/webp" });
    }, 'image/webp');

    stopCamera();
}

// Expor funções globais
window.inicializarInventario = inicializarInventario;
window.editarObjeto = editarObjeto;
window.excluirObjeto = excluirObjeto;

// Chama a inicialização quando o DOM está pronto
window.addEventListener('DOMContentLoaded', inicializarInventario);