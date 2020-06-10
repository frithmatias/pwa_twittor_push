// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');

const mensajes = [

  {
    _id: 'XXX',
    user: 'spiderman',
    mensaje: 'Hola Mundo'
  }

];


// Get mensajes
router.get('/', function (req, res) {
  // res.json('Obteniendo mensajes');
  res.json( mensajes );
});


// Post mensaje
router.post('/', function (req, res) {
  
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user
  };

  mensajes.push( mensaje );

  console.log(mensajes);


  res.json({
    ok: true,
    mensaje
  });
});


// Almacenar las suscripciones 
// http://localhost:3000/api/subscribe
router.post('/subscribe', (req, res) => {
  const suscripcion = req.body;
  push.addSubscription( suscripcion );
  res.json('subscribe');
});

// Nos ayuda a enviar el key publico al cliente para que luego nos envíe la suscripcion.
// http://localhost:3000/api/key
router.get('/key', (req, res) => {
  const key = push.getKey();
  // res.json(key);
  res.send(key);
});



// Enviar una notifiación PUSH a las personas, se controla del lado del server
// Este servicio no debería ser público debería estar protegido quizas con token, no debería ser público.
// http://localhost:3000/api/push
router.post('/push', (req, res ) => {
  // res.json('key publico');
  const post = {
    titulo: req.body.titulo,
    mensaje: req.body.mensaje, 
    usuario: req.body.usuario
  };

  push.sendPush( post );

  res.json( post );
  
});

module.exports = router;