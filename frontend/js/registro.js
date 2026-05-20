document.addEventListener('DOMContentLoaded', async () => {

    const form = document.getElementById('formRegistro');

    if (!form) return;

    // Cargar selects primero
    if (typeof cargarCategorias === 'function') {
        await cargarCategorias();
    }

    if (typeof cargarTurnos === 'function') {
        await cargarTurnos();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idEdicion = urlParams.get('id');

    /* =========================================
       MODO EDICIÓN
    ========================================= */
    if (idEdicion) {

        try {

            document.querySelector('h1').textContent =
                "Editar Expediente de Atleta";

            const res = await fetch(
                `http://localhost:3000/estudiantes/${idEdicion}`
            );

            const data = await res.json();

            if (res.ok) {

                const campos =
                    form.querySelectorAll('input, select, textarea');

                campos.forEach(input => {

                    const nombreCampo = input.name;

                    if (
                        data[nombreCampo] !== undefined &&
                        data[nombreCampo] !== null
                    ) {

                        // FECHAS
                        if (input.type === 'date') {

                            input.value =
                                data[nombreCampo]
                                    .split('T')[0];
                        }

                        // SELECT FOTO
                        else if (input.name === 'PermiteFoto') {

                            input.value =
                                data[nombreCampo] ? "1" : "0";
                        }

                        else {

                            input.value = data[nombreCampo];
                        }
                    }
                });

                // CAMPOS ESPECIALES
                document.getElementById('nacionalidadInput').value =
                    data.TodasLasNacionalidades || '';

                document.getElementById('telefonosInput').value =
                    data.TodosLosTelefonos || '';

                // BLOQUEAR FECHA INGRESO
                const fechaIngreso =
                    form.querySelector(
                        'input[name="FechaDeIngreso"]'
                    );

                if (fechaIngreso) {

                    fechaIngreso.readOnly = true;

                    fechaIngreso.style.backgroundColor =
                        "#e9ecef";

                    fechaIngreso.style.cursor =
                        "not-allowed";
                }

                // CAMBIAR TEXTO BOTÓN
                form.querySelector('.btn-guardar').textContent =
                    "Actualizar Expediente";
            }

        } catch (err) {

            console.error(
                "Error al cargar estudiante:",
                err
            );

            alert("Error cargando datos del estudiante");
        }
    }

    /* =========================================
       GUARDAR / ACTUALIZAR
    ========================================= */
    form.onsubmit = async (e) => {

        e.preventDefault();

        const formData = new FormData(form);

        const datos = Object.fromEntries(formData);

        /* =========================
           NACIONALIDADES
        ========================= */
        datos.NacionalidadesArr =
            document.getElementById('nacionalidadInput')
                .value
                .split(',')
                .map(n => n.trim())
                .filter(n => n !== "");

        /* =========================
           TELÉFONOS
        ========================= */
        datos.TelefonosArr =
            document.getElementById('telefonosInput')
                .value
                .split(',')
                .map(t => t.trim())
                .filter(t => t !== "");

        /* =========================
           CONVERSIONES
        ========================= */
        datos.PermiteFoto =
            parseInt(datos.PermiteFoto);

        datos.Peso =
            parseFloat(datos.Peso) || 0;

        datos.CategoriaID =
            parseInt(datos.CategoriaID);

        datos.TurnoID =
            parseInt(datos.TurnoID);

        /* =========================
           URL Y MÉTODO
        ========================= */
        const url = idEdicion
            ? `http://localhost:3000/estudiantes/${idEdicion}`
            : `http://localhost:3000/estudiantes`;

        const metodo =
            idEdicion ? 'PUT' : 'POST';

        try {

            const res = await fetch(url, {

                method: metodo,

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            });

            const respuesta = await res.json();

            if (res.ok) {

                alert(
                    idEdicion
                        ? "✅ Expediente actualizado correctamente"
                        : "✅ Estudiante registrado correctamente"
                );

                window.location.href =
                    'estudiantes.html';

            } else {

                alert(
                    "❌ Error: " +
                    (respuesta.error || "Error desconocido")
                );
            }

        } catch (err) {

            console.error(err);

            alert(
                "❌ Error de conexión con el servidor"
            );
        }
    };
});