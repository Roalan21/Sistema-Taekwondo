const URL = "http://localhost:3000/imparte";

document.addEventListener("DOMContentLoaded", () => {
    cargarProfesores();
    cargarTurnos();
    listar();

    document.getElementById("formImparte").addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = {
            ProfesorID: document.getElementById("profesor").value,
            TurnoID: document.getElementById("turno").value,
            TipoDeClase: document.getElementById("tipoClase").value
        };

        const res = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("Asignado correctamente");
            listar();
        }
    });
});

// 🔹 CARGAR PROFESORES
async function cargarProfesores() {
    const res = await fetch("http://localhost:3000/profesores");
    const data = await res.json();

    const select = document.getElementById("profesor");

    data.forEach(p => {
        select.innerHTML += `<option value="${p.ProfesorID}">
            ${p.PrimerNombre} ${p.PrimerApellido}
        </option>`;
    });
}

// 🔹 CARGAR TURNOS
async function cargarTurnos() {
    const res = await fetch("http://localhost:3000/turnos");
    const data = await res.json();

    const select = document.getElementById("turno");

    data.forEach(t => {
        select.innerHTML += `<option value="${t.TurnoID}">
            ${formatearHora(t.HoraInicio)} - ${formatearHora(t.HoraFin)}
        </option>`;
    });
}

// 🔹 LISTAR
async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaImparte");
    tabla.innerHTML = "";

    data.forEach(i => {
        tabla.innerHTML += `
            <tr>
                <td>${i.Profesor}</td>
                <td>${formatearHora(i.HoraInicio)} - ${formatearHora(i.HoraFin)}</td>
                <td>${i.TipoDeClase}</td>
                <td>${new Date(i.FechaRegistro).toLocaleDateString()}</td>
                <td>
                    <button onclick="eliminar(${i.ImparteID})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 🔹 ELIMINAR
async function eliminar(id) {
    if (!confirm("¿Eliminar asignación?")) return;

    await fetch(`${URL}/${id}`, { method: "DELETE" });
    listar();
}

function formatearHora(hora) {
    if (!hora) return "";

    // 🔥 Si viene como Date completo (con T)
    if (hora.includes("T")) {
        hora = hora.split("T")[1];
    }

    // 🔥 quitar milisegundos
    hora = hora.split('.')[0];

    let [h, m] = hora.split(':');

    h = parseInt(h);

    let ampm = h >= 12 ? 'PM' : 'AM';

    h = h % 12;
    if (h === 0) h = 12;

    return `${h}:${m} ${ampm}`;
}