const URL_BASE = 'http://localhost:3000';

let editando = false;
let profesorIdEditar = null;

document.addEventListener('DOMContentLoaded', () => {
    listarProfesores();

    document.getElementById('formProfesor').addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            PrimerNombre: document.getElementById('pNombre').value,
            SegundoNombre: document.getElementById('sNombre').value,
            PrimerApellido: document.getElementById('pApellido').value,
            SegundoApellido: document.getElementById('sApellido').value,
            FechaNacimiento: document.getElementById('fNac').value
        };

        try {
            let url = `${URL_BASE}/profesores`;
            let method = 'POST';

            // 🔥 SI ESTÁ EDITANDO → UPDATE
            if (editando) {
                url = `${URL_BASE}/profesores/${profesorIdEditar}`;
                method = 'PUT';
            } else {
                // 🔥 SOLO EN CREAR
                datos.FechaContratacion = document.getElementById('fCon').value;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                alert(editando ? "Profesor actualizado ✏️" : "Profesor registrado 🥋");

                // 🔄 RESET
                editando = false;
                profesorIdEditar = null;

                document.getElementById('fCon').disabled = false;
                document.querySelector('.btn-guardar').textContent = "Guardar Profesor";

                e.target.reset();
                listarProfesores();
            } else {
                const error = await res.json();
                alert("Error: " + error.error);
            }

        } catch (error) {
            console.error("Error:", error);
        }
    });
});

async function listarProfesores() {
    try {
        const res = await fetch(`${URL_BASE}/profesores`);
        const profes = await res.json();

        const tabla = document.getElementById('tablaProfesores');
        tabla.innerHTML = '';

        profes.forEach(p => {
            const nombreCompleto = `${p.PrimerNombre} ${p.SegundoNombre || ''} ${p.PrimerApellido} ${p.SegundoApellido || ''}`;

            tabla.innerHTML += `
                <tr>
                    <td>${nombreCompleto}</td>
                    <td>${new Date(p.FechaContratacion).toLocaleDateString()}</td>
                    <td>
                        <button onclick='cargarParaEditar(${JSON.stringify(p)})'>Editar</button>
                        <button onclick="inactivarProfesor(${p.ProfesorID})">Inactivar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al listar:", error);
    }
}

// 🔥 EDITAR
function cargarParaEditar(p) {
    editando = true;
    profesorIdEditar = p.ProfesorID;

    document.getElementById('pNombre').value = p.PrimerNombre;
    document.getElementById('sNombre').value = p.SegundoNombre || '';
    document.getElementById('pApellido').value = p.PrimerApellido;
    document.getElementById('sApellido').value = p.SegundoApellido || '';
    document.getElementById('fNac').value = new Date(p.FechaNacimiento).toISOString().split('T')[0];

    const inputCon = document.getElementById('fCon');
    inputCon.value = new Date(p.FechaContratacion).toISOString().split('T')[0];
    inputCon.disabled = true;

    document.querySelector('.btn-guardar').textContent = "Actualizar Profesor";

    window.scrollTo(0, 0);
}

// 🔥 INACTIVAR
async function inactivarProfesor(id) {
    if (!confirm("¿Seguro que desea inactivar este profesor?")) return;

    try {
        const res = await fetch(`${URL_BASE}/profesores/estado/${id}`, {
            method: 'PATCH'
        });

        if (res.ok) {
            alert("Profesor inactivado 🛑");
            listarProfesores();
        }
    } catch (error) {
        alert("Error al inactivar");
    }
}