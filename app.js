const API_URL = 'http://localhost:5000/api';
let chatbotContexto = { etapa: "inicio" };

// Función para alternar dinámicamente entre las 5 pestañas solicitadas
function cambiarPestana(idPestana) {
    // Escondemos todos los bloques de contenido
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    // Visualizamos la sección seleccionada
    document.getElementById(`sec-${idPestana}`).classList.remove('hidden');

    // Cambiamos el estado estético de los botones de control
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${idPestana}`).classList.add('active');
}

// PETICIÓN 1: Búsqueda centralizada del Trámite
async function buscarTramite() {
    const busqueda = document.getElementById('input-busqueda').value;
    const contenedor = document.getElementById('resultado-busqueda');
    if(!busqueda.trim()) return;
    
    try {
        const res = await fetch(`${API_URL}/tramites/${busqueda}`);
        const data = await res.json();
        
        if (data.encontrado) {
            const t = data.datos;
            contenedor.className = "card-info";
            contenedor.innerHTML = `
                <div class="card-header-flex">
                    <h3>${t.nombre}</h3>
                    <span class="badge-bus" style="margin-top:0; background-color:#dcfce7; color:#166534;">✓ Oficial</span>
                </div>
                <div class="grid-2">
                    <p><strong>🏢 Dependencia:</strong> ${t.dependencia}</p>
                    <p><strong>📍 Ubicación Exacta:</strong> ${t.direccion}</p>
                    <p><strong>🕒 Horario de Atención:</strong> ${t.horarios}</p>
                    <p><strong>⏳ Tiempo de Espera:</strong> ${t.tiempoEstimado}</p>
                </div>
                <div class="requirements-box">
                    <p><strong>📋 Requisitos obligatorios:</strong></p>
                    <p style="color:#475569; font-size:0.9rem; margin-top:4px;">${t.requisitos}</p>
                    <ul>${t.documentos.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            `;
        } else {
            contenedor.className = "alert-error-custom";
            contenedor.innerText = data.mensaje;
        }
    } catch {
        contenedor.className = "alert-error-custom";
        contenedor.innerText = "Error: Por favor, escribe exactamente 'subsidio de transporte universitario'.";
    }
}

// PETICIÓN 2: Chatbot Inteligente de orientación
async function enviarMensajeChat() {
    const input = document.getElementById('input-chat');
    const mensajeTexto = input.value.trim();
    if (!mensajeTexto) return;

    const chatBox = document.getElementById('chat-box');
    // Pintamos el mensaje del usuario en pantalla
    chatBox.innerHTML += `<div class="msg user-msg">${mensajeTexto}</div>`;
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch(`${API_URL}/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: mensajeTexto, contexto: chatbotContexto })
        });
        const data = await res.json();
        chatbotContexto = data.contexto;

        // Pintamos la respuesta lógica de la IA
        chatBox.innerHTML += `<div class="msg logo-msg">${data.respuesta}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch {
        chatBox.innerHTML += `<div class="msg logo-msg" style="color:red;">Error de conexión con el sistema.</div>`;
    }
}

// PETICIÓN 4: Verificación y Seguimiento Remoto
async function consultarEstado() {
    const cedula = document.getElementById('input-cedula').value;
    const contenedor = document.getElementById('resultado-seguimiento');
    if (!cedula) return;

    try {
        const res = await fetch(`${API_URL}/seguimiento/${cedula}`);
        const data = await res.json();

        contenedor.classList.remove('hidden');
        if (data.estado === 'Aprobado') {
            contenedor.className = "status-card status-aprobado";
        } else if (data.estado === 'Falta documento') {
            contenedor.className = "status-card status-falta";
        } else {
            contenedor.className = "status-card status-revision";
        }

        contenedor.innerHTML = `
            <h3>Trámite: ${data.tramite || 'Consulta General'}</h3>
            <p style="margin-top:8px;"><strong>Estado actual del proceso:</strong> ${data.estado}</p>
            <p style="font-size:0.9rem; opacity:0.9;"><strong>Etapa:</strong> ${data.etapa}</p>
        `;
    } catch {
        alert("Enciende el servidor Backend primero.");
    }
}

// PETICIÓN 5: Envío de alertas ciudadanas
async function enviarReporte(e) {
    e.preventDefault();
    const oficina = document.getElementById('rep-oficina').value;
    const motivo = document.getElementById('rep-motivo').value;
    const description = document.getElementById('rep-descripcion').value;

    try {
        const res = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oficina, motivo, descripcion: description })
        });
        const data = await res.json();

        if (data.enviado) {
            const alerta = document.getElementById('alerta-reporte');
            alerta.classList.remove('hidden');
            // Limpiamos los campos del formulario
            document.getElementById('rep-oficina').value = '';
            document.getElementById('rep-motivo').value = '';
            document.getElementById('rep-descripcion').value = '';
            
            // Ocultamos la notificación verde tras 4 segundos
            setTimeout(() => alerta.classList.add('hidden'), 4000);
        }
    } catch {
        alert("Asegúrate de que el Backend esté encendido en el puerto 5000.");
    }
}
