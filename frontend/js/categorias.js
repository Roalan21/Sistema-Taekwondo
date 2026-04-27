const URL = "http://localhost:3000/categorias";

let editando = false;
let idEditar = null;

document.addEventListener("DOMContentLoaded", listar);

// =========================
// LISTAR
// =========================
async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const contenedor = document.getElementById("contenedor-categorias");

    contenedor.innerHTML = data.map(c => `
        <div class="fila-estudiante">

            <div class="info-izquierda">
                <div class="avatar-estudiante">🏷</div>
                <span class="nombre-estudiante">${c.Nombre}</span>
            </div>

            <div>$${c.Precio}</div>

            <div class="acciones_categoria">
                <button onclick="editar(${c.CategoriaID}, '${c.Nombre}', ${c.Precio})">
                    ✏️ Editar
                </button>

                <button onclick="eliminar(${c.CategoriaID})">
                    🗑 Eliminar
                </button>
            </div>

        </div>
    `).join("");
}

// =========================
// MODAL
// =========================
function abrirModal() {
    document.getElementById("modalCategoria").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalCategoria").style.display = "none";

    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";

    editando = false;
}

// =========================
// GUARDAR / EDITAR
// =========================
async function guardarCategoria() {

    const datos = {
        Nombre: document.getElementById("nombre").value,
        Precio: parseFloat(document.getElementById("precio").value)
    };

    let metodo = "POST";
    let url = URL;

    if (editando) {
        metodo = "PUT";
        url = `${URL}/${idEditar}`;
    }

    const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        alert(editando ? "Actualizado" : "Creado");

        cerrarModal();
        listar();
    }
}

// =========================
// EDITAR
// =========================
function editar(id, nombre, precio) {
    editando = true;
    idEditar = id;

    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;

    document.getElementById("tituloModal").innerText = "Editar Categoría";

    abrirModal();
}

// =========================
// ELIMINAR
// =========================
async function eliminar(id) {

    if (!confirm("¿Eliminar categoría?")) return;

    const res = await fetch(`${URL}/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        alert("Eliminado");
        listar();
    }
}

// =========================
// BUSCAR
// =========================
function filtrarCategorias() {

    const input = document.getElementById("buscarCategoria").value.toLowerCase();

    const filas = document.querySelectorAll(".fila-estudiante");

    filas.forEach(fila => {
        const nombre = fila.querySelector(".nombre-estudiante").textContent.toLowerCase();

        fila.style.display = nombre.includes(input) ? "flex" : "none";
    });
}