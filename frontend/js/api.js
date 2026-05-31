const URL_BASE = "http://localhost:3000";

/* =========================
   FORMATEAR FECHA
========================= */
function formatearFecha(fechaISO) {
    if (!fechaISO) return "N/A";

    const partes = fechaISO.split("T")[0].split("-");

    if (partes.length !== 3) return fechaISO;

    const [year, month, day] = partes;

    return `${day}/${month}/${year}`;
}
/*fromatear hora*/
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

/* =========================
   CARGAR CATEGORÍAS
========================= */
async function cargarCategorias() {
    const select = document.getElementById("CategoriaID");

    if (!select) return;

    try {
        const res = await fetch(`${URL_BASE}/categorias`);
        const data = await res.json();

        select.innerHTML = `
            <option value="">Seleccione Categoría...</option>
            ${data.map(c =>
                `<option value="${c.CategoriaID}">${c.Nombre}</option>`
            ).join("")}
        `;

    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}
/*cargar turnos*/
async function cargarTurnos() {

    const select =
    document.getElementById("TurnoID");

    if (!select) return;

    try {

        const res =
        await fetch(`${URL_BASE}/turnos`);

        const data =
        await res.json();

        select.innerHTML = `
            <option value="">
                Seleccione Turno...
            </option>

            ${data.map(t => `
                <option value="${t.TurnoID}">
                    ${formatearHora(t.HoraInicio)} - ${formatearHora(t.HoraFin)}
                </option>
            `).join("")}
        `;

    } catch (error) {

        console.error(
            "Error cargando turnos:",
            error
        );
    }
}

let estadoActual = 1; // 1 = Activos, 0 = Inactivos

async function cambiarFiltroEstado(nuevoEstado) {
    console.log("Cambiando filtro a:", nuevoEstado); // Para depuración
    estadoActual = nuevoEstado;

    // Quitar active de ambos botones
    const btnActivo = document.querySelector('.activo-verde');
    const btnInactivo = document.querySelector('.inactivo-rojo');
    
    if (btnActivo) btnActivo.classList.remove('active');
    if (btnInactivo) btnInactivo.classList.remove('active');

    // Agregar active al botón seleccionado
    if (nuevoEstado === 1) {
        if (btnActivo) btnActivo.classList.add('active');
    } else {
        if (btnInactivo) btnInactivo.classList.add('active');
    }

    await cargarEstudiantes();
}


/* =========================
   CARGAR ESTUDIANTES
========================= */
async function cargarEstudiantes() {
    const contenedor = document.getElementById('contenedor-estudiantes');
    if (!contenedor) {
        console.error("No se encontró el contenedor de estudiantes");
        return;
    }
    
    try {
        console.log(`Fetching: ${URL_BASE}/estudiantes?estado=${estadoActual}`); // Para depuración
        
        const res = await fetch(`${URL_BASE}/estudiantes?estado=${estadoActual}`);
        
        console.log("Response status:", res.status); // Para depuración
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Datos recibidos del servidor:", data); // Para depuración
        console.log("Cantidad de registros:", data.length); // Para depuración

        if (data.length === 0) {
            contenedor.innerHTML = `<div class="sin-resultados" style="padding: 40px; text-align: center; color: #666;">
                No hay estudiantes ${estadoActual === 1 ? 'activos' : 'inactivos'}
            </div>`;
            return;
        }

        contenedor.innerHTML = data.map(e => {
            const iniciales = `${(e.Nombres || '').charAt(0)}${(e.Apellidos || '').charAt(0)}`.toUpperCase();
            
            // Mostrar el estado para depuración
            console.log(`Estudiante ${e.Nombres} - Estado: ${e.Estado} (tipo: ${typeof e.Estado})`);
            
            const botonEstado = e.Estado == 1
                ? `<button class="btn-baja" onclick="cambiarEstadoEstudiante(${e.EstudianteID}, 0)">🗑 Dar de Baja</button>`
                : `<button class="btn-reactivar" onclick="cambiarEstadoEstudiante(${e.EstudianteID}, 1)">✅ Activar</button>`;

            return `
                <div class="fila-estudiante">
                    <div class="info-izquierda">
                        <div class="avatar-estudiante">${iniciales}</div>
                        <span class="nombre-estudiante">${e.Nombres} ${e.Apellidos}</span>
                    </div>
                    <div class="acciones">
                        <button onclick='verEstudiante(${JSON.stringify(e).replace(/'/g, "&#39;")})'>👁 Visualizar</button>
                        <button onclick="window.location.href='nuevo-estudiante.html?id=${e.EstudianteID}'">✏️ Editar</button>
                        ${botonEstado}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { 
        console.error("Error en cargarEstudiantes:", err);
        contenedor.innerHTML = `<div class="error-carga" style="padding: 40px; text-align: center; color: red;">
            Error al cargar estudiantes: ${err.message}
        </div>`;
    }
}

async function cambiarEstadoEstudiante(id, nuevoEstado) {
    const accion = nuevoEstado === 1 ? "activar" : "inactivar";
    const result =
        await alertaConfirmacion(
            "¿Estás seguro de ${accion} este expediente?"
        );
    if (result.isConfirmed) {
        const res = await fetch(`${URL_BASE}/estudiantes/estado/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Estado: nuevoEstado })
        });
        if (res.ok) {
            alertaExito(`Estudiante ${accion}do con éxito`);
            cargarEstudiantes();
        }
    }
}

/* =========================
   VER DETALLE ESTUDIANTE
========================= */
function verEstudiante(e) {

    const detalle = document.getElementById("detalle-estudiante");

    detalle.innerHTML = `

    <div class="top-expediente">

        <div class="icono-expediente">📋</div>

        <div class="info-principal">
            <h2>Expediente del Estudiante</h2>

            <h3>
                ${e.Nombres} ${e.Apellidos}
            </h3>

            <span class="badge-cinta">
                Cinta: ${e.CintaActual}
            </span>
        </div>

    </div>


    <div class="grid-expediente">

        <div class="card-info">
            <h4>👤 Información Personal</h4>

            <p><strong>Fecha Nacimiento:</strong> ${formatearFecha(e.FechaDeNacimiento)}</p>
            <p><strong>Peso:</strong> ${e.Peso} Lb</p>
            <p><strong>Alergias:</strong> ${e.EnfermedadoAlergia || "Ninguna"}</p>
            <p><strong>Nacionalidad:</strong> ${e.TodasLasNacionalidades}</p>
        </div>

        <div class="card-info">
            <h4>📞 Información de Contacto</h4>

            <p><strong>¿Cómo supo?:</strong> ${e.ComoSupo}</p>
            <p><strong>Teléfonos:</strong> ${e.TodosLosTelefonos}</p>
            <p><strong>Ciudad:</strong> ${e.Ciudad}</p>
            <p><strong>Barrio:</strong> ${e.Barrio} - ${e.Distrito}</p>
        </div>

        <div class="card-info">
            <h4>👨‍👩‍👧 Información Familiar</h4>

            <p><strong>Padre / Madre:</strong>
                ${e.NomMadreOPadre} ${e.ApellMadreOPadre}
            </p>

            <p><strong>Emergencia:</strong>
                ${e.TelefonoDeEmergencia}
            </p>

            <p><strong>Facebook:</strong>
                ${e.FacebookPadreOMadre || "N/A"}
            </p>
        </div>

    </div>


    <div class="grid-mini">

        <div class="mini-card">
            <span>Categoría</span>
            <strong>${e.NombreCategoria}</strong>
        </div>

        <div class="mini-card">
            <span>Fecha Ingreso</span>
            <strong>${formatearFecha(e.FechaDeIngreso)}</strong>
        </div>

        <div class="mini-card">
            <span>Turno</span>

            <strong>
                ${formatearHora(e.HoraInicio) || "N/A"} -
                ${formatearHora(e.HoraFin) || "N/A"}
            </strong>
        </div>

        <div class="mini-card">
            <span>Permite Fotos</span>
            <strong>${e.PermiteFoto ? "Sí" : "No"}</strong>
        </div>

        <div class="mini-card">
            <span>Estado</span>
            <strong class="${e.Estado ? "verde" : "rojo"}">
                ${e.Estado ? "Activo" : "Inactivo"}
            </strong>
        </div>

    </div>


    <div class="footer-modal">
        <button class="btn-cerrar-modal" onclick="cerrarModal()">
            ✖ Cerrar
        </button>
    </div>
    `;

    document.getElementById("modalEstudiante").style.display = "flex";
}

/* =========================
   CERRAR MODAL
========================= */
function cerrarModal() {
    document.getElementById("modalEstudiante").style.display = "none";
}

/* =========================
   CLICK AFUERA DEL MODAL
========================= */
window.onclick = function (event) {

    const modal = document.getElementById("modalEstudiante");

    if (event.target === modal) {
        modal.style.display = "none";
    }
};

/* =========================
   DAR DE BAJA
========================= */
async function eliminarAtleta(id) {

    const confirmar = confirm(
        "¿Estás seguro de inactivar este expediente?"
    );

    if (!confirmar) return;

    try {
        const res = await fetch(
            `${URL_BASE}/estudiantes/estado/${id}`,
            { method: "PATCH" }
        );

        if (res.ok) {
            alert("Atleta inactivado correctamente.");
            cargarEstudiantes();
        }

    } catch (error) {
        console.error(error);
    }
}

/* =========================
   FILTRAR ESTUDIANTES
========================= */
function filtrarEstudiantes() {

    const input =
        document.getElementById("buscarEstudiante");

    const filtro =
        input.value.toLowerCase();

    const filas =
        document.querySelectorAll(".fila-estudiante");

    filas.forEach(fila => {

        const nombre =
            fila.querySelector(".nombre-estudiante")
            .textContent
            .toLowerCase();

        fila.style.display =
            nombre.includes(filtro)
            ? "flex"
            : "none";
    });
}