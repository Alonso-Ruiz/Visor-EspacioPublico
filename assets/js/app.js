function cerrarPortada() {
    var m = document.getElementById('welcome-modal');
    m.style.opacity = '0';
    setTimeout(function() { m.style.display = 'none'; }, 300);
}

document.querySelectorAll('[data-action="close-welcome"]').forEach(function(button) {
    button.addEventListener('click', cerrarPortada);
});

var panelDer = document.getElementById('panel-derecho');
var btnAbrir = document.getElementById('btn-abrir-panel');
document.getElementById('btn-cerrar-panel').onclick = function() { panelDer.classList.add('oculto'); btnAbrir.style.display = 'flex'; };
btnAbrir.onclick = function() { panelDer.classList.remove('oculto'); btnAbrir.style.display = 'none'; };

var ficha = document.getElementById('ficha-tecnica');
function cerrarFicha() {
    ficha.style.display = 'none';
    sourceHighlight.clear();
}

document.getElementById('btn-cerrar-ficha').addEventListener('click', cerrarFicha);

var formatJSON = new ol.format.GeoJSON();
function leerFeaturesSeguro(jsonData) {
    if(!jsonData) return [];
    return formatJSON.readFeatures(jsonData, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
}

// ESTILOS DINÁMICOS

// ─── Reglamento de Espacios Públicos — Tabla Oficial Art. 43 ──
var ATU_PARAMS = {
    'Conservación':  {ovLim:'85%', ca:'60%', ogLim:'15%', ms:'10%', mr:'5%',  mc:'2%',  mu:'2%',  ioe:'0.015',hu:'250 m²',alt:'4 m'},
    'Consolidación': {ovLim:'75%', ca:'40%', ogLim:'25%', ms:'15%', mr:'20%', mc:'2%',  mu:'2%',  ioe:'0.03', hu:'350 m²',alt:'4 m'},
    'Generación':    {ovLim:'75%', ca:'30%', ogLim:'25%', ms:'15%', mr:'20%', mc:'5%',  mu:'2%',  ioe:'0.05', hu:'500 m²',alt:'4 m'},
    'Dinamización':  {ovLim:'80%', ca:'30%', ogLim:'20%', ms:'15%', mr:'15%', mc:'5%',  mu:'2%',  ioe:'0.08', hu:'400 m²',alt:'7.5 m'},
    'Renovación':    {ovLim:'40%', ca:'15%', ogLim:'60%', ms:'25%', mr:'40%', mc:'15%', mu:'15%', ioe:'0.2',  hu:'400 m²',alt:'4.5 m'}
};
var styleManzanas = new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(100, 116, 139, 0.4)', width: 1 }), fill: new ol.style.Fill({ color: 'rgba(241, 245, 249, 0.1)' }) });

var styleParquesFn = function(feature, resolution) {
    var styles = [new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#10b981', width: 1.5 }), fill: new ol.style.Fill({ color: 'rgba(16, 185, 129, 0.25)' }) })];
    var z = map.getView().getZoomForResolution(resolution);
    var nombre = feature.get('NOMBRE');
    if (z > 16 && nombre) { 
        styles.push(new ol.style.Style({
            text: new ol.style.Text({ text: nombre, placement: 'polygon', fill: new ol.style.Fill({ color: '#064e3b' }), stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }), font: 'bold 11px sans-serif', overflow: true })
        }));
    }
    return styles;
};

var styleRedVialFn = function(feature, resolution) {
    var isPrin = document.getElementById('chk-vial-prin').checked;
    var isSec = document.getElementById('chk-vial-sec').checked;
    
    var clasif = String(feature.get('CLASIFIC') || feature.get('CLASIFICA') || feature.get('NIVEL') || '').toLowerCase();
    var esPrincipal = clasif.includes('principal') || clasif.includes('preferencial') || clasif.includes('arterial');
    
    if (esPrincipal && !isPrin) return null;
    if (!esPrincipal && !isSec) return null;

    var styles = [new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#334155', width: 2.5, lineCap: 'round' }) })];

    var z = map.getView().getZoomForResolution(resolution);
    var nombre = feature.get('NOMBRE_FIN');
    if (z > 16.5 && nombre) { 
        styles.push(new ol.style.Style({
            text: new ol.style.Text({ text: nombre, placement: 'line', maxAngle: Math.PI / 4, fill: new ol.style.Fill({ color: '#0f172a' }), stroke: new ol.style.Stroke({ color: '#ffffff', width: 3.5 }), font: 'bold 11px sans-serif' })
        }));
    }
    return styles;
};

var styleHighlight = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#3b82f6', width: 5 }), fill: new ol.style.Fill({ color: 'rgba(59, 130, 246, 0.3)' }) });

var satSource = new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', maxZoom: 22 });
var googleSat = new ol.layer.Tile({ source: satSource, opacity: 0.3 });

var vectorManzanas = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Manzanas_0 !== 'undefined' ? leerFeaturesSeguro(json_Manzanas_0) : [] }), style: styleManzanas, zIndex: 10 });
var vectorParques = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Parques_2 !== 'undefined' ? leerFeaturesSeguro(json_Parques_2) : [] }), style: styleParquesFn, declutter: true, zIndex: 12 });
var vectorRedVial = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_red_vial_3 !== 'undefined' ? leerFeaturesSeguro(json_red_vial_3) : [] }), style: styleRedVialFn, declutter: true, zIndex: 14 });

var sourceHighlight = new ol.source.Vector();
var layerHighlight = new ol.layer.Vector({ source: sourceHighlight, style: styleHighlight, zIndex: 20 });

var map = new ol.Map({
    target: 'map', renderer: ['webgl', 'canvas'],
    layers: [googleSat, vectorManzanas, vectorParques, vectorRedVial, layerHighlight],
    view: new ol.View({ center: ol.proj.fromLonLat([-76.9933, -12.0951]), zoom: 14, minZoom: 13, maxZoom: 22 }),
    controls: [new ol.control.Zoom(), new ol.control.ScaleLine({ units: 'metric' })]
});

// NORTE Y CENTRADO DE ROTACIÓN (Optimizado)
var northBtn = document.createElement('div');
northBtn.className = 'north-arrow-ctrl';
northBtn.innerHTML = '<i class="fas fa-location-arrow" id="compass-icon"></i>';
northBtn.onclick = function() {
    var view = map.getView();
    view.animate({ rotation: 0, duration: 500, easing: ol.easing.easeOut });
};
map.addControl(new ol.control.Control({ element: northBtn }));
map.getView().on('change:rotation', function() { document.getElementById('compass-icon').style.transform = `rotate(${map.getView().getRotation()}rad)`; });

// Eventos de Capas
document.getElementById('chk-redvial').onchange = e => {
    vectorRedVial.setVisible(e.target.checked);
    document.getElementById('chk-vial-prin').disabled = !e.target.checked;
    document.getElementById('chk-vial-sec').disabled = !e.target.checked;
};
document.getElementById('chk-vial-prin').onchange = () => vectorRedVial.changed();
document.getElementById('chk-vial-sec').onchange = () => vectorRedVial.changed();
document.getElementById('chk-parques').onchange = e => vectorParques.setVisible(e.target.checked);
document.getElementById('chk-manzanas').onchange = e => vectorManzanas.setVisible(e.target.checked);
document.getElementById('sat-opacity').oninput = e => googleSat.setOpacity(parseFloat(e.target.value));

// ==========================================
// LÓGICA DE LA FICHA TÉCNICA Y STREET VIEW
// ==========================================
function agregarFilaValida(htmlArr, etiqueta, valor) {
    if (valor && valor !== 'null' && String(valor).trim() !== '' && valor !== '-') {
        htmlArr.push(`<tr><td>${etiqueta}</td><td>${valor}</td></tr>`);
    }
}

function construirStreetView(coord) {
    var lonLat = ol.proj.toLonLat(coord);
    var lat = lonLat[1];
    var lng = lonLat[0];
    // Ciberseguridad: Añadido referrerpolicy="no-referrer"
    return `<div class="sv-container">
                <iframe class="street-view-frame" title="Vista de calle" src="https://maps.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed" allowfullscreen referrerpolicy="no-referrer"></iframe>
            </div>`;
}

function mostrarFicha(feature, coordinate) {
    if (!feature || feature.getProperties().MZ_ID) { cerrarFicha(); return; }

    var p = feature.getProperties();
    sourceHighlight.clear();
    sourceHighlight.addFeature(feature);
    
    var title = document.getElementById('ficha-title');
    var content = document.getElementById('ficha-content');
    var htmlRows = [];
    var finalHtml = construirStreetView(coordinate);

    if (p.NOMBRE) {
        // Data from refined Excel (parques_data.js)
        var pd2     = (typeof PARQUES_DATA !== 'undefined' && p['CÓDIGO']) ? (PARQUES_DATA[p['CÓDIGO']] || null) : null;
        var atuTipo = (pd2 ? pd2.atu : null) || (p.ATU || '').split('/')[0].trim() || '—';
        var ap      = ATU_PARAMS[atuTipo] || null;
        var atuClass = 'atu-' + atuTipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        var ocv     = pd2 ? pd2.ocv : null;   // % verde actual (from Excel)
        var ocg     = pd2 ? pd2.ocg : null;   // % gris actual  (from Excel)

        title.innerHTML = '<i class="fas fa-tree"></i> ' + p.NOMBRE;

        var areaNum = parseFloat(p['ÁREA']);
        var areaFmt = isNaN(areaNum) ? '—' : areaNum.toLocaleString('es-PE',{maximumFractionDigits:0}) + ' m²';

        // ── Header ─────────────────────────────────────────────────
        finalHtml += '<div class="park-summary '+atuClass+'">'
                   + '<span class="atu-badge">'+atuTipo+'</span>'
                   + '<div class="park-metadata">'
                   + (p['CÓDIGO'] ? '<strong class="park-code">'+p['CÓDIGO']+'</strong> · ' : '')
                   + areaFmt
                   + (p.CLASIFICAC ? '<br><span class="park-classification">'+p.CLASIFICAC+'</span>' : '')
                   + '</div></div>';

        // helpers
        var pct = function(v){ return v !== null && v !== undefined ? v.toFixed(1).replace('.0','') + '%' : '—'; };
        var TH  = 'class="norm-section"';
        var TL  = 'class="norm-label"';
        var TLA = 'class="norm-label norm-label--strong"';
        var TR  = 'class="norm-value"';
        var TR2 = 'class="norm-value norm-value--secondary"';
        var SEP = 'class="norm-row"';

        finalHtml += '<table class="norm-table">';

        // ── BLOQUE 1: Situación actual (del Excel) ─────────────────
        if (ocv !== null) {
            var ovLimNum = ap ? parseFloat(ap.ovLim) : null;
            var ogLimNum = ap ? parseFloat(ap.ogLim) : null;
            var ovOk = ovLimNum !== null ? ocv >= ovLimNum : null;
            var ogOk = ogLimNum !== null ? ocg <= ogLimNum : null;
            var tick = function(ok){ return ok === null ? '' : (ok ? ' <span class="status status--ok">✓</span>' : ' <span class="status status--error">✗</span>'); };

            finalHtml += '<tr><td colspan="3" '+TH+'>Situación Actual del Parque</td></tr>'
            // verde bar + value
                      + '<tr '+SEP+'>'
                      + '<td '+TLA+'>Ocupación verde</td>'
                      + '<td class="progress-cell">'
                      + '<progress class="occupancy-progress occupancy-progress--green" value="'+ocv+'" max="100">'+pct(ocv)+'</progress>'
                      + '</td>'
                      + '<td class="norm-value norm-value--green">'+pct(ocv)+tick(ovOk)+'</td></tr>'
            // gris bar + value
                      + '<tr '+SEP+'>'
                      + '<td '+TL+'>Ocupación gris</td>'
                      + '<td class="progress-cell">'
                      + '<progress class="occupancy-progress occupancy-progress--gray" value="'+ocg+'" max="100">'+pct(ocg)+'</progress>'
                      + '</td>'
                      + '<td class="norm-value norm-value--gray">'+pct(ocg)+tick(ogOk)+'</td></tr>';

            // Compliance note
            if (ovOk === false || ogOk === false) {
                finalHtml += '<tr><td colspan="3" class="compliance compliance--error">'
                           + '&#9888; El parque presenta déficit respecto al límite normativo.</td></tr>';
            } else if (ovOk === true && ogOk === true) {
                finalHtml += '<tr><td colspan="3" class="compliance compliance--ok">'
                           + '&#10003; El parque cumple con los límites normativos.</td></tr>';
            }
        }

        // ── BLOQUE 2: Límites normativos (refinados) ───────────────
        if (ap) {
            finalHtml += '<tr><td colspan="3" '+TH+'>Límites Normativos — Art. 43 RGEP</td></tr>'
                      + '<tr '+SEP+'><td '+TLA+'>Áreas verdes mínimas</td><td></td><td class="norm-value norm-value--green">'+(ap.ovLim||'—')+'</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'>Cobertura arbórea mínima</td><td></td><td class="norm-value norm-value--green-secondary">'+(ap.ca||'—')+'</td></tr>'
                      + '<tr class="norm-row norm-row--section-end"><td '+TL+'>Gris máxima absoluta</td><td></td><td class="norm-value norm-value--red">'+(ap.ogLim||'—')+'</td></tr>';
        }

        // ── BLOQUE 3: Módulos Funcionales ─────────────────────────
        if (ap) {
            finalHtml += '<tr><td colspan="3" '+TH+'>Módulos Funcionales</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'> Soporte <span class="module-code">(MS)</span></td><td></td><td '+TR2+'>'+(ap.ms||'—')+'</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'> Recreativo <span class="module-code">(MR)</span></td><td></td><td '+TR2+'>'+(ap.mr||'—')+'</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'> Comercial <span class="module-code">(MC)</span></td><td></td><td '+TR2+'>'+(ap.mc||'—')+'</td></tr>'
                      + '<tr class="norm-row norm-row--section-end"><td '+TL+'> Otros Usos <span class="module-code">(MU)</span></td><td></td><td '+TR2+'>'+(ap.mu||'—')+'</td></tr>'
                      + '<tr><td colspan="3" class="norm-note">* MC + MU ≤ 15% del área total</td></tr>';
        }

        // ── BLOQUE 4: Máximo de Área Techada para Módulos Funcionales ─────────────────────────────────
        if (ap) {
            finalHtml += '<tr><td colspan="3" '+TH+'>Máximo de Área Techada para Módulos Funcionales</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'>Índice de Ocupación para Infraestructura (IOE)</td><td></td><td '+TR2+'>'+(ap.ioe||'—')+'</td></tr>'
                      + '<tr '+SEP+'><td '+TL+'>Huella máxima</td><td></td><td '+TR2+'>'+(ap.hu||'—')+'</td></tr>'
                      + '<tr><td '+TL+'>Altura máxima</td><td></td><td '+TR2+'>'+(ap.alt||'—')+'</td></tr>';
        }

        finalHtml += '</table>';
    } else if (p.NOMBRE_FIN) {
        title.innerHTML = `<i class="fas fa-road"></i> ${p.NOMBRE_FIN}`;
        agregarFilaValida(htmlRows, "Clasificación Normativa", p.CLASIFIC);
        if(p.ANCHO && p.ANCHO !== '-') htmlRows.push(`<tr><td>Ancho Normativo Vigente</td><td>${p.ANCHO} m</td></tr>`);
        
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
        
        if (p.FRANJAS && p.FRANJAS !== 'null' && String(p.FRANJAS).trim() !== '') {
            // Ciberseguridad: rel="noopener noreferrer"
            finalHtml += `<a href="${p.FRANJAS}" target="_blank" rel="noopener noreferrer" class="btn-accion"><i class="fas fa-file-pdf"></i> Diseño de Franjas (PDF)</a>`;
        }
    }

    content.innerHTML = finalHtml;
    ficha.style.display = 'flex';
}

map.on('singleclick', function(evt) {
    if (document.body.classList.contains('streetview-targeting')) return;
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(f) { return f; }, { hitTolerance: 5 });
    mostrarFicha(feature, evt.coordinate);
});

map.on('pointermove', function(evt) {
    if (evt.dragging) return;
    var hit = map.forEachFeatureAtPixel(evt.pixel, function(f) { 
        return f.getProperties().MZ_ID ? false : true; 
    }, { hitTolerance: 5 });
    map.getViewport().classList.toggle('is-hovering', hit);
});

// ==========================================
// BUSCADOR CON ENMARCADO Y AUTO-CLICK
// ==========================================
var dictBusqueda = [];
[vectorRedVial, vectorParques].forEach(layer => {
    layer.getSource().getFeatures().forEach(f => {
        var p = f.getProperties();
        var nom = p.NOMBRE_FIN || p.NOMBRE || "";
        if (nom && nom.trim() !== "") {
            dictBusqueda.push({ label: nom, searchToken: nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), tipo: p.NOMBRE_FIN ? "Vía" : "Parque", feature: f });
        }
    });
});
dictBusqueda.sort((a, b) => a.label.localeCompare(b.label));

var inputBuscador = document.getElementById('buscador-rgep');
var resDiv = document.getElementById('lista-resultados');

inputBuscador.addEventListener('input', function() {
    var val = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    resDiv.innerHTML = '';
    if(val.length < 2) { resDiv.style.display = 'none'; return; }
    
    var matches = dictBusqueda.filter(v => v.searchToken.includes(val)).slice(0, 8);
    
    if(matches.length === 0) {
        resDiv.innerHTML = '<div class="search-empty">Sin resultados.</div>';
    } else {
        matches.forEach(v => {
            var item = document.createElement('div');
            item.className = 'resultado-item resultado-item--' + (v.tipo === 'Parque' ? 'parque' : 'via');
            item.setAttribute('role', 'option');
            item.innerHTML = `<span class="res-titulo">${v.label}</span><span class="res-sub">${v.tipo}</span>`;
            item.onclick = function() {
                inputBuscador.value = v.label;
                resDiv.style.display = 'none';
                inputBuscador.blur();
                
                var ext = v.feature.getGeometry().getExtent();
                var center = ol.extent.getCenter(ext);
                
                var pLeft = window.innerWidth <= 896 ? 20 : 400; 
                var pBottom = window.innerWidth <= 896 ? 120 : 50; 
                map.getView().fit(ext, { padding: [50, 50, pBottom, pLeft], maxZoom: 18, duration: 800 });
                
                setTimeout(function() { mostrarFicha(v.feature, center); }, 850);
            };
            resDiv.appendChild(item);
        });
    }
    resDiv.style.display = 'block';
});

document.addEventListener('click', function(event) {
    if (!document.getElementById('search-box').contains(event.target)) {
        resDiv.style.display = 'none';
    }
});
