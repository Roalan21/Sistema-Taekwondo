// js/main.js
function cargarSidebar() {
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="sidebar-header">King's Taekwondo</div>
        <ul class="sidebar-menu">
            <li><a href="index.html">  Dashboard</a></li>
            <li><a href="estudiantes.html">Ver Estudiantes</a></li>
            <li><a href="profesores.html">Profesores</a></li>
            <li><a href="categorias.html">categorias</a></li>
            <li><a href="turnos.html">turnos</a></li>
            <li><a href="imparte.html">imparte</a></li>
            <li><a href="evento.html">evento</a></li>
            <li><a href="mensualidad.html">mensualidad</a></li>
            <li><a href="pagos.html">pagos</a></li>
            <li><a href="producto.html">producto</a></li>
            <li><a href="salidas.html">salidas</a></li>
            <li><a href="inventario.html">inventario</a></li>
        </ul>
    </nav>`;
    
    // Insertar la sidebar al principio del body o de un contenedor
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

document.addEventListener('DOMContentLoaded', cargarSidebar);