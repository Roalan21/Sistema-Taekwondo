const URL = "http://localhost:3000/dashboard";

document.addEventListener(
    "DOMContentLoaded",
    cargarDashboard
);
document.getElementById(
    "fechaActual"
).textContent =
new Date().toLocaleDateString(
    "es-NI",
    {
        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric"
    }
);
async function cargarDashboard() {

    try {

        const res =
            await fetch(URL);

        const data =
            await res.json();
        console.log(data);
        
        // TARJETAS
        

        document.getElementById(
            "totalEstudiantes"
        ).textContent =
            data.estudiantes;

        document.getElementById(
            "totalIngresos"
        ).textContent =
            `C$ ${data.ingresos}`;

        document.getElementById(
            "productosStock"
        ).textContent =
            data.stock.length;

        document.getElementById(
            "mensualidadesPendientes"
        ).textContent =
            data.mensualidadesPendientes;

        document.getElementById(
            "mensualidadesVencidas"
        ).textContent =
            data.mensualidadesVencidas;

            
        
        // STOCK
        

        document.getElementById(
            "listaStock"
        ).innerHTML = data.stock.map(p => `

            <div class="item stock-bajo">

                ${p.Nombre}
                -
                Stock: ${p.StockActual}

            </div>

        `).join("");

        
        // EVENTOS
        

        document.getElementById(
            "listaEventos"
        ).innerHTML = data.eventos.map(e => `

            <div class="item">

                ${e.Nombre}
                -
                ${formatearFecha(e.Fecha)}

            </div>

        `).join("");

        
        // EXAMENES
        

        document.getElementById(
            "listaExamenes"
        ).innerHTML = data.examenes.map(e => `

            <div class="item">

                ${e.CintaEvaluada}
                -
                ${formatearFecha(e.Fecha)}

            </div>

        `).join("");
        
        // MOROSOS
        

        document.getElementById(
            "listaMorosos"
        ).innerHTML = data.morosos.map(m => `

            <div class="item stock-bajo">

                ${m.Nombres}
                ${m.Apellidos}

                -

                Pendientes:
                ${m.TotalPendientes}

            </div>

        `).join("");
        
        // CUMPLEAÑOS
        

        document.getElementById(
            "listaCumpleanios"
        ).innerHTML = data.cumpleanios.map(c => `

            <div class="item">

                🎂

                ${c.Nombres}
                ${c.Apellidos}

                -

                ${formatearCumple(
                    c.FechaDeNacimiento
                )}

            </div>

        `).join("");

        
        // GRAFICA
        
        const tiposPago =
            data.ingresosPorTipo.map(
                p => p.TipoPago
            );

        const montosPago =
            data.ingresosPorTipo.map(
                p => p.Total
            );

        new Chart(

            document.getElementById(
                "graficaIngresos"
            ),

            {

                type: 'pie',

                data: {

                    labels: tiposPago,

                    datasets: [{

                        data: montosPago

                    }]
                }
            }
        );

        const nombres =
            data.productosVendidos.map(
                p => p.Nombre
            );

        const cantidades =
            data.productosVendidos.map(
                p => p.TotalVendido
            );

        new Chart(

            document.getElementById(
                "graficaProductos"
            ),

            {

                type: 'bar',

                data: {

                    labels: nombres,

                    datasets: [{

                        label:
                            'Productos vendidos',

                        data: cantidades
                    }]
                }
            }
        );

        const estados =
            data.estadosMensualidades.map(
                e => e.Estado
            );

        const totales =
            data.estadosMensualidades.map(
                e => e.Total
            );

        new Chart(

            document.getElementById(
                "graficaMensualidades"
            ),

            {

                type: 'pie',

                data: {

                    labels: estados,

                    datasets: [{

                        data: totales

                    }]
                }
            }
        );
        

    } catch (error) {

        console.error(error);
    }
}

function formatearFecha(fechaIso) {

    const fecha =
        new Date(fechaIso);

    return fecha.toLocaleDateString();
}
function formatearCumple(fechaIso) {

    const fecha =
        new Date(fechaIso);

    return fecha.toLocaleDateString(
        'es-NI',
        {
            day: '2-digit',
            month: 'long'
        }
    );
}