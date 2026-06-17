const URL = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarMovimientos();

    document.getElementById("formInventario")
        .addEventListener("submit", registrarEntrada);
});

async function cargarProductos() {
    const res = await fetch(`${URL}/productos`);
    const data = await res.json();

    const select = document.getElementById("producto");

    select.innerHTML = `
        <option value="">
            Seleccione producto
        </option>
    `;

    data.forEach(p => {
        select.innerHTML += `
            <option value="${p.ProductoID}">
                ${p.Nombre}
            </option>
        `;
    });
}

async function registrarEntrada(e) {
    e.preventDefault();

    const data = {
        ProductoID: document.getElementById("producto").value,
        Cantidad: parseInt(
            document.getElementById("cantidad").value
        ),
        Descripcion: document.getElementById("descripcion").value
    };

    try {
        const res = await fetch(`${URL}/inventario/entrada`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error);
        }

        alertaExito(result.message);

        document.getElementById("formInventario").reset();

        cargarMovimientos();

    } catch (error) {
        console.error(error);
        alertaError("Error en inventario ❌");
    }
}

async function cargarMovimientos() {
    const contenedor =
        document.getElementById("cuerpoTablaInventario");

    try {
        const res =
            await fetch(`${URL}/inventario/movimientos`);

        const data =
            await res.json();

        if (data.length === 0) {
            contenedor.innerHTML = `
                <div class="sin-resultados">
                    No hay movimientos registrados.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = data.map(m => `

            <div class="fila-inventario">

                <span class="producto-inventario">
                    ${m.Producto}
                </span>

                <span class="
                    ${m.TipoMovimiento === 'ENTRADA'
                        ? 'movimiento-entrada'
                        : 'movimiento-salida'}
                ">
                    ${m.TipoMovimiento}
                </span>

                <span class="cantidad-inventario">
                    ${m.Cantidad}
                </span>

                <span class="fecha-inventario">
                    ${formatearFecha(m.Fecha)}
                </span>

                <span class="descripcion-inventario">
                    ${m.Descripcion || 'Sin descripción'}
                </span>

            </div>

        `).join("");

    } catch (error) {
        console.error(error);

        contenedor.innerHTML = `
            <div class="sin-resultados">
                Error cargando movimientos.
            </div>
        `;
    }
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return "N/A";

    const fecha = new Date(fechaIso);

    return fecha.toLocaleDateString("es-NI");
}