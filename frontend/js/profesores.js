const URL_BASE = 'http://localhost:3000';

let editando = false;
let profesorIdEditar = null;
let filtroActual = 'activos';
let profesoresOriginales = [];

let profesorSeleccionadoId = null;
let profesorSeleccionadoNombre = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Página cargada, iniciando...");
    listarProfesores();

    // Eventos de filtros
    const btnActivos = document.getElementById('btnActivos');
    const btnInactivos = document.getElementById('btnInactivos');
    
    if (btnActivos) {
        btnActivos.addEventListener('click', () => {
            filtroActual = 'activos';
            btnActivos.classList.add('active');
            btnInactivos.classList.remove('active');
            filtrarProfesores();
        });
    }
    
    if (btnInactivos) {
        btnInactivos.addEventListener('click', () => {
            filtroActual = 'inactivos';
            btnInactivos.classList.add('active');
            btnActivos.classList.remove('active');
            filtrarProfesores();
        });
    }

    const buscador = document.getElementById('buscadorProfesor');
    if (buscador) {
        buscador.addEventListener('input', filtrarProfesores);
    }

    const btnNuevo = document.getElementById('btnNuevoProfesor');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            editando = false;
            profesorIdEditar = null;
            document.getElementById('modalTitleProfesor').innerText = "Nuevo Profesor";
            document.getElementById('formProfesorModal').reset();
            document.getElementById('modalProfesor').style.display = "flex";
        });
    }

    // Cerrar modales
    const cerrarModal = document.getElementById('cerrarModalProfesor');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => {
            document.getElementById('modalProfesor').style.display = "none";
        });
    }
    
    const cerrarAsignar = document.getElementById('cerrarModalAsignarTurno');
    if (cerrarAsignar) {
        cerrarAsignar.addEventListener('click', () => {
            document.getElementById('modalAsignarTurno').style.display = "none";
        });
    }
    
    const cerrarExpediente = document.getElementById('cerrarModalExpediente');
    if (cerrarExpediente) {
        cerrarExpediente.addEventListener('click', () => {
            document.getElementById('modalExpediente').style.display = "none";
        });
    }

    const formProfesor = document.getElementById('formProfesorModal');
    if (formProfesor) {
        formProfesor.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const datos = {
                PrimerNombre: document.getElementById('pNombre').value,
                SegundoNombre: document.getElementById('sNombre').value,
                PrimerApellido: document.getElementById('pApellido').value,
                SegundoApellido: document.getElementById('sApellido').value,
                FechaNacimiento: document.getElementById('fNac').value
            };

            try {
                let url = `${URL_BASE}/profesores`;
                let method = 'POST';

                if (editando) {
                    url = `${URL_BASE}/profesores/${profesorIdEditar}`;
                    method = 'PUT';
                } else {
                    datos.FechaContratacion = document.getElementById('fCon').value;
                }

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (res.ok) {
                    alertaExito(editando ? "✅ Profesor actualizado" : "✅ Profesor registrado");
                    document.getElementById('modalProfesor').style.display = "none";
                    editando = false;
                    profesorIdEditar = null;
                    formProfesor.reset();
                    await listarProfesores();
                } else {
                    const error = await res.json();
                    alertaError("❌ Error: " + (error.error || "Error desconocido"));
                }
            } catch (error) {
                console.error("Error:", error);
                alertaError("❌ Error de conexión");
            }
        });
    }

    const formAsignar = document.getElementById('formAsignarTurno');
    if (formAsignar) {
        formAsignar.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarAsignacionTurno();
        });
    }

    window.addEventListener('click', (e) => {
        const modalProfesor = document.getElementById('modalProfesor');
        const modalAsignar = document.getElementById('modalAsignarTurno');
        const modalExpediente = document.getElementById('modalExpediente');
        if (e.target === modalProfesor) {
            modalProfesor.style.display = "none";
        }
        if (e.target === modalAsignar) {
            modalAsignar.style.display = "none";
        }
        if (e.target === modalExpediente) {
            modalExpediente.style.display = "none";
        }
    });
});

async function listarProfesores() {
    try {
        console.log("📡 Cargando lista de profesores...");
        
        let res = await fetch(`${URL_BASE}/profesores/todos`);
        
        if (!res.ok) {
            console.log("⚠️ Ruta /todos no encontrada, usando /profesores");
            res = await fetch(`${URL_BASE}/profesores`);
            const activos = await res.json();
            
            try {
                const resInactivos = await fetch(`${URL_BASE}/profesores/inactivos`);
                if (resInactivos.ok) {
                    const inactivos = await resInactivos.json();
                    profesoresOriginales = [...activos, ...inactivos];
                } else {
                    profesoresOriginales = activos;
                }
            } catch {
                profesoresOriginales = activos;
            }
        } else {
            profesoresOriginales = await res.json();
        }
        
        console.log("✅ Profesores cargados:", profesoresOriginales.length);
        filtrarProfesores();
    } catch (error) {
        console.error("❌ Error al listar profesores:", error);
        const contenedor = document.getElementById('contenedor-profesores');
        if (contenedor) {
            contenedor.innerHTML = `<div class="sin-resultados" style="color: red;">❌ Error al cargar profesores: ${error.message}</div>`;
        }
    }
}

function filtrarProfesores() {
    const busqueda = document.getElementById('buscadorProfesor')?.value.toLowerCase() || '';
    
    let filtrados = profesoresOriginales.filter(p => {
        if (filtroActual === 'activos' && p.Estado !== 1 && p.Estado !== true) return false;
        if (filtroActual === 'inactivos' && p.Estado !== 0 && p.Estado !== false) return false;
        
        const nombreCompleto = `${p.PrimerNombre} ${p.SegundoNombre || ''} ${p.PrimerApellido} ${p.SegundoApellido || ''}`.toLowerCase();
        return nombreCompleto.includes(busqueda);
    });
    
    console.log(`Filtrados: ${filtrados.length} profesores (${filtroActual})`);
    renderizarProfesores(filtrados);
}

async function renderizarProfesores(profesores) {
    const contenedor = document.getElementById('contenedor-profesores');
    
    if (!contenedor) {
        console.error("No se encontró el contenedor 'contenedor-profesores'");
        return;
    }
    
    if (profesores.length === 0) {
        contenedor.innerHTML = `<div class="sin-resultados">No hay profesores ${filtroActual === 'activos' ? 'activos' : 'inactivos'}.</div>`;
        return;
    }
    
    // Cargar asignaciones
    const asignaciones = await obtenerAsignacionesProfesores();
    
    let html = `
        <div class="tabla-header-profesores" style="grid-template-columns: 2fr 1.5fr 1.5fr;">
            <span>Profesor</span>
            <span>Turnos Asignados</span>
            <span>Acciones</span>
        </div>
        <div id="lista-profesores">
    `;
    
    for (const p of profesores) {
        // Construir nombre completo
        const nombreCompleto = `${p.PrimerNombre || ''} ${p.SegundoNombre || ''} ${p.PrimerApellido || ''} ${p.SegundoApellido || ''}`.trim();
        const iniciales = nombreCompleto.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        // Obtener turnos del profesor
        const turnosProfesor = asignaciones.filter(a => 
            (a.ProfesorID == p.ProfesorID) || (a.profesorid == p.ProfesorID)
        );
        let turnosHtml = '';
        
        if (turnosProfesor.length === 0) {
            turnosHtml = '<span style="color: #999; font-style: italic;">Sin turnos asignados</span>';
        } else {
            turnosHtml = `<div style="display: flex; flex-direction: column; gap: 8px;">`;
            turnosProfesor.forEach(t => {
                const horaInicio = t.HoraInicio || '';
                const horaFin = t.HoraFin || '';
                turnosHtml += `<div style="background: #e0e7ff; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem;">
                    <strong>${formatearHora(horaInicio)} - ${formatearHora(horaFin)}</strong><br>
                    ${t.TipoDeClase ? `📋 ${t.TipoDeClase}` : '📋 Sin tipo'}
                </div>`;
            });
            turnosHtml += `</div>`;
        }
        
        const estadoActivo = (p.Estado === 1 || p.Estado === true);
        
        html += `
    <div class="fila-estudiante" style="grid-template-columns: 2fr 1.5fr 1.5fr; display: grid; align-items: start;">
        <div class="info-izquierda">
            <div class="avatar-estudiante">${iniciales || '??'}</div>
            <div>
                <span class="nombre-estudiante">${nombreCompleto || 'Nombre no disponible'}</span>
                <div style="font-size: 0.7rem; color: ${estadoActivo ? '#22c55e' : '#ef4444'}; margin-top: 4px;">
                    ${estadoActivo ? '<i class="fa-solid fa-circle"></i> Activo' : '<i class="fa-solid fa-circle"></i> Inactivo'}
                </div>
            </div>
        </div>
        <div>
            ${turnosHtml}
        </div>
        <div class="acciones" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="btn-ver-expediente" data-id='${JSON.stringify(p)}'>
                <i class="fa-solid fa-eye"></i> Visualizar
            </button>
            ${estadoActivo ? `
            <button class="btn-asignar-turno"
                data-id="${p.ProfesorID}"
                data-nombre="${nombreCompleto.replace(/'/g, "\\'")}">
                <i class="fa-solid fa-calendar-plus"></i> Asignar Turno
            </button>
            ` : ''}
            <button class="btn-editar-profesor" data-id='${JSON.stringify(p)}'>
                <i class="fa-solid fa-pencil"></i> Editar
            </button>
`;

// Para los botones de inactivar/reactivar más abajo:
if (estadoActivo) {
    html += `<button class="btn-inactivar" data-id="${p.ProfesorID}" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
        <i class="fa-solid fa-user-slash"></i> Inactivar
    </button>`;
} else {
    html += `<button class="btn-reactivar" data-id="${p.ProfesorID}" style="background: #22c55e; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
        <i class="fa-solid fa-user-check"></i> Reactivar
    </button>`;
}

html += `
        </div>
    </div>
`;
    }
    
    html += `</div>`;
    contenedor.innerHTML = html;
    
    // Agregar event listeners
    document.querySelectorAll('.btn-editar-profesor').forEach(btn => {
        btn.addEventListener('click', () => {
            const profesor = JSON.parse(btn.dataset.id);
            cargarParaEditar(profesor);
        });
    });
    
    document.querySelectorAll('.btn-ver-expediente').forEach(btn => {
        btn.addEventListener('click', () => {
            const profesor = JSON.parse(btn.dataset.id);
            mostrarExpediente(profesor);
        });
    });
    
    document.querySelectorAll('.btn-inactivar').forEach(btn => {
        btn.addEventListener('click', () => {
            inactivarProfesor(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.btn-reactivar').forEach(btn => {
        btn.addEventListener('click', () => {
            reactivarProfesor(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.btn-asignar-turno').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            abrirModalAsignarTurno(id, nombre);
        });
    });
}

async function obtenerAsignacionesProfesores() {
    try {
        const res = await fetch(`${URL_BASE}/imparte`); // <-- VERIFICA ESTA RUTA
        if (res.ok) {
            const data = await res.json();
            console.log("Asignaciones detectadas:", data); // Para ver qué trae
            return data;
        }
    } catch (error) {
        console.error("Error al obtener asignaciones:", error);
    }
    return [];
}

// Función para mostrar el expediente del profesor (similar a estudiantes)
// Función para mostrar el expediente del profesor (diseño HORIZONTAL)
async function mostrarExpediente(profesor) {
    // Obtener asignaciones del profesor
    const asignaciones = await obtenerAsignacionesProfesores();
    const turnosProfesor = asignaciones.filter(a =>
        Number(a.ProfesorID) === Number(profesor.ProfesorID)
    );
    
    const nombreCompleto = `${profesor.PrimerNombre || ''} ${profesor.SegundoNombre || ''} ${profesor.PrimerApellido || ''} ${profesor.SegundoApellido || ''}`.trim();
    const iniciales = nombreCompleto.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    // Formatear fechas
    const fechaNac = profesor.FechaNacimiento ? new Date(profesor.FechaNacimiento).toLocaleDateString() : 'No registrada';
    const fechaCont = profesor.FechaContratacion ? new Date(profesor.FechaContratacion).toLocaleDateString() : 'No registrada';
    const estado = (profesor.Estado === 1 || profesor.Estado === true) ? 'Activo' : 'Inactivo';
    const estadoColor = (profesor.Estado === 1 || profesor.Estado === true) ? '#22c55e' : '#ef4444';
    
    // Calcular edad
    let edad = 'No disponible';
    if (profesor.FechaNacimiento) {
        const hoy = new Date();
        const nac = new Date(profesor.FechaNacimiento);
        let edadCalculada = hoy.getFullYear() - nac.getFullYear();
        const mes = hoy.getMonth() - nac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
            edadCalculada--;
        }
        edad = `${edadCalculada} años`;
    }
    
    // Calcular años de antigüedad
    let antiguedad = 'No disponible';
    if (profesor.FechaContratacion) {
        const hoy = new Date();
        const contrato = new Date(profesor.FechaContratacion);
        let años = hoy.getFullYear() - contrato.getFullYear();
        const mes = hoy.getMonth() - contrato.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < contrato.getDate())) {
            años--;
        }
        antiguedad = `${años} años`;
    }
    
    // Generar HTML para los turnos asignados
    let turnosHtml = '';
    if (turnosProfesor.length === 0) {
        turnosHtml = '<p style="color: #64748b; margin: 0;">Sin turnos asignados</p>';
    } else {
        turnosHtml = '<div style="display: flex; flex-direction: column; gap: 8px;">';
        turnosProfesor.forEach(t => {
            turnosHtml += `
                <div style="background: #f0fdf4; padding: 8px 12px; border-radius: 8px;">
                    <strong>⏰ ${formatearHora(t.HoraInicio)} - ${formatearHora(t.HoraFin)}</strong><br>
                    📋 ${t.TipoDeClase || 'No especificado'}
                    <br><br>

                    <button
                        onclick="eliminarAsignacion(
                            ${t.ProfesorID},
                            ${t.TurnoID}
                        )"
                        style="
                            background:#ef4444;
                            color:white;
                            border:none;
                            padding:5px 10px;
                            border-radius:5px;
                            cursor:pointer;
                        "
                    >
                        🗑️ Quitar
                    </button>
                </div>

            `;
        });
        turnosHtml += '</div>';
    }

    
    
    // Expediente con diseño HORIZONTAL (usando grid de 2 columnas)
    const expedienteHtml = `
        <div class="top-expediente" style="margin-bottom: 20px;">
            <div class="icono-expediente" style="width: 70px; height: 70px; font-size: 30px;">${iniciales}</div>
            <div class="info-principal">
                <h2 style="margin: 0 0 5px 0; font-size: 1.8rem;">${nombreCompleto}</h2>
                <h3 style="margin: 0 0 8px 0; font-size: 1rem; color: #2563eb;">Profesor de Taekwondo</h3>
                <span class="badge-cinta" style="background: ${estadoColor}20; color: ${estadoColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">${estado}</span>
            </div>
        </div>
        
        <!-- Grid horizontal de 2 columnas -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Tarjeta Información Personal -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 1rem;">📋 Información Personal</h4>
                <p style="margin: 8px 0;"><strong>Nombre completo:</strong><br>${nombreCompleto}</p>
                <p style="margin: 8px 0;"><strong>Fecha de nacimiento:</strong><br>${fechaNac}</p>
                <p style="margin: 8px 0;"><strong>Edad:</strong><br>${edad}</p>
            </div>
            
            <!-- Tarjeta Información Laboral -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 1rem;">🏢 Información Laboral</h4>
                <p style="margin: 8px 0;"><strong>Fecha de contratación:</strong><br>${fechaCont}</p>
                <p style="margin: 8px 0;"><strong>Antigüedad:</strong><br>${antiguedad}</p>
                <p style="margin: 8px 0;"><strong>Estado:</strong><br><span style="color: ${estadoColor};">${estado}</span></p>
            </div>
        </div>
        
        <!-- Tarjeta de Turnos Asignados (ocupa todo el ancho) -->
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 1rem;">📅 Turnos Asignados</h4>
            ${turnosHtml}
        </div>
        
        <div style="text-align: center;">
            <button class="btn-cerrar-modal" onclick="document.getElementById('modalExpediente').style.display = 'none';" style="background: #ef4444; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Cerrar
            </button>
        </div>
    `;
    
    document.getElementById('contenidoExpediente').innerHTML = expedienteHtml;
    document.getElementById('modalExpediente').style.display = "flex";
}
async function eliminarAsignacion(
    profesorId,
    turnoId
) {

    const result = await alertaConfirmacion(
        "¿Desea quitar este turno?"
    );

    if (!result.isConfirmed) return;

    const res = await fetch(
        `${URL_BASE}/imparte/${profesorId}/${turnoId}`,
        {
            method: "DELETE"
        }
    );

    if (res.ok) {

        alertaExito(
            "✅ Asignación eliminada"
        );

        // Recargar lista
        await listarProfesores();

        // Buscar nuevamente el profesor
        const profesor = profesoresOriginales.find(
            p => Number(p.ProfesorID) === Number(profesorId)
        );

        if (profesor) {
            await mostrarExpediente(profesor);
        }

    } else {

        alertaError(
            "❌ No se pudo eliminar"
        );
    }
}

function cargarParaEditar(p) {
    editando = true;
    profesorIdEditar = p.ProfesorID;
    
    document.getElementById('pNombre').value = p.PrimerNombre || '';
    document.getElementById('sNombre').value = p.SegundoNombre || '';
    document.getElementById('pApellido').value = p.PrimerApellido || '';
    document.getElementById('sApellido').value = p.SegundoApellido || '';
    
    if (p.FechaNacimiento) {
        document.getElementById('fNac').value = new Date(p.FechaNacimiento).toISOString().split('T')[0];
    }
    if (p.FechaContratacion) {
        document.getElementById('fCon').value = new Date(p.FechaContratacion).toISOString().split('T')[0];
    }
    
    document.getElementById('modalTitleProfesor').innerText = "Editar Profesor";
    document.getElementById('modalProfesor').style.display = "flex";
}

async function inactivarProfesor(id) {
    const result =
        await alertaConfirmacion(
            "¿Seguro que desea inactivar este profesor?"
        );
    if (!result.isConfirmed) return;
    
    try {
        const res = await fetch(`${URL_BASE}/profesores/estado/${id}`, {
            method: 'PATCH'
        });
        
        if (res.ok) {
            alertaExito("🛑 Profesor inactivado");
            await listarProfesores();
        } else {
            alertaError("❌ Error al inactivar");
        }
    } catch (error) {
        console.error("Error:", error);
        alertaError("❌ Error al inactivar");
    }
}

async function reactivarProfesor(id) {
    const result =
        await alertaConfirmacion(
            "¿Seguro que desea reactivar al profesor?"
        );
    if (!result.isConfirmed) return;
    
    try {
        const res = await fetch(`${URL_BASE}/profesores/reactivar/${id}`, {
            method: 'PATCH'
        });
        
        if (res.ok) {
            alertaExito("✅ Profesor reactivado");
            await listarProfesores();
        } else {
            alertaError("❌ Error al reactivar");
        }
    } catch (error) {
        console.error("Error:", error);
        alertaError("❌ Error al reactivar");
    }
}

async function abrirModalAsignarTurno(profesorId, profesorNombre) {
    profesorSeleccionadoId = profesorId;
    profesorSeleccionadoNombre = profesorNombre;
    
    const infoDiv = document.getElementById('infoProfesorAsignar');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <strong>Profesor:</strong> ${profesorNombre}<br>
            <small>Seleccione el turno y tipo de clase que impartirá</small>
        `;
    }
    
    await cargarTurnosDisponibles();
    
    const formAsignar = document.getElementById('formAsignarTurno');
    if (formAsignar) formAsignar.reset();
    
    const modal = document.getElementById('modalAsignarTurno');
    if (modal) modal.style.display = "flex";
}

async function cargarTurnosDisponibles() {
    try {
        const res = await fetch(`${URL_BASE}/turnos`);
        const turnos = await res.json();
        
        const select = document.getElementById('selectTurno');
        if (select) {
            select.innerHTML = '<option value="">-- Seleccione un turno --</option>';
            
            turnos.forEach(turno => {
                const option = document.createElement('option');
                option.value = turno.TurnoID;
                option.textContent = `${formatearHora(turno.HoraInicio)} - ${formatearHora(turno.HoraFin)}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar turnos:", error);
    }
}

async function guardarAsignacionTurno() {
    const turnoId = document.getElementById('selectTurno')?.value;
    const tipoClase = document.getElementById('tipoClase')?.value;
    
    if (!turnoId) {
        alertaAdvertencia("Debe seleccionar un turno");
        return;
    }
    
    if (!tipoClase || !tipoClase.trim()) {
        alertaAdvertencia("Debe especificar el tipo de clase");
        return;
    }
    
    try {
        const res = await fetch(`${URL_BASE}/imparte`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ProfesorID: profesorSeleccionadoId,
                TurnoID: parseInt(turnoId),
                TipoDeClase: tipoClase
            })
        });
        
        if (res.ok) {
            alertaExito(`✅ Turno asignado correctamente al profesor ${profesorSeleccionadoNombre}`);
            const modal = document.getElementById('modalAsignarTurno');
            if (modal) modal.style.display = "none";
            await listarProfesores();
        } else {
            const error = await res.json();
            alertaError("❌ Error al asignar turno: " + (error.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error:", error);
        alertaError("❌ Error al asignar turno");
    }
}

function formatearHora(hora) {
    if (!hora) return "";
    let horaStr = hora.toString();
    if (horaStr.includes("T")) horaStr = horaStr.split("T")[1];
    horaStr = horaStr.split('.')[0];
    let [h, m] = horaStr.split(':');
    h = parseInt(h);
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
}