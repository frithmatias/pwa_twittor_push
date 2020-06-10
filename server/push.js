const urlsafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');
const fs = require('fs');
const webpush = require('web-push');

// config vapid de webpush
webpush.setVapidDetails(
    'mailto:matiasfrith@gmail.com', // por si los servicios cambian
    vapid.publicKey,
    vapid.privateKey
  );


// Con la persistencia de las suscripciones ahora levanto mis suscripciones guardadas
// let suscripciones = require('./subs-db.json');
let suscripciones = []; 
if (fs.existsSync('server/subs-db.json')) {
    suscripciones = require('./subs-db.json');
} 


console.log('Suscripciones:', suscripciones);
module.exports.getKey = () => {
    return urlsafeBase64.decode(vapid.publicKey);
}

module.exports.addSubscription = ( suscripcion ) => {
    suscripciones.push( suscripcion );
    fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify( suscripciones )); // guardamos las suscripciones en un archivo dentro de la carpeta server
    console.log('push.js > ', suscripciones);
}

// post es la info que queremos enviar a través del push 
module.exports.sendPush = ( post ) => {

    const notificacionesEnviadas = [];

    // vamos a necesitar el index del forEach
    suscripciones.forEach( (suscripcion, i ) => {
        // el segundo argumento es un string, si mandamos un objeto hay que pasarlo por json.stringify()
        const pushProm = webpush.sendNotification(suscripcion, JSON.stringify(post))
        .then( console.log('Notificación enviada '))
        .catch( err => {
            console.log('Notifiación falló');
            if ( err.statusCode === 410 ) { // GONE, ya no existe 
                suscripciones[i].borrar = true;
            }
        });
        console.log('pushProm', pushProm);
        notificacionesEnviadas.push( pushProm );
        // suscripcion: {"endpoint": "https://...", "expirationTime": null, "keys": { "p256dh": "...", "auth": "..."}}
    });

    Promise.all(notificacionesEnviadas).then(()=> { // no me interesa el argumento, yo se que las hizo.
        
        // obtengo sólo las que NO tenen la propiedad borrar: true;
        suscripciones = suscripciones.filter(subs => !subs.borrar ); 

        // guardamos las suscripciones en un archivo dentro de la carpeta server
        fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify( suscripciones )); 

    })
}