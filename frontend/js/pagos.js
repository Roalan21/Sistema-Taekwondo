const URL = "http://localhost:3000";


// CAMBIO TIPO PAGO

document.getElementById("tipoPago")
.addEventListener("change", function () {

    const tipo = this.value;

    // ocultar todos
    document.getElementById("mensualidadCampos")
        .style.display = "none";

    document.getElementById("examenCampos")
        .style.display = "none";

    document.getElementById("eventoCampos")
        .style.display = "none";

    // mostrar según tipo
    if (tipo === "MENSUALIDAD") {

        document.getElementById("mensualidadCampos")
            .style.display = "block";
    }

    if (tipo === "EXAMEN") {

        document.getElementById("examenCampos")
            .style.display = "block";

        cargarExamenes();
    }

    if (tipo === "EVENTO") {

        document.getElementById("eventoCampos")
            .style.display = "block";

        cargarEventos();
    }
});


// CUOTAS

document.getElementById("esCuotas")
.addEventListener("change", function () {

    document.getElementById("cuotas")
        .disabled = !this.checked;
});


// DOM READY

document.addEventListener("DOMContentLoaded", async () => {

    await cargarEstudiantes();

    await cargarMetodos();

    // valores por defecto
    document.getElementById("tipoPago").value =
        "MENSUALIDAD";

    document.getElementById("mensualidadCampos")
        .style.display = "block";

    // submit
    document.getElementById("formPago")
        .addEventListener("submit", pagar);

    
    // LEER URL
    
    const params =
        new URLSearchParams(window.location.search);

    const modo =
        params.get("modo");

    const estudianteID =
        params.get("estudiante");

    const mensualidadID =
        params.get("mensualidad");

    const origen =
        params.get("origen");
    
    // PAGO AUTOMÁTICO MENSUALIDAD
    
    if (modo === "mensualidad") {

        // tipo pago fijo
        document.getElementById("tipoPago").value =
            "MENSUALIDAD";

        document.getElementById("tipoPago")
            .disabled = true;

        // estudiante fijo
        document.getElementById("estudiante").value =
            estudianteID;

        document.getElementById("estudiante")
            .disabled = true;

        // ocultar otros bloques
        document.getElementById("examenCampos")
            .style.display = "none";

        document.getElementById("eventoCampos")
            .style.display = "none";

        // ocultar cuotas
        document.getElementById("mensualidadCampos")
            .style.display = "none";

        // monto readonly
        document.getElementById("monto")
            .readOnly = true;

        document.getElementById("monto")
            .style.backgroundColor = "#e5e7eb";

        // mostrar info
        if (origen === "registro") {

            document.getElementById("infoPagoAutomatico")
                .style.display = "block";

            document.getElementById("textoPagoAutomatico")
                .innerHTML = `
                    El estudiante fue registrado correctamente.
                    Ahora solo falta procesar el primer pago
                    de mensualidad.
                `;
            document.getElementById("tituloPagoAutomatico").textContent =
                "Pago automático de mensualidad";

        } else {

            document.getElementById("infoPagoAutomatico")
                .style.display = "none";
        }
        // cargar monto automático
        await cargarMensualidadPendiente(
            mensualidadID
        );
    }
    const eventoID =
        params.get("evento");
    
    // pagar evento 
    
    if (modo === "evento") {

        document.getElementById("tipoPago").value =
            "EVENTO";

        document.getElementById("tipoPago")
            .disabled = true;

        document.getElementById("estudiante").value =
            estudianteID;

        document.getElementById("estudiante")
            .disabled = true;

        document.getElementById("evento").value =
            eventoID;

        document.getElementById("evento").setAttribute(
            "data-eventoid",
            eventoID
        );

        document.getElementById("evento")
            .disabled = true;

        document.getElementById("eventoCampos")
            .style.display = "block";

        document.getElementById("mensualidadCampos")
            .style.display = "none";

        document.getElementById("examenCampos")
            .style.display = "none";

        document.getElementById("infoPagoAutomatico")
            .style.display = "block";
        document.getElementById("tituloPagoAutomatico").textContent =
            "Pago de inscripción a evento";

        document.getElementById("textoPagoAutomatico")
            .innerHTML = `
                El estudiante será inscrito al evento
                después de procesar el pago.
            `;
        

        await cargarMontoEvento(eventoID);
    }
    const examenID =
        params.get("examen");
    
    if (modo === "examen") {

        document.getElementById("tipoPago").value =
            "EXAMEN";

        document.getElementById("tipoPago")
            .disabled = true;

        document.getElementById("estudiante").value =
            estudianteID;

        document.getElementById("estudiante")
            .disabled = true;

        document.getElementById("examenCampos")
            .style.display = "block";

        document.getElementById("examen").value =
            examenID;
        document.getElementById("examen")
            .setAttribute(
                "data-examenid",
                examenID
            );

        document.getElementById("examen")
            .disabled = true;

        document.getElementById("mensualidadCampos")
            .style.display = "none";

        document.getElementById("eventoCampos")
            .style.display = "none";

        document.getElementById("infoPagoAutomatico")
            .style.display = "block";
        document.getElementById("tituloPagoAutomatico").textContent =
            "Pago de examen";
        document.getElementById("textoPagoAutomatico")
            .innerHTML = `
                El estudiante será inscrito
                al examen después del pago.
            `;

        await cargarMontoExamen(examenID);
    }
});



// CARGAR ESTUDIANTES

async function cargarEstudiantes() {

    try {

        const res =
            await fetch(`${URL}/estudiantes`);

        const data =
            await res.json();

        const select =
            document.getElementById("estudiante");

        select.innerHTML = `
            <option value="">
                Seleccione un estudiante
            </option>
        `;

        data.forEach(e => {

            select.innerHTML += `
                <option value="${e.EstudianteID}">
                    ${e.Nombres} ${e.Apellidos}
                </option>
            `;
        });

    } catch (error) {

        console.error(
            "Error cargando estudiantes:",
            error
        );
    }
}


// CARGAR MÉTODOS

async function cargarMetodos() {

    try {

        const res =
            await fetch(`${URL}/metodos-pago`);

        const data =
            await res.json();

        const select =
            document.getElementById("metodo");

        select.innerHTML = "";

        data.forEach(m => {

            select.innerHTML += `
                <option value="${m.MetodoPagoID}">
                    ${m.Metodo}
                </option>
            `;
        });

    } catch (error) {

        console.error(
            "Error cargando métodos:",
            error
        );
    }
}


// CARGAR MENSUALIDAD

async function cargarMensualidadPendiente(
    mensualidadID
) {

    try {

        const res = await fetch(
            `${URL}/mensualidades/${mensualidadID}`
        );

        const mensualidad =
            await res.json();

        document.getElementById("monto").value =
            mensualidad.Precio;

    } catch (error) {

        console.error(
            "Error cargando mensualidad:",
            error
        );
    }
}

// CARGAR monto evento

async function cargarMontoEvento(eventoID) {

    try {

        const res =
            await fetch(`${URL}/eventos/${eventoID}`);

        const evento =
            await res.json();

        document.getElementById("monto").value =
            evento.Precio;

    } catch (error) {

        console.error(
            "Error cargando evento:",
            error
        );
    }
}


// CARGAR monto examen

async function cargarMontoExamen(examenID) {

    const res =
        await fetch(`${URL}/examenes/${examenID}`);

    const examen =
        await res.json();

    document.getElementById("monto").value =
        examen.Precio;
}


// CARGAR EXÁMENES

async function cargarExamenes() {

    try {

        const res =
            await fetch(`${URL}/examenes`);

        const data =
            await res.json();

        const select =
            document.getElementById("examen");

        select.innerHTML = `
            <option value="">
                Seleccione un examen
            </option>
        `;

        data.forEach(e => {

            select.innerHTML += `
                <option value="${e.ExamenID}">
                    ${e.Fecha} - C$${e.Precio}
                </option>
            `;
        });

    } catch (error) {

        console.error(
            "Error cargando exámenes:",
            error
        );
    }
}


// CARGAR EVENTOS

async function cargarEventos() {

    try {

        const res =
            await fetch(`${URL}/eventos`);

        const data =
            await res.json();

        const select =
            document.getElementById("evento");

        select.innerHTML = `
            <option value="">
                Seleccione un evento
            </option>
        `;

        data.forEach(e => {

            select.innerHTML += `
                <option value="${e.EventoID}">
                    ${e.Nombre} - ${e.Fecha}
                </option>
            `;
        });

    } catch (error) {

        console.error(
            "Error cargando eventos:",
            error
        );
    }
}


// PAGAR

async function pagar(e) {

    e.preventDefault();

    try {

        const tipo =
            document.getElementById("tipoPago").value;

        const data = {

            EstudianteID:
                parseInt(
                    document.getElementById("estudiante").value
                ),

            MetodoPagoID:
                parseInt(
                    document.getElementById("metodo").value
                ),

            Monto:
                parseFloat(
                    document.getElementById("monto").value
                ),

            TipoPago: tipo,

            EsCuotas:
                document.getElementById("esCuotas")
                    .checked,

            Cuotas:
                parseInt(
                    document.getElementById("cuotas").value
                ) || 1,

            ExamenID:
                parseInt(
                    document.getElementById("examen").value ||
                    document.getElementById("examen")
                        .dataset.examenid
                ) || null,

            EventoID:
                parseInt(
                    document.getElementById("evento").value ||
                    document.getElementById("evento")
                        .dataset.eventoid
                ) || null
                
        };

        const res = await fetch(
            `${URL}/pagos/pago-completo`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const result =
            await res.json();

        if (!res.ok) {

            throw new Error(
                result.error || "Error al pagar"
            );
        }

        alertaExito(result.message);


        // redirección
        window.location.href =
            `recibo.html?id=${result.ReciboID}`;

    } catch (error) {

        console.error(error);

        alertaError(
            "❌ " + error.message
        );
    }
}