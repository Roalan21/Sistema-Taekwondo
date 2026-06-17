const URL_PARTICIPA = `${window.location.origin}/participa`;
const URL_ESTUDIANTES = `${window.location.origin}/estudiantes`;
const URL_EVENTOS = `${window.location.origin}/eventos`;

let eventoSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Obtener parámetros de URL (si viene desde eventos.html)
    const urlParams = new URLSearchParams(window.location.search);
    const modo = urlParams.get("modo");
    const eventoId = urlParams.get('eventoId');
    const eventoTitulo = urlParams.get('eventoTitulo');
    const formulario = document.querySelector(".card-form");
    // Cargar selects
    await cargarEstudiantes();
    await cargarEventos();

    if (modo === "participantes") {
        formulario.style.display = "none";

        document.getElementById("infoEvento").innerHTML =
            `🏆 Participantes del evento: <strong>${decodeURIComponent(eventoTitulo || '')}</strong>`;
    }

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

        if (!estudianteId || !eventoId) {
            alertaAdvertencia("Seleccione un estudiante y un evento");
            return;
        }

        // Verificar si ya existe la inscripción
        const resVerif = await fetch(`${URL_PARTICIPA}/verificar?estudiante=${estudianteId}&evento=${eventoId}`);
        const existe = await resVerif.json();

        if (existe.existe) {
            alertaAdvertencia("⚠️ Este estudiante ya está registrado en este evento");
            return;
        }
        // Redirigir a pagos antes de registrar
        window.location.href =
            `pagos.html?modo=evento&estudiante=${estudianteId}&evento=${eventoId}`;
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
            const nombreCompleto = `${e.Nombres} ${e.Apellidos}`;
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

        console.log(participaciones);

        const contenedor =
            document.getElementById("contenedor-participaciones");

        // VALIDAR ARRAY
        if (!Array.isArray(participaciones)) {

            contenedor.innerHTML = `
                <div class="sin-resultados">
                    Error al cargar participantes
                </div>
            `;

            return;
        }

        // SIN PARTICIPANTES
        if (participaciones.length === 0) {

            contenedor.innerHTML = `
                <div class="sin-resultados">
                    No hay estudiantes inscritos en este evento
                </div>
            `;

            return;
        }

        // RENDER
        contenedor.innerHTML = participaciones.map(p => {

            let resultadoDisplay = '';

            if (p.Resultado === 'Oro')
                resultadoDisplay = '🥇 Oro';

            else if (p.Resultado === 'Plata')
                resultadoDisplay = '🥈 Plata';

            else if (p.Resultado === 'Bronce')
                resultadoDisplay = '🥉 Bronce';

            else if (p.Resultado === 'Participación')
                resultadoDisplay = '📋 Participación';

            else
                resultadoDisplay = '❌ Sin resultado';

            const asistenciaDisplay =
                p.Asistencia
                    ? '✅ Asistió'
                    : '❌ No asistió';

            return `
                <div class="fila-estudiante">

                    <div class="info-izquierda">

                        <div class="avatar-estudiante">
                            👤
                        </div>

                        <div>

                            <div class="nombre-estudiante">
                                ${p.Estudiante}
                            </div>

                            <small style="color: #64748b;">
                                ID: ${p.EstudianteID}
                            </small>

                        </div>

                    </div>

                    <div>${p.Evento}</div>

                    <div>
                        ${formatearFechaLocal(p.FechaRegistro)}
                    </div>

                    <div>
                        <select class="select-asistencia"
                            data-id="${p.ParticipaID}">

                            <option value="1"
                                ${p.Asistencia ? "selected" : ""}>
                                ✅ Asistió
                            </option>

                            <option value="0"
                                ${!p.Asistencia ? "selected" : ""}>
                                ❌ No asistió
                            </option>

                        </select>
                    </div>

                    <div>
                        <select class="select-resultado"
                            data-id="${p.ParticipaID}">

                            <option value=""
                                ${!p.Resultado ? "selected" : ""}>
                                Sin resultado
                            </option>

                            <option value="Oro"
                                ${p.Resultado === "Oro" ? "selected" : ""}>
                                🥇 Oro
                            </option>

                            <option value="Plata"
                                ${p.Resultado === "Plata" ? "selected" : ""}>
                                🥈 Plata
                            </option>

                            <option value="Bronce"
                                ${p.Resultado === "Bronce" ? "selected" : ""}>
                                🥉 Bronce
                            </option>

                            <option value="Participación"
                                ${p.Resultado === "Participación" ? "selected" : ""}>
                                📋 Participación
                            </option>

                        </select>
                    </div>

                    <div class="acciones">

                        <button
                            class="btn-guardar"
                            onclick="guardarParticipacion(${p.ParticipaID})"
                        >
                            💾 Guardar
                        </button>

                        <button
                            class="btn-eliminar"
                            data-id="${p.ParticipaID}"
                            data-estudiante="${p.Estudiante}"
                        >
                            🗑️ Eliminar
                        </button>

                    </div>

                </div>
            `;

        }).join("");

        // BOTONES ELIMINAR
        document.querySelectorAll(".btn-eliminar")
            .forEach(btn => {

            btn.addEventListener("click", async () => {

                const id = btn.dataset.id;

                const estudiante =
                    btn.dataset.estudiante;
                const result =
                    await alertaConfirmacion(
                        "¿Eliminar la inscripción de ${estudiante}?"
                    );
                if (result.isConfirmed)
                {

                    await fetch(
                        `${URL_PARTICIPA}/${id}`,
                        { method: "DELETE" }
                    );

                    alertaExito("Inscripción eliminada");

                    cargarParticipaciones(eventoSeleccionado);
                }
            });
        });

        
       

    } catch (error) {

        console.error(
            "Error cargando participaciones:",
            error
        );

        document.getElementById(
            "contenedor-participaciones"
        ).innerHTML = `
            <div class="sin-resultados">
                Error al cargar participantes
            </div>
        `;
    }
}

async function guardarParticipacion(id) {

    try {

        const fila =
            document.querySelector(
                `.select-asistencia[data-id="${id}"]`
            ).closest(".fila-estudiante");

        const asistencia =
            fila.querySelector(".select-asistencia").value;

        const resultado =
            fila.querySelector(".select-resultado").value;

        const res = await fetch(
            `${URL_PARTICIPA}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    Asistencia: parseInt(asistencia),

                    Resultado: resultado
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {

            throw new Error(
                data.error || "Error actualizando"
            );
        }

        alertaExito("✅ Participación actualizada");

    } catch (error) {

        console.error(error);

        alertaError("❌ " + error.message);
    }
}
window.guardarParticipacion = guardarParticipacion;

// Función auxiliar para formatear fecha
function formatearFechaLocal(fechaIso) {
    if (!fechaIso) return "N/A";
    const fecha = new Date(fechaIso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
}