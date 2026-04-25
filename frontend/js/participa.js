const URL = "http://localhost:3000/participa";

document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    cargarEventos();
    listar();

    document.getElementById("formParticipa").addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = {
            EstudianteID: document.getElementById("estudiante").value,
            EventoID: document.getElementById("evento").value,
            Resultado: document.getElementById("resultado").value
        };

        await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        alert("Registrado");
        listar();
    });
});

// 🔹 cargar estudiantes
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

// 🔹 cargar eventos
async function cargarEventos() {
    const res = await fetch("http://localhost:3000/eventos");
    const data = await res.json();

    const select = document.getElementById("evento");

    data.forEach(e => {
        select.innerHTML += `<option value="${e.EventoID}">
            ${e.Nombre}
        </option>`;
    });
}

// 🔹 listar
async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaParticipa");
    tabla.innerHTML = "";

    data.forEach(p => {
        tabla.innerHTML += `
            <tr>
                <td>${p.Estudiante}</td>
                <td>${p.Evento}</td>
                <td>${p.Resultado}</td>
            </tr>
        `;
    });
}