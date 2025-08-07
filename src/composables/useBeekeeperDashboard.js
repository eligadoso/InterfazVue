import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export function useBeekeeperDashboard() {
  // Nuevas referencias para el gráfico
  const chartCanvas = ref(null);
  let chartInstance = null;

  // --- Data Simulation Functions ---

  // Helper to generate a single data point (e.g., for an hour)
  const generateSingleDataPoint = (timeLabel) => ({
    time: timeLabel,
    temperature: Number.parseFloat((Math.random() * (38 - 30) + 30).toFixed(1)),
    humidity: Number.parseFloat((Math.random() * (75 - 55) + 55).toFixed(1)),
    weight: Number.parseFloat((Math.random() * (30 - 20) + 20).toFixed(1)),
    beeActivity: ["Normal", "Alta", "Baja"][Math.floor(Math.random() * 3)],
  })

  // Helper to generate hourly data for a day and calculate averages
  const generateDailySummary = (dayLabel, numHours = 24) => {
    const records = []
    let totalTemp = 0
    let totalHum = 0
    let totalWeight = 0

    for (let i = 0; i < numHours; i++) {
      const hour = i.toString().padStart(2, "0")
      const timeLabel = `${dayLabel} ${hour}:00`
      const dataPoint = generateSingleDataPoint(timeLabel)
      records.push(dataPoint)
      totalTemp += dataPoint.temperature
      totalHum += dataPoint.humidity
      totalWeight += dataPoint.weight
    }

    return {
      label: dayLabel,
      averageTemperature: Number.parseFloat((totalTemp / numHours).toFixed(1)),
      averageHumidity: Number.parseFloat((totalHum / numHours).toFixed(1)),
      averageWeight: Number.parseFloat((totalWeight / numHours).toFixed(1)),
      records,
    }
  }

  // Helper to generate daily summaries for a month and calculate averages
  const generateMonthlySummary = (monthName, monthValue, daysInMonth) => {
    const dailyData = []
    let totalTemp = 0
    let totalHum = 0
    let totalWeight = 0

    for (let i = 1; i <= daysInMonth; i++) {
      const dayLabel = `Día ${i}`
      const dailySummary = generateDailySummary(dayLabel)
      dailyData.push(dailySummary)
      totalTemp += dailySummary.averageTemperature
      totalHum += dailySummary.averageHumidity
      totalWeight += dailySummary.averageWeight
    }

    return {
      label: monthName,
      monthValue,
      averageTemperature: Number.parseFloat((totalTemp / daysInMonth).toFixed(1)),
      averageHumidity: Number.parseFloat((totalHum / daysInMonth).toFixed(1)),
      averageWeight: Number.parseFloat((totalWeight / daysInMonth).toFixed(1)),
      dailyData,
    }
  }

  // Main function to generate all historical data
  const generateHistoricalData = () => {
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] // Simplified, ignoring leap years

    const yearMonthlyData = monthNames.map((name, index) =>
      generateMonthlySummary(name, (index + 1).toString().padStart(2, "0"), daysInMonths[index]),
    )

    // For 'day' view, just one day's detailed data
    const todayData = generateDailySummary("Hoy")

    // For 'week' view, 7 days' detailed data
    const weekDailyData = Array.from({ length: 7 }, (_, i) => generateDailySummary(`Día ${i + 1} (Semana)`))

    // For 'month' view, 30 days' detailed data (using a generic month)
    const monthDailyData = Array.from({ length: 30 }, (_, i) => generateDailySummary(`Día ${i + 1} (Mes)`))

    return {
      day: todayData,
      week: { dailyData: weekDailyData },
      month: { dailyData: monthDailyData },
      year: { monthlyData: yearMonthlyData },
    }
  }

  // --- State Variables ---
  const realTimeData = ref({
    time: "Ahora",
    temperature: 35.2,
    humidity: 65.8,
    weight: 25.1,
    beeActivity: "Normal",
  })
  const selectedPeriod = ref('day')
  const selectedHive = ref('all')
  const startDate = ref('')
  const endDate = ref('')
  const alerts = ref([
    {
      id: 1,
      type: 'critical',
      title: 'Alerta Crítica: Peso Anormalmente Bajo',
      message: 'El peso de la colmena ha caído drásticamente. Posible pérdida de enjambre o robo.',
      timestamp: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: 2,
      type: 'warning',
      title: 'Advertencia: Alta Humedad',
      message: 'Se ha detectado un nivel de humedad elevado en la colmena #3. Considere revisar la ventilación.',
      timestamp: Date.now() - 7200000, // 2 hours ago
    },
    {
      id: 3,
      type: 'warning',
      title: 'Advertencia: Temperatura Baja',
      message: 'La temperatura en la colmena #1 ha estado por debajo del umbral óptimo durante 6 horas.',
      timestamp: Date.now() - 10800000, // 3 hours ago
    },
  ])

  const showChart = ref(true) // New state for chart toggle

  // New states for drill-down
  const selectedMonthIndex = ref(null)
  const selectedDayIndex = ref(null)

  // --- Constants ---
  const periods = [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Año', value: 'year' },
  ]

  // --- Memoized Data ---
  const historicalData = computed(() => generateHistoricalData())

  // Función para crear/actualizar el gráfico
  const createChart = async () => {
    await nextTick();
    
    if (!chartCanvas.value) return;
    
    // Destruir gráfico existente si existe
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = chartCanvas.value.getContext('2d');
    
    // Obtener datos según el período y vista actual
    let chartData = getChartData();
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: chartData.temperature,
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Humedad (%)',
            data: chartData.humidity,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          },
          {
            label: 'Peso (kg)',
            data: chartData.weight,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: chartData.title
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y;
                if (context.dataset.label === 'Temperatura (°C)') {
                  label += '°C';
                } else if (context.dataset.label === 'Humedad (%)') {
                  label += '%';
                } else if (context.dataset.label === 'Peso (kg)') {
                  label += ' kg';
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tiempo'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperatura (°C)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Humedad (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
          }
        },
      },
    });
  };

  // Función para obtener datos del gráfico según la vista actual
  const getChartData = () => {
    let data = [];
    let title = '';
    
    if (selectedPeriod.value === 'day') {
      data = historicalData.value.day.records;
      title = 'Datos del Día - Registros por Hora';
    } else if (selectedPeriod.value === 'week' && selectedDayIndex.value !== null) {
      data = historicalData.value.week.dailyData[selectedDayIndex.value]?.records || [];
      title = `Datos del ${historicalData.value.week.dailyData[selectedDayIndex.value]?.label} - Registros por Hora`;
    } else if (selectedPeriod.value === 'month' && selectedDayIndex.value !== null) {
      data = historicalData.value.month.dailyData[selectedDayIndex.value]?.records || [];
      title = `Datos del ${historicalData.value.month.dailyData[selectedDayIndex.value]?.label} - Registros por Hora`;
    } else if (selectedPeriod.value === 'year' && selectedMonthIndex.value !== null && selectedDayIndex.value !== null) {
      data = historicalData.value.year.monthlyData[selectedMonthIndex.value]?.dailyData[selectedDayIndex.value]?.records || [];
      title = `Datos del ${historicalData.value.year.monthlyData[selectedMonthIndex.value]?.dailyData[selectedDayIndex.value]?.label} - Registros por Hora`;
    } else {
      // Vista de resumen (semana, mes, año sin drill-down)
      if (selectedPeriod.value === 'week') {
        data = historicalData.value.week.dailyData;
        title = 'Datos de la Semana - Promedios por Día';
      } else if (selectedPeriod.value === 'month') {
        data = historicalData.value.month.dailyData;
        title = 'Datos del Mes - Promedios por Día';
      } else if (selectedPeriod.value === 'year') {
        data = historicalData.value.year.monthlyData;
        title = 'Datos del Año - Promedios por Mes';
      }
    }
    
    const labels = data.map(item => {
      if (item.time) {
        // Para registros por hora
        return item.time.split(' ')[1] || item.time;
      } else {
        // Para resúmenes diarios/mensuales
        return item.label;
      }
    });
    
    const temperature = data.map(item => 
      item.temperature || item.averageTemperature
    );
    
    const humidity = data.map(item => 
      item.humidity || item.averageHumidity
    );
    
    const weight = data.map(item => 
      item.weight || item.averageWeight
    );
    
    return {
      labels,
      temperature,
      humidity,
      weight,
      title
    };
  };

  // Watchers para actualizar el gráfico cuando cambian los datos
  watch([showChart, selectedPeriod, selectedMonthIndex, selectedDayIndex], () => {
    if (showChart.value) {
      nextTick(() => {
        createChart();
      });
    }
  });

  // --- Effects ---
  let realTimeInterval;

  onMounted(() => {
    realTimeInterval = setInterval(() => {
      realTimeData.value = {
        time: "Ahora",
        temperature: Number.parseFloat((Math.random() * (38 - 30) + 30).toFixed(1)),
        humidity: Number.parseFloat((Math.random() * (75 - 55) + 55).toFixed(1)),
        weight: Number.parseFloat((Math.random() * (30 - 20) + 20).toFixed(1)),
        beeActivity: ["Normal", "Alta", "Baja"][Math.floor(Math.random() * 3)],
      }
    }, 3000)
  })

  onUnmounted(() => {
    if (realTimeInterval) {
      clearInterval(realTimeInterval)
    }
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  // --- Handlers ---
  const selectPeriod = (period) => {
    selectedPeriod.value = period
    selectedMonthIndex.value = null
    selectedDayIndex.value = null
  }

  const handleViewDays = (monthIndex) => {
    selectedMonthIndex.value = monthIndex
    selectedDayIndex.value = null // Reset day selection when viewing month
  }

  const handleViewRecords = (dayIndex) => {
    selectedDayIndex.value = dayIndex
  }

  const handleBackToMonth = () => {
    selectedDayIndex.value = null
  }

  const handleBackToYear = () => {
    selectedMonthIndex.value = null
    selectedDayIndex.value = null
  }

  const applyFilters = () => {
    console.log('Aplicando filtros:', {
      period: selectedPeriod.value,
      hive: selectedHive.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
    alert(`Filtros aplicados:\n      Período: ${periods.find((p) => p.value === selectedPeriod.value)?.label}\n      Colmena: ${selectedHive.value === 'all' ? 'Todas' : selectedHive.value}\n      Fecha Inicio: ${startDate.value || 'N/A'}\n      Fecha Fin: ${endDate.value || 'N/A'}\n      (Los datos mostrados son simulados y no cambian con el filtro de fecha/colmena en esta demo.)\n    `)
  }

  const handleLogout = () => {
    alert("Cerrar Sesión") // Placeholder for actual logout logic
    // In a real app, you'd clear auth tokens, redirect, etc.
  }

  // --- Computed Properties for Titles ---
  const currentHistoricalTitle = computed(() => {
    if (selectedPeriod.value === "year") {
      if (selectedMonthIndex.value !== null) {
        const monthLabel = historicalData.value.year.monthlyData[selectedMonthIndex.value]?.label
        if (selectedDayIndex.value !== null) {
          const dayLabel = historicalData.value.year.monthlyData[selectedMonthIndex.value]?.dailyData[selectedDayIndex.value]?.label
          return `Registros de ${dayLabel} de ${monthLabel}`
        }
        return `Datos de ${monthLabel} (Año)`
      }
      return "Datos del Año por Mes"
    }
    if (selectedPeriod.value === "month") {
      if (selectedDayIndex.value !== null) {
        const dayLabel = historicalData.value.month.dailyData[selectedDayIndex.value]?.label
        return `Registros de ${dayLabel} (Mes)`
      }
      return "Datos de Este Mes por Día"
    }
    if (selectedPeriod.value === "week") {
      if (selectedDayIndex.value !== null) {
        const dayLabel = historicalData.value.week.dailyData[selectedDayIndex.value]?.label
        return `Registros de ${dayLabel} (Semana)`
      }
      return "Datos de Esta Semana por Día"
    }
    if (selectedPeriod.value === "day") {
      return "Registros de Hoy"
    }
    return "Datos Históricos"
  })

  // Utility for conditional class names (similar to cn from '@/lib/utils')
  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  // Retornar todas las variables y funciones que necesita el componente
  return {
    // Referencias
    chartCanvas,
    
    // Estado
    realTimeData,
    selectedPeriod,
    selectedHive,
    startDate,
    endDate,
    alerts,
    showChart,
    selectedMonthIndex,
    selectedDayIndex,
    
    // Constantes
    periods,
    
    // Datos computados
    historicalData,
    currentHistoricalTitle,
    
    // Funciones
    selectPeriod,
    handleViewDays,
    handleViewRecords,
    handleBackToMonth,
    handleBackToYear,
    applyFilters,
    handleLogout,
    createChart,
    getChartData,
    cn
  }
}