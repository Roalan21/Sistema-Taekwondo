const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date().toISOString().split("T")[0];

    document.getElementById("desde").value = hoy;
    document.getElementById("hasta").value = hoy;

    cargarReportes();
});

async function cargarReportes() {
    const desde = document.getElementById("desde").value;
    const hasta = document.getElementById("hasta").value;

    await cargarIngresos(desde, hasta);
    await cargarMensualidades();
    await cargarMorosos();
    await cargarProductos(desde, hasta);
}

async function cargarIngresos(desde, hasta) {
    const res = await fetch(`${URL}/reportes/ingresos?desde=${desde}&hasta=${hasta}`);
    const data = await res.json();

    document.getElementById("reporteIngresos").innerHTML = `
        <div class="tabla-header" style="grid-template-columns: 2fr 1fr 1fr;">
            <span>Tipo</span>
            <span>Cantidad</span>
            <span>Total</span>
        </div>

        ${data.map(r => `
            <div class="fila-tabla" style="grid-template-columns: 2fr 1fr 1fr;">
                <span>${r.Tipo}</span>
                <span>${r.Cantidad}</span>
                <span>C$ ${r.Total || 0}</span>
            </div>
        `).join("")}
    `;
}

async function cargarMensualidades() {
    const res = await fetch(`${URL}/reportes/mensualidades`);
    const data = await res.json();

    document.getElementById("reporteMensualidades").innerHTML = `
        <div class="tabla-header" style="grid-template-columns: 2fr 1fr 1fr;">
            <span>Estado</span>
            <span>Cantidad</span>
            <span>Total</span>
        </div>

        ${data.map(r => `
            <div class="fila-tabla" style="grid-template-columns: 2fr 1fr 1fr;">
                <span>${r.Estado}</span>
                <span>${r.Cantidad}</span>
                <span>C$ ${r.Total || 0}</span>
            </div>
        `).join("")}
    `;
}

async function cargarMorosos() {
    const res = await fetch(`${URL}/reportes/morosos`);
    const data = await res.json();

    document.getElementById("reporteMorosos").innerHTML = `
        <div class="tabla-header" style="grid-template-columns: 2fr 1fr 1fr;">
            <span>Estudiante</span>
            <span>Pendientes</span>
            <span>Total debe</span>
        </div>

        ${data.map(r => `
            <div class="fila-tabla" style="grid-template-columns: 2fr 1fr 1fr;">
                <span>${r.Nombres} ${r.Apellidos}</span>
                <span>${r.TotalPendientes}</span>
                <span>C$ ${r.TotalDebe || 0}</span>
            </div>
        `).join("")}
    `;
}

async function cargarProductos(desde, hasta) {
    const res = await fetch(`${URL}/reportes/productos-vendidos?desde=${desde}&hasta=${hasta}`);
    const data = await res.json();

    document.getElementById("reporteProductos").innerHTML = `
        <div class="tabla-header" style="grid-template-columns: 2fr 1fr 1fr;">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Total vendido</span>
        </div>

        ${data.map(r => `
            <div class="fila-tabla" style="grid-template-columns: 2fr 1fr 1fr;">
                <span>${r.Nombre}</span>
                <span>${r.CantidadVendida}</span>
                <span>C$ ${r.TotalVendido || 0}</span>
            </div>
        `).join("")}
    `;
}

function exportarPDF() {

    const elemento =
        document.getElementById("areaReportePDF");

    const opciones = {
        margin: [10, 10, 10, 10],
        filename: "reporte-taekwondo.pdf",

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        },

        pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [
                ".tabla-contenedor",
                ".fila-tabla",
                ".tabla-header"
            ]
        }
    };

    html2pdf()
        .set(opciones)
        .from(elemento)
        .save();
}