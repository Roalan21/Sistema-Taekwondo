const URL = "http://localhost:3000/categorias";

let editando = false;
let idEditar = null;

document.addEventListener("DOMContentLoaded", () => {
    listar();

    document.getElementById("formCategoria").addEventListener("submit", async (e) => {
        e.preventDefault();

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

            editando = false;
            idEditar = null;

            document.getElementById("formCategoria").reset();
            listar();
        }
    });
});

async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaCategorias");
    tabla.innerHTML = "";

    data.forEach(c => {
        tabla.innerHTML += `
            <tr>
                <td>${c.Nombre}</td>
                <td>${c.Precio}</td>
                <td>
                    <button onclick="editar(${c.CategoriaID}, '${c.Nombre}', ${c.Precio})">Editar</button>
                </td>
            </tr>
        `;
    });
}

function editar(id, nombre, precio) {
    editando = true;
    idEditar = id;

    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;
}