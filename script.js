document.addEventListener("DOMContentLoaded", () => {
  // 1. DATA OFICIAL CON ESTIBA EXACTA (RESPALDO PREVENTIVO)
  let dataStore = {
    kpis: {
      cajas_totales: 25597,
      proyeccion_10: 28157,
      pallets_mes: 102,
      camiones_mes: 4
    },
    semanal: {
      labels: ['Sem 1 (1-7)', 'Sem 2 (8-14)', 'Sem 3 (15-21)', 'Sem 4 (22-28)', 'Sem 5 (29-31)*'],
      impulsivo: [3775, 4021, 4152, 4297, 2373],
      familiar: [1184, 1150, 1227, 1392, 797],
      granel: [241, 344, 260, 212, 172]
    },
    escenarios: {
      labels: ['Impulsivos', 'Familiares', 'Granel'],
      real: [18618, 5750, 1229],
      p5: [19549, 6038, 1290],
      p10: [20480, 6325, 1352],
      p20: [22342, 6900, 1475]
    },
    topPallets: [
      { sku: "12018554", name: "SAVORY Helado Cassata Brick 6x1L N1 CL", cat: "Familiar", code: "fam", cjs: 1381, factor: 135, pallets: 11 },
      { sku: "12345001", name: "KRIKO FRUTILLA 20X60 ML C", cat: "Impulsivo", code: "imp", cjs: 1147, factor: 325, pallets: 4 },
      { sku: "12345002", name: "SAVORY CENTELLA GALACTEA HEL 26X37,6G CL", cat: "Impulsivo", code: "imp", cjs: 1116, factor: 325, pallets: 4 },
      { sku: "12345003", name: "MEGA Helado Frambuesa 16x90ml", cat: "Impulsivo", code: "imp", cjs: 1060, factor: 325, pallets: 4 },
      { sku: "12345004", name: "SAVORY CENTELLA Hel Mz Lm 26x52g CL", cat: "Impulsivo", code: "imp", cjs: 1037, factor: 325, pallets: 4 },
      { sku: "12345005", name: "CHOCOLITO Helado 20x85ml N1 CL", cat: "Impulsivo", code: "imp", cjs: 910, factor: 325, pallets: 3 },
      { sku: "12345006", name: "CRAZY Helado Frambuesa 12x170 ml CL", cat: "Impulsivo", code: "imp", cjs: 894, factor: 198, pallets: 5 },
      { sku: "12345007", name: "COLA DE TIGRE LECHE 26 X 70 ML", cat: "Impulsivo", code: "imp", cjs: 848, factor: 325, pallets: 3 },
      { sku: "12345008", name: "CRAZY Helado Flocos 12x170ml CL", cat: "Impulsivo", code: "imp", cjs: 787, factor: 198, pallets: 4 },
      { sku: "12345009", name: "CROCANTY Helado 20x90ml CL", cat: "Impulsivo", code: "imp", cjs: 744, factor: 325, pallets: 3 }
    ]
  };

  // Cargar datos.json generado por datos.py si está disponible
  fetch("datos.json")
    .then(res => res.json())
    .then(remoteData => {
      if (remoteData.kpis) dataStore.kpis = remoteData.kpis;
      if (remoteData.semanal) dataStore.semanal = remoteData.semanal;
      if (remoteData.escenarios) dataStore.escenarios = remoteData.escenarios;
      if (remoteData.top_pallets && remoteData.top_pallets.length > 0) {
        dataStore.topPallets = remoteData.top_pallets.map(p => ({
          sku: p.sku || "N/A",
          name: p.name,
          cat: p.familia_label || (p.cat === "fam" ? "Familiar" : (p.cat === "granel" ? "Granel" : "Impulsivo")),
          code: p.cat,
          cjs: p.cjs,
          factor: p.factor_pallet || (p.cat === "fam" ? 135 : (p.cat === "granel" ? 96 : 325)),
          pallets: Math.ceil(p.pallets || (p.cjs / (p.factor_pallet || 325)))
        }));
      }
      actualizarDashboard();
    })
    .catch(() => {
      actualizarDashboard();
    });

  // 2. ANIMACIÓN DE NÚMEROS EN LOS KPIS
  const animateValue = (element, target, duration = 1400) => {
    let start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easeOutQuad * target);

      element.textContent = current.toLocaleString("es-CL");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString("es-CL");
      }
    };
    requestAnimationFrame(update);
  };

  // 3. REFERENCIAS DEL DOM (BAHÍA E INSPECTOR)
  const truckGrid = document.getElementById("truckGrid");
  const inspSlot = document.getElementById("inspSlot");
  const inspName = document.getElementById("inspName");
  const inspCat = document.getElementById("inspCat");
  const inspFactor = document.getElementById("inspFactor");
  const inspCjs = document.getElementById("inspCjs");

  // Carga operativa considerando estiba oficial
  const truckLoads = {
    iquique: {
      titulo: "Camión #1: Troncal Iquique Centro (Alta Densidad)",
      pallets: [
        { name: "Kriko Frutilla", cat: "Impulsivo", code: "imp", factor: 325, cjs: 1147, count: 8 },
        { name: "Centella Galáctea", cat: "Impulsivo", code: "imp", factor: 325, cjs: 1116, count: 7 },
        { name: "Mega Frambuesa", cat: "Impulsivo", code: "imp", factor: 325, cjs: 1060, count: 6 },
        { name: "Chocolito", cat: "Impulsivo", code: "imp", factor: 325, cjs: 910, count: 4 },
        { name: "Cassata Brick 1L", cat: "Familiar", code: "fam", factor: 135, cjs: 1381, count: 3 }
      ]
    },
    hospicio: {
      titulo: "Camión #2: Conurbación Hospicio + Iquique Sur",
      pallets: [
        { name: "Cassata Brick 1L", cat: "Familiar", code: "fam", factor: 135, cjs: 1381, count: 7 },
        { name: "Crazy Frambuesa", cat: "Impulsivo", code: "imp", factor: 198, cjs: 894, count: 6 },
        { name: "Centella Mz Limón", cat: "Impulsivo", code: "imp", factor: 325, cjs: 1037, count: 6 },
        { name: "Cola de Tigre", cat: "Impulsivo", code: "imp", factor: 325, cjs: 848, count: 5 },
        { name: "Chocolate Suizo 1L", cat: "Familiar", code: "fam", factor: 135, cjs: 700, count: 4 }
      ]
    },
    interior: {
      titulo: "Camión #3: Stock Iquique + Ruta Pampa Tamarugal",
      pallets: [
        { name: "Crazy Flocos", cat: "Impulsivo", code: "imp", factor: 198, cjs: 787, count: 6 },
        { name: "Trululu Súper", cat: "Impulsivo", code: "imp", factor: 325, cjs: 644, count: 6 },
        { name: "Crocanty", cat: "Impulsivo", code: "imp", factor: 325, cjs: 744, count: 5 },
        { name: "Cassata Brick 1L", cat: "Familiar", code: "fam", factor: 135, cjs: 1381, count: 5 },
        { name: "Crazy Sangurucho", cat: "Impulsivo", code: "imp", factor: 260, cjs: 723, count: 4 },
        { name: "Baldes Granel 4.8L", cat: "Granel", code: "granel", factor: 96, cjs: 400, count: 2 }
      ]
    }
  };

  function recargarBahiaCamion(tipoRuta) {
    const dataRuta = truckLoads[tipoRuta];
    if (!dataRuta || !truckGrid) return;

    truckGrid.innerHTML = "";
    let slotCount = 1;

    dataRuta.pallets.forEach(prod => {
      for (let i = 0; i < prod.count; i++) {
        if (slotCount <= 28) {
          const slotNumber = `P-${String(slotCount).padStart(2, '0')}`;
          const block = document.createElement("div");
          block.className = `pallet-block ${prod.code}`;
          block.innerHTML = `
            <span class="p-id">${slotNumber}</span>
            <span class="p-name">${prod.name.split(" ")[0]}</span>
          `;

          block.addEventListener("mouseenter", () => {
            if (inspSlot) inspSlot.textContent = slotNumber;
            if (inspName) inspName.textContent = prod.name;
            if (inspCat) {
              inspCat.textContent = prod.cat;
              inspCat.className = `insp-pill ${prod.code}`;
            }
            if (inspFactor) inspFactor.textContent = `${prod.factor} CJS/Pallet`;
            if (inspCjs) inspCjs.textContent = `${prod.cjs.toLocaleString("es-CL")} CJS`;
          });

          truckGrid.appendChild(block);
          slotCount++;
        }
      }
    });

    const p1 = dataRuta.pallets[0];
    if (inspSlot) inspSlot.textContent = "P-01";
    if (inspName) inspName.textContent = p1.name;
    if (inspCat) {
      inspCat.textContent = p1.cat;
      inspCat.className = `insp-pill ${p1.code}`;
    }
    if (inspFactor) inspFactor.textContent = `${p1.factor} CJS/Pallet`;
    if (inspCjs) inspCjs.textContent = `${p1.cjs.toLocaleString("es-CL")} CJS`;
  }

  const fleetCards = document.querySelectorAll(".fleet-card");
  fleetCards.forEach(card => {
    card.addEventListener("click", () => {
      fleetCards.forEach(c => c.classList.remove("active-route"));
      card.classList.add("active-route");
      const ruta = card.getAttribute("data-dest");
      recargarBahiaCamion(ruta);
    });
  });

  // 4. FUNCIÓN PARA LIMPIAR NOMBRES EN EL EJE Y
  const formatearNombreComercial = (nombreCompleto) => {
    const u = nombreCompleto.toUpperCase();
    if (u.includes("CASSATA BRICK")) return "Cassata Brick 1L";
    if (u.includes("KRIKO")) return "Kriko Frutilla";
    if (u.includes("CENTELLA GALACTEA")) return "Centella Galáctea";
    if (u.includes("MEGA FRAMBUESA")) return "Mega Frambuesa";
    if (u.includes("CENTELLA") && u.includes("MZ")) return "Centella Mz Limón";
    if (u.includes("CHOCOLITO")) return "Chocolito";
    if (u.includes("CRAZY") && u.includes("FRAMBUESA")) return "Crazy Frambuesa";
    if (u.includes("COLA DE TIGRE") || u.includes("TIGRE")) return "Cola de Tigre";
    if (u.includes("CRAZY") && u.includes("FLOCOS")) return "Crazy Flocos";
    if (u.includes("CROCANTY")) return "Crocanty";
    if (u.includes("SUIZO")) return "Chocolate Suizo 1L";
    if (u.includes("TRES LECHES")) return "Tres Leches 1L";
    return nombreCompleto.length > 20 ? nombreCompleto.substring(0, 20) + "..." : nombreCompleto;
  };

  // 5. INICIALIZADOR GLOBAL DEL DASHBOARD
  function actualizarDashboard() {
    document.querySelectorAll(".counter").forEach(counter => {
      const id = counter.id;
      let target = parseInt(counter.getAttribute("data-target"), 10);
      if (id === "kpi-cajas" && dataStore.kpis.cajas_totales) target = dataStore.kpis.cajas_totales;
      if (id === "kpi-proy" && dataStore.kpis.proyeccion_10) target = dataStore.kpis.proyeccion_10;
      if (id === "kpi-pallets" && dataStore.kpis.pallets_mes) target = dataStore.kpis.pallets_mes;
      if (id === "kpi-camiones" && dataStore.kpis.camiones_mes) target = dataStore.kpis.camiones_mes;
      animateValue(counter, target);
    });

    recargarBahiaCamion("iquique");

    // Gráfico 1: Ventas Semanales Apiladas
    const ctxSem = document.getElementById("chartSemanas");
    if (ctxSem) {
      new Chart(ctxSem, {
        type: "bar",
        data: {
          labels: dataStore.semanal.labels,
          datasets: [
            { label: "Impulsivos", data: dataStore.semanal.impulsivo, backgroundColor: "#2563EB", borderRadius: 4 },
            { label: "Familiares", data: dataStore.semanal.familiar, backgroundColor: "#059669", borderRadius: 4 },
            { label: "Granel", data: dataStore.semanal.granel, backgroundColor: "#D97706", borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, grid: { color: "rgba(255,255,255,0.05)" } }
          }
        }
      });
    }

    // Gráfico 2: Escenarios 2026
    const ctxEsc = document.getElementById("chartEscenarios");
    let chartEsc = null;
    if (ctxEsc) {
      chartEsc = new Chart(ctxEsc, {
        type: "bar",
        data: {
          labels: dataStore.escenarios.labels,
          datasets: [
            { label: "Real 2025", data: dataStore.escenarios.real, backgroundColor: "#64748B", borderRadius: 4 },
            { label: "+5%", data: dataStore.escenarios.p5, backgroundColor: "#38BDF8", borderRadius: 4 },
            { label: "+10% (Target)", data: dataStore.escenarios.p10, backgroundColor: "#2563EB", borderRadius: 4 },
            { label: "+20%", data: dataStore.escenarios.p20, backgroundColor: "#1E1B4B", borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "rgba(255,255,255,0.05)" } }
          }
        }
      });
    }

    const btnAll = document.getElementById("btnAllEscenarios");
    const btnF10 = document.getElementById("btnFocus10");

    if (btnAll && btnF10 && chartEsc) {
      btnAll.addEventListener("click", function() {
        this.classList.add("active");
        btnF10.classList.remove("active");
        chartEsc.data.datasets.forEach(ds => ds.hidden = false);
        chartEsc.update();
      });

      btnF10.addEventListener("click", function() {
        this.classList.add("active");
        btnAll.classList.remove("active");
        chartEsc.data.datasets.forEach(ds => {
          ds.hidden = (ds.label !== "Real 2025" && ds.label !== "+10% (Target)");
        });
        chartEsc.update();
      });
    }

    // Gráfico 3 & 4 (Top 10): Barras Horizontales y Gráficos Circulares Comparativos
    const ctxTop = document.getElementById("chartPalletsTop");
    const ctxPieMes = document.getElementById("chartPieMes");
    const ctxPieSem = document.getElementById("chartPieSemana");

    const boxBarras = document.getElementById("boxBarras");
    const boxCirculares = document.getElementById("boxCirculares");
    const btnBarras = document.getElementById("btnVistaBarras");
    const btnCircular = document.getElementById("btnVistaCircular");
    const subPallets = document.getElementById("subtituloPallets");

    const coloresTop10 = [
      "#10B981", "#2563EB", "#3B82F6", "#06B6D4", "#6366F1",
      "#8B5CF6", "#EC4899", "#F59E0B", "#F97316", "#64748B"
    ];

    let chartTopInstance = null;
    let chartPieMesInstance = null;
    let chartPieSemInstance = null;

    if (ctxTop) {
      chartTopInstance = new Chart(ctxTop, {
        type: "bar",
        data: {
          labels: dataStore.topPallets.map(p => `${formatearNombreComercial(p.name)} (${p.factor} c/p)`),
          datasets: [{
            label: "Pallets Reales Calculados",
            data: dataStore.topPallets.map(p => p.pallets),
            backgroundColor: dataStore.topPallets.map(p => p.code === "imp" ? "#2563EB" : (p.code === "fam" ? "#059669" : "#D97706")),
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => dataStore.topPallets[items[0].dataIndex].name,
                label: (ctx) => ` Demanda Mes: ${ctx.parsed.x} Pallets Reales (Clic para ver ficha)`
              }
            }
          },
          scales: {
            x: { ticks: { stepSize: 1 }, grid: { color: "rgba(255,255,255,0.05)" } },
            y: { grid: { display: false } }
          },
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              abrirModalProducto(dataStore.topPallets[idx], "mes");
            }
          }
        }
      });
    }

    // Inicialización de Gráficos Circulares Ordenados y con Texto Blanco Legible
    function inicializarGraficosCirculares() {
      if (chartPieMesInstance && chartPieSemInstance) return;

      // 1. DATA MES: Ordenada de Mayor a Menor por Pallets del Mes
      const itemsMesOrdenados = [...dataStore.topPallets].sort((a, b) => b.pallets - a.pallets);

      // 2. DATA SEMANA: Ordenada de Mayor a Menor por Pallets Semanales
      const itemsSemOrdenados = [...dataStore.topPallets].sort((a, b) => {
        const palSemB = b.pallets / 4.43;
        const palSemA = a.pallets / 4.43;
        return palSemB - palSemA;
      });

      // 1. DONUT MES
      if (ctxPieMes) {
        chartPieMesInstance = new Chart(ctxPieMes, {
          type: "doughnut",
          data: {
            labels: itemsMesOrdenados.map(p => `${formatearNombreComercial(p.name)}: ${p.pallets} plts`),
            datasets: [{
              data: itemsMesOrdenados.map(p => p.pallets),
              backgroundColor: coloresTop10,
              borderWidth: 2,
              borderColor: "#0A0F1D",
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#F8FAFC", // TEXTO BLANCO BRILLANTE DE ALTA VISIBILIDAD
                  boxWidth: 12,
                  boxHeight: 12,
                  usePointStyle: true,
                  padding: 12,
                  font: {
                    size: 11,
                    weight: "600",
                    family: "'Plus Jakarta Sans', sans-serif"
                  }
                }
              },
              tooltip: {
                callbacks: {
                  title: (items) => itemsMesOrdenados[items[0].dataIndex].name,
                  label: (ctx) => ` Demanda Mes: ${ctx.raw} Pallets (Clic para ver ficha)`
                }
              }
            },
            cutout: "60%",
            onClick: (evt, elements) => {
              if (elements && elements.length > 0) {
                const idx = elements[0].index;
                abrirModalProducto(itemsMesOrdenados[idx], "mes");
              }
            }
          }
        });
      }

      // 2. DONUT SEMANA
      if (ctxPieSem) {
        chartPieSemInstance = new Chart(ctxPieSem, {
          type: "doughnut",
          data: {
            labels: itemsSemOrdenados.map(p => {
              const palExacto = (p.pallets / 4.43).toFixed(1);
              return `${formatearNombreComercial(p.name)}: ~${Math.max(1, Math.round(p.pallets / 4.43))} plts (${palExacto})`;
            }),
            datasets: [{
              data: itemsSemOrdenados.map(p => Math.max(1, Math.round(p.pallets / 4.43))),
              backgroundColor: coloresTop10,
              borderWidth: 2,
              borderColor: "#0A0F1D",
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#F8FAFC", // TEXTO BLANCO BRILLANTE DE ALTA VISIBILIDAD
                  boxWidth: 12,
                  boxHeight: 12,
                  usePointStyle: true,
                  padding: 12,
                  font: {
                    size: 11,
                    weight: "600",
                    family: "'Plus Jakarta Sans', sans-serif"
                  }
                }
              },
              tooltip: {
                callbacks: {
                  title: (items) => itemsSemOrdenados[items[0].dataIndex].name,
                  label: (ctx) => ` Demanda Semanal: ${ctx.raw} Pallets (Clic para ver ficha)`
                }
              }
            },
            cutout: "60%",
            onClick: (evt, elements) => {
              if (elements && elements.length > 0) {
                const idx = elements[0].index;
                abrirModalProducto(itemsSemOrdenados[idx], "semana");
              }
            }
          }
        });
      }
    }

    if (btnBarras && btnCircular) {
      btnBarras.addEventListener("click", () => {
        btnBarras.classList.add("active");
        btnCircular.classList.remove("active");
        if (boxBarras) boxBarras.style.display = "block";
        if (boxCirculares) boxCirculares.style.display = "none";
        if (subPallets) subPallets.textContent = "Visualiza el ranking de pallets según el cubicaje oficial de cada helado.";
      });

      btnCircular.addEventListener("click", () => {
        btnCircular.classList.add("active");
        btnBarras.classList.remove("active");
        if (boxBarras) boxBarras.style.display = "none";
        if (boxCirculares) boxCirculares.style.display = "grid";
        if (subPallets) subPallets.textContent = "Comparativa de ocupación: Volumen total acumulado (Mes) vs. Cupo de carga semanal.";
        inicializarGraficosCirculares();
      });
    }

    // Gráfico Donut de Comunas
    const ctxZonas = document.getElementById("chartZonas");
    if (ctxZonas) {
      new Chart(ctxZonas, {
        type: "doughnut",
        data: {
          labels: ["Iquique (69.9%)", "Alto Hospicio (26.0%)", "Pozo Almonte (2.4%)", "Pica (1.0%)", "Huara / Camiña (0.7%)"],
          datasets: [{
            data: [17890, 6650, 620, 260, 177],
            backgroundColor: ["#2563EB", "#059669", "#D97706", "#7C3AED", "#64748B"],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { boxWidth: 12, usePointStyle: true, color: "#94A3B8" }
            }
          },
          cutout: "68%"
        }
      });
    }
  }

  // 6. CONTROL DEL MODAL DINÁMICO (BLINDADO Y SIN ERRORES DE VARIABLE)
  const modal = document.getElementById("productModal");
  const modalClose = document.getElementById("modalCloseBtn");

  function abrirModalProducto(prod, vista = "mes") {
    if (!modal || !prod) return;

    const elSku = document.getElementById("modalSkuPill");
    const elTitle = document.getElementById("modalProdTitle");
    const elCat = document.getElementById("modalCat");
    const elFactor = document.getElementById("modalFactor");
    const elCjs = document.getElementById("modalCjs");
    const elPallets = document.getElementById("modalPallets");
    const elNote = document.getElementById("modalImpactNote");

    if (elSku) elSku.textContent = prod.sku && prod.sku !== "N/A" ? `SKU: ${prod.sku}` : "SKU OFICIAL SAVORY";
    if (elTitle) elTitle.textContent = prod.name;
    if (elCat) elCat.textContent = prod.cat;
    if (elFactor) elFactor.textContent = `${prod.factor} CJS/Pallet`;

    const labelCjs = elCjs ? elCjs.closest('.spec-item').querySelector('.spec-label') : null;
    const labelPallets = elPallets ? elPallets.closest('.spec-item').querySelector('.spec-label') : null;

    if (vista === "semana") {
      // ==========================================
      // A) VISTA SEMANAL (ROTACIÓN Y DESPACHO)
      // ==========================================
      const palSemExacto = prod.pallets / 4.43;
      const cjsSem = Math.round(prod.cjs / 4.43);

      const minPal = Math.floor(palSemExacto);
      const maxPal = Math.ceil(palSemExacto);
      const rangoPallets = minPal === maxPal ? `${maxPal} Pallets` : `${minPal} a ${maxPal} Pallets`;

      if (labelCjs) labelCjs.textContent = "VENTA SEMANAL PROMEDIO";
      if (elCjs) elCjs.textContent = `${cjsSem.toLocaleString("es-CL")} Cajas / 7 días`;

      if (labelPallets) labelPallets.textContent = "ESPACIO EN RAMPLA (DE 28 SLOTS)";
      if (elPallets) elPallets.textContent = `${rangoPallets} en el camión por semana`;

      if (elNote) {
        elNote.innerHTML = `🚚 <strong>Interpretación Operativa (Semanal):</strong> En 1 semana se consumen <strong>${cjsSem.toLocaleString("es-CL")} cajas</strong> de este helado. Para cubrir esa venta, cada despacho semanal debe llevar <strong>${rangoPallets} en el camión</strong> (${prod.factor} cajas por pallet).`;
      }

    } else {
      // ==========================================
      // B) VISTA MENSUAL (CONSOLIDADO EN BODEGA)
      // ==========================================
      if (labelCjs) labelCjs.textContent = "VENTA TOTAL DEL MES";
      if (elCjs) elCjs.textContent = `${prod.cjs.toLocaleString("es-CL")} Cajas en el mes`;

      if (labelPallets) labelPallets.textContent = "VOLUMEN MENSUAL EN BODEGA";
      if (elPallets) elPallets.textContent = `${prod.pallets} Pallets en el mes (Acumulado)`;

      if (elNote) {
        if (prod.factor <= 140) {
          elNote.innerHTML = `📦 <strong>Interpretación Operativa (Mensual):</strong> En todo el mes se despachan <strong>${prod.cjs.toLocaleString("es-CL")} cajas</strong>, ocupando <strong>${prod.pallets} pallets de piso</strong> en bodega. Por su formato voluminoso (${prod.factor} cjs/pal), este solo producto representa casi <strong>medio camión rampla completo</strong> del mes.`;
        } else if (prod.factor === 198) {
          elNote.innerHTML = `📦 <strong>Interpretación Operativa (Mensual):</strong> En todo el mes se comercializan <strong>${prod.cjs.toLocaleString("es-CL")} cajas</strong>, ocupando <strong>${prod.pallets} pallets</strong> acumulados en bodega con estiba intermedia (${prod.factor} cjs/pal).`;
        } else {
          elNote.innerHTML = `📦 <strong>Interpretación Operativa (Mensual):</strong> Con <strong>${prod.cjs.toLocaleString("es-CL")} cajas</strong> vendidas al mes, solo requiere <strong>${prod.pallets} pallets</strong> en bodega gracias a su alta densidad (${prod.factor} cajas por pallet).`;
        }
      }
    }

    modal.classList.add("active");
  }

  if (modalClose) {
    modalClose.onclick = () => modal.classList.remove("active");
  }
  window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("active");
  };

  Chart.defaults.color = "#94A3B8";
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
});