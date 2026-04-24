// js/main.js
function cargarSidebar() {
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="sidebar-header">King's Taekwondo</div>
        <ul class="sidebar-menu">
            <li><a href="index.html">  Dashboard</a></li>
            <li><a href="estudiantes.html">👥 Ver Estudiantes</a></li>
            <li><a href="nuevo-estudiante.html">➕ Agregar Estudiante</a></li>
            <li><a href="#">📦 Inventario</a></li>
            <li><a href="#">💰 Ventas</a></li>
        </ul>
    </nav>`;
    
    // Insertar la sidebar al principio del body o de un contenedor
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

document.addEventListener('DOMContentLoaded', cargarSidebar);