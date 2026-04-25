const URL = "http://localhost:3000/mensualidades";

document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    listar();

    document.getElementById("formMensualidad").addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = {
            EstudianteID: document.getElementById("estudiante").value,
            Precio: parseFloat(document.getElementById("precio").value),
            FechaLimite: document.getElementById("fecha").value
        };

        await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        alert("Mensualidad creada");
        listar();
    });
});

async function cargarEstudiantes() {
    const res = await fetch("http://localhost:3000/estudiantes");
    const data = await res.json();

    const select = document.getElementById("estudiante");

    data.forEach(e => {
        select.innerHTML += `<option value="${e.EstudianteID}">
            ${e.PrimerNombre} ${e.PrimerApellido}
        </option>`;
    });
}

async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaMensualidad");
    tabla.innerHTML = "";

    data.forEach(m => {
        tabla.innerHTML += `
            <tr>
                <td>${m.Estudiante}</td>
                <td>${m.Precio}</td>
                <td>${new Date(m.FechaLimite).toLocaleDateString()}</td>
            </tr>
        `;
    });
}