const URL = window.location.origin;

let carrito = [];

async function cargarProductos() {
    const res = await fetch(`${URL}/productos`);
    const data = await res.json();

    const select = document.getElementById("producto");

    data.forEach(p => {
        select.innerHTML += `
            <option value="${p.ProductoID}" data-precio="${p.PrecioVenta}">
                ${p.Nombre} - C$${p.PrecioVenta}
            </option>
        `;
    });
}

function agregar() {
    const select = document.getElementById("producto");
    const cantidad = parseInt(document.getElementById("cantidad").value);

    const precio = select.selectedOptions[0].dataset.precio;

    carrito.push({
        ProductoID: select.value,
        Cantidad: cantidad,
        PrecioUnitario: parseFloat(precio)
    });

    document.getElementById("lista").innerHTML += `<li>Producto agregado</li>`;
}

async function pagar() {
    const res = await fetch(`${URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: carrito })
    });

    const result = await res.json();

    alert(result.message);
    carrito = [];
    document.getElementById("lista").innerHTML = "";
}

cargarProductos();