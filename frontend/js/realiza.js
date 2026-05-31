const URL_REALIZA = "http://localhost:3000/realiza";
const URL_ESTUDIANTES = "http://localhost:3000/estudiantes";
const URL_EXAMENES = "http://localhost:3000/examenes";

let examenSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {

    await cargarEstudiantes();

    await cargarExamenes();

    const params =
        new URLSearchParams(window.location.search);

    const examenId =
        params.get("examenId");

    const modo =
        params.get("modo");

    const selectExamen =
        document.getElementById("examen");

    // ======================================
    // SI VIENE DESDE EXAMEN.HTML
    // ======================================

    if (examenId) {

        selectExamen.value = examenId;

        examenSeleccionado = examenId;

        selectExamen.disabled = true;

        cargarRealiza(examenId);

        const texto =
            selectExamen.options[
                selectExamen.selectedIndex
            ].text;

        document.getElementById("infoExamen")
            .innerHTML = `
                🥋 Participantes del examen:
                <strong>${texto}</strong>
            `;
    }

    // ======================================
    // MODO PARTICIPANTES
    // ======================================

    if (modo === "participantes") {

        document.getElementById("formRealiza")
            .style.display = "none";
    }

    // ======================================
    // CAMBIO EXAMEN
    // ======================================

    selectExamen.addEventListener("change", (e) => {

        examenSeleccionado = e.target.value;

        if (examenSeleccionado) {

            cargarRealiza(examenSeleccionado);

            const texto =
                e.target.options[
                    e.target.selectedIndex
                ].text;

            document.getElementById("infoExamen")
                .innerHTML = `
                    🥋 Participantes del examen:
                    <strong>${texto}</strong>
                `;
        }
    });

    // ======================================
    // SUBMIT
    // ======================================

    document.getElementById("formRealiza")
        .addEventListener("submit", inscribir);

    // ======================================
    // VOLVER
    // ======================================

    document.getElementById("btnVolver")
        .addEventListener("click", () => {

            window.location.href = "examen.html";
        });

});


// ESTUDIANTES

async function cargarEstudiantes() {

    const res =
        await fetch(URL_ESTUDIANTES);

    const data =
        await res.json();

    const select =
        document.getElementById("estudiante");

    select.innerHTML =
        `<option value="">Seleccione</option>`;

    data.forEach(e => {

        select.innerHTML += `
            <option value="${e.EstudianteID}">
                ${e.Nombres} ${e.Apellidos}
            </option>
        `;
    });
}


// EXAMENES

async function cargarExamenes() {

    const res =
        await fetch(URL_EXAMENES);

    const data =
        await res.json();

    const select =
        document.getElementById("examen");

    select.innerHTML =
        `<option value="">Seleccione</option>`;

    data.forEach(e => {

        select.innerHTML += `
            <option value="${e.ExamenID}">
                ${e.CintaEvaluada} - ${formatearFecha(e.Fecha)}
            </option>
        `;
    });
}


// INSCRIBIR

async function inscribir(e) {

    e.preventDefault();

    const estudianteID =
        document.getElementById("estudiante").value;

    const examenID =
        document.getElementById("examen").value;

    const verif =
        await fetch(
            `${URL_REALIZA}/verificar?estudiante=${estudianteID}&examen=${examenID}`
        );

    const existe =
        await verif.json();

    if (existe.existe) {

        alertaAdvertencia("Ya inscrito");

        return;
    }

    window.location.href =
        `pagos.html?modo=examen&estudiante=${estudianteID}&examen=${examenID}`;
}


// CARGAR

async function cargarRealiza(examenID) {

    try {

        const res =
            await fetch(
                `${URL_REALIZA}/examen/${examenID}`
            );

        const data =
            await res.json();

        const contenedor =
            document.getElementById(
                "listaParticipantes"
            );

        if (data.length === 0) {

            contenedor.innerHTML = `
                <div class="sin-resultados">
                    No hay participantes
                </div>
            `;

            return;
        }

        contenedor.innerHTML = data.map(r => `

            <div class="fila-tabla">

                <span>
                    ${r.Estudiante}
                </span>

                <span>
                    ${r.CintaActual}
                </span>

                <span>

                    <select
                        id="asistencia-${r.RealizaID}"
                    >

                        <option
                            value="1"
                            ${r.Asistencia ? "selected" : ""}
                        >
                            Asistió
                        </option>

                        <option
                            value="0"
                            ${!r.Asistencia ? "selected" : ""}
                        >
                            No asistió
                        </option>

                    </select>

                </span>

                <span>

                    <input
                        type="number"
                        id="nota-${r.RealizaID}"
                        value="${r.Nota ?? ''}"
                    >

                </span>

                <span>

                    <select
                        id="resultado-${r.RealizaID}"
                    >

                        <option value="">
                            Seleccione
                        </option>

                        <option
                            value="APROBADO"
                            ${r.Resultado === "APROBADO"
                                ? "selected"
                                : ""
                            }
                        >
                            APROBADO
                        </option>

                        <option
                            value="REPROBADO"
                            ${r.Resultado === "REPROBADO"
                                ? "selected"
                                : ""
                            }
                        >
                            REPROBADO
                        </option>

                    </select>

                </span>

                <span>

                    <button
                        class="btn-guardar"
                        onclick="guardarResultado(
                            ${r.RealizaID}
                        )"
                    >
                        💾 Guardar
                    </button>

                </span>

            </div>

        `).join("");

    } catch (error) {

        console.error(error);
    }
}

// CARGAR resuktados

async function guardarResultado(id) {

    try {

        const asistencia =
            document.getElementById(
                `asistencia-${id}`
            ).value;

        const nota =
            document.getElementById(
                `nota-${id}`
            ).value;

        const resultado =
            document.getElementById(
                `resultado-${id}`
            ).value;

        let nuevaCinta = null;

        // si aprobó
        if (resultado === "APROBADO") {

            nuevaCinta = prompt(
                "Ingrese la nueva cinta:"
            );

            if (!nuevaCinta) {

                alertaAdvertencia(
                    "Debe ingresar la nueva cinta"
                );

                return;
            }
        }

        const res = await fetch(

            `${URL_REALIZA}/${id}`,

            {
                method: "PUT",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    Asistencia:
                        parseInt(asistencia),

                    Nota:
                        parseFloat(nota),

                    Resultado:
                        resultado,

                    NuevaCinta:
                        nuevaCinta
                })
            }
        );

        const result =
            await res.json();

        if (!res.ok) {

            throw new Error(
                result.error || "Error actualizando examen"
            );
        }

        alert(result.message);
        cargarRealiza(examenSeleccionado);

    } catch (error) {

        console.error(error);

        alertaError(
            "❌ " + error.message
        );
    }
}


// ACTUALIZAR

async function actualizar(id, select) {

    const resultado =
        select.value;

    let nuevaCinta = null;

    if (resultado === "APROBADO") {

        nuevaCinta =
            prompt("Nueva cinta:");
    }

    await fetch(
        `${URL_REALIZA}/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                Asistencia: 1,

                Nota: 100,

                Resultado: resultado,

                NuevaCinta: nuevaCinta
            })
        }
    );

    alertaExito("Actualizado");
}

function formatearFecha(fechaIso) {

    const fecha = new Date(fechaIso);

    return fecha.toLocaleDateString();
}