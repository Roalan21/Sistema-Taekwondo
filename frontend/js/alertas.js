function alertaExito(mensaje) {

    Swal.fire({

        icon: 'success',

        title: 'Éxito',

        text: mensaje,

        timer: 1800,

        showConfirmButton: false
    });
}

function alertaError(mensaje) {

    Swal.fire({

        icon: 'error',

        title: 'Error',

        text: mensaje
    });
}

function alertaAdvertencia(mensaje) {

    Swal.fire({

        icon: 'warning',

        title: 'Advertencia',

        text: mensaje
    });
}

async function alertaConfirmacion(mensaje) {

    return await Swal.fire({

        title: 'Confirmar',

        text: mensaje,

        icon: 'question',

        showCancelButton: true,

        confirmButtonText: 'Sí',

        cancelButtonText: 'Cancelar'
    });
}