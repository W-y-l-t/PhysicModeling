(function() {
    'use strict';
  
    function meshgrid(x, y) {
      const X = numeric.rep([y.length, x.length], 0);
      const Y = numeric.rep([y.length, x.length], 0);
      for (let i = 0; i < y.length; i++) {
        for (let j = 0; j < x.length; j++) {
          X[i][j] = x[j];
          Y[i][j] = y[i];
        }
      }
      return [X, Y];
    }
  
    /* ---------------- ФИЗИЧЕСКАЯ МОДЕЛЬ -------------------------
       I(θ,λ) = sinc²(π·period·sinθ / λ)  · [ sin(Nφ/2)/sin(φ/2) ]²,
       φ = 2π·period·sinθ / λ.
    */
    function diffractionIntensity(thetaGrid, wavelengthGrid, period, strokes) {
        const pi = Math.PI;

        const phase = (factor) =>
        numeric.div(
            numeric.mul(pi * factor,
                        thetaGrid.map(row => row.map(Math.sin))),
            wavelengthGrid)

        // Огибающая (одна щель)
        const phasePeriod = phase(period);             // π·d·sinθ/λ
        // Интерференция N щелей
        const phaseStrokes = phase(period * strokes);  // π·dN·sinθ/λ
        const phaseD = phase(period);            // π·d·sinθ/λ

        // [ sin(α)/α ]²
        const sinc2   = numeric.div(
                        numeric.pow(numeric.sin(phasePeriod), 2),
                        numeric.pow(phasePeriod, 2));

        // [ sin(Nφ/2)/sin(φ/2) ]²
        const envelope = numeric.div(
                        numeric.pow(numeric.sin(phaseStrokes), 2),
                        numeric.pow(numeric.sin(phaseD), 2));

        return numeric.mul(sinc2, envelope);
    }
  
    function plotSurface(id, theta, wavelength, intensity) {
        Plotly.newPlot(
          id,
          [{ x: theta, y: wavelength, z: intensity, type: 'surface', colorscale: 'Viridis' }],
          {
            title: 'Интенсивность дифракционной решетки (3D)',
            autosize: true,
            margin: { l: 60, r: 20, t: 50, b: 60 },
            scene: 
            {
              xaxis: { title: 'Угол дифракции' },
              yaxis: { title: 'Длина волны (нм)' },
              zaxis: { title: 'Интенсивность' }
            },
            responsive: true
          }
        );
      }
      
      function plotHeatmap(id, theta, wavelength, intensity, title) {
        Plotly.newPlot(
          id,
          [{ x: theta, y: wavelength, z: intensity, type: 'heatmap', colorscale: 'Viridis' }],
          {
            title,
            autosize: true,
            margin: { l: 60, r: 20, t: 50, b: 60 },
            xaxis: { title: 'Угол дифракции' },
            yaxis: { title: 'Длина волны (нм)' }
          },
          { responsive: true }
        );
      }
  
    function plotGraphs() {
      const period = parseFloat(document.getElementById('period').value);
      const strokes = parseInt(document.getElementById('total_strokes').value, 10);
  
      const theta = numeric.linspace(-Math.PI / 2, Math.PI / 2, 100);
      const wavelength = numeric.linspace(400, 750, 2000);
      const [Theta, Wavelength] = meshgrid(theta, wavelength);
  
      const intensity = diffractionIntensity(Theta, Wavelength, period, strokes);
      plotSurface('plot1', theta, wavelength, intensity);
      plotHeatmap('plot2', theta, wavelength, intensity, 'Интенсивность дифракционной решетки (2D)');
  
      const wl1 = 470;
      const wl2 = 475;
      const wlRange = numeric.linspace(450, 495, 2000);
      const [ThetaC] = meshgrid(theta, wlRange);
      const grid1 = numeric.rep([wlRange.length, theta.length], wl1);
      const grid2 = numeric.rep([wlRange.length, theta.length], wl2);
  
      const I1 = diffractionIntensity(ThetaC, grid1, period, strokes);
      const I2 = diffractionIntensity(ThetaC, grid2, period, strokes);
      const combined = numeric.add(I1, I2);
  
      plotHeatmap(
        'plot3', theta, wlRange, combined,
        'Интенсивность близких спектральных линий (2D)'
      );
    }
  
    window.plotGraphs = plotGraphs;
    window.onload = plotGraphs;
  })();
  