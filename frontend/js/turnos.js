const URL = "http://localhost:3000/turnos";

let editando = false;
let idEditar = null;

document.addEventListener("DOMContentLoaded", () => {
    listar();

    document.getElementById("formTurno").addEventListener("submit", async (e) => {
        e.preventDefault();

        const datos = {
            HoraInicio: document.getElementById("horaInicio").value,
            HoraFin: document.getElementById("horaFin").value
        };

        if (datos.HoraInicio >= datos.HoraFin) {
            alert("La hora inicio debe ser menor que la final");
            return;
        }

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

            document.getElementById("formTurno").reset();
            listar();
        }
    });
});

async function listar() {
    const res = await fetch(URL);
    const data = await res.json();

    const tabla = document.getElementById("tablaTurnos");
    tabla.innerHTML = "";

    data.forEach(t => {
        tabla.innerHTML += `
            <tr>
                <td>${formatearHora(t.HoraInicio)} - ${formatearHora(t.HoraFin)}</td>
                <td>
                    <button onclick="editar(${t.TurnoID}, '${t.HoraInicio}', '${t.HoraFin}')">Editar</button>
                    <button onclick="eliminar(${t.TurnoID})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function editar(id, hi, hf) {
    editando = true;
    idEditar = id;

    document.getElementById("horaInicio").value = hi;
    document.getElementById("horaFin").value = hf;
}

async function eliminar(id) {
    if (!confirm("¿Eliminar turno?")) return;

    const res = await fetch(`${URL}/${id}`, { method: "DELETE" });

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