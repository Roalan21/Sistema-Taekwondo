const URL_EVENTOS = "http://localhost:3000/eventos";

let eventosGlobal = [];
let filtroActual = "vigentes"; // vigentes, caducados

document.addEventListener("DOMContentLoaded", () => {
    listarEventos();

    // Manejo del modal
    const modal = document.getElementById("modalEvento");
    const btnAbrir = document.getElementById("btnAbrirModalEvento");
    const btnCerrar = document.getElementById("cerrarModalEvento");

    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            document.getElementById("modalTituloEvento").innerText = "Nuevo Evento";
            document.getElementById("formEvento").reset();
            document.getElementById("eventoId").value = "";
            modal.style.display = "flex";
        });
    }

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Submit del formulario
    document.getElementById("formEvento").addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("eventoId").value;
        const datos = {
            Nombre: document.getElementById("nombre").value,
            Lugar: document.getElementById("lugar").value,
            Fecha: document.getElementById("fecha").value,
            Precio: parseFloat(document.getElementById("precio").value),
            Descripcion: document.getElementById("descripcion").value
        };

        try {
            if (id) {
                // Editar
                const res = await fetch(`${URL_EVENTOS}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });
                if (res.ok) {
                    alert("✅ Evento actualizado");
                } else {
                    alert("❌ Error al actualizar");
                }
            } else {
                // Crear
                const res = await fetch(URL_EVENTOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });
                if (res.ok) {
                    alert("✅ Evento creado");
                } else {
                    alert("❌ Error al crear");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error al conectar con el servidor");
        }

        modal.style.display = "none";
        listarEventos();
    });

    // Filtros de eventos vigentes/caducados
    document.querySelectorAll("[data-filtro]").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("[data-filtro]").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroActual = btn.dataset.filtro;
            renderizarEventos();
        });
    });

    // Buscador
    const buscador = document.getElementById("buscarEvento");
    if (buscador) {
        buscador.addEventListener("input", () => {
            renderizarEventos();
        });
    }
});

// Función para verificar si un evento está vigente (fecha >= hoy)
function estaVigente(fechaEvento) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaEvento);
    fecha.setHours(0, 0, 0, 0);
    return fecha >= hoy;
}

// Formatear fecha para mostrar
function formatearFecha(fechaIso) {
    if (!fechaIso) return "N/A";
    const fecha = new Date(fechaIso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
}

async function listarEventos() {
    try {
        const res = await fetch(URL_EVENTOS);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        eventosGlobal = await res.json();
        renderizarEventos();
    } catch (error) {
        console.error("Error al listar eventos:", error);
        const contenedor = document.getElementById("contenedor-eventos");
        if (contenedor) {
            contenedor.innerHTML = `<div class="sin-resultados">❌ Error al cargar eventos: ${error.message}</div>`;
        }
    }
}

function renderizarEventos() {
    const contenedor = document.getElementById("contenedor-eventos");
    if (!contenedor) return;

    const busqueda = document.getElementById("buscarEvento")?.value.toLowerCase() || "";

    let eventosFiltrados = [...eventosGlobal];

    // Filtrar por vigencia
    if (filtroActual === "vigentes") {
        eventosFiltrados = eventosFiltrados.filter(e => estaVigente(e.Fecha));
    } else if (filtroActual === "caducados") {
        eventosFiltrados = eventosFiltrados.filter(e => !estaVigente(e.Fecha));
    }

    // Filtrar por búsqueda
    if (busqueda) {
        eventosFiltrados = eventosFiltrados.filter(e =>
            (e.Nombre && e.Nombre.toLowerCase().includes(busqueda)) ||
            (e.Lugar && e.Lugar.toLowerCase().includes(busqueda))
        );
    }

    if (eventosFiltrados.length === 0) {
        contenedor.innerHTML = `<div class="sin-resultados">📭 No hay eventos para mostrar</div>`;
        return;
    }

    contenedor.innerHTML = eventosFiltrados.map(evento => {
        const iniciales = evento.Nombre ? evento.Nombre.substring(0, 2).toUpperCase() : "EV";
        const fechaFormateada = formatearFecha(evento.Fecha);
        const estado = estaVigente(evento.Fecha);
        const estadoClass = estado ? "verde" : "rojo";
        const estadoTexto = estado ? "Vigente" : "Caducado";
        
        return `
            <div class="fila-estudiante" data-id="${evento.EventoID}">
                <div class="info-izquierda">
                    <div class="avatar-estudiante">${iniciales}</div>
                    <div>
                        <div class="nombre-estudiante">${evento.Nombre || "Sin nombre"}</div>
                        <small style="color: #64748b;">${evento.Descripcion || 'Sin descripción'} | <span class="${estadoClass}">${estadoTexto}</span></small>
                    </div>
                </div>
                <div>${evento.Lugar || "N/A"}</div>
                <div>${fechaFormateada}</div>
                <div>$${evento.Precio ? evento.Precio.toFixed(2) : "0.00"}</div>
                <div class="acciones">
                    <button class="btn-editar-evento" data-id="${evento.EventoID}">✏️ Editar</button>
                    <button class="btn-inscribir" data-id="${evento.EventoID}" data-nombre="${evento.Nombre}">👥 Inscribir</button>
                    <button class="btn-eliminar-evento" data-id="${evento.EventoID}">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join("");

    // Event listeners para botones dinámicos
    document.querySelectorAll(".btn-editar-evento").forEach(btn => {
        btn.addEventListener("click", () => editarEvento(btn.dataset.id));
    });

    document.querySelectorAll(".btn-eliminar-evento").forEach(btn => {
        btn.addEventListener("click", () => eliminarEvento(btn.dataset.id));
    });

    document.querySelectorAll(".btn-inscribir").forEach(btn => {
        btn.addEventListener("click", () => {
            const eventoId = btn.dataset.id;
            const eventoTitulo = encodeURIComponent(btn.dataset.nombre);
            window.location.href = `participa.html?eventoId=${eventoId}&eventoTitulo=${eventoTitulo}`;
        });
    });
}

async function editarEvento(id) {
    try {
        const res = await fetch(`${URL_EVENTOS}/${id}`);
        if (!res.ok) throw new Error("Error al obtener el evento");
        const evento = await res.json();

        document.getElementById("modalTituloEvento").innerText = "Editar Evento";
        document.getElementById("eventoId").value = evento.EventoID;
        document.getElementById("nombre").value = evento.Nombre || "";
        document.getElementById("lugar").value = evento.Lugar || "";
        document.getElementById("fecha").value = evento.Fecha ? evento.Fecha.split('T')[0] : '';
        document.getElementById("precio").value = evento.Precio || "";
        document.getElementById("descripcion").value = evento.Descripcion || "";

        document.getElementById("modalEvento").style.display = "flex";
    } catch (error) {
        console.error("Error al editar:", error);
        alert("❌ Error al cargar los datos del evento");
    }
}

async function eliminarEvento(id) {
    if (confirm("⚠️ ¿Estás seguro de eliminar este evento?\nEsta acción eliminará también todas las participaciones asociadas.")) {
        try {
            const res = await fetch(`${URL_EVENTOS}/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("✅ Evento eliminado");
                listarEventos();
            } else {
                alert("❌ Error al eliminar");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("❌ Error al conectar con el servidor");
        }
    }
}