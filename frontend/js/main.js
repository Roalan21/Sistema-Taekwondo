// js/main.js
function cargarSidebar() {
    console.log("Cargando sidebar..."); // Para verificar que la función se ejecuta
    
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="sidebar-header">King's Taekwondo</div>
        <ul class="sidebar-menu">
            <li><a href="dashboard.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a></li>
            <li><a href="estudiantes.html"><i class="fa-solid fa-users"></i> Estudiantes</a></li>
            <li><a href="profesores.html"><i class="fa-solid fa-chalkboard-user"></i> Profesores</a></li>
            <li><a href="categorias.html"><i class="fa-solid fa-tags"></i> Categorias</a></li>
            <li><a href="turnos.html"><i class="fa-solid fa-calendar-alt"></i> Turnos</a></li>
            <li><a href="evento.html"><i class="fa-solid fa-calendar-check"></i> Evento</a></li>
            <li><a href="examen.html"><i class="fa-solid fa-pen-to-square"></i> Examen</a></li>
            <li><a href="mensualidad.html"><i class="fa-solid fa-dollar-sign"></i> Mensualidad</a></li>
            <li><a href="producto.html"><i class="fa-solid fa-box"></i> Producto</a></li>
            <li><a href="salidas.html"><i class="fa-solid fa-cart-shopping"></i> Ventas</a></li>
            <li><a href="inventario.html"><i class="fa-solid fa-warehouse"></i> Inventario</a></li>
            <li><a href="reportes.html"><i class="fa-solid fa-chart-bar"></i> Reportes</a></li>
        </ul>
    </nav>`;
    
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    console.log("Sidebar cargada correctamente");
}

// Asegurar que se ejecute cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarSidebar);
} else {
    cargarSidebar();
}