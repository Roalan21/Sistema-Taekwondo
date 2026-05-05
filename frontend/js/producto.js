const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    //cargarProveedores();
    document.getElementById("formProducto").addEventListener("submit", crearProducto);
});

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

        document.getElementById("formProducto").reset();

    } catch (error) {
        console.error("ERROR FRONT:", error);
        alert("Error al guardar producto ❌");
    }
}

async function cargarProveedores() {
    try {
        const res = await fetch(`${URL}/tusah`);
        const data = await res.json();

        const select = document.getElementById("proveedor");

        select.innerHTML = `<option value="">Seleccione proveedor</option>`;

        data.forEach(p => {
            select.innerHTML += `
                <option value="${p.TusahID}">
                    ${p.Fecha}
                </option>
            `;
        });

    } catch (error) {
        console.error("Error cargando proveedores:", error);
    }
}

