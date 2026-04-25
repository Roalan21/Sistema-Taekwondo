const URL = "http://localhost:3000/eventos";

document.addEventListener("DOMContentLoaded", () => {
    listar();

    document.getElementById("formEvento").addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = {
            Nombre: document.getElementById("nombre").value,
            Lugar: document.getElementById("lugar").value,
            Fecha: document.getElementById("fecha").value,
            Precio: parseFloat(document.getElementById("precio").value),
            Descripcion: document.getElementById("descripcion").value
        };

        await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        alert("Evento creado");
        e.target.reset();
        listar();
    });
});

async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaEventos");
    tabla.innerHTML = "";

    data.forEach(e => {
        tabla.innerHTML += `
            <tr>
                <td>${e.Nombre}</td>
                <td>${e.Lugar}</td>
                <td>${new Date(e.Fecha).toLocaleDateString()}</td>
                <td>${e.Precio}</td>
            </tr>
        `;
    });
}