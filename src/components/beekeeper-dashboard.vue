<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">Panel del Apicultor</h1>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <UserIcon class="h-5 w-5 text-gray-600" />
          <span class="font-medium text-gray-700">Nombre de Usuario</span>
        </div>
        <button
          @click="handleLogout"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <LogOutIcon class="h-4 w-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </header>

    <!-- Widgets de datos en tiempo real -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Datos en Tiempo Real</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Grouping into Hive and Environment -->
        <div class="bg-white rounded-lg shadow-md">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Colmena</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p class="text-sm text-gray-500">Peso de la Colmena</p>
                  <p class="text-3xl font-bold text-gray-900">{{ realTimeData.weight }} kg</p>
                </div>
                <ScaleIcon class="h-8 w-8 text-green-500" />
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p class="text-sm text-gray-500">Actividad de Abejas</p>
                  <p class="text-3xl font-bold text-gray-900">{{ realTimeData.beeActivity }}</p>
                </div>
                <ActivityIcon class="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Ambiente</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p class="text-sm text-gray-500">Temperatura</p>
                  <p class="text-3xl font-bold text-gray-900">{{ realTimeData.temperature }}°C</p>
                </div>
                <ThermometerIcon class="h-8 w-8 text-orange-500" />
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p class="text-sm text-gray-500">Humedad</p>
                  <p class="text-3xl font-bold text-gray-900">{{ realTimeData.humidity }}%</p>
                </div>
                <CloudRainIcon class="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visualización de alertas -->
    <section class="mb-8">
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
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
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
          <!-- Back buttons for drill-down -->
          <div v-if="selectedMonthIndex !== null || selectedDayIndex !== null" class="mb-4 flex gap-2">
            <button
              v-if="selectedDayIndex !== null"
              @click="handleBackToMonth"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              &larr; Volver a la Vista Mensual
            </button>
            <button
              v-if="selectedMonthIndex !== null && selectedDayIndex === null"
              @click="handleBackToYear"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              &larr; Volver a la Vista Anual
            </button>
          </div>

          <h3 class="text-lg font-medium text-gray-800 mb-3 capitalize">{{ currentHistoricalTitle }}</h3>

          <!-- Conditional rendering for different views -->
          <div v-if="selectedPeriod === 'year' && selectedMonthIndex === null">
            <!-- Year view: list of months with averages and "View Days" button -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <div
                v-for="(month, index) in historicalData.year.monthlyData"
                :key="month.monthValue"
                class="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <p class="font-semibold mb-2">{{ month.label }}</p>
                <p>
                  Temp Media: <span class="font-medium">{{ month.averageTemperature }}°C</span>
                </p>
                <p>
                  Hum Media: <span class="font-medium">{{ month.averageHumidity }}%</span>
                </p>
                <p>
                  Peso Medio: <span class="font-medium">{{ month.averageWeight }} kg</span>
                </p>
                <button
                  @click="handleViewDays(index)"
                  class="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors self-end"
                >
                  Ver Días
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'year' && selectedMonthIndex !== null && selectedDayIndex === null">
            <!-- Month view (drilled down from year): list of days with averages and "View Records" button -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <div
                v-for="(day, index) in historicalData.year.monthlyData[selectedMonthIndex]?.dailyData"
                :key="day.label"
                class="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <p class="font-semibold mb-2">{{ day.label }}</p>
                <p>
                  Temp Media: <span class="font-medium">{{ day.averageTemperature }}°C</span>
                </p>
                <p>
                  Hum Media: <span class="font-medium">{{ day.averageHumidity }}%</span>
                </p>
                <p>
                  Peso Medio: <span class="font-medium">{{ day.averageWeight }} kg</span>
                </p>
                <button
                  @click="handleViewRecords(index)"
                  class="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors self-end"
                >
                  Ver Registros
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'year' && selectedMonthIndex !== null && selectedDayIndex !== null">
            <!-- Day view (drilled down from month): Chart or List of all records for the day -->
            <div class="w-full">
              <div class="flex items-center justify-end space-x-2 mb-4">
                <label for="chart-toggle" class="text-sm font-medium text-gray-700">Mostrar Gráfico</label>
                <button
                  id="chart-toggle"
                  role="switch"
                  :aria-checked="showChart"
                  @click="showChart = !showChart"
                  :class="[
                    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    showChart ? 'bg-blue-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      showChart ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  ></span>
                </button>
              </div>

              <div v-if="showChart" class="w-full h-[400px] bg-white rounded-md shadow-sm p-4">
                <canvas ref="chartCanvas" class="w-full h-full"></canvas>
              </div>
              <div v-else class="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Registros Detallados del Día</h4>
                <ul
                  v-if="historicalData.year.monthlyData[selectedMonthIndex]?.dailyData[selectedDayIndex]?.records && historicalData.year.monthlyData[selectedMonthIndex]?.dailyData[selectedDayIndex]?.records.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700 max-h-[400px] overflow-y-auto"
                >
                  <li
                    v-for="(dataPoint, idx) in historicalData.year.monthlyData[selectedMonthIndex]?.dailyData[selectedDayIndex]?.records"
                    :key="idx"
                    class="bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <p class="font-semibold mb-1">{{ dataPoint.time }}:</p>
                    <div class="grid grid-cols-2 gap-x-2">
                      <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                      <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                      <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-gray-500 text-center py-4">No hay registros detallados para este día.</p>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'month' && selectedDayIndex === null">
            <!-- Month view: list of days with averages and "View Records" button -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <div
                v-for="(day, index) in historicalData.month.dailyData"
                :key="day.label"
                class="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <p class="font-semibold mb-2">{{ day.label }}</p>
                <p>
                  Temp Media: <span class="font-medium">{{ day.averageTemperature }}°C</span>
                </p>
                <p>
                  Hum Media: <span class="font-medium">{{ day.averageHumidity }}%</span>
                </p>
                <p>
                  Peso Medio: <span class="font-medium">{{ day.averageWeight }} kg</span>
                </p>
                <button
                  @click="handleViewRecords(index)"
                  class="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors self-end"
                >
                  Ver Registros
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'month' && selectedDayIndex !== null">
            <!-- Day view (drilled down from month): Chart or List of all records for the day -->
            <div class="w-full">
              <div class="flex items-center justify-end space-x-2 mb-4">
                <label for="chart-toggle-month" class="text-sm font-medium text-gray-700">Mostrar Gráfico</label>
                <button
                  id="chart-toggle-month"
                  role="switch"
                  :aria-checked="showChart"
                  @click="showChart = !showChart"
                  :class="[
                    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    showChart ? 'bg-blue-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      showChart ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  ></span>
                </button>
              </div>

              <div v-if="showChart" class="w-full h-[400px] bg-white rounded-md shadow-sm p-4">
                <canvas ref="chartCanvas" class="w-full h-full"></canvas>
              </div>
              <div v-else class="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Registros Detallados del Día</h4>
                <ul
                  v-if="historicalData.month.dailyData[selectedDayIndex]?.records && historicalData.month.dailyData[selectedDayIndex]?.records.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700 max-h-[400px] overflow-y-auto"
                >
                  <li
                    v-for="(dataPoint, idx) in historicalData.month.dailyData[selectedDayIndex]?.records"
                    :key="idx"
                    class="bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <p class="font-semibold mb-1">{{ dataPoint.time }}:</p>
                    <div class="grid grid-cols-2 gap-x-2">
                      <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                      <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                      <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-gray-500 text-center py-4">No hay registros detallados para este día.</p>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'week' && selectedDayIndex === null">
            <!-- Week view: list of days with averages and "View Records" button -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700">
              <div
                v-for="(day, index) in historicalData.week.dailyData"
                :key="day.label"
                class="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <p class="font-semibold mb-2">{{ day.label }}</p>
                <p>
                  Temp Media: <span class="font-medium">{{ day.averageTemperature }}°C</span>
                </p>
                <p>
                  Hum Media: <span class="font-medium">{{ day.averageHumidity }}%</span>
                </p>
                <p>
                  Peso Medio: <span class="font-medium">{{ day.averageWeight }} kg</span>
                </p>
                <button
                  @click="handleViewRecords(index)"
                  class="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors self-end"
                >
                  Ver Registros
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'week' && selectedDayIndex !== null">
            <!-- Day view (drilled down from week): Chart or List of all records for the day -->
            <div class="w-full">
              <div class="flex items-center justify-end space-x-2 mb-4">
                <label for="chart-toggle-week" class="text-sm font-medium text-gray-700">Mostrar Gráfico</label>
                <button
                  id="chart-toggle-week"
                  role="switch"
                  :aria-checked="showChart"
                  @click="showChart = !showChart"
                  :class="[
                    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    showChart ? 'bg-blue-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      showChart ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  ></span>
                </button>
              </div>

              <div v-if="showChart" class="w-full h-[400px] bg-white rounded-md shadow-sm p-4">
                <canvas ref="chartCanvas" class="w-full h-full"></canvas>
              </div>
              <div v-else class="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Registros Detallados del Día</h4>
                <ul
                  v-if="historicalData.week.dailyData[selectedDayIndex]?.records && historicalData.week.dailyData[selectedDayIndex]?.records.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700 max-h-[400px] overflow-y-auto"
                >
                  <li
                    v-for="(dataPoint, idx) in historicalData.week.dailyData[selectedDayIndex]?.records"
                    :key="idx"
                    class="bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <p class="font-semibold mb-1">{{ dataPoint.time }}:</p>
                    <div class="grid grid-cols-2 gap-x-2">
                      <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                      <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                      <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-gray-500 text-center py-4">No hay registros detallados para este día.</p>
              </div>
            </div>
          </div>

          <div v-else-if="selectedPeriod === 'day'">
            <!-- Day view: Chart or List of all records for the day -->
            <div class="w-full">
              <div class="flex items-center justify-end space-x-2 mb-4">
                <label for="chart-toggle-day" class="text-sm font-medium text-gray-700">Mostrar Gráfico</label>
                <button
                  id="chart-toggle-day"
                  role="switch"
                  :aria-checked="showChart"
                  @click="showChart = !showChart"
                  :class="[
                    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    showChart ? 'bg-blue-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      showChart ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  ></span>
                </button>
              </div>

              <div v-if="showChart" class="w-full h-[400px] bg-white rounded-md shadow-sm p-4">
                <canvas ref="chartCanvas" class="w-full h-full"></canvas>
              </div>
              <div v-else class="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Registros Detallados del Día</h4>
                <ul
                  v-if="historicalData.day.records && historicalData.day.records.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700 max-h-[400px] overflow-y-auto"
                >
                  <li
                    v-for="(dataPoint, idx) in historicalData.day.records"
                    :key="idx"
                    class="bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <p class="font-semibold mb-1">{{ dataPoint.time }}:</p>
                    <div class="grid grid-cols-2 gap-x-2">
                      <p>Temp: <span class="font-medium">{{ dataPoint.temperature }}°C</span></p>
                      <p>Hum: <span class="font-medium">{{ dataPoint.humidity }}%</span></p>
                      <p>Peso: <span class="font-medium">{{ dataPoint.weight }} kg</span></p>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-gray-500 text-center py-4">No hay registros detallados para este día.</p>
              </div>
            </div>
          </div>

          <!-- Fallback for no data (should not be reached with current simulation) -->
          <p
            v-else
            class="text-gray-500 text-center py-4"
          >
            No hay datos disponibles para este período o vista.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { ThermometerIcon, CloudRainIcon, ScaleIcon, ActivityIcon, AlertTriangleIcon, InfoIcon, UserIcon, LogOutIcon } from 'lucide-vue-next';
import Chart from 'chart.js/auto';

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
  alert(`Filtros aplicados:
      Período: ${periods.find((p) => p.value === selectedPeriod.value)?.label}
      Colmena: ${selectedHive.value === 'all' ? 'Todas' : selectedHive.value}
      Fecha Inicio: ${startDate.value || 'N/A'}
      Fecha Fin: ${endDate.value || 'N/A'}
      (Los datos mostrados son simulados y no cambian con el filtro de fecha/colmena en esta demo.)
    `)
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
</script>

<style scoped>
/* No se necesita CSS adicional aquí ya que Tailwind CSS maneja la mayoría del estilo. */
/* Puedes añadir estilos específicos si es necesario. */
</style>