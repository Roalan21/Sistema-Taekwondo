const URL = `${window.location.origin}/mensualidades`;
let mensualidadesGlobal = [];
let filtroActual = "pendientes";
document.addEventListener("DOMContentLoaded", () => {

    listarMensualidades();

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

                renderizarMensualidades();

            });

        });

});

function obtenerEstadoVisual(m) {

    if (m.Estado === "PAGADA") {
        return "PAGADA";
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const fechaLimite = new Date(m.FechaLimite);
    fechaLimite.setHours(0,0,0,0);

    if (fechaLimite < hoy) {
        return "VENCIDA";
    }

    return "PENDIENTE";
}


// LISTAR

async function listarMensualidades() {

    try {

        const res =
            await fetch(URL);

        mensualidadesGlobal =
            await res.json();

        renderizarMensualidades();

    } catch (error) {

        console.error(error);

    }
}
function renderizarMensualidades() {

    const contenedor =
        document.getElementById("tablaMensualidad");

    let mensualidadesFiltradas =
        [...mensualidadesGlobal];

    if (filtroActual === "pendientes") {

        mensualidadesFiltradas =
            mensualidadesFiltradas.filter(
                m => obtenerEstadoVisual(m) === "PENDIENTE"
            );
    }

    if (filtroActual === "vencidas") {

        mensualidadesFiltradas =
            mensualidadesFiltradas.filter(
                m => obtenerEstadoVisual(m) === "VENCIDA"
            );
    }

    if (filtroActual === "pagadas") {

        mensualidadesFiltradas =
            mensualidadesFiltradas.filter(
                m => obtenerEstadoVisual(m) === "PAGADA"
            );
    }

    contenedor.innerHTML = "";

    mensualidadesFiltradas.forEach(m => {

        const estadoVisual =
            obtenerEstadoVisual(m);

        let colorEstado = "";
        let botonPagar = "";

        if (estadoVisual === "PAGADA") {

            colorEstado = "#16a34a";

            botonPagar = `
                <span style="
                    color:#16a34a;
                    font-weight:bold;
                ">
                    Pagada
                </span>
            `;
        }

        if (estadoVisual === "PENDIENTE") {

            colorEstado = "#f59e0b";

            botonPagar = `
                <a
                    href="pagos.html?modo=mensualidad&estudiante=${m.EstudianteID}&mensualidad=${m.MensualidadID}"
                    class="btn-nuevo"
                >
                    Pagar 💰
                </a>
            `;
        }

        if (estadoVisual === "VENCIDA") {

            colorEstado = "#dc2626";

            botonPagar = `
                <a
                    href="pagos.html?modo=mensualidad&estudiante=${m.EstudianteID}&mensualidad=${m.MensualidadID}"
                    class="btn-nuevo"
                >
                    Pagar 💰
                </a>
            `;
        }

        contenedor.innerHTML += `

            <div class="fila-pago">

                <span class="pago-nombre">
                    ${m.Estudiante}
                </span>

                <span class="pago-monto">
                    C$ ${m.Precio}
                </span>

                <span class="pago-fecha">
                    ${new Date(m.FechaLimite)
                        .toLocaleDateString()}
                </span>

                <span style="
                    color:${colorEstado};
                    font-weight:bold;
                ">
                    ${estadoVisual}
                </span>

                <span>
                    ${botonPagar}
                </span>

            </div>

        `;
    });

}