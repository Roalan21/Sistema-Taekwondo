const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    document.getElementById("formInventario").addEventListener("submit", registrarEntrada);
});

async function cargarProductos() {
    const res = await fetch(`${URL}/productos`);
    const data = await res.json();

    const select = document.getElementById("producto");
    select.innerHTML = `<option value="">Seleccione producto</option>`;

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
        Cantidad: parseInt(document.getElementById("cantidad").value),
        Descripcion: document.getElementById("descripcion").value
    };

    try {
        const res = await fetch(`${URL}/inventario/entrada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error);

        alert(result.message);
        document.getElementById("formInventario").reset();

    } catch (error) {
        console.error(error);
        alert("Error en inventario ❌");
    }
}