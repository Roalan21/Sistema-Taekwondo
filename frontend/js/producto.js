const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Listar los productos existentes nada más cargar la página
    listarProductos();
    
    // 2. Escuchar el evento del formulario
    document.getElementById("formProducto").addEventListener("submit", crearProducto);
});

// --- FUNCIÓN PARA MOSTRAR LOS PRODUCTOS EN LA TABLA ---
async function listarProductos() {
    try {
        const res = await fetch(`${URL}/productos`);
        const productos = await res.json();

        const tabla = document.getElementById("cuerpoTablaProductos");
        if (!tabla) return; // Seguridad por si el ID no existe en el HTML

        tabla.innerHTML = ""; 

        productos.forEach(p => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.Nombre}</td>
                    <td>${p.Descripcion || '<span class="text-muted">Sin descripción</span>'}</td>
                    <td>C$ ${parseFloat(p.PrecioVenta).toFixed(2)}</td>
                    <td class="stock-valor">${p.StockActual || 0}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al listar productos:", error);
    }
}

// --- FUNCIÓN PARA GUARDAR UN PRODUCTO NUEVO ---
async function crearProducto(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);

    // 🔥 VALIDACIONES
    if (!nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        alert("Ingrese un precio válido");
        return;
    }

    const data = {
        Nombre: nombre,
        Descripcion: descripcion,
        PrecioVenta: precio,
        StockActual: 0, // Todo producto nuevo inicia con stock cero
        Estado: 1       // Por defecto activo
    };

    try {
        const res = await fetch(`${URL}/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || "Error al guardar producto");
        }

        alert(result.message || "Producto guardado 📦");

        // Limpiar el formulario
        document.getElementById("formProducto").reset();
        
        // 🔥 ACTUALIZAR LA TABLA para ver el nuevo producto sin recargar la página
        listarProductos();

    } catch (error) {
        console.error("ERROR FRONT:", error);
        alert("Error al guardar producto ❌");
    }
}