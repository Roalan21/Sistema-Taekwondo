
const URL = "http://localhost:3000/productos";
document.addEventListener("DOMContentLoaded", () => {
    // 1. Listar los productos existentes nada más cargar la página
    listarProductos();
    
    // 2. Escuchar el evento del formulario
    document.getElementById("formProducto").addEventListener("submit", crearProducto);
});

// --- FUNCIÓN PARA MOSTRAR LOS PRODUCTOS EN LA TABLA ---
async function listarProductos() {
    try {
        const res = await fetch(`${URL}`);
        const productos = await res.json();

        const contenedor = document.getElementById("cuerpoTablaProductos");
        if (!contenedor) return; 

        contenedor.innerHTML = ""; 

        productos.forEach(p => {
            const stockClase = p.StockActual <= 5 ? 'rojo' : 'verde';
            const precioFormatted = parseFloat(p.PrecioVenta).toFixed(2);

            // Usamos la clase 'fila-producto' que definimos en el CSS
            contenedor.innerHTML += `
                <div class="fila-producto">
                    <span style="font-weight: bold; color: #1e293b;">${p.Nombre}</span>
                    
                    <span style="color: #64748b; font-size: 0.9rem;">
                        ${p.Descripcion || '<i>Sin descripción</i>'}
                    </span>
                    
                    <span style="color: #1e293b; font-weight: 600;">C$ ${precioFormatted}</span>
                    
                    <span class="${stockClase}" style="font-weight: bold; display: flex; align-items: center; gap: 5px;">
                        ${p.StockActual || 0} unidades
                    </span>
                    <button
                        onclick="abrirModalEditar(
                            ${p.ProductoID},
                            '${p.Nombre}',
                            '${p.Descripcion}',
                            ${p.PrecioVenta}
                        )"
                    >
                        ✏️ Editar
                    </button>
                </div>
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

    //  VALIDACIONES
    if (!nombre) {
        alertaAdvertencia("El nombre es obligatorio");
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        alertaAdvertencia("Ingrese un precio válido");
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

        alertaExito(result.message || "Producto guardado 📦");

        // Limpiar el formulario
        document.getElementById("formProducto").reset();
        
        //  ACTUALIZAR LA TABLA para ver el nuevo producto sin recargar la página
        listarProductos();

    } catch (error) {
        console.error("ERROR FRONT:", error);
        alertaError("Error al guardar producto ❌");
    }
}

function abrirModalEditar(
    id,
    nombre,
    descripcion,
    precio
) {

    document.getElementById(
        "modalEditar"
    ).style.display = "flex";

    document.getElementById(
        "editarProductoID"
    ).value = id;

    document.getElementById(
        "editarNombre"
    ).value = nombre;

    document.getElementById(
        "editarDescripcion"
    ).value = descripcion;

    document.getElementById(
        "editarPrecio"
    ).value = precio;
}

function cerrarModal() {

    document.getElementById(
        "modalEditar"
    ).style.display = "none";
}
async function guardarEdicion() {

    try {

        const id =
            document.getElementById(
                "editarProductoID"
            ).value;

        const data = {

            Nombre:
                document.getElementById(
                    "editarNombre"
                ).value,

            Descripcion:
                document.getElementById(
                    "editarDescripcion"
                ).value,

            PrecioVenta:
                document.getElementById(
                    "editarPrecio"
                ).value
        };

        const res = await fetch(

            `${URL}/${id}`,

            {

                method: "PUT",

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
                result.error
            );
        }

        alertaExito(
            "Producto actualizado"
        );

        cerrarModal();

        listarProductos()

    } catch (error) {

        alertaError(error.message);
    }
}