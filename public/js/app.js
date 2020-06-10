
var url = window.location.href;
var swLocation = '/twittor/sw.js';
var swReg;

if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', function(){
        

        // El proceso de registro del Service Worker, devuelve una PROMESA de tipo ServiceWorkerRegistration 
        navigator.serviceWorker.register( swLocation ).then( function(reg){
            swReg = reg;
            swReg.pushManager.getSubscription().then( verificaSuscripcion );  // (*)

            // EL 'pushManager' es un METODO del registro del SW (swReg) es decir de lo que me devuelve la promesa 
            // que es de tipo ServiceWorkerRegistration (*)
            // swReg.pushManager.getSubscription().then( verificaSuscripcion );  // (*)

            // swReg.pushManager.getSubscription() me devuelve un objeto, quiere decir que si viene 
            // algo distinto a UNDEFINED ya estoy registrado. Por eso hago 
            // swReg.pushManager.getSubscription().then( verificaSuscripcion );
            // que es lo mismo que hacer
            // swReg.pushManager.getSubscription().then( resp => verificaSuscripcion( resp ));
        
        })

    })
}





// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnActivadas    = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});


// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario
    };


    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( data )
    })
    .then( res => res.json() )
    .then( res => console.log( 'app.js', res ))
    .catch( err => console.log( 'app.js error:', err ));



    crearMensajeHTML( mensaje, usuario );

});



// Obtener mensajes del servidor
function getMensajes() {

    fetch('api')
        .then( res => res.json() )
        .then( posts => {

            console.log(posts);
            posts.forEach( post =>
                crearMensajeHTML( post.mensaje, post.user ));


        });


}

getMensajes();



// Detectar cambios de conexión
function isOnline() {

    if ( navigator.onLine ) {
        // tenemos conexión
        // console.log('online');
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'OK!'
        });


    } else{
        // No tenemos conexión
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
    }

}

window.addEventListener('online', isOnline );
window.addEventListener('offline', isOnline );

isOnline();





// NOTIFICACIONES 
function verificaSuscripcion(activadas){
    console.log(activadas);
    if ( activadas ) { // a este metodo llego un objeto
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else { // a este metodo llego UNDEFINED
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}

// verificaSuscripcion();
/*
Esta verificación ahora la hago al inicio, luego de cargar el service worker 

    navigator.serviceWorker.register( swLocation ).then( function(reg){
        swReg = reg;
        swReg.pushManager.getSubscription().then( verificaSuscripcion )
    })

*/

function enviarNotificacion(){
    console.log('Enviando notificación!');
    const notificationOpts = {
        body: 'Este es el cuerpo de la notificacion',
        icon: '/img/icons/icon-72x72.png'

    }
    const n = new Notification('Hola Mundo', notificationOpts);
    console.log('n', n);
    // Esto es solo una demostración de como hacerlo de lado de JS, no lo vamos a hacer así, 
    // mas adelante lo vamos a hacer del lado del SW.

    n.onclick = () => {
        console.log('Click');
    }
}

function notificarme(){
    if(!window.Notification){
        console.log('Este navegador no soporta notificaciones');
        return;
    }
    if( Notification.permission === 'granted'){
        enviarNotificacion();
    } else if ( Notification.permission !== 'denied' || Notification.permission === 'default') {
        // podemos usar una fn de flecha pero todo lo hice con funciones normales, lo vamos a hacer con un fn normal
        Notification.requestPermission( function ( permission ) {
            console.log(permission);
            if(permission === 'granted') {
                enviarNotificacion();
            } 
        });
    }
}


// Envía una notificacion cada vez que recargo la página, o en caso de tener las configuración en 'Preguntar' me va 
// a pedir permiso para enviar notificacioens
// notificarme(); // comento para que no moleste cada vez que recargo la página. 

// PIDE PERMISO PARA LAS NOTIFICACIONES

function getPublicKey(){
    // fetch('api/key')
    //     .then(res => res.text())
    //     .then(console.log);

    return fetch('api/key') 
    // al poner return transformo getPublicKey en una promesa que devuelve un tipo Uint8Array
    // function getPublicKey(): Promise<Uint8Array>
        .then( res => res.arrayBuffer()) 
        .then( key => new Uint8Array(key)) // Uint8Array es una función de JS.
}

// getPublicKey().then(console.log);
btnDesactivadas.on('click', function() {
    if(!swReg) return console.log('No hay registro de SW');

    // getPublicKey() hace un fetch a la api fetch('api/key') para obtener la llave
    // esa llave es la que necesito para crear el registro en el SW.
    getPublicKey().then( function(key){
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key 
        })
        .then( res => res.toJSON())
        .then( suscripcion => {
            console.log(suscripcion);
            
            fetch(
                'api/subscribe', 
                {
                    method: 'POST', 
                    headers: {'Content-Type':'application/json'}, 
                    body: JSON.stringify( suscripcion )
                }
            )
            .then( verificaSuscripcion )
            .catch( cancelarSuscripcon );
            
            // ADICIONALMENTE verificaSuscripcion porque ya lo hice en el registro del sw
            // verificaSuscripcion(suscripcion); 
        })
    })
});





function cancelarSuscripcon(){
    // Como se hace swReg.pushManager.subscribe() pareciera que lo que tenemos que hacer es un 
    // swReg.pushManager.unsubscribe() pero no, no funciona así, no funciona como un observable de RXJS. 

    swReg.pushManager.getSubscription().then( subs => {
        subs.unsubscribe().then(()=> verificaSuscripcion(false));
    })
}
btnActivadas.on('click', function(){
    cancelarSuscripcon();
})