const URL = "http://localhost:3000";

document.getElementById("tipoPago").addEventListener("change", function () {

    const tipo = this.value;

    document.getElementById("mensualidadCampos").style.display = "none";
    document.getElementById("examenCampos").style.display = "none";
    document.getElementById("eventoCampos").style.display = "none";

    if (tipo === "Mensualidad") {
        document.getElementById("mensualidadCampos").style.display = "block";
    }

    if (tipo === "Examen") {
        document.getElementById("examenCampos").style.display = "block";
        cargarExamenes();
    }

    if (tipo === "Evento") {
        document.getElementById("eventoCampos").style.display = "block";
        cargarEventos();
    }
});
document.getElementById("esCuotas").addEventListener("change", function () {
    document.getElementById("cuotas").disabled = !this.checked;
});

document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    cargarMetodos();
    document.getElementById("tipoPago").value = "Mensualidad";
    document.getElementById("mensualidadCampos").style.display = "block";
    document.getElementById("formPago").addEventListener("submit", pagar);
});

async function cargarEstudiantes() {
    const res = await fetch(`${URL}/estudiantes`);
    const data = await res.json();

    const select = document.getElementById("estudiante");

    // 🔥 opción por defecto
    select.innerHTML = `<option value="">Seleccione un estudiante</option>`;

    data.forEach(e => {
        select.innerHTML += `
            <option value="${e.EstudianteID}">
                ${e.PrimerNombre} ${e.PrimerApellido}
            </option>
        `;
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

// 🔹 cargar examenes
async function cargarExamenes() {
    try {
        const res = await fetch(`${URL}/examenes`);
        const data = await res.json();

        console.log("EXAMENES:", data); // 👈 DEBUG

        const select = document.getElementById("examen");

        if (!select) {
            console.error("No existe el select examen ❌");
            return;
        }

        select.innerHTML = `<option value="">Seleccione un examen</option>`;

        data.forEach(e => {
            select.innerHTML += `
                <option value="${e.ExamenID}">
                    ${e.Fecha} - C$${e.Precio}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando examenes:", error);
    }
}

// 🔹 cargar eventos
async function cargarEventos() {
    const res = await fetch(`${URL}/eventos`);
    const data = await res.json();

    const select = document.getElementById("evento");
    select.innerHTML = `<option value="">Seleccione un evento</option>`;

    data.forEach(e => {
        select.innerHTML += `
            <option value="${e.EventoID}">
                ${e.Nombre} - ${e.Fecha}
            </option>
        `;
    });
}

async function pagar(e) {
    e.preventDefault();

    const tipo = document.getElementById("tipoPago").value;

    const data = {
        EstudianteID: document.getElementById("estudiante").value,
        MetodoPagoID: document.getElementById("metodo").value,
        Monto: parseFloat(document.getElementById("monto").value),
        TipoPago: tipo,
        EsCuotas: document.getElementById("esCuotas").checked,
        Cuotas: parseInt(document.getElementById("cuotas").value) || 1,
        ExamenID: document.getElementById("examen").value,
        EventoID: document.getElementById("evento").value
    };

    try {
        const res = await fetch(`${URL}/pagos/pago-completo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        alert(result.message);
        document.getElementById("formPago").reset();

    } catch (error) {
        alert("Error al procesar pago ❌");
        console.error(error);
    }
}

