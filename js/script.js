/* =========================================================
   Landing Siman - Script principal
   1. Menú de navegación para celular
   2. Validación del formulario de suscripción
   ========================================================= */

/* ---------- 1. Menú de navegación ---------- */
const botonMenu = document.querySelector(".menu-boton");
const menu = document.querySelector("#menu-principal");

if (botonMenu && menu) {
  const alternarMenu = (abrir) => {
    botonMenu.setAttribute("aria-expanded", String(abrir));
    botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("abierto", abrir);
  };

  botonMenu.addEventListener("click", () => {
    alternarMenu(botonMenu.getAttribute("aria-expanded") !== "true");
  });

  // Cierra el menú con la tecla Escape
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      alternarMenu(false);
      botonMenu.focus();
    }
  });

  // Cierra el menú al elegir una opción
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) alternarMenu(false);
  });
}

/* ---------- 2. Formulario de suscripción ---------- */
const formulario = document.querySelector("#form-suscripcion");

if (formulario) {
  const mensajeExito = document.querySelector("#mensaje-exito");

  // Mensajes de error en español para cada campo
  const mensajes = {
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

  // Devuelve el mensaje del primer error encontrado en el campo
  const obtenerError = (campo) => {
    const errores = mensajes[campo.name] ?? {};
    const tipo = Object.keys(errores).find((clave) => campo.validity[clave]);
    return tipo ? errores[tipo] : "";
  };

  // Valida un campo y muestra u oculta su mensaje de error
  const validarCampo = (campo) => {
    const error = obtenerError(campo);
    campo.setAttribute("aria-invalid", error ? "true" : "false");
    document.querySelector(`#error-${campo.name}`).textContent = error;
    return !error;
  };

  // Campos que solo aceptan letras y espacios (marcados con data-solo-texto)
  const caracterNoPermitido = /[^\p{L}\s]/gu;

  for (const campo of formulario.querySelectorAll("[data-solo-texto]")) {
    // Bloquea números y símbolos antes de que se escriban
    campo.addEventListener("beforeinput", (evento) => {
      if (evento.data && new RegExp(caracterNoPermitido.source, "u").test(evento.data)) {
        evento.preventDefault();
      }
    });

    // Limpia lo que llegue pegado o autocompletado
    campo.addEventListener("input", () => {
      const limpio = campo.value.replace(caracterNoPermitido, "");
      if (limpio !== campo.value) campo.value = limpio;
    });
  }

  // Campos de correo: solo caracteres válidos en un email y una sola @
  const caracterNoPermitidoCorreo = /[^A-Za-z0-9._%+\-@]/g;

  for (const campo of formulario.querySelectorAll('input[type="email"]')) {
    // Bloquea espacios, símbolos no válidos y una segunda @
    campo.addEventListener("beforeinput", (evento) => {
      if (!evento.data) return;
      const tieneInvalidos = /[^A-Za-z0-9._%+\-@]/.test(evento.data);
      const segundaArroba = evento.data.includes("@") && campo.value.includes("@");
      if (tieneInvalidos || segundaArroba) evento.preventDefault();
    });

    // Limpia lo que llegue pegado o autocompletado
    campo.addEventListener("input", () => {
      let limpio = campo.value.replace(caracterNoPermitidoCorreo, "");
      const primeraArroba = limpio.indexOf("@");
      if (primeraArroba !== -1) {
        limpio = limpio.slice(0, primeraArroba + 1) + limpio.slice(primeraArroba + 1).replaceAll("@", "");
      }
      if (limpio !== campo.value) campo.value = limpio;
    });
  }

  // Quita espacios sobrantes en los campos de texto
  const limpiarEspacios = (campo) => {
    if (campo.type === "text" || campo.type === "email") {
      campo.value = campo.value.trim().replace(/\s+/g, " ");
    }
  };

  // Valida cada campo cuando el usuario sale de él o lo corrige
  for (const campo of formulario.elements) {
    if (!campo.name) continue;
    campo.addEventListener("blur", () => {
      limpiarEspacios(campo);
      validarCampo(campo);
    });
    campo.addEventListener("change", () => validarCampo(campo));
    campo.addEventListener("input", () => {
      if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
    });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensajeExito.classList.remove("visible");

    const campos = [...formulario.elements].filter((campo) => campo.name);
    campos.forEach(limpiarEspacios);
    const invalidos = campos.filter((campo) => !validarCampo(campo));

    if (invalidos.length > 0) {
      invalidos[0].focus(); // Lleva al usuario al primer campo con error
      return;
    }

    mensajeExito.classList.add("visible");
    formulario.reset();
    campos.forEach((campo) => campo.removeAttribute("aria-invalid"));
  });
}
