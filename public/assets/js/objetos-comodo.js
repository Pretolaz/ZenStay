import { Imovel } from './entities/imovel.js';
import { db, app } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let itemParaExcluir = null; // Armazena o item a ser excluído para o modal de confirmação

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
    cancelarObjetoBtn.addEventListener('click', () => toggleFormObjeto(false));
    fotoObjetoInput.addEventListener('change', handleFileSelect);
    btnCamera.addEventListener('click', openCamera);
    btnCapture.addEventListener('click', captureImage);

    const btnNovoObjeto = document.getElementById('btnNovoObjeto');
    if (btnNovoObjeto) {
        btnNovoObjeto.addEventListener('click', () => {
            resetFormObjeto();
            toggleFormObjeto(true);
        });
    }

    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', executarExclusao);
    }

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
        row.style.cursor = 'pointer';
        row.classList.add('table-row-hover');

        // Evento de clique na linha para abrir detalhes
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                verDetalhesObjeto(obj);
            }
        });

        // Placeholder inicial
        const imgId = `img-${obj.imovelId}-${obj.comodoId}-${obj.id}`;
        const imageUrl = 'https://placehold.co/100x100?text=...';

        row.innerHTML = `
            <td><img id="${imgId}" src="${imageUrl}" alt="${obj.nome}" class="inventory-item-image" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td>${obj.id}</td>
            <td>${obj.imovelTitulo}</td>
            <td>${obj.comodoNome}</td>
            <td>${obj.tipo}</td>
            <td>${obj.nome}</td>
            <td style="text-align: center;">${obj.quantidade}</td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" onclick="editarObjeto(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Editar">✏️</button>
                <button class="action-btn d  elete-btn" onclick="prepararExclusao(${obj.imovelId}, ${obj.comodoId}, ${obj.id})" title="Excluir">🗑️</button>
            </td>
        `;
        tabelaObjetosBody.appendChild(row);

        // Carregar imagem real se existir
        if (obj.fotoId) {
            recuperarFotoInventario(obj.fotoId).then(base64 => {
                const imgElement = document.getElementById(imgId);
                if (imgElement && base64) {
                    imgElement.src = base64;
                } else if (imgElement) {
                    imgElement.src = 'https://placehold.co/100x100?text=N/A';
                }
            });
        } else if (obj.fotoUrl) {
            // Fallback para compatibilidade antiga
            const imgElement = document.getElementById(imgId);
            if (imgElement) imgElement.src = obj.fotoUrl;
        } else {
            const imgElement = document.getElementById(imgId);
            if (imgElement) imgElement.src = 'https://placehold.co/100x100?text=N/A';
        }
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

// Função para salvar a foto em uma coleção separada
async function salvarFotoInventario(fotoId, base64) {
    try {
        await setDoc(doc(db, "inventario_fotos", fotoId), {
            base64: base64
        });
        return true;
    } catch (error) {
        console.error("Erro ao salvar foto separada:", error);
        return false;
    }
}

// Função para recuperar a foto
async function recuperarFotoInventario(fotoId) {
    try {
        const docRef = doc(db, "inventario_fotos", fotoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().base64;
        }
        return null;
    } catch (error) {
        console.error("Erro ao recuperar foto:", error);
        return null;
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
        let fotoBase64 = document.getElementById('previewObjeto').src;
        let fotoId = null;

        // Se a imagem NÃO for o placeholder, preparamos para salvar
        if (fotoBase64 && !fotoBase64.includes('placehold.co')) {
            // Gera um ID único para a foto
            fotoId = `foto_${imovelId}_${comodoId}_${Date.now()}`;

            // Salva a foto na coleção separada
            await salvarFotoInventario(fotoId, fotoBase64);
        }

        const imovel = await Imovel.buscarPorId(imovelId);
        if (!imovel) {
            Toast.error("Imóvel não encontrado.");
            return;
        }

        // Objeto a ser salvo no array do imóvel (agora SEM o base64 gigante)
        const objetoData = {
            id: objetoId,
            tipo: tipoObjetoInput.value,
            nome: nomeObjetoInput.value,
            quantidade: parseInt(quantidadeObjetoInput.value, 10),
            fotoId: fotoId, // Salvamos apenas o ID
            fotoUrl: null   // Limpamos o campo antigo para economizar espaço
        };

        // Se estiver editando e não trocou a foto, precisamos manter o fotoId antigo
        if (objetoId) {
            const comodoAntigo = imovel.comodos.find(c => c.id == comodoId);
            if (comodoAntigo) {
                const objetoAntigo = comodoAntigo.objetos.find(o => o.id == objetoId);
                if (objetoAntigo && !fotoId && objetoAntigo.fotoId) {
                    objetoData.fotoId = objetoAntigo.fotoId;
                }
            }
        }

        await imovel.salvarObjeto(comodoId, objetoData);
        Toast.success("Objeto salvo com sucesso!");

        // Atualização Otimista da Interface (sem recarregar tudo do banco)
        const comodo = imovel.comodos.find(c => c.id == comodoId);
        const flatObject = {
            ...objetoData,
            imovelId: imovel.id,
            imovelTitulo: imovel.titulo,
            comodoId: comodo.id,
            comodoNome: comodo.nome
        };

        if (objetoId) {
            // Editando: atualiza o item no array local
            const index = allObjects.findIndex(o => o.id == objetoId && o.imovelId == imovelId && o.comodoId == comodoId);
            if (index !== -1) {
                // Mantém a fotoUrl antiga se não houve nova foto, para não piscar na tela
                if (!flatObject.fotoId && !flatObject.fotoUrl && allObjects[index].fotoUrl) {
                    flatObject.fotoUrl = allObjects[index].fotoUrl;
                }
                allObjects[index] = { ...allObjects[index], ...flatObject };
            }
        } else {
            // Adicionando: empurra para o array local
            // Se tiver fotoId, a renderTable vai buscar async. Se tiver preview, podemos usar temporariamente?
            // Por simplicidade, deixamos a renderTable buscar.
            allObjects.push(flatObject);
        }

        renderTable();
        toggleFormObjeto(false);
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

        // Carregar a foto
        if (objeto.fotoId) {
            const base64 = await recuperarFotoInventario(objeto.fotoId);
            previewObjeto.src = base64 || 'https://placehold.co/300x200?text=Erro+Imagem';
        } else if (objeto.fotoUrl) {
            previewObjeto.src = objeto.fotoUrl;
        } else {
            previewObjeto.src = 'https://placehold.co/300x200?text=Sem+Imagem';
        }

        document.getElementById('formTitleObjeto').textContent = '✏️ Editar Objeto';
        toggleFormObjeto(true);
    } catch (error) {
        console.error("Erro ao carregar objeto para edição:", error);
        Toast.error("Erro ao carregar objeto para edição.");
    }
}

async function prepararExclusao(imovelId, comodoId, objetoId) {
    itemParaExcluir = { imovelId, comodoId, objetoId };
    document.getElementById('modalConfirmacaoExclusao').style.display = 'block';
}

async function executarExclusao() {
    if (!itemParaExcluir) return;

    try {
        const { imovelId, comodoId, objetoId } = itemParaExcluir;

        // Otimização: Buscar apenas o imóvel específico
        const imovel = await Imovel.buscarPorId(imovelId);

        if (imovel) {
            await imovel.removerObjeto(comodoId, objetoId);
            Toast.success("Objeto excluído com sucesso!");

            // Atualização Local (sem recarregar tudo)
            allObjects = allObjects.filter(o => !(o.id == objetoId && o.imovelId == imovelId && o.comodoId == comodoId));
            renderTable();
        } else {
            Toast.error("Imóvel não encontrado.");
        }

        document.getElementById('modalConfirmacaoExclusao').style.display = 'none';
        itemParaExcluir = null;
    } catch (error) {
        Toast.error("Erro ao excluir objeto: " + error.message);
    }
}

function toggleFormObjeto(show) {
    const container = document.getElementById('formObjetoContainer');
    container.style.display = show ? 'block' : 'none';
    if (show) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function verDetalhesObjeto(obj) {
    document.getElementById('detalheTitulo').textContent = `📦 ${obj.nome}`;
    document.getElementById('detalheNome').textContent = obj.nome;
    document.getElementById('detalheTipo').textContent = obj.tipo;
    document.getElementById('detalheQuantidade').textContent = obj.quantidade;
    document.getElementById('detalheImovel').textContent = obj.imovelTitulo;
    document.getElementById('detalheComodo').textContent = obj.comodoNome;

    const img = document.getElementById('detalheImagem');
    img.src = 'https://placehold.co/300x200?text=Carregando...';
    img.style.display = 'block';

    let base64 = null;
    if (obj.fotoId) {
        base64 = await recuperarFotoInventario(obj.fotoId);
    } else if (obj.fotoUrl) {
        base64 = obj.fotoUrl;
    }

    if (base64 && !base64.includes('placehold.co')) {
        img.src = base64;
    } else {
        img.src = 'https://placehold.co/300x200?text=Sem+Imagem';
    }

    document.getElementById('modalDetalhesObjeto').style.display = 'block';
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
window.excluirObjeto = prepararExclusao; // Mantendo compatibilidade se algo chamar excluirObjeto
window.prepararExclusao = prepararExclusao;
window.editarObjeto = editarObjeto;
window.verDetalhesObjeto = verDetalhesObjeto;

// Chama a inicialização quando o DOM está pronto
window.addEventListener('DOMContentLoaded', inicializarInventario);
