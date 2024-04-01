// clase usuario con suspropiedades
class Usuario {
  constructor(cedula, nombre, correo, clave, habilitado) {
    this.cedula = cedula;
    this.nombre = nombre;
    this.correo = correo;
    this.clave = clave;
    this.habilitado = habilitado;
    this.saldo = 0;
    this.movimientos = [];
  }
}

const obtenerUsuarios = () => {
  // obtener lostado de usuarios desde el localstorage si no hay nada devuelve un nuevo array
  // JSON . parse transforma un string en un array
  return JSON.parse(localStorage.getItem("usuarios")) || [];
};

const actualizarUsuarios = (listaUsuarios) => {
  // almacenar lista de usuarios en local storage
  // JSON . stringify transforma un array en un string
  localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
};

const obtenerUsuario = (nombre, listaUsuarios) => {
  // obtener usuario por nombre
  return listaUsuarios.find((u) => u.nombre === nombre);
};

const insertarMovimiento = (movimiento, valor, nombreUsuario) => {
  // obtener usuario por nombre
  let listaUsuarios = obtenerUsuarios();
  let usuario = listaUsuarios.find((u) => u.nombre === nombreUsuario);

  // insertar movimiento realizado
  usuario.movimientos.push(
    `movimiento: ${movimiento} ------ valor: ${valor} ------ fecha: ${new Date()}`
  );

  actualizarUsuarios(listaUsuarios);
};

function guardarDatos() {
  let listaUsuarios = obtenerUsuarios();

  let formulario = document.getElementById("formulario");
  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    let cedula = document.getElementById("cedula_input").value;
    let nombre = document.getElementById("usuario_input").value;
    let correo = document.getElementById("email_input").value;
    let clave = document.getElementById("password_input").value;
    let confirmar_clave = document.getElementById("confirmar_input").value;

    if (clave != confirmar_clave) {
      alert("Las claves no coinciden");
      document.getElementById("confirmar_input").focus();
      return;
    }

    var usuario = new Usuario(cedula, nombre, correo, clave, true);
    listaUsuarios.push(usuario);

    actualizarUsuarios(listaUsuarios);
    alert("Usuario alamacenado correctamente");
    formulario.reset();

    console.log(listaUsuarios);
  });
}

var contador_intentos = 0;

function ingresarUsuario() {
  let listaUsuarios = obtenerUsuarios();

  let maxIntentos = 3;
  let usuarioIngresado = document.getElementById("input_usuario").value;
  let claveIngresada = document.getElementById("input_password").value;

  // validar utilizando find si existe un usuario con esa clave y nombre de usuario
  let usuario = listaUsuarios.find((u) => u.nombre === usuarioIngresado);

  // validar si el usuario existe
  if (!usuario) {
    alert("El usuario no existe");
    return;
  }

  // validar si el usuario no esta bloqueado
  if (!usuario.habilitado) {
    alert("Usuario bloqueado");
    return;
  }

  if (usuario.clave === claveIngresada) {
    // usuario correcto redirigir a menu y almacenar el nombre del usuario que ingresa
    localStorage.setItem("usuario_logueado", usuario.nombre);
    contador_intentos = 0;
    window.location.href = "/movimientos.html";
  } else {
    contador_intentos++;
    alert("Usuario o contraseña incorrectos");
    if (contador_intentos >= maxIntentos) {
      // bloquear el usuario si supera el número de intentos
      usuario.habilitado = false;
      actualizarUsuarios(listaUsuarios);
      alert("agotaste el numero de intentos permitidos, usuario bloqueado");
    }
  }
}

function consignar() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }

  let listaUsuarios = obtenerUsuarios();
  let usuario = obtenerUsuario(nombreUsuario, listaUsuarios);

  let valor = parseFloat(document.getElementById("Valor-consignar").value);

  if (isNaN(valor)) {
    alert("Ingrese un valor");
    return;
  }

  let saldo = usuario.saldo || 0;
  usuario.saldo = saldo + valor;

  actualizarUsuarios(listaUsuarios);

  insertarMovimiento("Consignación", valor, nombreUsuario);

  document.getElementById("nuevoSaldo").hidden = false;
  document.getElementById(
    "textoSaldo"
  ).innerHTML = `Su nuevo saldo es: ${usuario.saldo}`;
}

function retirar() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }

  let listaUsuarios = obtenerUsuarios();
  let usuario = obtenerUsuario(nombreUsuario, listaUsuarios);

  let valor = parseFloat(document.getElementById("Valor-retirar").value);

  if (isNaN(valor)) {
    alert("Ingrese un valor");
    return;
  }

  let saldo = usuario.saldo || 0;

  if (saldo <= 0 || valor > saldo) {
    document.getElementById("fondosInsuficientes").hidden = false;
    return;
  }
  document.getElementById("fondosInsuficientes").hidden = true;

  usuario.saldo = saldo - valor;

  actualizarUsuarios(listaUsuarios);
  insertarMovimiento("Retiro", valor, nombreUsuario);

  document.getElementById("nuevoSaldo").hidden = false;
  document.getElementById(
    "textoSaldo"
  ).innerHTML = `Su nuevo saldo es: ${usuario.saldo}`;
}

function consultarSaldo() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }

  let listaUsuarios = obtenerUsuarios();
  let usuario = obtenerUsuario(nombreUsuario, listaUsuarios);

  document.getElementById("textoSaldo").innerHTML = `${usuario.saldo}`;
}

function movimientos() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }

  let listaUsuarios = obtenerUsuarios();
  let usuario = obtenerUsuario(nombreUsuario, listaUsuarios);

  crearTabla(usuario.movimientos);
}

function cambiarClave() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }

  let listaUsuarios = obtenerUsuarios();
  let usuario = obtenerUsuario(nombreUsuario, listaUsuarios);

  let clave = document.getElementById("password_input").value;
  let confirmar_clave = document.getElementById("confirmar_input").value;

  if (clave != confirmar_clave) {
    alert("Las claves no coinciden");
    document.getElementById("confirmar_input").focus();
    return;
  }

  usuario.clave = clave;

  actualizarUsuarios(listaUsuarios);
  alert("Clave actualizada correctamente");
  cerrarSesion();
}

function cerrarSesion() {
  // elimina el registro del usuario logueado para cerrar sesion
  localStorage.removeItem("usuario_logueado");
  // redirecciona a la pagina de iniciar sesion
  window.location.href = "/index2.html";
}

function validarUsuarioLogueado() {
  // obtener nombre de usuario logueado
  let nombreUsuario = localStorage.getItem("usuario_logueado");

  if (!nombreUsuario) {
    alert("No se encuentra el usuario");
    return "";
  }

  return nombreUsuario;
}

function irConsignar() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }
  window.location.href = "/consignar.html";
}
function irCambiarClave() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }
  window.location.href = "/cambiarClave.html";
}
function irMovimientos() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }
  window.location.href = "/movimientos.html";
}
function irRetirar() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }
  window.location.href = "/sacar.html";
}
function irSaldo() {
  let nombreUsuario = validarUsuarioLogueado();
  if (!nombreUsuario) {
    return;
  }
  window.location.href = "/saldo.html";
}

function crearTabla(datos) {
  var table = document.createElement("table");
  var cuerpo = document.createElement("tbody");

  datos.forEach(function (datosFila) {
    var fila = document.createElement("tr");
    var celda = document.createElement("td");
    celda.appendChild(document.createTextNode(datosFila));
    fila.appendChild(celda);

    cuerpo.appendChild(fila);
  });

  table.appendChild(cuerpo);
  document.getElementById("contenedor-tabla").appendChild(table);
}
