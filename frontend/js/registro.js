document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formRegistro');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idEdicion = urlParams.get('id');

    // 1. MODO EDICIÓN: Si hay un ID en la URL, pedimos los datos al servidor
    if (idEdicion) {
        try {
            // Cambiamos el título visualmente
            document.querySelector('h1').textContent = "Editar Expediente de Atleta";
            
            const res = await fetch(`http://localhost:3000/estudiantes/${idEdicion}`);
            const data = await res.json();

            if (res.ok) {
                // RECORRIDO AUTOMÁTICO: Rellena PrimerNombre, SegundoNombre, etc.
                // Busca cada input que tenga un atributo 'name' igual a la columna de la DB
                const campos = form.querySelectorAll('input, select, textarea');
                
                campos.forEach(input => {
                    const nombreCampo = input.name;
                    if (data[nombreCampo] !== undefined && data[nombreCampo] !== null) {
                        
                        // Si es un campo de fecha, hay que limpiarlo (YYYY-MM-DD)
                        if (input.type === 'date') {
                            input.value = data[nombreCampo].split('T')[0];
                        } 
                        // Si es el selector de fotos (Bit a String)
                        else if (input.id === 'PermiteFoto') {
                            input.value = data[nombreCampo] ? "1" : "0";
                        }
                        else {
                            input.value = data[nombreCampo];
                        }
                    }
                });

                // RELLENO DE CAMPOS ESPECIALES (Los que procesamos con comas)
                document.getElementById('nacionalidadInput').value = data.TodasLasNacionalidades || '';
                document.getElementById('telefonosInput').value = data.TodosLosTelefonos || '';

                // BLOQUEO DE FECHA DE INGRESO ( Mechanical Necessity )
                const fIngreso = form.querySelector('input[name="FechaDeIngreso"]');
                if (fIngreso) {
                    fIngreso.readOnly = true;
                    fIngreso.style.backgroundColor = "#e9ecef"; // Color gris de bloqueado
                    fIngreso.style.cursor = "not-allowed";
                }

                // Cambiamos el texto del botón
                form.querySelector('.btn-guardar').textContent = "Actualizar Expediente";
            }
        } catch (err) {
            console.error("Error al cargar datos:", err);
        }
    }

    // 2. MANEJO DEL SUBMIT (POST para nuevo, PUT para editar)
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);
        
        // Procesar los inputs de texto a Arrays para el Backend
        datos.NacionalidadesArr = document.getElementById('nacionalidadInput').value
            .split(',')
            .map(n => n.trim())
            .filter(n => n !== "");

        datos.TelefonosArr = document.getElementById('telefonosInput').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== "");

        // Convertir tipos de datos para SQL Server
        datos.PermiteFoto = parseInt(datos.PermiteFoto);
        datos.Peso = parseFloat(datos.Peso) || 0;
        datos.CategoriaID = parseInt(datos.CategoriaID);

        const url = idEdicion ? `http://localhost:3000/estudiantes/${idEdicion}` : 'http://localhost:3000/estudiantes';
        const metodo = idEdicion ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                alert(idEdicion ? "✅ Cambios guardados correctamente" : "✅ Atleta registrado con éxito");
                window.location.href = 'estudiantes.html';
            } else {
                const errorData = await res.json();
                alert("❌ Error: " + errorData.error);
            }
        } catch (err) {
            alert("Error de conexión con el servidor.");
        }
    };
});