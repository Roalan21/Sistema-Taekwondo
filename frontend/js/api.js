const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "N/A";
    // SQL Server devuelve 'YYYY-MM-DDT00:00:00.000Z'
    // Con split('T')[0] nos quedamos solo con 'YYYY-MM-DD'
    const partes = fechaISO.split('T')[0].split('-');
    if (partes.length !== 3) return fechaISO; 
    
    const [year, month, day] = partes;
    return `${day}/${month}/${year}`; // Formato Nicaragua: DD/MM/YYYY
};
const URL_BASE = 'http://localhost:3000';

// 1. Llenar el select de categorías en el formulario
async function cargarCategorias() {
    const select = document.getElementById('CategoriaID');
    if (!select) return; // Si no estamos en el form, no hace nada

    try {
        const res = await fetch(`${URL_BASE}/categorias`);
        const categorias = await res.json();
        select.innerHTML = '<option value="">Seleccione Categoría...</option>' + 
            categorias.map(c => `<option value="${c.CategoriaID}">${c.Nombre}</option>`).join('');
    } catch (err) {
        console.error("Error cargando categorías:", err);
    }
}

// 2. Cargar la lista de estudiantes (para estudiantes.html)
async function cargarEstudiantes() {
    const contenedor = document.getElementById('contenedor-estudiantes');
    if (!contenedor) return;

    try {
        const res = await fetch(`${URL_BASE}/estudiantes`);
        const data = await res.json();
        console.log("Datos recibidos:", data[0]);
        if (data.length === 0) {
            contenedor.innerHTML = "<p>No hay atletas registrados.</p>";
            return;
        }

        contenedor.innerHTML = data.map(e => `
            <div class="estudiante-block">
                <div class="header-estudiante">
                    <span>${e.PrimerNombre} ${e.SegundoNombre} ${e.PrimerApellido} ${e.SegundoApellido}</span>
                    <span class="cinta-badge">Cinta: ${e.CintaActual}</span>
                </div>
                
                <div class="grid-datos">
                    <div class="dato-item"><span class="label">Nacimiento</span><span class="valor">${formatearFecha(e.FechaDeNacimiento)}</span></div>
                    <div class="dato-item"><span class="label">Peso</span><span class="valor">${e.Peso} Lb</span></div>
                    <div class="dato-item"><span class="label">Alergias/Enfermedad</span><span class="valor">${e.EnfermedadoAlergia || 'Ninguna'}</span></div>
                    <div class="dato-item"><span class="label">Nacionalidad</span><span class="valor">${e.TodasLasNacionalidades || 'No registrada'}</span></div>
                    <div class="dato-item"><span class="label">Ciudad</span><span class="valor">${e.Ciudad}</span></div>
                    <div class="dato-item"><span class="label">Barrio/Distrito</span><span class="valor">${e.Barrio}, Dist. ${e.Distrito}</span></div>
                    <div class="dato-item"><span class="label">¿Cómo supo?</span><span class="valor">${e.ComoSupo}</span></div>
                    <div class="dato-item"><span class="label">Teléfonos Atleta</span><span class="valor">${e.TodosLosTelefonos}</span></div>

                    <div class="dato-item"><span class="label">Padre/Madre</span><span class="valor">${e.NomMadreOPadre} ${e.ApellMadreOPadre}</span></div>
                    <div class="dato-item"><span class="label">Tel. Emergencia</span><span class="valor">${e.TelefonoDeEmergencia}</span></div>
                    <div class="dato-item"><span class="label">Facebook</span><span class="valor">${e.FacebookPadreOMadre || 'N/A'}</span></div>

                    <div class="dato-item"><span class="label">Categoría</span><span class="valor">${e.NombreCategoria || 'Sin categoría'}</span></div>
                    <div class="dato-item"><span class="label">Fecha Ingreso</span><span class="valor">${formatearFecha(e.FechaDeIngreso)}</span></div>
                    <div class="dato-item">
                        <span class="label">Permite Fotos</span>
                        <span class="valor">${e.PermiteFoto ? ' Sí' : ' No'}</span>
                    </div>
                    <div class="dato-item">
                        <span class="label">Estado</span>
                        <span class="valor">${e.Estado ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div class="acciones-estudiante" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dfe6e9; display: flex; gap: 10px;">
                        <button onclick="window.location.href='nuevo-estudiante.html?id=${e.EstudianteID}'" 
                                style="background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            ✏️ Editar Atleta
                        </button>
                        <button onclick="eliminarAtleta(${e.EstudianteID})" 
                                style="background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            🗑️ Dar de Baja
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error al cargar expedientes:", err);
        contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
}
async function eliminarAtleta(id) {
    if (confirm("¿Estás seguro de inactivar este expediente?")) {
        const res = await fetch(`http://localhost:3000/estudiantes/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Atleta inactivado");
            cargarEstudiantes(); 
        }
    }
}