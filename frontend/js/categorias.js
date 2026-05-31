const URL = "http://localhost:3000/categorias";

let editando = false;
let idEditar = null;

document.addEventListener("DOMContentLoaded", () => {
    listar();
    
    const formCategoria = document.getElementById("formCategoria");
    if (formCategoria) {
        formCategoria.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarCategoria();
        });
    }
});


// LISTAR

async function listar() {
    try {
        const res = await fetch(URL);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const data = await res.json();

        const contenedor = document.getElementById("contenedor-categorias");

        if (data.length === 0) {
            contenedor.innerHTML = `<div class="fila-estudiante" style="justify-content: center;">No hay categorías registradas</div>`;
            return;
        }

        contenedor.innerHTML = data.map(c => `
            <div class="fila-estudiante">

                <div class="info-izquierda">
                    <div class="avatar-estudiante">🏷</div>
                    <span class="nombre-estudiante">${escapeHtml(c.Nombre)}</span>
                </div>

                <div>$${c.Precio}</div>

                <div class="acciones_categoria">
                    <button onclick="editar(${c.CategoriaID}, '${escapeHtml(c.Nombre)}', ${c.Precio})">
                        ✏️ Editar
                    </button>

                    <button onclick="eliminar(${c.CategoriaID})">
                        🗑 Eliminar
                    </button>
                </div>

            </div>
        `).join("");
    } catch (error) {
        console.error("Error al listar categorías:", error);
        document.getElementById("contenedor-categorias").innerHTML = 
            `<div class="fila-estudiante" style="justify-content: center; color: red;">
                Error al cargar las categorías. Verifica que el servidor esté corriendo.
            </div>`;
    }
}


// MODAL

function abrirModal() {
    document.getElementById("modalCategoria").style.display = "flex";
    document.getElementById("tituloModal").innerText = "Nueva Categoría";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    editando = false;
    idEditar = null;
}

function cerrarModal() {
    document.getElementById("modalCategoria").style.display = "none";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    editando = false;
    idEditar = null;
}


// GUARDAR / EDITAR

async function guardarCategoria() {
    const nombreInput = document.getElementById("nombre");
    const precioInput = document.getElementById("precio");
    
    const nombre = nombreInput.value.trim();
    const precio = parseFloat(precioInput.value);
    
    // Validaciones
    if (!nombre) {
        alertaAdvertencia("Por favor, ingrese el nombre de la categoría");
        nombreInput.focus();
        return;
    }
    
    if (isNaN(precio) || precio <= 0) {
        alertaAdvertencia("Por favor, ingrese un precio válido mayor a 0");
        precioInput.focus();
        return;
    }

    const datos = {
        Nombre: nombre,
        Precio: precio
    };

    let metodo = "POST";
    let url = URL;

    if (editando) {
        metodo = "PUT";
        url = `${URL}/${idEditar}`;
    }

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alertaExito(editando ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
            cerrarModal();
            listar();
        } else {
            const error = await res.json();
            alertaError(`Error: ${error.error || "No se pudo guardar la categoría"}`);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        alertaError("Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000");
    }
}


// EDITAR

function editar(id, nombre, precio) {
    editando = true;
    idEditar = id;

    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;

    document.getElementById("tituloModal").innerText = "Editar Categoría";

    abrirModal();
}


// ELIMINAR

async function eliminar(id) {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
        const res = await fetch(`${URL}/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            alertaExito("Categoría eliminada correctamente");
            listar();
        } else {
            const error = await res.json();
            alertaError(`Error: ${error.error || "No se pudo eliminar la categoría"}`);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alertaError("Error de conexión. Verifica que el servidor esté corriendo");
    }
}


// BUSCAR

function filtrarCategorias() {
    const input = document.getElementById("buscarCategoria").value.toLowerCase();
    const filas = document.querySelectorAll(".fila-estudiante");

    filas.forEach(fila => {
        const nombreElement = fila.querySelector(".nombre-estudiante");
        if (nombreElement) {
            const nombre = nombreElement.textContent.toLowerCase();
            fila.style.display = nombre.includes(input) ? "flex" : "none";
        }
    });
}


// FUNCIÓN AUXILIAR PARA ESCAPAR HTML

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cerrar modal si se hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById("modalCategoria");
    if (event.target === modal) {
        cerrarModal();
    }
}