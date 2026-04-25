const URL_MODALIDAD = "http://localhost:3000/modalidades";
const URL_TURNOS = "http://localhost:3000/turnos";

document.addEventListener("DOMContentLoaded", () => {
    cargarTurnos();
    listar();

    document.getElementById("formModalidad").addEventListener("submit", guardar);
});

// 🔥 CARGAR TURNOS
async function cargarTurnos() {
    const res = await fetch(URL_TURNOS);
    const data = await res.json();

    const select = document.getElementById("turno");

    select.innerHTML = '<option value="">Seleccione Turno</option>';

    data.forEach(t => {
        select.innerHTML += `
            <option value="${t.TurnoID}">
                ${formatearHora(t.HoraInicio)} - ${formatearHora(t.HoraFin)}
            </option>
        `;
    });
}

// 🔥 GUARDAR MULTIPLE
async function guardar(e) {
    e.preventDefault();

    const turnoID = document.getElementById("turno").value;

    const dias = Array.from(
        document.querySelectorAll('#dias input[type="checkbox"]:checked')
    ).map(d => d.value);

    if (!turnoID) {
        alert("Seleccione un turno");
        return;
    }

    if (dias.length === 0) {
        alert("Seleccione al menos un día");
        return;
    }

    const res = await fetch(URL_MODALIDAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            TurnoID: turnoID,
            Dias: dias
        })
    });

    if (res.ok) {
        alert("Modalidades guardadas 🔥");

        document.getElementById("formModalidad").reset();
        listar();
    }
}

// 🔥 LISTAR
async function listar() {
    const res = await fetch(URL_MODALIDAD);
    const data = await res.json();

    const tabla = document.getElementById("tablaModalidad");
    tabla.innerHTML = "";

    data.forEach(m => {
        tabla.innerHTML += `
            <tr>
                <td>${m.Dia}</td>
                <td>${formatearHora(m.HoraInicio)} - ${formatearHora(m.HoraFin)}</td>
                <td>
                    <button onclick="eliminar(${m.ModalidadID})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 🔥 ELIMINAR
async function eliminar(id) {
    if (!confirm("¿Eliminar modalidad?")) return;

    const res = await fetch(`${URL_MODALIDAD}/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        alert("Eliminado");
        listar();
    }
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