class TemperatureMap {
    constructor(containerId, width, height) {
        this.container = d3.select(`#${containerId}`);
        this.width = width;
        this.height = height;
        
        // Create SVG element
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'temperature-map');
        
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.width]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0]);
            
        // Create color scale (blue to red)
        this.colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([-10, 40]); // Temperature range in °C
            
        // Initialize map elements
        this.initMap();
    }
    
    initMap() {
        // Add background
        this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#f8f9fa')
            .attr('rx', 4);
            
        // Create main group for map elements
        this.mapGroup = this.svg.append('g')
            .attr('class', 'map-group');
            
        // Create tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('box-shadow', '0 0 8px rgba(0,0,0,0.2)')
            .style('font-family', 'Open Sans, sans-serif')
            .style('font-size', '14px')
            .style('pointer-events', 'none');
            
        // Add loading state
        this.showLoading();
    }
    
    showLoading() {
        this.mapGroup.selectAll('*').remove();
        
        this.mapGroup.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#666')
            .text('Cargando datos de temperatura...');
    }
    
    updateData(data) {
        // Clear existing elements
        this.mapGroup.selectAll('*').remove();
        
        // Create a grid of temperature points
        const gridSize = 10;
        const points = [];
        
        for (let x = 0; x <= 100; x += gridSize) {
            for (let y = 0; y <= 100; y += gridSize) {
                // Simulate temperature based on position (for demo)
                const value = 20 + 
                    (Math.sin(x/20) * 10) + 
                    (Math.cos(y/20) * 8) + 
                    (y/100 * 15) - 
                    (Math.abs(x-50)/50 * 5);
                
                points.push({ x, y, value });
            }
        }
        
        // Create temperature points
        this.mapGroup.selectAll('.temperature-point')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'temperature-point')
            .attr('cx', d => this.xScale(d.x))
            .attr('cy', d => this.yScale(d.y))
            .attr('r', gridSize/2)
            .attr('fill', d => this.colorScale(d.value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8)
            .on('mouseover', (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                this.tooltip.html(`
                    <strong>Temperatura:</strong> ${d.value.toFixed(1)}°C<br>
                    <strong>Posición:</strong> (${d.x.toFixed(1)}, ${d.y.toFixed(1)})
                `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 40) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
            
        // Add contour lines
        this.addContourLines(points);
        
        // Add legend
        this.addLegend();
    }
    
    addContourLines(points) {
        // Generate contour data
        const contourData = d3.contourDensity()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y))
            .weight(d => d.value)
            .size([this.width, this.height])
            .bandwidth(20)
            .thresholds(10)(points);
            
        // Draw contours
        this.mapGroup.append('g')
            .attr('class', 'contours')
            .selectAll('path')
            .data(contourData)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.5);
    }
    
    addLegend() {
        // Remove existing legend
        this.svg.select('.legend').remove();
        
        // Legend dimensions
        const legendWidth = 150;
        const legendHeight = 20;
        const margin = 20;
        
        // Create legend group
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - legendWidth - margin}, ${margin})`);
            
        // Add legend title
        legend.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('Temperatura (°C)');
            
        // Create gradient
        const gradient = legend.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');
            
        // Add gradient stops
        gradient.selectAll('stop')
            .data(d3.range(0, 1.01, 0.1))
            .enter()
            .append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => this.colorScale(d * 50 - 10));
            
        // Add gradient rect
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)')
            .attr('rx', 2);
            
        // Add scale ticks
        const tickValues = [-10, 0, 10, 20, 30, 40];
        const xScale = d3.scaleLinear()
            .domain([-10, 40])
            .range([0, legendWidth]);
            
        legend.selectAll('.legend-tick')
            .data(tickValues)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${xScale(d)}, ${legendHeight})`)
            .call(g => {
                g.append('line')
                    .attr('y1', 0)
                    .attr('y2', 5)
                    .attr('stroke', '#555')
                    .attr('stroke-width', 1);
                    
                g.append('text')
                    .attr('y', 18)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .text(d => d);
            });
    }
}

export class TemperatureMap {
    constructor(containerId, width, height) {
        this.container = d3.select(`#${containerId}`);
        this.width = width;
        this.height = height;
        
        // Create SVG element
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'temperature-map');
        
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.width]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0]);
            
        // Create color scale (blue to red)
        this.colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([-10, 40]); // Temperature range in °C
            
        // Initialize map elements
        this.initMap();
    }
    
    initMap() {
        // Add background
        this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#f8f9fa')
            .attr('rx', 4);
            
        // Create main group for map elements
        this.mapGroup = this.svg.append('g')
            .attr('class', 'map-group');
            
        // Create tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('box-shadow', '0 0 8px rgba(0,0,0,0.2)')
            .style('font-family', 'Open Sans, sans-serif')
            .style('font-size', '14px')
            .style('pointer-events', 'none');
            
        // Add loading state
        this.showLoading();
    }
    
    showLoading() {
        this.mapGroup.selectAll('*').remove();
        
        this.mapGroup.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#666')
            .text('Cargando datos de temperatura...');
    }
    
    updateData(data) {
        // Clear existing elements
        this.mapGroup.selectAll('*').remove();
        
        // Create a grid of temperature points
        const gridSize = 10;
        const points = [];
        
        for (let x = 0; x <= 100; x += gridSize) {
            for (let y = 0; y <= 100; y += gridSize) {
                // Simulate temperature based on position (for demo)
                const value = 20 + 
                    (Math.sin(x/20) * 10) + 
                    (Math.cos(y/20) * 8) + 
                    (y/100 * 15) - 
                    (Math.abs(x-50)/50 * 5);
                
                points.push({ x, y, value });
            }
        }
        
        // Create temperature points
        this.mapGroup.selectAll('.temperature-point')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'temperature-point')
            .attr('cx', d => this.xScale(d.x))
            .attr('cy', d => this.yScale(d.y))
            .attr('r', gridSize/2)
            .attr('fill', d => this.colorScale(d.value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8)
            .on('mouseover', (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                this.tooltip.html(`
                    <strong>Temperatura:</strong> ${d.value.toFixed(1)}°C<br>
                    <strong>Posición:</strong> (${d.x.toFixed(1)}, ${d.y.toFixed(1)})
                `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 40) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
            
        // Add contour lines
        this.addContourLines(points);
        
        // Add legend
        this.addLegend();
    }
    
    addContourLines(points) {
        // Generate contour data
        const contourData = d3.contourDensity()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y))
            .weight(d => d.value)
            .size([this.width, this.height])
            .bandwidth(20)
            .thresholds(10)(points);
            
        // Draw contours
        this.mapGroup.append('g')
            .attr('class', 'contours')
            .selectAll('path')
            .data(contourData)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.5);
    }
    
    addLegend() {
        // Remove existing legend
        this.svg.select('.legend').remove();
        
        // Legend dimensions
        const legendWidth = 150;
        const legendHeight = 20;
        const margin = 20;
        
        // Create legend group
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - legendWidth - margin}, ${margin})`);
            
        // Add legend title
        legend.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('Temperatura (°C)');
            
        // Create gradient
        const gradient = legend.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');
            
        // Add gradient stops
        gradient.selectAll('stop')
            .data(d3.range(0, 1.01, 0.1))
            .enter()
            .append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => this.colorScale(d * 50 - 10));
            
        // Add gradient rect
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)')
            .attr('rx', 2);
            
        // Add scale ticks
        const tickValues = [-10, 0, 10, 20, 30, 40];
        const xScale = d3.scaleLinear()
            .domain([-10, 40])
            .range([0, legendWidth]);
            
        legend.selectAll('.legend-tick')
            .data(tickValues)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${xScale(d)}, ${legendHeight})`)
            .call(g => {
                g.append('line')
                    .attr('y1', 0)
                    .attr('y2', 5)
                    .attr('stroke', '#555')
                    .attr('stroke-width', 1);
                    
                g.append('text')
                    .attr('y', 18)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .text(d => d);
            });
    }
}
