const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    cargarMetodos();

    document.getElementById("formPago").addEventListener("submit", pagar);
});

// 🔹 cargar estudiantes
async function cargarEstudiantes() {
    const res = await fetch(`${URL}/estudiantes`);
    const data = await res.json();

    const select = document.getElementById("estudiante");

    data.forEach(e => {
        select.innerHTML += `<option value="${e.EstudianteID}">
            ${e.PrimerNombre} ${e.PrimerApellido}
        </option>`;
    });

    select.addEventListener("change", cargarMensualidades);
}

// 🔹 cargar mensualidades
async function cargarMensualidades() {
    const estudianteID = document.getElementById("estudiante").value;

    const res = await fetch(`${URL}/mensualidades`);
    const data = await res.json();

    const select = document.getElementById("mensualidad");
    select.innerHTML = "";

    data
        .filter(m => m.EstudianteID == estudianteID)
        .forEach(m => {
            select.innerHTML += `<option value="${m.MensualidadID}">
                ${m.FechaLimite} - C$${m.Precio}
            </option>`;
        });
}

// 🔹 cargar métodos
async function cargarMetodos() {
    const res = await fetch(`${URL}/metodos-pago`);
    const data = await res.json();

    const select = document.getElementById("metodo");

    data.forEach(m => {
        select.innerHTML += `<option value="${m.MetodoPagoID}">
            ${m.Metodo}
        </option>`;
    });
}

// 🔥 PROCESO COMPLETO
async function pagar(e) {
    e.preventDefault();

    const monto = parseFloat(document.getElementById("monto").value);

    // 1️⃣ RECIBO
    const r1 = await fetch(`${URL}/recibos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Descripcion: "Pago mensualidad",
            Tipo: "Mensualidad",
            MontoFinal: monto
        })
    });

    const recibo = await r1.json();

    // 2️⃣ PAGO
    const r2 = await fetch(`${URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ReciboID: recibo.ReciboID,
            MetodoPagoID: document.getElementById("metodo").value,
            Monto: monto,
            TipoPago: "Mensualidad"
        })
    });

    const pago = await r2.json();

    // 3️⃣ GENERA
    await fetch(`${URL}/genera`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            MensualidadID: document.getElementById("mensualidad").value,
            PagoID: pago.PagoID,
            Monto: monto
        })
    });

    alert("Pago realizado correctamente 💰");
}