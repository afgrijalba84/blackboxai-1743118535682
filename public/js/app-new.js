// Import TemperatureMap class
import { TemperatureMap } from './map-new.js';

// Main Application Controller
class TemperatureModelApp {
    constructor() {
        // Initialize application
        this.initElements();
        this.initState();
        this.initComponents();
        this.setupEventListeners();
    }

    initElements() {
        this.mapContainer = document.getElementById('temperature-map');
        this.chartContainer = document.getElementById('temperature-chart');
        this.altitudeSlider = document.getElementById('altitude-slider');
        this.latitudeSlider = document.getElementById('latitude-slider');
        this.modelSelect = document.getElementById('model-select');
        this.simulateBtn = document.getElementById('simulate-btn');
        this.exportBtn = document.getElementById('export-btn');
    }

    initState() {
        this.state = {
            altitude: 0,
            latitude: 0,
            modelType: 'finite-difference',
            temperatureData: null
        };
    }

    initComponents() {
        this.initMap();
        this.initChart();
    }

    initMap() {
        const width = this.mapContainer.clientWidth;
        const height = 400;
        this.temperatureMap = new TemperatureMap('temperature-map', width, height);
    }

    initChart() {
        const canvas = document.createElement('canvas');
        canvas.height = 250;
        this.chartContainer.appendChild(canvas);

        this.chart = new Chart(canvas, {
            type: 'line',
            data: this.getChartData(),
            options: this.getChartOptions()
        });
    }

    getChartData() {
        return {
            labels: Array(24).fill().map((_, i) => `${i}:00`),
            datasets: [{
                label: 'Temperatura (°C)',
                data: this.calculateTemperatureSeries(),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true
            }]
        };
    }

    getChartOptions() {
        return {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Temperatura (°C)' }
                },
                x: {
                    title: { display: true, text: 'Hora del día' }
                }
            }
        };
    }

    setupEventListeners() {
        this.altitudeSlider.addEventListener('input', (e) => {
            this.state.altitude = parseInt(e.target.value);
            this.updateChart();
        });

        this.latitudeSlider.addEventListener('input', (e) => {
            this.state.latitude = parseInt(e.target.value);
            this.updateChart();
        });

        this.modelSelect.addEventListener('change', (e) => {
            this.state.modelType = e.target.value;
        });

        this.simulateBtn.addEventListener('click', () => this.runSimulation());
        this.exportBtn.addEventListener('click', () => this.exportData());
    }

    runSimulation() {
        this.showLoading();
        const delay = this.state.modelType === 'finite-difference' ? 1000 : 2000;

        setTimeout(() => {
            this.state.temperatureData = this.generateTemperatureData();
            this.temperatureMap.updateData(this.state.temperatureData);
            this.resetSimulateButton();
        }, delay);
    }

    showLoading() {
        this.simulateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Calculando...';
        this.simulateBtn.disabled = true;
        this.temperatureMap.showLoading();
    }

    resetSimulateButton() {
        this.simulateBtn.innerHTML = '<i class="fas fa-play me-2"></i>Simular';
        this.simulateBtn.disabled = false;
    }

    generateTemperatureData() {
        const data = [];
        const gridSize = 5;
        
        for (let x = 0; x <= 100; x += gridSize) {
            for (let y = 0; y <= 100; y += gridSize) {
                const value = this.calculateTemperature(x, y);
                data.push({ x, y, value });
            }
        }
        return data;
    }

    calculateTemperature(x, y) {
        const baseTemp = 20 + (this.state.latitude / 3) + (this.state.altitude / 500);
        const value = baseTemp + (Math.sin(x/20) * 5) + (Math.cos(y/20) * 4) + (y/100 * 10) - (Math.abs(x-50)/50 * 3);
        return Math.max(-10, Math.min(40, value));
    }

    calculateTemperatureSeries() {
        return Array(24).fill().map((_, i) => 
            20 + Math.sin(i/2) * 10 + this.state.altitude/500 - Math.abs(this.state.latitude)/3
        );
    }

    updateChart() {
        this.chart.data.datasets[0].data = this.calculateTemperatureSeries();
        this.chart.update();
    }

    exportData() {
        if (!this.state.temperatureData) {
            alert('No hay datos para exportar. Ejecute una simulación primero.');
            return;
        }

        const csvContent = "x,y,temperatura\n" + 
            this.state.temperatureData.map(d => 
                `${d.x},${d.y},${d.value.toFixed(2)}`
            ).join("\n");

        this.downloadCSV(csvContent, `temperatura_${Date.now()}.csv`);
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new TemperatureModelApp();
});