const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const tramites = {
  "subsidio de transporte universitario": {
    nombre: "Subsidio de Transporte Universitario",
    direccion: "Calle 34 No. 43-31, Alcaldía de Barranquilla",
    horarios: "Lunes a Viernes - 8:00 AM a 4:00 PM",
    dependencia: "Secretaría de Gestión Social",
    requisitos: "Ser estudiante activo, pertenecer a Sisbén A o B, vivir en Barranquilla.",
    documentos: ["Cédula / Tarjeta de Identidad", "Volante de matrícula vigente", "Certificado Sisbén IV"],
    tiempoEstimado: "15 días hábiles"
  }
};

const seguimientos = {
  "123456": { tramite: "Subsidio de Transporte", estado: "En revisión", etapa: "Validación de documentos" },
  "789012": { tramite: "Subsidio de Transporte", estado: "Falta documento", etapa: "Falta adjuntar Certificado Sisbén" }
};

app.get('/api/tramites/:query', (req, res) => {
  const q = req.params.query.toLowerCase().trim();
  if (tramites[q]) return res.json({ encontrado: true, datos: tramites[q] });
  res.status(404).json({ encontrado: false, mensaje: "Trámite no encontrado. Intenta buscando 'subsidio de transporte universitario'" });
});

app.post('/api/chatbot', (req, res) => {
  const { mensaje, contexto } = req.body;
  const msg = mensaje.toLowerCase();

  if (!contexto || contexto.etapa === "inicio") {
    if (msg.includes("subsidio") || msg.includes("transporte")) {
      return res.json({
        respuesta: "¡Perfecto! Veo que buscas el Subsidio de Transporte. ¿Eres estudiante activo de universidad o instituto técnico?",
        contexto: { etapa: "pregunta_estudiante", tramite: "subsidio de transporte universitario" }
      });
    }
    return res.json({
      respuesta: "Hola, ¿en qué trámite de la Alcaldía te puedo asesorar hoy? (Ej: Subsidio de transporte)",
      contexto: { etapa: "inicio" }
    });
  }

  if (contexto.etapa === "pregunta_estudiante") {
    if (msg.includes("si") || msg.includes("sí")) {
      return res.json({
        respuesta: "Excelente. ¿Ya completaste la entrega de documentos?",
        contexto: { etapa: "pregunta_documentos", tramite: contexto.tramite }
      });
    } else {
      return res.json({ respuesta: "Lo siento, este beneficio es solo para estudiantes activos.", contexto: { etapa: "inicio" } });
    }
  }

  if (contexto.etapa === "pregunta_documentos") {
    if (msg.includes("si") || msg.includes("sí")) {
      return res.json({ respuesta: "¡Excelente! Puedes ver el estado de tu radicado digital en la sección '4. Mi Estado' usando tu cédula.", contexto: { etapa: "inicio" } });
    } else {
      const info = tramites[contexto.tramite];
      return res.json({ respuesta: `Por favor, dirígete a la ${info.dependencia} en la ${info.direccion} y lleva: ${info.documentos.join(', ')}.`, contexto: { etapa: "inicio" } });
    }
  }
});

app.get('/api/seguimiento/:cedula', (req, res) => {
  const id = req.params.cedula;
  if (seguimientos[id]) return res.json(seguimientos[id]);
  res.json({ estado: "Pendiente", etapa: "No iniciado o cédula no registrada" });
});

app.post('/api/reportes', (req, res) => {
  res.json({ enviado: true });
});

app.listen(5000, () => console.log("Servidor de la Alcaldía corriendo en el puerto 5000"));
