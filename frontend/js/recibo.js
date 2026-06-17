const URL = window.location.origin;

document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(window.location.search);

    const id =
        params.get("id");

    if (!id) return;

    try {

        const res =
            await fetch(`${URL}/recibos/${id}`);

        const r =
            await res.json();

        let tablaProductos = "";

        if (r.Productos && r.Productos.length > 0) {

            tablaProductos = `
                <h3>Detalle de Productos</h3>

                <table border="1" width="100%">
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>

                    ${r.Productos.map(p => `
                        <tr>
                            <td>${p.Nombre}</td>
                            <td>${p.CantidadProducto}</td>
                            <td>C$${p.PrecioUnitario}</td>
                            <td>C$${p.Subtotal}</td>
                        </tr>
                    `).join("")}
                </table>

                <br>
            `;
        }

        const nombre =
            (r.Nombres || r.Apellidos)
                ? `${r.Nombres || ""} ${r.Apellidos || ""}`
                : "Venta de productos";

        const tipo =
            r.TipoPago || r.Tipo || "N/A";

        const metodo =
            r.Metodo || "N/A";

        const detalles =
            r.Detalles || r.Descripcion || "Sin detalles";

        document.getElementById("reciboContenido").innerHTML = `

        <div class="recibo-factura">

            <div class="encabezado-recibo">

                <h2>🥋 King's Taekwondo</h2>

                <p>
                    Sistema de Gestión Administrativa
                </p>

                <hr>

                <h3>
                    RECIBO #${r.ReciboID}
                </h3>

            </div>

            <div class="datos-recibo">

                <div>
                    <strong>Cliente:</strong><br>
                    ${nombre}
                </div>

                <div>
                    <strong>Fecha:</strong><br>
                    ${
                        r.FechaEmision
                        ? new Date(r.FechaEmision).toLocaleDateString()
                        : "N/A"
                    }
                </div>

            </div>

            <div class="datos-recibo">

                <div>
                    <strong>Tipo:</strong><br>
                    ${tipo}
                </div>

                <div>
                    <strong>Método:</strong><br>
                    ${metodo}
                </div>

            </div>

            <div class="detalle-recibo">

                <p>
                    <strong>Descripción:</strong>
                    ${detalles}
                </p>

            </div>

            ${tablaProductos}

            <div class="total-recibo">

                TOTAL:
                C$${r.TotalFinal || 0}

            </div>

            <div class="pie-recibo">

                Gracias por su pago 

            </div>

        </div>

        `;

    } catch (error) {

        console.error(error);

        alertaError(
            "Error cargando recibo"
        );
    }

});