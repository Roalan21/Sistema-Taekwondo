const URL = window.location.origin;

let listaProductos = []; 
let listaProductosBD = [];
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarMetodos();

    document.getElementById("tipoSalida").addEventListener("change", cambiarVista);
    document.getElementById("agregarProducto").addEventListener("click", agregarProducto);
    document.getElementById("guardarVenta").addEventListener("click", guardarVenta);
    document.getElementById("productoVenta").addEventListener("change", calcularTotal);
    document.getElementById("productoVenta").addEventListener("change", () => {calcularTotal();mostrarPromocion();});
    document.getElementById("cantidadVenta").addEventListener("input", calcularTotal);
    document.getElementById("descuentoVenta").addEventListener("input", calcularTotal);
});

function cambiarVista() {
    const tipo = document.getElementById("tipoSalida").value;

    document.getElementById("ventaCampos").style.display = "none";
    document.getElementById("regaliaCampos").style.display = "none";
    document.getElementById("promocionCampos").style.display = "none";

    if (tipo === "Venta") document.getElementById("ventaCampos").style.display = "block";
    if (tipo === "Regalia") document.getElementById("regaliaCampos").style.display = "block";
    if (tipo === "Promocion") document.getElementById("promocionCampos").style.display = "block";
}

async function cargarProductos() {
    const res = await fetch(`${URL}/productos`);
    const data = await res.json();
    console.log(data);
    listaProductosBD = data;
    ["productoVenta", "productoRegalia", "productoPromocion"].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        select.innerHTML = `<option value="">Seleccione producto</option>`;

        data.forEach(p => {
            select.innerHTML += `
                <option value="${p.ProductoID}" data-precio="${p.PrecioVenta}">
                    ${p.Nombre}
                </option>
            `;
        });
    });
}

async function cargarMetodos() {
    const res = await fetch(`${URL}/metodos-pago`);
    const data = await res.json();

    const select = document.getElementById("metodoPago");

    select.innerHTML = `<option value="">Seleccione método</option>`;

    data.forEach(m => {
        select.innerHTML += `<option value="${m.MetodoPagoID}">
            ${m.Metodo}
        </option>`;
    });
}
function agregarProducto() {
    const select = document.getElementById("productoVenta");
    const cantidad = parseInt(document.getElementById("cantidadVenta").value);
    const descuento = parseFloat(document.getElementById("descuentoVenta").value) || 0;

    if (!select.value || cantidad <= 0) {
        alertaAdvertencia("Seleccione producto y cantidad válida");
        return;
    }
    const productoBD =
        listaProductosBD.find(
            p => p.ProductoID == select.value
        );

    if (cantidad > productoBD.StockActual) {

        alertaError("Stock insuficiente ❌");
        return;

    }

    let precio = productoBD.PrecioVenta;

    if (productoBD.TienePromocion == 1) {

        precio = productoBD.PrecioPromocion;

    }
    const total = precio * cantidad * (1 - descuento / 100);

    const producto = {
        id: parseInt(select.value),
        nombre: select.selectedOptions[0].text,
        cantidad,
        precio,
        descuento,
        total,

        promocion:
            productoBD.TienePromocion == 1
    };

    listaProductos.push(producto);

    renderLista();
    calcularTotalGeneral();

    // 🔥 LIMPIAR CAMPOS
    document.getElementById("cantidadVenta").value = "";
    document.getElementById("descuentoVenta").value = "";
    document.getElementById("totalCalculado").value = "";
   
}

function renderLista() {
    const ul = document.getElementById("listaVenta");
    ul.innerHTML = "";

    listaProductos.forEach((p, index) => {
        ul.innerHTML += `
            <li>
                ${p.nombre}
                - Cant: ${p.cantidad}
                - Desc: ${p.descuento}%
                - Total: C$${p.total.toFixed(2)}

                ${p.promocion ? " PROMO" : ""}
                <button onclick="eliminarProducto(${index})">X</button>
            </li>
        `;
    });
}

function calcularTotalGeneral() {
    const total = listaProductos.reduce((acc, p) => acc + p.total, 0);
    document.getElementById("totalCalculado").value = `C$ ${total.toFixed(2)}`;
}

function eliminarProducto(index) {
    listaProductos.splice(index, 1);
    renderLista();
}

async function guardarVenta() {
    if (listaProductos.length === 0) {
        alertaAdvertencia("Agregue al menos un producto");
        return;
    }

    if (!document.getElementById("metodoPago").value) {
        alertaAdvertencia("Seleccione un método de pago");
        return;
    }

    const totalFinal = listaProductos.reduce((acc, p) => acc + p.total, 0);

    const data = {
        productos: listaProductos,
        TotalFinal: totalFinal,
        MontoFinal: totalFinal,
        MetodoPagoID: document.getElementById("metodoPago").value
    };

    try {
        const res = await fetch(`${URL}/salidas/venta`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error);

        Swal.fire({
            icon: "success",
            title: "Venta registrada",
            text: result.message
        }).then(() => {
            window.location.href =
                `recibo.html?id=${result.ReciboID}`;
        });

    } catch (error) {
        console.error(error);
        alertaError("❌ " + error.message);
    }
}

function calcularTotal() {
    const select = document.getElementById("productoVenta");

    if (!select.value) return;

    const productoBD =
        listaProductosBD.find(
            p => p.ProductoID == select.value
        );

    let precio = productoBD.PrecioVenta;

    if (productoBD.TienePromocion == 1) {

        precio = productoBD.PrecioPromocion;

    }
    const cantidad = parseInt(document.getElementById("cantidadVenta").value) || 0;
    const descuento = parseFloat(document.getElementById("descuentoVenta").value) || 0;

    const total = precio * cantidad * (1 - descuento / 100);

    document.getElementById("totalCalculado").value = `C$ ${total.toFixed(2)}`;
}

function mostrarPromocion() {

    const select =
        document.getElementById("productoVenta");

    const info =
        document.getElementById("infoPromocion");

    if (!select.value) {

        info.style.display = "none";
        return;

    }

    const producto =
        listaProductosBD.find(
            p => p.ProductoID == select.value
        );

    if (!producto) return;

    if (producto.TienePromocion == 1) {

        info.style.display = "block";

        const ahorro =
            producto.PrecioVenta -
            producto.PrecioPromocion;

        info.innerHTML = `
             PROMOCIÓN ACTIVA<br><br>

            Precio normal:
            <strong>C$ ${producto.PrecioVenta}</strong><br>

            Precio promoción:
            <strong>C$ ${producto.PrecioPromocion}</strong><br>

            Ahorras:
            <strong>C$ ${ahorro}</strong>
        `;

    } else {

        info.style.display = "none";

    }

}

document.getElementById("guardarRegalia").addEventListener("click", async () => {

    const data = {
        destinatario: document.getElementById("destinatario").value,
        descripcion: document.getElementById("descripcionRegalia").value,
        productoID: document.getElementById("productoRegalia").value,
        cantidad: parseInt(document.getElementById("cantidadRegalia").value)
    };

    try {
        const res = await fetch(`${URL}/salidas/regalia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        alert(result.message);

    } catch (error) {
        console.error(error);
        alertaError("Error en regalía ❌");
    }
});

document.getElementById("guardarPromocion").addEventListener("click", async () => {

    const data = {
        tipo: document.getElementById("tipoPromocion").value,
        fechaInicio: document.getElementById("fechaInicio").value,
        fechaFin: document.getElementById("fechaFin").value,
        productoID: document.getElementById("productoPromocion").value,
        precioPromocion: parseFloat(document.getElementById("PrecioPromocion").value),
    };

    try {
        const res = await fetch(`${URL}/salidas/promocion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log(result);
        if (!res.ok) {

            alertaError(result.error || "Error al crear promoción ❌");
            return;

        }

        alert(result.message);

    } catch (error) {
        console.error(error);
        alertaError("Error en promoción ❌");
    }
});