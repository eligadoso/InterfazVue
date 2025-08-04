<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Panel del Apicultor</h1>

    <!-- Widgets de datos en tiempo real -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Datos en Tiempo Real</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Temperatura</p>
            <p class="text-3xl font-bold text-gray-900">{{ realTimeData.temperature }}°C</p>
          </div>
          <ThermometerIcon class="h-8 w-8 text-orange-500" />
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Humedad</p>
            <p class="text-3xl font-bold text-gray-900">{{ realTimeData.humidity }}%</p>
          </div>
          <CloudRainIcon class="h-8 w-8 text-blue-500" />
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Peso de la Colmena</p>
            <p class="text-3xl font-bold text-gray-900">{{ realTimeData.weight }} kg</p>
          </div>
          <ScaleIcon class="h-8 w-8 text-green-500" />
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Actividad de Abejas</p>
            <p class="text-3xl font-bold text-gray-900">{{ realTimeData.beeActivity }}</p>
          </div>
          <ActivityIcon class="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </section>

    <!-- Visualización de datos históricos -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Datos Históricos</h2>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectPeriod(period.value)"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedPeriod === period.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            {{ period.label }}
          </button>
        </div>

        <!-- Nuevos Filtros -->
        <div class="flex flex-wrap items-end gap-4 mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 class="text-lg font-medium text-gray-800 w-full mb-2">Filtros Adicionales:</h3>
          <!-- Filtro de Colmena -->
          <div>
            <label for="hive-select" class="block text-sm font-medium text-gray-700 mb-1">Colmena:</label>
            <select
              id="hive-select"
              v-model="selectedHive"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todas las Colmenas</option>
              <option value="hive-1">Colmena #1</option>
              <option value="hive-2">Colmena #2</option>
              <option value="hive-3">Colmena #3</option>
            </select>
          </div>

          <!-- Filtros de Rango de Fechas -->
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio:</label>
            <input
              type="date"
              id="start-date"
              v-model="startDate"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin:</label>
            <input
              type="date"
              id="end-date"
              v-model="endDate"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>

        <div class="border border-gray-200 rounded-md p-4 min-h-[200px] flex flex-col bg-gray-50">
          <div v-if="selectedPeriod === 'year' && selectedMonthInYear">
            <button
              @click="selectedMonthInYear = null"
              class="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              &larr; Volver a la Vista Anual
            </button>
            <h3 class="text-lg font-medium text-gray-800 mb-3">{{ currentHistoricalTitle }}</h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <li v-for="(dataPoint, index) in displayedHistoricalData" :key="index" class="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <p class="font-semibold mb-1">{{ dataPoint.label }}:</p>
                <div class="grid grid-cols-2 gap-x-2">
                  <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                  <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                  <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                </div>
              </li>
            </ul>
          </div>
          <div v-else-if="selectedPeriod === 'year'">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Datos del Año por Mes</h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <li v-for="month in historicalData.year" :key="month.monthValue" class="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between">
                <p class="font-semibold mb-2">{{ month.label }}</p>
                <button
                  @click="selectedMonthInYear = month.monthValue"
                  class="px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors self-end"
                >
                  Ver Días
                </button>
              </li>
            </ul>
          </div>
          <div v-else-if="displayedHistoricalData.length > 0" class="w-full">
            <h3 class="text-lg font-medium text-gray-800 mb-3 capitalize">
              {{ currentHistoricalTitle }}
            </h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <li v-for="(dataPoint, index) in displayedHistoricalData" :key="index" class="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <p class="font-semibold mb-1">{{ dataPoint.label }}:</p>
                <div class="grid grid-cols-2 gap-x-2">
                  <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                  <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                  <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                </div>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 text-center py-4">No hay datos disponibles para este período.</p>
          <p class="mt-4 text-gray-600 text-center italic">
            (Aquí se renderizaría un gráfico real con una biblioteca de gráficos)
          </p>
        </div>
      </div>
    </section>

    <!-- Visualización de alertas -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Alertas del Sistema</h2>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div v-if="alerts.length > 0">
          <ul class="space-y-3">
            <li
              v-for="alert in alerts"
              :key="alert.id"
              :class="[
                'p-4 rounded-md border',
                alert.type === 'critical'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800',
              ]"
            >
              <div class="flex items-start">
                <AlertTriangleIcon v-if="alert.type === 'critical'" class="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <InfoIcon v-else class="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <p class="font-semibold">{{ alert.title }}</p>
                  <p class="text-sm">{{ alert.message }}</p>
                  <p class="text-xs text-gray-600 mt-1">{{ new Date(alert.timestamp).toLocaleString() }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No hay alertas activas.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ThermometerIcon, CloudRainIcon, ScaleIcon, ActivityIcon, AlertTriangleIcon, InfoIcon } from 'lucide-vue-next';

// Datos en tiempo real (simulados)
const realTimeData = ref({
  temperature: 35.2,
  humidity: 65.8,
  weight: 25.1,
  beeActivity: 'Normal',
});

let realTimeInterval;

onMounted(() => {
  // Simular actualización de datos en tiempo real cada 3 segundos
  realTimeInterval = setInterval(() => {
    realTimeData.value.temperature = (Math.random() * (38 - 30) + 30).toFixed(1);
    realTimeData.value.humidity = (Math.random() * (75 - 55) + 55).toFixed(1);
    realTimeData.value.weight = (Math.random() * (30 - 20) + 20).toFixed(1);
    const activities = ['Normal', 'Alta', 'Baja'];
    realTimeData.value.beeActivity = activities[Math.floor(Math.random() * activities.length)];
  }, 3000);
});

onUnmounted(() => {
  clearInterval(realTimeInterval);
});

// Datos históricos (simulados)
const selectedPeriod = ref('day');
const selectedMonthInYear = ref(null); // Nuevo estado para el mes seleccionado en la vista anual

const periods = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Año', value: 'year' },
];

// Nuevas variables para filtros
const selectedHive = ref('all');
const startDate = ref('');
const endDate = ref('');

const generateDataPoint = (label) => ({
  label: label,
  temperature: (Math.random() * (38 - 30) + 30).toFixed(1),
  humidity: (Math.random() * (75 - 55) + 55).toFixed(1),
  weight: (Math.random() * (30 - 20) + 20).toFixed(1),
});

const generateDailyData = (daysInMonth) => {
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    data.push(generateDataPoint(`Día ${i}`));
  }
  return data;
};

const generateYearlyData = () => {
  const yearData = [];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Simplificado, ignorando años bisiestos

  monthNames.forEach((name, index) => {
    yearData.push({
      label: name,
      monthValue: (index + 1).toString().padStart(2, '0'), // e.g., '01', '02'
      dailyData: generateDailyData(daysInMonths[index])
    });
  });
  return yearData;
};

const historicalData = ref({
  day: generateDataPoint('Hoy'), // Un solo punto para el día
  week: Array.from({ length: 7 }, (_, i) => generateDataPoint(`Día ${i + 1}`)), // 7 días
  month: Array.from({ length: 30 }, (_, i) => generateDataPoint(`Día ${i + 1}`)), // 30 días
  year: generateYearlyData(), // Datos anuales con estructura de meses y días
});

// Función para cambiar el período y resetear la vista de mes si no es 'year'
const selectPeriod = (period) => {
  selectedPeriod.value = period;
  if (period !== 'year') {
    selectedMonthInYear.value = null; // Resetear la selección de mes si cambiamos de año
  }
};

// Computed property para los datos históricos que se muestran
const displayedHistoricalData = computed(() => {
  if (selectedPeriod.value === 'year' && selectedMonthInYear.value) {
    const monthData = historicalData.value.year.find(
      (month) => month.monthValue === selectedMonthInYear.value
    );
    return monthData ? monthData.dailyData : [];
  }
  return historicalData.value[selectedPeriod.value];
});

// Computed property para el título de la sección de datos históricos
const currentHistoricalTitle = computed(() => {
  if (selectedPeriod.value === 'year' && selectedMonthInYear.value) {
    const monthData = historicalData.value.year.find(
      (month) => month.monthValue === selectedMonthInYear.value
    );
    return monthData ? `Datos de ${monthData.label}` : 'Datos del Año';
  }
  const periodLabel = periods.find(p => p.value === selectedPeriod.value)?.label;
  return `Datos de ${periodLabel === 'Día' ? 'Hoy' : periodLabel === 'Semana' ? 'Esta Semana' : periodLabel === 'Mes' ? 'Este Mes' : 'Este Año'}`;
});


// Función para aplicar filtros (simulada)
const applyFilters = () => {
  console.log('Aplicando filtros:', {
    period: selectedPeriod.value,
    hive: selectedHive.value,
    startDate: startDate.value,
    endDate: endDate.value,
  });
  // En una aplicación real, aquí se haría la llamada a la API o se filtraría la data.
  // Para esta simulación, solo mostraremos un mensaje.
  alert(`Filtros aplicados:
        Período: ${periods.find(p => p.value === selectedPeriod.value).label}
        Colmena: ${selectedHive.value === 'all' ? 'Todas' : selectedHive.value}
        Fecha Inicio: ${startDate.value || 'N/A'}
        Fecha Fin: ${endDate.value || 'N/A'}
        (Los datos mostrados son simulados y no cambian con el filtro de fecha/colmena en esta demo.)
      `);
};

// Alertas del sistema (simuladas)
const alerts = ref([
  {
    id: 1,
    type: 'critical',
    title: 'Alerta Crítica: Peso Anormalmente Bajo',
    message: 'El peso de la colmena ha caído drásticamente. Posible pérdida de enjambre o robo.',
    timestamp: Date.now() - 3600000, // Hace 1 hora
  },
  {
    id: 2,
    type: 'warning',
    title: 'Advertencia: Alta Humedad',
    message: 'Se ha detectado un nivel de humedad elevado en la colmena #3. Considere revisar la ventilación.',
    timestamp: Date.now() - 7200000, // Hace 2 horas
  },
  {
    id: 3,
    type: 'warning',
    title: 'Advertencia: Temperatura Baja',
    message: 'La temperatura en la colmena #1 ha estado por debajo del umbral óptimo durante 6 horas.',
    timestamp: Date.now() - 10800000, // Hace 3 horas
  },
]);
</script>

<style scoped>
/* No se necesita CSS adicional aquí ya que Tailwind CSS maneja la mayoría del estilo. */
/* Puedes añadir estilos específicos si es necesario. */
</style>
