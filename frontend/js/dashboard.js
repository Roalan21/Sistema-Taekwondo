const URL = "http://localhost:3000/dashboard";

document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    actualizarHora();
    setInterval(actualizarHora, 60000);
});

function actualizarHora() {
    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString("es-NI", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const horaFormateada = ahora.toLocaleTimeString("es-NI", {
        hour: "2-digit",
        minute: "2-digit"
    });
    document.getElementById("fechaActual").innerHTML = `${fechaFormateada} • ${horaFormateada}`;
}

async function cargarDashboard() {
    try {
        const res = await fetch(URL);
        const data = await res.json();
        console.log(data);
        
        // TARJETAS KPI con animación de conteo
        animarConteo("totalEstudiantes", 0, data.estudiantes);
        document.getElementById("totalIngresos").textContent = `C$ ${data.ingresos.toLocaleString()}`;
        animarConteo("productosStock", 0, data.stock.length);
        animarConteo("mensualidadesPendientes", 0, data.mensualidadesPendientes);
        animarConteo("mensualidadesVencidas", 0, data.mensualidadesVencidas);
        
        // PRODUCTOS CON BAJO STOCK
        const listaStock = document.getElementById("listaStock");
        if (data.stock.length === 0) {
            listaStock.innerHTML = '<div class="item" style="color: #22c55e;">✅ Todos los productos tienen stock suficiente</div>';
        } else {
            listaStock.innerHTML = data.stock.map(p => `
                <div class="item stock-bajo">
                    <i class="fa-solid fa-box"></i>
                    ${p.Nombre}
                    <span style="margin-left: auto; background: #dc2626; color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem;">
                        Stock: ${p.StockActual}
                    </span>
                </div>
            `).join("");
        }
        
        // EVENTOS
        document.getElementById("listaEventos").innerHTML = data.eventos.map(e => `
            <div class="item">
                <i class="fa-solid fa-calendar-day" style="color: #2563eb;"></i>
                <strong>${e.Nombre}</strong>
                <span style="margin-left: auto; font-size: 0.8rem; color: #64748b;">📅 ${formatearFecha(e.Fecha)}</span>
            </div>
        `).join("");
        
        // EXÁMENES
        document.getElementById("listaExamenes").innerHTML = data.examenes.map(e => `
            <div class="item">
                <i class="fa-solid fa-pen-to-square" style="color: #16a34a;"></i>
                <strong>${e.CintaEvaluada}</strong>
                <span style="margin-left: auto; font-size: 0.8rem; color: #64748b;">📅 ${formatearFecha(e.Fecha)}</span>
            </div>
        `).join("");
        
        // MOROSOS
        const listaMorosos = document.getElementById("listaMorosos");
        if (data.morosos.length === 0) {
            listaMorosos.innerHTML = '<div class="item" style="color: #22c55e;">✅ No hay estudiantes morosos</div>';
        } else {
            listaMorosos.innerHTML = data.morosos.map(m => `
                <div class="item stock-bajo" style="background: #fef2f2; margin: 5px 0; border-radius: 10px;">
                    <i class="fa-solid fa-user"></i>
                    <strong>${m.Nombres} ${m.Apellidos}</strong>
                    <span style="margin-left: auto; background: #dc2626; color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem;">
                        Pendiente: C$${m.TotalPendientes}
                    </span>
                </div>
            `).join("");
        }
        
        // CUMPLEAÑOS
        const listaCumpleanios = document.getElementById("listaCumpleanios");
        if (data.cumpleanios.length === 0) {
            listaCumpleanios.innerHTML = '<div class="item">🎂 No hay cumpleaños este mes</div>';
        } else {
            listaCumpleanios.innerHTML = data.cumpleanios.map(c => `
                <div class="item">
                    <i class="fa-solid fa-cake-candles" style="color: #f59e0b;"></i>
                    <strong>${c.Nombres} ${c.Apellidos}</strong>
                    <span style="margin-left: auto; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem;">
                        🎂 ${formatearCumple(c.FechaDeNacimiento)}
                    </span>
                </div>
            `).join("");
        }
        
        // GRÁFICAS (destruir anteriores si existen)
        destruirGraficas();
        
        // Gráfica de Ingresos por Tipo
        const tiposPago = data.ingresosPorTipo.map(p => p.TipoPago);
        const montosPago = data.ingresosPorTipo.map(p => p.Total);
        
        new Chart(document.getElementById("graficaIngresos"), {
            type: 'doughnut',
            data: {
                labels: tiposPago,
                datasets: [{
                    data: montosPago,
                    backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        
        // Gráfica de Productos Más Vendidos
        const nombres = data.productosVendidos.map(p => p.Nombre);
        const cantidades = data.productosVendidos.map(p => p.TotalVendido);
        
        new Chart(document.getElementById("graficaProductos"), {
            type: 'bar',
            data: {
                labels: nombres,
                datasets: [{
                    label: 'Unidades vendidas',
                    data: cantidades,
                    backgroundColor: '#2563eb',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
        
        // Gráfica de Estados de Mensualidades
        const estados = data.estadosMensualidades.map(e => e.Estado);
        const totales = data.estadosMensualidades.map(e => e.Total);
        
        new Chart(document.getElementById("graficaMensualidades"), {
            type: 'pie',
            data: {
                labels: estados,
                datasets: [{
                    data: totales,
                    backgroundColor: ['#22c55e', '#f59e0b', '#dc2626'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el dashboard'
        });
    }
}

function animarConteo(elementoId, inicio, fin) {
    const elemento = document.getElementById(elementoId);
    let actual = inicio;
    const duracion = 1000;
    const incremento = Math.ceil(fin / 30);
    
    const intervalo = setInterval(() => {
        actual += incremento;
        if (actual >= fin) {
            elemento.textContent = fin;
            clearInterval(intervalo);
        } else {
            elemento.textContent = actual;
        }
    }, duracion / 30);
}

let charts = [];
function destruirGraficas() {
    charts.forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = [];
}

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
}

function formatearCumple(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-NI', { day: '2-digit', month: 'long' });
}