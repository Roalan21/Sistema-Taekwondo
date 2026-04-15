async function cargarEstudiantes() {
    const contenedor = document.getElementById('contenedor-estudiantes');
    try {
        const respuesta = await fetch('http://localhost:3000/estudiantes');
        const datos = await respuesta.json();

        contenedor.innerHTML = ""; 
        datos.forEach(est => {
            const block = document.createElement('div');
            block.className = 'estudiante-block'; // Asegúrate de definir esto en estilos.css
            
            // Ejemplo de cómo generar el HTML en tu JS para que el CSS funcione
            let contenidoHtml = `<div class="header-estudiante">👤 ${est.PrimerNombre} ${est.PrimerApellido}</div>`;
            contenidoHtml += `<div class="grid-datos">`;

            Object.keys(est).forEach(llave => {
                // Ponemos un color rojo si la llave es "CintaActual"
                const claseValor = llave === 'CintaActual' ? 'valor-destacado' : '';
                
                contenidoHtml += `
                    <div class="dato-item">
                        <span class="label">${llave}</span>
                        <span class="valor ${claseValor}">${est[llave] ?? 'N/A'}</span>
                    </div>`;
            });

            contenidoHtml += `</div>`;
            block.innerHTML = contenidoHtml;
            contenedor.appendChild(block);
        });
    } catch (e) { console.error(e); }
}
cargarEstudiantes();