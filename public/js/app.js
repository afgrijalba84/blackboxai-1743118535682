// Import TemperatureMap class
import { TemperatureMap } from './map.js';

// Main Application Controller
class TemperatureModelApp {
    constructor() {
        // DOM Elements
        this.mapContainer = document.getElementById('temperature-map');
        this.chartContainer = document.getElementById('temperature-chart');
        this.altitudeSlider = document.getElementById('altitude-slider');
        this.latitudeSlider = document.getElementById('latitude-slider');
        this.modelSelect = document.getElementById('model-select');
        this.simulateBtn = document.getElementById('simulate-btn');
        this.exportBtn = document.getElementById('export-btn');

        // Application State
        this.state = {
            altitude: 0,
            latitude: 0,
            modelType: 'finite-difference',
            temperatureData: null,
            chartData: null
        };

        // Initialize components
        this.initMap();
        this.initChart();
        this.setupEventListeners();
    }

    // Initialize D3.js map visualization
    initMap() {
        const width = this.mapContainer.clientWidth;
        const height = 400;
        
        // Create temperature map instance
        this.temperatureMap = new TemperatureMap('temperature-map', width, height);
    }

    // Initialize Chart.js visualization
    initChart() {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.height = 250;
        this.chartContainer.appendChild(canvas);

        // Create chart instance
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array(24).fill().map((_, i) => `${i}:00`),
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: Array(24).fill().map(() => Math.random() * 30),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hora del día'
                        }
                    }
                }
            }
        });
    }

    // Set up event listeners
    setupEventListeners() {
        // Parameter sliders
        this.altitudeSlider.addEventListener('input', (e) => {
            this.state.altitude = parseInt(e.target.value);
            this.updateUI();
        });

        this.latitudeSlider.addEventListener('input', (e) => {
            this.state.latitude = parseInt(e.target.value);
            this.updateUI();
        });

        // Model selection
        this.modelSelect.addEventListener('change', (e) => {
            this.state.modelType = e.target.value;
            this.updateUI();
        });

        // Simulate button
        this.simulateBtn.addEventListener('click', () => {
            this.runSimulation();
        });

        // Export button
        this.exportBtn.addEventListener('click', () => {
            this.exportData();
        });
    }

    // Update UI based on current state
    updateUI() {
        // Update chart with dummy data for now
        this.chart.data.datasets[0].data = Array(24).fill().map(
            (_, i) => 20 + Math.sin(i/2) * 10 + this.state.altitude/500 - Math.abs(this.state.latitude)/3
        );
        this.chart.update();
    }

    // Run temperature simulation
    runSimulation() {
        // Show loading state
        this.simulateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Calculando...';
        this.simulateBtn.disabled = true;

        // Clear previous data
        this.state.temperatureData = null;
        this.temperatureMap.showLoading();

        // Simulate computation time based on model complexity
        const delay = this.state.modelType === 'finite-difference' ? 1000 : 2000;

        // Simulate API call
        setTimeout(() => {
            // Generate temperature data
            this.state.temperatureData = this.generateTemperatureData();

            // Update visualizations
            this.updateMap();
            this.updateChart();
            
            // Reset button
            this.simulateBtn.innerHTML = '<i class="fas fa-play me-2"></i>Simular';
            this.simulateBtn.disabled = false;
        }, delay);
    }

    // Update map with new data
    updateMap() {
        // Generate simulated temperature data based on parameters
        const data = this.generateTemperatureData();
        this.temperatureMap.updateData(data);
    }

    // Generate simulated temperature data
    generateTemperatureData() {
        const data = [];
        const gridSize = 5; // More detailed grid
        
        for (let x = 0; x <= 100; x += gridSize) {
            for (let y = 0; y <= 100; y += gridSize) {
                // Simulate temperature based on parameters
                const baseTemp = 20 + 
                    (this.state.latitude / 3) + 
                    (this.state.altitude / 500);
                    
                const value = baseTemp + 
                    (Math.sin(x/20) * 5) + 
                    (Math.cos(y/20) * 4) + 
                    (y/100 * 10) - 
                    (Math.abs(x-50)/50 * 3);
                
                data.push({ 
                    x, 
                    y, 
                    value: Math.max(-10, Math.min(40, value)) // Clamp values
                });
            }
        }
        return data;
    }

    // Update chart with new data
    updateChart() {
        // TODO: Implement actual chart update
        console.log('Updating chart with new data');
    }

    // Export data as CSV
    exportData() {
        if (!this.state.temperatureData) {
            alert('No hay datos para exportar. Ejecute una simulación primero.');
            return;
        }

        // Create CSV content
        let csvContent = "x,y,temperatura\n" + 
            this.state.temperatureData.map(d => 
                `${d.x},${d.y},${d.value.toFixed(2)}`
            ).join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `temperatura_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TemperatureModelApp();
});