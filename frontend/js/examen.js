const URL_EXAMENES = "http://localhost:3000/examenes";
let examenesGlobal = [];

let filtroActual = "vigentes";
document.addEventListener("DOMContentLoaded", () => {

    cargarExamenes();

    document.getElementById("formExamen")
        .addEventListener("submit", guardarExamen);

    document
        .querySelectorAll("[data-filtro]")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                document
                    .querySelectorAll("[data-filtro]")
                    .forEach(b =>
                        b.classList.remove("active")
                    );

                btn.classList.add("active");

                filtroActual =
                    btn.dataset.filtro;

                renderizarExamenes();
            });

        });
});


// GUARDAR

async function guardarExamen(e) {

    e.preventDefault();

    const examenId =
        document.getElementById("examenId").value;

    const data = {

        Fecha:
            document.getElementById("fecha").value,

        Precio:
            parseFloat(
                document.getElementById("precio").value
            ),

        CintaEvaluada:
            document.getElementById("cinta").value
    };

    try {

        let res;

        // EDITAR
        if (examenId) {

            res = await fetch(
                `${URL_EXAMENES}/${examenId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );
        }

        // CREAR
        else {

            res = await fetch(
                URL_EXAMENES,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );
        }

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || result.message);
        }

        alertaExito(result.message);

        document.getElementById("formExamen")
            .reset();

        document.getElementById("examenId").value = "";

        cargarExamenes();

    } catch (error) {

        console.error(error);

        alertaError(error.message);
    }
}


// LISTAR

async function cargarExamenes() {

    try {

        const res =
            await fetch(URL_EXAMENES);

        examenesGlobal =
            await res.json();

        if (examenesGlobal.length === 0) {

            document.getElementById("listaExamenes").innerHTML = `
                <div>
                    No hay exámenes registrados
                </div>
            `;

            return;
        }

        renderizarExamenes();

    } catch (error) {

        console.error(error);
    }
}

function examenVigente(fechaExamen) {

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const fecha = new Date(fechaExamen);
    fecha.setHours(0,0,0,0);

    return fecha >= hoy;
}


// EDITAR

async function editarExamen(id) {

    try {

        const res =
            await fetch(`${URL_EXAMENES}/${id}`);

        const examen =
            await res.json();

        document.getElementById("examenId").value =
            examen.ExamenID;

        document.getElementById("fecha").value =
            examen.Fecha.split("T")[0];

        document.getElementById("precio").value =
            examen.Precio;

        document.getElementById("cinta").value =
            examen.CintaEvaluada;

    } catch (error) {

        console.error(error);
    }
}


// ELIMINAR

async function eliminarExamen(id) {
    const result =
    await alertaConfirmacion(
        "¿Eliminar examen?"
    );
    if (!result.isConfirmed) {
        return;
    }

    try {

        await fetch(
            `${URL_EXAMENES}/${id}`,
            {
                method: "DELETE"
            }
        );

        cargarExamenes();

    } catch (error) {

        console.error(error);
    }
}


// INSCRIBIR

function inscribir(examenID) {

    window.location.href =
        `realiza.html?examenId=${examenID}`;
}


// VER PARTICIPANTES

function verParticipantes(examenID) {

    window.location.href =
        `realiza.html?modo=participantes&examenId=${examenID}`;
}

function renderizarExamenes() {

    const lista =
        document.getElementById("listaExamenes");

    let examenesFiltrados =
        [...examenesGlobal];

    if (filtroActual === "vigentes") {

        examenesFiltrados =
            examenesFiltrados.filter(
                e => examenVigente(e.Fecha)
            );
    }

    if (filtroActual === "caducados") {

        examenesFiltrados =
            examenesFiltrados.filter(
                e => !examenVigente(e.Fecha)
            );
    }

    if (examenesFiltrados.length === 0) {

        lista.innerHTML = `
            <div>
                No hay exámenes para mostrar
            </div>
        `;

        return;
    }

    lista.innerHTML =
        examenesFiltrados.map(e => {

            const vigente =
                examenVigente(e.Fecha);

            const estadoTexto =
                vigente
                    ? "Vigente"
                    : "Finalizado";

            const estadoColor =
                vigente
                    ? "#27ae60"
                    : "#e74c3c";

            return `

                <div class="fila-estudiante">

                    <div class="info-izquierda">

                        <div class="avatar-estudiante">
                            🥋
                        </div>

                        <div>

                            <div class="nombre-estudiante">
                                ${e.CintaEvaluada}
                            </div>

                            <p>
                                📅 ${formatearFecha(e.Fecha)}
                            </p>

                            <p>
                                💰 C$${e.Precio}
                            </p>

                            <p
                                style="
                                    color:${estadoColor};
                                    font-weight:bold;
                                "
                            >
                                ${estadoTexto}
                            </p>

                        </div>

                    </div>

                    <div class="acciones">

                        ${vigente ? `
                            <button onclick="editarExamen(${e.ExamenID})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                        ` : ''}

                        ${vigente ? `
                            <button onclick="eliminarExamen(${e.ExamenID})">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        ` : ''}

                        <button onclick="verParticipantes(${e.ExamenID})">
                            <i class="fas fa-users"></i> Participantes
                        </button>

                        ${vigente ? `
                            <button onclick="inscribir(${e.ExamenID})">
                                <i class="fas fa-credit-card"></i> Inscribir
                            </button>
                        ` : ''}

                    </div>

                </div>

            `;

        }).join("");
}


// FECHA

function formatearFecha(fechaIso) {

    const fecha = new Date(fechaIso);

    return fecha.toLocaleDateString();
}