const apiURL = "https://mindicador.cl/api/";
let chartInstance;

async function obtenerTiposCambio() {
  try {
    const res = await fetch(apiURL);
    if (!res.ok) {
      throw new Error('Error al obtener los datos de la API');
    }
    const data = await res.json();
    poblarSelect(data);
    return data;
  } catch (error) {
    mostrarError(error.message);
    return cargarDatosLocales();
  }
}

function poblarSelect(data) {
  const select = document.getElementById('moneda');
  select.innerHTML = '';

  const monedas = {
    dolar: 'Dólar',
    euro: 'Euro'
  };  // Limitar a dos monedas específicas

  Object.keys(monedas).forEach(moneda => {
    if (data[moneda]) {
      const option = document.createElement('option');
      option.value = moneda;
      option.text = monedas[moneda];
      select.appendChild(option);
    }
  });
}

async function convertirMoneda() {
  const cantidad = document.getElementById('cantidad').value;
  const moneda = document.getElementById('moneda').value;

  if (!cantidad || cantidad <= 0) {
    mostrarError('Por favor, ingrese una cantidad válida');
    return;
  }

  const datos = await obtenerTiposCambio();
  if (!datos) return;

  let tasaCambio = datos[moneda].valor;

  const resultado = cantidad / tasaCambio;
  document.getElementById('resultado').textContent = `${cantidad} CLP son ${resultado.toFixed(6)} ${moneda.toUpperCase()}`;

  obtenerHistorialMoneda(moneda);
}

function mostrarError(mensaje) {
  document.getElementById('resultado').textContent = `Error: ${mensaje}`;
}

async function obtenerHistorialMoneda(moneda) {
  try {
    const res = await fetch(`${apiURL}${moneda}`);
    if (!res.ok) {
      throw new Error('Error al obtener los datos del historial');
    }
    const data = await res.json();
    mostrarGraficoHistorial(data.serie);
  } catch (error) {
    mostrarError(error.message);
  }
}

function mostrarGraficoHistorial(historial) {
  const labels = historial.slice(0, 10).map(item => formatearFecha(new Date(item.fecha)));
  const valores = historial.slice(0, 10).map(item => item.valor);

  const ctx = document.getElementById('historialChart').getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.reverse(),
      datasets: [{
        label: 'Valor en los últimos 10 días',
        data: valores.reverse(),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }]
    }
  });
}

function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}-${mes}-${año}`;
}

async function cargarDatosLocales() {
  try {
    const res = await fetch('./assets/mindicador.json');
    const data = await res.json();
    poblarSelect(data);
    return data;
  } catch (error) {
    mostrarError('Error al cargar los datos locales');
  }
}

document.addEventListener('DOMContentLoaded', obtenerTiposCambio);
