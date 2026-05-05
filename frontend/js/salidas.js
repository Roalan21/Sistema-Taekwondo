const URL = "http://localhost:3000";

let listaProductos = []; 

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarMetodos();

    document.getElementById("tipoSalida").addEventListener("change", cambiarVista);
    document.getElementById("agregarProducto").addEventListener("click", agregarProducto);
    document.getElementById("guardarVenta").addEventListener("click", guardarVenta);
    document.getElementById("productoVenta").addEventListener("change", calcularTotal);
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
        alert("Seleccione producto y cantidad válida");
        return;
    }

    const precio = parseFloat(select.selectedOptions[0].dataset.precio);
    const total = precio * cantidad * (1 - descuento / 100);

    const producto = {
        id: parseInt(select.value),
        nombre: select.selectedOptions[0].text,
        cantidad,
        precio,
        descuento,
        total
    };

    listaProductos.push(producto);

    renderLista();
    calcularTotalGeneral();

    // 🔥 LIMPIAR CAMPOS
    document.getElementById("cantidadVenta").value = "";
    document.getElementById("descuentoVenta").value = "";
    document.getElementById("totalCalculado").value = "";
    document.getElementById("MontoFinal").value = "";
}

function renderLista() {
    const ul = document.getElementById("listaVenta");
    ul.innerHTML = "";

    listaProductos.forEach((p, index) => {
        ul.innerHTML += `
            <li>
                ${p.nombre} - Cant: ${p.cantidad} - Desc: ${p.descuento}% - Total: C$${p.total.toFixed(2)}
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
        alert("Agregue al menos un producto");
        return;
    }

    const totalFinal = listaProductos.reduce((acc, p) => acc + p.total, 0);

    const data = {
        productos: listaProductos,
        TotalFinal: totalFinal,
        MontoFinal: totalFinal, // aquí puedes luego validar si quieres pagos parciales
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

        alert(result.message);

        listaProductos = [];
        renderLista();
        document.getElementById("totalCalculado").value = "";

    } catch (error) {
        console.error(error);
        alert("Error en venta ❌");
    }
}

function calcularTotal() {
    const select = document.getElementById("productoVenta");

    if (!select.value) return;

    const precio = parseFloat(select.selectedOptions[0].dataset.precio);
    const cantidad = parseInt(document.getElementById("cantidadVenta").value) || 0;
    const descuento = parseFloat(document.getElementById("descuentoVenta").value) || 0;

    const total = precio * cantidad * (1 - descuento / 100);

    document.getElementById("totalCalculado").value = `C$ ${total.toFixed(2)}`;
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
        alert("Error en regalía ❌");
    }
});

document.getElementById("guardarPromocion").addEventListener("click", async () => {

    const data = {
        tipo: document.getElementById("tipoPromocion").value,
        fechaInicio: document.getElementById("fechaInicio").value,
        fechaFin: document.getElementById("fechaFin").value,
        productoID: document.getElementById("productoPromocion").value,
        precioPromocion: parseFloat(document.getElementById("PrecioPromocion").value),
        cantidad: parseInt(document.getElementById("precioPromo").value)
    };

    try {
        const res = await fetch(`${URL}/salidas/promocion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        alert(result.message);

    } catch (error) {
        console.error(error);
        alert("Error en promoción ❌");
    }
});