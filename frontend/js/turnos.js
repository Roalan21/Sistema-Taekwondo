// ==================== TURNOS ====================
const URL_TURNOS = "http://localhost:3000/turnos";
const URL_MODALIDAD = "http://localhost:3000/modalidades";

let editandoTurno = false;
let idEditarTurno = null;

// Elementos del DOM
const contenedorTurnos = document.getElementById("contenedor-turnos");
const modalTurno = document.getElementById("modalTurno");
const formTurno = document.getElementById("formTurnoModal");
const modalTitleTurno = document.getElementById("modalTitleTurno");
const btnNuevoTurno = document.getElementById("btnNuevoTurno");
const cerrarModalTurno = document.getElementById("cerrarModalTurno");
const buscadorTurno = document.getElementById("buscadorTurno");

// Elementos para Modalidad
const modalAgregarModalidad = document.getElementById("modalAgregarModalidad");
const cerrarModalAgregarModalidad = document.getElementById("cerrarModalAgregarModalidad");
const infoTurnoSeleccionado = document.getElementById("infoTurnoSeleccionado");
const btnGuardarModalidad = document.getElementById("btnGuardarModalidad");

let turnoSeleccionadoId = null;
let turnoSeleccionadoHorario = null;

let turnosOriginales = [];
let modalidadesPorTurno = {};

document.addEventListener("DOMContentLoaded", () => {
    listarTurnos();

    // Eventos Turnos
    btnNuevoTurno.addEventListener("click", () => {
        editandoTurno = false;
        idEditarTurno = null;
        modalTitleTurno.innerText = "Nuevo Turno";
        formTurno.reset();
        modalTurno.style.display = "flex";
    });

    cerrarModalTurno.addEventListener("click", () => {
        modalTurno.style.display = "none";
    });

    // FORMULARIO DE TURNO CON MEJORAS
    formTurno.addEventListener("submit", async (e) => {
        e.preventDefault();

        const HoraInicio = document.getElementById("horaInicio").value;
        const HoraFin = document.getElementById("horaFin").value;

        if (!HoraInicio || !HoraFin) {
            alert("Debe seleccionar ambas horas.");
            return;
        }

        if (HoraInicio >= HoraFin) {
            alert("La hora inicio debe ser menor que la hora fin.");
            return;
        }

        const datos = { HoraInicio, HoraFin };

        let metodo = "POST";
        let url = URL_TURNOS;

        if (editandoTurno) {
            metodo = "PUT";
            url = `${URL_TURNOS}/${idEditarTurno}`;
        }

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            const data = await res.json();

            if (res.ok) {
                alert(editandoTurno ? "✅ Turno actualizado" : "✅ Turno creado");
                modalTurno.style.display = "none";
                await listarTurnos(); // Esperar a que se recargue
                formTurno.reset(); // Limpiar el formulario
            } else {
                // Mostrar mensaje de error específico del servidor
                const errorMsg = data.error || "Error al guardar el turno";
                alert(`❌ ${errorMsg}`);
                console.error("Error del servidor:", errorMsg);
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("❌ Error de conexión con el servidor");
        }
    });

    buscadorTurno.addEventListener("input", filtrarTurnos);

    // Eventos Modalidad
    cerrarModalAgregarModalidad.addEventListener("click", () => {
        modalAgregarModalidad.style.display = "none";
        // Resetear checkboxes
        document.querySelectorAll('#dias input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    btnGuardarModalidad.addEventListener("click", async () => {
        await guardarModalidad();
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener("click", (e) => {
        if (e.target === modalTurno) modalTurno.style.display = "none";
        if (e.target === modalAgregarModalidad) modalAgregarModalidad.style.display = "none";
    });
});

// ==================== FUNCIONES TURNOS ====================
async function listarTurnos() {
    try {
        const res = await fetch(URL_TURNOS);
        turnosOriginales = await res.json();
        
        // Cargar modalidades para cada turno
        await cargarModalidadesPorTurno();
        renderizarTurnos(turnosOriginales);
    } catch (error) {
        console.error("Error al cargar turnos:", error);
    }
}

async function cargarModalidadesPorTurno() {
    try {
        const res = await fetch(URL_MODALIDAD);
        const modalidades = await res.json();
        
        // Agrupar modalidades por TurnoID
        modalidadesPorTurno = {};
        modalidades.forEach(m => {
            if (!modalidadesPorTurno[m.TurnoID]) {
                modalidadesPorTurno[m.TurnoID] = [];
            }
            modalidadesPorTurno[m.TurnoID].push(m.Dia);
        });
    } catch (error) {
        console.error("Error al cargar modalidades:", error);
    }
}

// 1. LIMPIEZA Y RENDERIZADO
function renderizarTurnos(turnos) {
    if (!contenedorTurnos) return;

    // CRUCIAL: Limpiar el contenedor antes de renderizar para que los borrados desaparezcan
    contenedorTurnos.innerHTML = ""; 

    if (turnos.length === 0) {
        contenedorTurnos.innerHTML = `<div class="sin-resultados">No hay turnos registrados.</div>`;
        return;
    }

    let html = `
        <div class="tabla-header" style="grid-template-columns: 2fr 1fr 1.5fr;">
            <span>Horario</span>
            <span>Días / Modalidad</span>
            <span>Acciones</span>
        </div>
        <div id="lista-turnos">
    `;

    turnos.forEach(turno => {
        const horarioMostrar = `${formatearHora(turno.HoraInicio)} - ${formatearHora(turno.HoraFin)}`;
        const diasModalidad = modalidadesPorTurno[turno.TurnoID] || [];
        
        let diasHtml = diasModalidad.length === 0 
            ? '<span style="color: #999; font-style: italic;">Sin días asignados</span>'
            : `<div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${diasModalidad.map(dia => `<span style="background: #e0e7ff; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${dia}</span>`).join('')}
               </div>`;

        html += `
            <div class="fila-estudiante" style="grid-template-columns: 2fr 1fr 1.5fr; display: grid; align-items: center;">
                <div class="info-izquierda">
                    <div class="avatar-estudiante">⏰</div>
                    <span class="nombre-estudiante">${horarioMostrar}</span>
                </div>
                <div>${diasHtml}</div>
                <div class="acciones">
                    <button class="btn-agregar-modalidad" data-id="${turno.TurnoID}" data-horario="${horarioMostrar}">📅 + Modalidad</button>
                    <button class="btn-editar-turno" data-id="${turno.TurnoID}" data-inicio="${turno.HoraInicio}" data-fin="${turno.HoraFin}">✏️ Editar</button>
                    <button class="btn-eliminar-turno" data-id="${turno.TurnoID}">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    contenedorTurnos.innerHTML = html;

    // Volver a asignar los eventos a los nuevos botones creados
    asignarEventosBotones(); 
}

// 2. ELIMINACIÓN ATÓMICA
async function eliminarTurno(id) {
    if (!confirm("¿Estás seguro de eliminar este turno? Esta acción limpiará todas las modalidades y registros asociados.")) return;
    
    try {
        // Enviamos la petición al backend. El controlador se encarga de borrar 
        // en Corresponde, Imparte y Modalidad mediante la transacción SQL.
        const res = await fetch(`${URL_TURNOS}/${id}`, { method: "DELETE" });
        
        if (res.ok) {
            alert("✅ Turno eliminado de la base de datos");
            // Forzamos la recarga de la lista para actualizar el frontend
            await listarTurnos(); 
        } else {
            const error = await res.json();
            alert("❌ Error: " + (error.error || "No se pudo eliminar"));
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("❌ Error de conexión con el servidor");
    }
}

function editarTurno(id, horaInicio, horaFin) {
    editandoTurno = true;
    idEditarTurno = id;
    modalTitleTurno.innerText = "Editar Turno";
    document.getElementById("horaInicio").value = horaInicio;
    document.getElementById("horaFin").value = horaFin;
    modalTurno.style.display = "flex";
}



function filtrarTurnos() {
    const texto = buscadorTurno.value.toLowerCase();
    if (!texto.trim()) {
        renderizarTurnos(turnosOriginales);
        return;
    }
    const filtrados = turnosOriginales.filter(turno => {
        const horario = `${formatearHora(turno.HoraInicio)} - ${formatearHora(turno.HoraFin)}`;
        return horario.toLowerCase().includes(texto);
    });
    renderizarTurnos(filtrados);
}

// ==================== FUNCIONES MODALIDAD ====================
function abrirModalAgregarModalidad(turnoId, horario) {
    turnoSeleccionadoId = turnoId;
    turnoSeleccionadoHorario = horario;
    
    infoTurnoSeleccionado.innerHTML = `
        <strong>Turno seleccionado:</strong> ${horario}<br>
        <small>Seleccione los días en los que se imparte este turno</small>
    `;
    
    // Cargar días ya existentes para este turno
    const diasExistentes = modalidadesPorTurno[turnoId] || [];
    
    // Resetear checkboxes y marcar los existentes
    document.querySelectorAll('#dias input[type="checkbox"]').forEach(cb => {
        cb.checked = diasExistentes.includes(cb.value);
    });
    
    modalAgregarModalidad.style.display = "flex";
}

async function guardarModalidad() {
    if (!turnoSeleccionadoId) {
        alert("No hay turno seleccionado");
        return;
    }
    
    const diasSeleccionados = Array.from(
        document.querySelectorAll('#dias input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    
    if (diasSeleccionados.length === 0) {
        alert("Debe seleccionar al menos un día");
        return;
    }
    
    // Obtener días existentes para no duplicar
    const diasExistentes = modalidadesPorTurno[turnoSeleccionadoId] || [];
    const diasNuevos = diasSeleccionados.filter(dia => !diasExistentes.includes(dia));
    
    if (diasNuevos.length === 0) {
        alert("Todos los días seleccionados ya están registrados para este turno");
        modalAgregarModalidad.style.display = "none";
        return;
    }
    
    try {
        const res = await fetch(URL_MODALIDAD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                TurnoID: turnoSeleccionadoId,
                Dias: diasNuevos
            })
        });
        
        if (res.ok) {
            alert(`✅ Modalidad guardada para los días: ${diasNuevos.join(", ")}`);
            modalAgregarModalidad.style.display = "none";
            
            // Resetear checkboxes
            document.querySelectorAll('#dias input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            // Recargar la lista
            await listarTurnos();
        } else {
            const error = await res.json();
            alert("Error al guardar modalidad: " + (error.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
    }
}

function asignarEventosBotones() {
    // Botones de Agregar Modalidad
    document.querySelectorAll('.btn-agregar-modalidad').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const horario = btn.dataset.horario;
            abrirModalAgregarModalidad(id, horario);
        };
    });

    // Botones de Editar
    document.querySelectorAll('.btn-editar-turno').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const inicio = btn.dataset.inicio;
            const fin = btn.dataset.fin;
            editarTurno(id, inicio, fin);
        };
    });

    // Botones de Eliminar (El que te interesa corregir)
    document.querySelectorAll('.btn-eliminar-turno').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            eliminarTurno(id);
        };
    });
}

function formatearHora(hora) {
    if (!hora) return "";
    if (hora.includes("T")) hora = hora.split("T")[1];
    hora = hora.split('.')[0];
    let [h, m] = hora.split(':');
    h = parseInt(h);
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
}