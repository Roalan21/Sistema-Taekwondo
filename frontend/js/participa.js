const URL_PARTICIPA = "http://localhost:3000/participa";
const URL_ESTUDIANTES = "http://localhost:3000/estudiantes";
const URL_EVENTOS = "http://localhost:3000/eventos";

let eventoSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Obtener parámetros de URL (si viene desde eventos.html)
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('eventoId');
    const eventoTitulo = urlParams.get('eventoTitulo');

    // Cargar selects
    await cargarEstudiantes();
    await cargarEventos();

    // Si viene con evento seleccionado
    if (eventoId) {
        document.getElementById("evento").value = eventoId;
        eventoSeleccionado = eventoId;
        document.getElementById("infoEvento").innerHTML = `🎯 Inscribiendo estudiantes al evento: <strong>${decodeURIComponent(eventoTitulo || '')}</strong>`;
        cargarParticipaciones(eventoId);
    }

    // Botón volver a eventos
    const btnVolver = document.getElementById("btnVolver");
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "evento.html";
        });
    }

    // Evento cambio de evento
    document.getElementById("evento").addEventListener("change", (e) => {
        eventoSeleccionado = e.target.value;
        if (eventoSeleccionado) {
            cargarParticipaciones(eventoSeleccionado);
            const eventoText = e.target.options[e.target.selectedIndex]?.text;
            document.getElementById("infoEvento").innerHTML = `🎯 Participantes del evento: <strong>${eventoText}</strong>`;
        } else {
            document.getElementById("contenedor-participaciones").innerHTML = "";
            document.getElementById("infoEvento").innerHTML = "Selecciona un evento para ver sus participantes";
        }
    });

    // Submit del formulario
    document.getElementById("formParticipa").addEventListener("submit", async (e) => {
        e.preventDefault();

        const estudianteId = document.getElementById("estudiante").value;
        const eventoId = document.getElementById("evento").value;
        const resultado = document.getElementById("resultado").value;

        if (!estudianteId || !eventoId) {
            alert("Seleccione un estudiante y un evento");
            return;
        }

        // Verificar si ya existe la inscripción
        const resVerif = await fetch(`${URL_PARTICIPA}/verificar?estudiante=${estudianteId}&evento=${eventoId}`);
        const existe = await resVerif.json();

        if (existe.existe) {
            alert("⚠️ Este estudiante ya está registrado en este evento");
            return;
        }

        const datos = {
            EstudianteID: parseInt(estudianteId),
            EventoID: parseInt(eventoId),
            Resultado: resultado || null
        };

        try {
            const res = await fetch(URL_PARTICIPA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                alert("✅ Participación registrada exitosamente");
                document.getElementById("formParticipa").reset();
                document.getElementById("evento").value = eventoSeleccionado || "";
                if (eventoSeleccionado) {
                    cargarParticipaciones(eventoSeleccionado);
                }
            } else {
                alert("❌ Error al registrar");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error al conectar con el servidor");
        }
    });
});

// Cargar estudiantes activos
async function cargarEstudiantes() {
    try {
        const res = await fetch(`${URL_ESTUDIANTES}?estado=1`);
        const data = await res.json();
        
        const select = document.getElementById("estudiante");
        select.innerHTML = '<option value="">Seleccione estudiante...</option>';
        
        data.forEach(e => {
            const nombreCompleto = `${e.PrimerNombre} ${e.PrimerApellido}`;
            select.innerHTML += `<option value="${e.EstudianteID}">${nombreCompleto}</option>`;
        });
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

// Cargar eventos (solo vigentes)
async function cargarEventos() {
    try {
        const res = await fetch(URL_EVENTOS);
        const data = await res.json();
        
        const select = document.getElementById("evento");
        select.innerHTML = '<option value="">Seleccione evento...</option>';
        
        // Filtrar eventos vigentes (fecha >= hoy)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const eventosVigentes = data.filter(e => {
            const fechaEvento = new Date(e.Fecha);
            fechaEvento.setHours(0, 0, 0, 0);
            return fechaEvento >= hoy;
        });
        
        eventosVigentes.forEach(e => {
            const fechaFormateada = new Date(e.Fecha).toLocaleDateString();
            select.innerHTML += `<option value="${e.EventoID}">${e.Nombre} - ${fechaFormateada}</option>`;
        });
    } catch (error) {
        console.error("Error cargando eventos:", error);
    }
}

// Cargar participaciones de un evento específico
async function cargarParticipaciones(eventoId) {
    try {
        const res = await fetch(`${URL_PARTICIPA}/evento/${eventoId}`);
        const participaciones = await res.json();
        
        const contenedor = document.getElementById("contenedor-participaciones");
        
        if (participaciones.length === 0) {
            contenedor.innerHTML = `<div class="sin-resultados">No hay estudiantes inscritos en este evento</div>`;
            return;
        }
        
        contenedor.innerHTML = participaciones.map(p => {
            let resultadoDisplay = '';
            if (p.Resultado === 'Oro') resultadoDisplay = '🥇 Oro';
            else if (p.Resultado === 'Plata') resultadoDisplay = '🥈 Plata';
            else if (p.Resultado === 'Bronce') resultadoDisplay = '🥉 Bronce';
            else if (p.Resultado === 'Participación') resultadoDisplay = '📋 Participación';
            else resultadoDisplay = '❌ Sin resultado';
            
            return `
                <div class="fila-estudiante">
                    <div class="info-izquierda">
                        <div class="avatar-estudiante">👤</div>
                        <div>
                            <div class="nombre-estudiante">${p.Estudiante}</div>
                            <small style="color: #64748b;">ID: ${p.EstudianteID}</small>
                        </div>
                    </div>
                    <div>${p.Evento}</div>
                    <div>${formatearFechaLocal(p.FechaRegistro)}</div>
                    <div>${resultadoDisplay}</div>
                    <div class="acciones">
                        <button class="btn-eliminar" data-id="${p.ParticipaID}" data-estudiante="${p.Estudiante}">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join("");
        
        // Agregar event listeners a los botones eliminar
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const estudiante = btn.dataset.estudiante;
                
                if (confirm(`¿Eliminar la inscripción de ${estudiante}?`)) {
                    await fetch(`${URL_PARTICIPA}/${id}`, { method: "DELETE" });
                    alert("Inscripción eliminada");
                    cargarParticipaciones(eventoSeleccionado);
                }
            });
        });
        
    } catch (error) {
        console.error("Error cargando participaciones:", error);
        document.getElementById("contenedor-participaciones").innerHTML = 
            `<div class="sin-resultados">Error al cargar participantes</div>`;
    }
}

// Función auxiliar para formatear fecha
function formatearFechaLocal(fechaIso) {
    if (!fechaIso) return "N/A";
    const fecha = new Date(fechaIso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
}