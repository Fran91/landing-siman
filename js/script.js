/* =========================================================
   Landing Siman - Script principal
   1. Menú de navegación para celular
   2. Validación del formulario de suscripción
   ========================================================= */

/* ---------- 1. Menú de navegación ---------- */
const iniciarMenu = () => {
  const boton = document.querySelector(".menu-boton");
  const menu = document.querySelector("#menu-principal");
  if (!boton || !menu) return;

  const alternarMenu = (abrir) => {
    boton.setAttribute("aria-expanded", abrir);
    boton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("abierto", abrir);
  };

  boton.addEventListener("click", () => {
    alternarMenu(boton.getAttribute("aria-expanded") !== "true");
  });

  // Cierra el menú con Escape o al elegir una opción
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      alternarMenu(false);
      boton.focus();
    }
  });

  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) alternarMenu(false);
  });
};

/* ---------- 2. Formulario de suscripción ---------- */

// Mensajes de error en español para cada campo
const MENSAJES = {
  nombre: {
    valueMissing: "Escribe tu nombre completo.",
    tooShort: "El nombre debe tener al menos 3 caracteres.",
    patternMismatch: "Escribe nombre y apellido, solo con letras."
  },
  correo: {
    valueMissing: "Escribe tu correo electrónico.",
    typeMismatch: "Escribe un correo válido, por ejemplo: nombre@correo.com.",
    patternMismatch: "Escribe un correo válido, por ejemplo: nombre@correo.com."
  },
  interes: {
    valueMissing: "Selecciona una categoría."
  },
  acepto: {
    valueMissing: "Debes aceptar para poder suscribirte."
  }
};

// Caracteres NO permitidos según el tipo de campo
const NO_PERMITIDOS = {
  texto: /[^\p{L}\s]/u,             // solo letras y espacios
  correo: /[^A-Za-z0-9._%+\-@]/     // solo caracteres válidos en un email
};

// Devuelve la regla de caracteres del campo (o null si no tiene)
const reglaDe = (campo) => {
  if (campo.hasAttribute("data-solo-texto")) return NO_PERMITIDOS.texto;
  if (campo.type === "email") return NO_PERMITIDOS.correo;
  return null;
};

// Quita los caracteres no permitidos y deja una sola @ en correos
const limpiarValor = (campo, regla) => {
  let valor = campo.value.replace(new RegExp(regla.source, regla.flags + "g"), "");
  if (campo.type === "email") {
    const [usuario, ...resto] = valor.split("@");
    valor = resto.length ? `${usuario}@${resto.join("")}` : usuario;
  }
  if (valor !== campo.value) campo.value = valor;
};

// Quita espacios sobrantes al inicio, al final y repetidos
const limpiarEspacios = (campo) => {
  if (campo.type === "text" || campo.type === "email") {
    campo.value = campo.value.trim().replace(/\s+/g, " ");
  }
};

// Valida un campo y muestra u oculta su mensaje de error
const validarCampo = (campo) => {
  const errores = MENSAJES[campo.name] ?? {};
  const tipo = Object.keys(errores).find((clave) => campo.validity[clave]);
  const error = tipo ? errores[tipo] : "";

  campo.setAttribute("aria-invalid", Boolean(error));
  document.getElementById(campo.getAttribute("aria-describedby")).textContent = error;
  return !error;
};

const iniciarFormulario = () => {
  const formulario = document.querySelector("#form-suscripcion");
  if (!formulario) return;

  const mensajeExito = document.querySelector("#mensaje-exito");
  const campos = [...formulario.elements].filter((campo) => campo.name);

  // Un solo listener por evento para todo el formulario (delegación)

  // Bloquea caracteres no permitidos antes de que se escriban
  formulario.addEventListener("beforeinput", (evento) => {
    const { target: campo, data } = evento;
    const regla = reglaDe(campo);
    if (!regla || !data) return;
    const segundaArroba = campo.type === "email" && data.includes("@") && campo.value.includes("@");
    if (regla.test(data) || segundaArroba) evento.preventDefault();
  });

  // Limpia lo pegado o autocompletado y revalida si había error
  formulario.addEventListener("input", ({ target: campo }) => {
    const regla = reglaDe(campo);
    if (regla) limpiarValor(campo, regla);
    if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
  });

  // Valida al salir de un campo o al cambiar su valor
  formulario.addEventListener("focusout", ({ target: campo }) => {
    if (!campo.name) return;
    limpiarEspacios(campo);
    validarCampo(campo);
  });

  formulario.addEventListener("change", ({ target: campo }) => {
    if (campo.name) validarCampo(campo);
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensajeExito.hidden = true;

    campos.forEach(limpiarEspacios);
    const invalidos = campos.filter((campo) => !validarCampo(campo));

    if (invalidos.length) {
      invalidos[0].focus(); // Lleva al usuario al primer campo con error
      return;
    }

    mensajeExito.hidden = false;
    formulario.reset();
    campos.forEach((campo) => campo.removeAttribute("aria-invalid"));
  });
};

iniciarMenu();
iniciarFormulario();
