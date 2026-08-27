var headerInfoTimer = null;
var infoHintTimer = null;
var cerrandoAnexosPorFicha = false;
var leyendaResaltadaTimer = null;

function mostrarAyudaInfoTitulo(duracion) {
    var hint = document.getElementById('info-title-hint');
    if (!hint) return;
    hint.classList.add('is-visible');
    if (infoHintTimer) window.clearTimeout(infoHintTimer);
    infoHintTimer = window.setTimeout(function () {
        hint.classList.remove('is-visible');
    }, duracion || 20000);
}

function ocultarInfoTitulo() {
    var header = document.getElementById('header-box');
    var button = document.getElementById('btn-info-title');
    var anexos = document.getElementById('anexos-detalle');
    if (anexos && anexos.open) return;
    if (header) {
        header.classList.add('info-hidden');
        header.setAttribute('aria-hidden', 'true');
    }
    if (button) button.setAttribute('aria-expanded', 'false');
}

function despejarAnexosParaFicha() {
    var header = document.getElementById('header-box');
    var button = document.getElementById('btn-info-title');
    var anexos = document.getElementById('anexos-detalle');

    if (headerInfoTimer) window.clearTimeout(headerInfoTimer);
    if (anexos && anexos.open) {
        cerrandoAnexosPorFicha = true;
        anexos.open = false;
        window.setTimeout(function () { cerrandoAnexosPorFicha = false; }, 120);
    }

    if (header) {
        header.classList.remove('anexos-open');
        header.classList.add('info-hidden');
        header.setAttribute('aria-hidden', 'true');
    }
    if (button) button.setAttribute('aria-expanded', 'false');
}

function mostrarInfoTitulo(duracion) {
    var header = document.getElementById('header-box');
    var button = document.getElementById('btn-info-title');
    var anexos = document.getElementById('anexos-detalle');
    if (!header) return;
    header.classList.remove('info-hidden');
    header.setAttribute('aria-hidden', 'false');
    if (button) button.setAttribute('aria-expanded', 'true');
    if (headerInfoTimer) window.clearTimeout(headerInfoTimer);
    if (!anexos || !anexos.open) {
        headerInfoTimer = window.setTimeout(ocultarInfoTitulo, duracion || 9000);
    }
}

function cerrarPortada() {
    var m = document.getElementById('welcome-modal');
    m.style.opacity = '0';
    setTimeout(function () { m.style.display = 'none'; }, 300);
    window.setTimeout(function () {
        mostrarInfoTitulo(9000);
        mostrarAyudaInfoTitulo(20000);
    }, 350);
}

document.querySelectorAll('[data-action="close-welcome"]').forEach(function (button) {
    button.addEventListener('click', cerrarPortada);
});

document.getElementById('btn-info-title').addEventListener('click', function () {
    mostrarInfoTitulo(12000);
});

document.getElementById('anexos-detalle').addEventListener('toggle', function () {
    var header = document.getElementById('header-box');
    header.classList.toggle('anexos-open', this.open);
    if (headerInfoTimer) window.clearTimeout(headerInfoTimer);
    if (cerrandoAnexosPorFicha && !this.open) {
        cerrandoAnexosPorFicha = false;
        ocultarInfoTitulo();
        return;
    }
    if (this.open) {
        mostrarInfoTitulo();
    } else {
        mostrarInfoTitulo(12000);
    }
});

var panelDer = document.getElementById('panel-derecho');
var btnAbrir = document.getElementById('btn-abrir-panel');
document.getElementById('btn-cerrar-panel').onclick = function () { panelDer.classList.add('oculto'); btnAbrir.style.display = 'flex'; };
btnAbrir.onclick = function () { panelDer.classList.remove('oculto'); btnAbrir.style.display = 'none'; };

function featurePerteneceALayer(feature, layer) {
    return !!(feature && layer && layer.getSource && layer.getSource().hasFeature(feature));
}

function idLeyendaParaVia(feature) {
    var competencia = normalizarTextoFiltro(feature.get('COMPETENCI'));
    var clasif = normalizarTextoFiltro(feature.get('CLASIFIC') || feature.get('CLASIFICA') || feature.get('NIVEL'));
    var subclasif = normalizarTextoFiltro(feature.get('SUBCLASIFI'));
    var categoria = normalizarTextoFiltro(feature.get('CATEGORÍA') || feature.get('CATEGORIA'));
    var esMetropolitana = competencia.includes('metropolitana') || clasif.includes('metropolitana');
    var esPrincipal = clasif.includes('principal') || clasif.includes('preferencial') || clasif.includes('arterial');
    var esSecundaria = clasif.includes('secundaria');

    if (esMetropolitana) {
        if (subclasif.includes('expresa')) return 'chk-vial-expresa';
        if (subclasif.includes('arterial')) return 'chk-vial-arterial';
        if (subclasif.includes('colectora')) return 'chk-vial-colectora';
        return 'chk-vial-met';
    }

    if (esPrincipal) {
        if (categoria.includes('avenida')) return 'chk-pref-avenida';
        if (categoria.includes('calle')) return 'chk-pref-calle';
        if (categoria.includes('jiron')) return 'chk-pref-jiron';
        if (categoria.includes('pasaje')) return 'chk-pref-pasaje';
        return 'chk-vial-prin';
    }

    if (esSecundaria) {
        if (subclasif.includes('transito')) return 'chk-sec-transito';
        if (subclasif.includes('restriccion')) return 'chk-sec-restriccion';
        if (categoria.includes('alameda')) return 'chk-sec-alameda';
        if (categoria.includes('pasaje')) return 'chk-sec-pasaje';
        return 'chk-vial-sec';
    }

    return 'chk-vial-local';
}

function idLeyendaParaAtu(feature) {
    var tipo = String(feature.get('TRAT_URB2') || '').trim();
    var config = ATU_STYLE_CONFIG[tipo];
    return config ? config.id : 'chk-atu';
}

function idLeyendaParaRioSurco(feature) {
    var situacion = normalizarTextoFiltro(feature.get('situación') || feature.get('situacion') || feature.get('TIPO'));
    if (situacion.includes('descubierta')) return 'chk-surco-zona-descubierta';
    if (situacion.includes('cubierta')) return 'chk-surco-zona-cubierta';
    return 'chk-canal-surco';
}

function idLeyendaParaFeature(feature) {
    var tipo = feature && feature.get('__tipo');
    if (!tipo) return null;

    if (tipo === 'via') return idLeyendaParaVia(feature);
    if (tipo === 'parque') return 'chk-parques';
    if (tipo === 'jardin-aislamiento') return 'chk-jardines-aislamiento';
    if (tipo === 'atu') return idLeyendaParaAtu(feature);
    if (tipo === 'sector') return 'chk-sectores';
    if (tipo === 'subsector') return 'chk-subsectores';
    if (tipo === 'servidumbre') return 'chk-servidumbres';
    if (tipo === 'juan-alameda') return 'chk-juan-alamedas';
    if (tipo === 'juan-pasaje-calle' || tipo === 'urb-juan') return 'chk-juan-pasajes-calles';
    if (tipo === 'surco-zona-reglamentada') return 'chk-surco-zona-reglamentada';
    if (tipo === 'surco-faja') return 'chk-surco-faja-marginal';
    if (tipo === 'surco-uso-restringido') return 'chk-surco-usos-restringidos';
    if (tipo === 'rio-surco') return idLeyendaParaRioSurco(feature);
    if (tipo === 'bien-cultural-huaca') return 'chk-huaca-san-borja';
    if (tipo === 'epi') return featurePerteneceALayer(feature, vectorEpiLimatambo) ? 'chk-epi-lt' : 'chk-epi-tsb';

    return null;
}

function abrirDetallesPadres(elemento) {
    var detalle = elemento ? elemento.closest('details') : null;
    while (detalle) {
        detalle.open = true;
        detalle = detalle.parentElement ? detalle.parentElement.closest('details') : null;
    }
}

function elementoVisualLeyenda(input) {
    if (!input) return null;
    return input.closest('.legend-pills label') ||
        input.closest('.capa-item') ||
        input.closest('summary') ||
        input.parentElement;
}

function resaltarLeyendaParaFeature(feature) {
    var id = idLeyendaParaFeature(feature);
    var input = id ? document.getElementById(id) : null;
    var elemento = elementoVisualLeyenda(input);
    if (!elemento) return;

    if (panelDer && panelDer.classList.contains('oculto')) {
        panelDer.classList.remove('oculto');
        if (btnAbrir) btnAbrir.style.display = 'none';
    }

    abrirDetallesPadres(elemento);

    if (leyendaResaltadaTimer) window.clearTimeout(leyendaResaltadaTimer);
    document.querySelectorAll('.legend-focus').forEach(function (actual) {
        actual.classList.remove('legend-focus');
    });

    window.setTimeout(function () {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        elemento.classList.add('legend-focus');
        leyendaResaltadaTimer = window.setTimeout(function () {
            elemento.classList.remove('legend-focus');
        }, 3200);
    }, 80);
}

var ficha = document.getElementById('ficha-tecnica');
var parque3DSeleccionado = null;
var parque3DCacheArboles = new Map();
var parque3DEstado = null;
var parque3DDependenciasPromise = null;
var arbolesMapaPromise = null;
var arbolesMapaCargados = false;
var arbolSeleccionadoId = null;
var overlayArbol = null;

function cerrarFicha() {
    ficha.style.display = 'none';
    sourceHighlight.clear();
}

document.getElementById('btn-cerrar-ficha').addEventListener('click', cerrarFicha);
document.getElementById('park3d-close').addEventListener('click', cerrarParque3D);
document.getElementById('park3d-modal').addEventListener('click', function (event) {
    if (event.target.id === 'park3d-modal') cerrarParque3D();
});
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') cerrarParque3D();
});

var formatJSON = new ol.format.GeoJSON();
function leerFeaturesSeguro(jsonData) {
    if (!jsonData) return [];
    return formatJSON.readFeatures(jsonData, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
}

function crearFeatures(jsonData, tipo) {
    var features = leerFeaturesSeguro(jsonData);
    features.forEach(function (feature) { feature.set('__tipo', tipo, true); });
    return features;
}

// ESTILOS DINÁMICOS

// ─── Reglamento de Espacios Públicos — Tabla Oficial Art. 43 ──
var ATU_PARAMS = {
    'Conservación': { ovLim: '85%', ca: '60%', ogLim: '15%', ms: '10%', mr: '5%', mc: '2%', mu: '2%', ioe: '0.015', hu: '250 m²', alt: '4 m' },
    'Consolidación': { ovLim: '75%', ca: '40%', ogLim: '25%', ms: '15%', mr: '20%', mc: '2%', mu: '2%', ioe: '0.03', hu: '350 m²', alt: '4 m' },
    'Generación': { ovLim: '75%', ca: '30%', ogLim: '25%', ms: '15%', mr: '20%', mc: '5%', mu: '2%', ioe: '0.05', hu: '500 m²', alt: '4 m' },
    'Dinamización': { ovLim: '80%', ca: '30%', ogLim: '20%', ms: '15%', mr: '15%', mc: '5%', mu: '2%', ioe: '0.08', hu: '400 m²', alt: '7.5 m' },
    'Renovación': { ovLim: '40%', ca: '15%', ogLim: '60%', ms: '25%', mr: '40%', mc: '15%', mu: '15%', ioe: '0.2', hu: '400 m²', alt: '4.5 m' }
};
var styleManzanas = new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(100, 116, 139, 0.4)', width: 1 }), fill: new ol.style.Fill({ color: 'rgba(241, 245, 249, 0.1)' }) });
var styleManzanasLimatambo = new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(71, 85, 105, 0.65)', width: 1, lineDash: [5, 3] }), fill: new ol.style.Fill({ color: 'rgba(241, 245, 249, 0.06)' }) });
var styleEpiLimatambo = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#047857', width: 2 }), fill: new ol.style.Fill({ color: 'rgba(16, 185, 129, 0.2)' }) });
var styleEpiTorres = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#0f766e', width: 2 }), fill: new ol.style.Fill({ color: 'rgba(45, 212, 191, 0.22)' }) });
var styleServidumbre = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#a16207', width: 1.5 }), fill: new ol.style.Fill({ color: 'rgba(251, 191, 36, 0.3)' }) });
var styleUrbJuan = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#be123c', width: 1.5 }), fill: new ol.style.Fill({ color: 'rgba(232, 113, 141, 0.35)' }) });
var styleJardinesAislamiento = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#92400e', width: 1.2 }), fill: new ol.style.Fill({ color: 'rgba(229, 182, 54, 0.38)' }) });
var styleJuanAlamedas = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#7f1d1d', width: 1.3 }), fill: new ol.style.Fill({ color: 'rgba(208, 28, 66, 0.34)' }) });
var styleJuanPasajesCalles = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#111827', width: 2.4 }), fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.02)' }) });
var styleLimiteDistrital = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#111827', width: 3, lineDash: [10, 5] }), fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.01)' }) });
var styleSurcoZonaReglamentada = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#dc2626', width: 2, lineDash: [8, 5] }), fill: new ol.style.Fill({ color: 'rgba(220, 38, 38, 0.08)' }) });
var styleSurcoFajaMarginal = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#334155', width: 1.6, lineDash: [3, 3] }), fill: new ol.style.Fill({ color: 'rgba(100, 116, 139, 0.16)' }) });
var styleSurcoUsoRestringido = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: '#065f46', width: 2, lineDash: [8, 5] })
});
var styleHuacaSanBorja = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: '#815000', width: 2 }),
    fill: new ol.style.Fill({ color: 'rgba(129, 80, 0, 0.34)' })
});
if (typeof style_Bienes_culturales_Inmuebles_0 === 'function') {
    styleHuacaSanBorja = style_Bienes_culturales_Inmuebles_0;
}

var ATU_STYLE_CONFIG = {
    'Conservación 1': { id: 'chk-atu-conservacion-1', parent: 'chk-atu-conservacion', color: '81, 210, 21' },
    'Conservación 2': { id: 'chk-atu-conservacion-2', parent: 'chk-atu-conservacion', color: '170, 221, 25' },
    'Conservación 3': { id: 'chk-atu-conservacion-3', parent: 'chk-atu-conservacion', color: '46, 168, 146' },
    'Consolidación 1': { id: 'chk-atu-consolidacion-1', parent: 'chk-atu-consolidacion', color: '192, 117, 13' },
    'Consolidación 2': { id: 'chk-atu-consolidacion-2', parent: 'chk-atu-consolidacion', color: '233, 157, 112' },
    'Consolidación 3': { id: 'chk-atu-consolidacion-3', parent: 'chk-atu-consolidacion', color: '255, 230, 139' },
    'Generación 1': { id: 'chk-atu-generacion-1', parent: 'chk-atu-generacion', color: '23, 177, 230' },
    'Generación 2': { id: 'chk-atu-generacion-2', parent: 'chk-atu-generacion', color: '118, 210, 228' },
    'Dinamización 1': { id: 'chk-atu-dinamizacion-1', parent: 'chk-atu-dinamizacion', color: '233, 59, 43' },
    'Dinamización 2': { id: 'chk-atu-dinamizacion-2', parent: 'chk-atu-dinamizacion', color: '156, 9, 55' },
    'Renovación 1': { id: 'chk-atu-renovacion-1', parent: 'chk-atu-renovacion', color: '182, 64, 211' },
    'Renovación 2': { id: 'chk-atu-renovacion-2', parent: 'chk-atu-renovacion', color: '255, 150, 252' },
    'Renovación 3': { id: 'chk-atu-renovacion-3', parent: 'chk-atu-renovacion', color: '199, 175, 237' }
};

var styleRioSurcoFn = function (feature) {
    if (!filtroActivo('chk-natural-general')) return null;
    if (!filtroActivo('chk-canal-surco')) return null;
    var situacion = normalizarTextoFiltro(feature.get('situación') || feature.get('situacion') || feature.get('TIPO'));
    var descubierta = situacion.includes('descubierta');
    var cubierta = situacion.includes('cubierta') && !descubierta;
    if (cubierta && !filtroActivo('chk-surco-zona-cubierta')) return null;
    if (descubierta && !filtroActivo('chk-surco-zona-descubierta')) return null;
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: cubierta ? '#2563eb' : '#0891b2',
            width: cubierta ? 3 : 2.4,
            lineDash: cubierta ? null : [8, 5],
            lineCap: 'round',
            lineJoin: 'round'
        })
    });
};

function normalizarTextoFiltro(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filtroActivo(id) {
    var input = document.getElementById(id);
    return !input || input.checked;
}

var styleParquesFn = function (feature, resolution) {
    var styles = [new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#65a30d', width: 1.5 }), fill: new ol.style.Fill({ color: 'rgba(101, 163, 13, 0.28)' }) })];
    var z = map.getView().getZoomForResolution(resolution);
    var nombre = feature.get('NOMBRE');
    if (z > 16 && nombre) {
        styles.push(new ol.style.Style({
            text: new ol.style.Text({ text: nombre, placement: 'polygon', fill: new ol.style.Fill({ color: '#064e3b' }), stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }), font: 'bold 11px sans-serif', overflow: true })
        }));
    }
    return styles;
};

var styleAtuFn = function (feature) {
    if (!filtroActivo('chk-atu')) return null;
    var tipo = String(feature.get('TRAT_URB2') || '').trim();
    var config = ATU_STYLE_CONFIG[tipo];
    if (!config || !filtroActivo(config.parent) || !filtroActivo(config.id)) return null;

    return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(15, 23, 42, 0.45)', width: 0.8 }),
        fill: new ol.style.Fill({ color: 'rgba(' + config.color + ', 0.32)' })
    });
};

function crearEstiloEtiqueta(texto, opciones) {
    opciones = opciones || {};
    return new ol.style.Text({
        text: texto || '',
        placement: 'point',
        fill: new ol.style.Fill({ color: opciones.fill || '#ffffff' }),
        stroke: new ol.style.Stroke({ color: opciones.stroke || '#0f172a', width: opciones.strokeWidth || 3 }),
        font: opciones.font || 'bold 13px sans-serif',
        overflow: true
    });
}

var styleSectoresFn = function (feature, resolution) {
    var zoom = map.getView().getZoomForResolution(resolution);
    var nombre = feature.get('Sectores') ? String(feature.get('Sectores')) : '';
    var styles = [new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(1, 107, 255, 0.95)', width: 1.9 }),
        fill: new ol.style.Fill({ color: 'rgba(1, 107, 255, 0.04)' })
    })];
    if (zoom >= 13.5 && nombre) {
        styles.push(new ol.style.Style({
            text: crearEstiloEtiqueta(nombre, {
                fill: '#016bff',
                stroke: '#ffffff',
                strokeWidth: 3.5,
                font: "bold 19px 'Arial Black', sans-serif"
            })
        }));
    }
    return styles;
};

var styleSubsectoresFn = function (feature, resolution) {
    var zoom = map.getView().getZoomForResolution(resolution);
    var nombre = feature.get('RefName') ? String(feature.get('RefName')) : '';
    var styles = [new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(229, 229, 229, 0.95)', width: 1.9 }),
        fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.01)' })
    })];
    if (zoom >= 13.5 && nombre) {
        styles.push(new ol.style.Style({
            text: crearEstiloEtiqueta(nombre, {
                fill: '#ffffff',
                stroke: '#05009a',
                strokeWidth: 4,
                font: "bold 13px 'Arial Black', sans-serif"
            })
        }));
    }
    return styles;
};

var styleRedVialFn = function (feature, resolution) {
    if (!filtroActivo('chk-movilidad-general')) return null;
    var competencia = normalizarTextoFiltro(feature.get('COMPETENCI'));
    var clasif = normalizarTextoFiltro(feature.get('CLASIFIC') || feature.get('CLASIFICA') || feature.get('NIVEL'));
    var subclasif = normalizarTextoFiltro(feature.get('SUBCLASIFI'));
    var categoria = normalizarTextoFiltro(feature.get('CATEGORÍA') || feature.get('CATEGORIA'));
    var esMetropolitana = competencia.includes('metropolitana') || clasif.includes('metropolitana');
    var esPrincipal = clasif.includes('principal') || clasif.includes('preferencial') || clasif.includes('arterial');
    var esSecundaria = clasif.includes('secundaria');

    if (esMetropolitana) {
        if (!filtroActivo('chk-vial-met')) return null;
        if (subclasif.includes('expresa') && !filtroActivo('chk-vial-expresa')) return null;
        if (subclasif.includes('arterial') && !filtroActivo('chk-vial-arterial')) return null;
        if (subclasif.includes('colectora') && !filtroActivo('chk-vial-colectora')) return null;
    } else {
        if (!filtroActivo('chk-vial-local')) return null;

        if (esPrincipal) {
            if (!filtroActivo('chk-vial-prin')) return null;
            if (categoria.includes('avenida') && !filtroActivo('chk-pref-avenida')) return null;
            if (categoria.includes('calle') && !filtroActivo('chk-pref-calle')) return null;
            if (categoria.includes('jiron') && !filtroActivo('chk-pref-jiron')) return null;
            if (categoria.includes('pasaje') && !filtroActivo('chk-pref-pasaje')) return null;
        } else if (esSecundaria) {
            if (!filtroActivo('chk-vial-sec')) return null;
            if (subclasif.includes('transito') && !filtroActivo('chk-sec-transito')) return null;
            if (subclasif.includes('restriccion') && !filtroActivo('chk-sec-restriccion')) return null;
            if (categoria.includes('pasaje') && !filtroActivo('chk-sec-pasaje')) return null;
            if (categoria.includes('alameda') && !filtroActivo('chk-sec-alameda')) return null;
        }
    }

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
var ARBOLES_ZOOM_VISIBLE = 17;
var styleArbolCache = new WeakMap();
var styleArbolCopa = function () {
    return null;
};
var styleArbolPunto = function (feature, resolution) {
    var zoom = map.getView().getZoomForResolution(resolution);
    if (zoom < ARBOLES_ZOOM_VISIBLE) return null;
    var seleccionado = feature.get('__treeSelected');
    var bucket = Math.round(zoom * 2) / 2;
    var cache = styleArbolCache.get(feature);
    if (!cache) {
        cache = Object.create(null);
        styleArbolCache.set(feature, cache);
    }
    var cacheKey = (seleccionado ? '1' : '0') + ':' + bucket;
    if (cache[cacheKey]) return cache[cacheKey];

    var metricas = feature.get('__metricasArbol') || metricasArbolPark3D(feature.getProperties());
    var radioMetros = Math.max(.9, (metricas.ew + metricas.ns) / 4);
    var radioPx = Math.max(3.5, Math.min(24, radioMetros / resolution));
    var puntoPx = bucket >= 18.5 ? 3 : 2;
    cache[cacheKey] = [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: seleccionado ? radioPx + 2 : radioPx,
                fill: new ol.style.Fill({
                    color: seleccionado ? 'rgba(255, 207, 63, 0.48)' : 'rgba(90, 138, 66, 0.38)'
                }),
                stroke: new ol.style.Stroke({
                    color: seleccionado ? '#e0a53a' : 'rgba(63, 107, 48, 0.55)',
                    width: seleccionado ? 1.6 : 0.7
                })
            })
        }),
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: seleccionado ? puntoPx + 1 : puntoPx,
                fill: new ol.style.Fill({ color: seleccionado ? '#274b1c' : 'rgba(39, 75, 28, 0.88)' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: seleccionado ? 1.2 : 0.7 })
            })
        })
    ];
    return cache[cacheKey];
};

var satSource = new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', maxZoom: 22 });
var googleSat = new ol.layer.Tile({ source: satSource, opacity: 0.3 });

var seccionesPorCodigo = Object.create(null);
if (typeof json_Secciones_Viales_3_6 !== 'undefined') {
    json_Secciones_Viales_3_6.features.forEach(function (feature) {
        var propiedades = feature.properties || {};
        if (propiedades.CODIGO) seccionesPorCodigo[propiedades.CODIGO] = propiedades;
    });
}

var vectorManzanas = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Manzanas_0 !== 'undefined' ? crearFeatures(json_Manzanas_0, 'manzana') : [] }), style: styleManzanas, zIndex: 10 });
var vectorManzanasLimatambo = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Manzanas_Limatambo_2 !== 'undefined' ? crearFeatures(json_Manzanas_Limatambo_2, 'manzana') : [] }), style: styleManzanasLimatambo, zIndex: 10 });
var vectorEpiLimatambo = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_EPI_LT_0 !== 'undefined' ? crearFeatures(json_EPI_LT_0, 'epi') : [] }), style: styleEpiLimatambo, zIndex: 11 });
var vectorEpiTorres = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_EPI_TSB_1 !== 'undefined' ? crearFeatures(json_EPI_TSB_1, 'epi') : [] }), style: styleEpiTorres, zIndex: 11 });
var vectorServidumbres = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Servidumbredepaso_EPI_LT_3 !== 'undefined' ? crearFeatures(json_Servidumbredepaso_EPI_LT_3, 'servidumbre') : [] }), style: styleServidumbre, zIndex: 11 });
var vectorAtu = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_TU_detallado_0 !== 'undefined' ? crearFeatures(json_TU_detallado_0, 'atu') : [] }), style: styleAtuFn, zIndex: 7 });
var vectorLimiteDistrital = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_limite_distrital_0 !== 'undefined' ? crearFeatures(json_limite_distrital_0, 'limite-distrital') : [] }), style: styleLimiteDistrital, zIndex: 16 });
var vectorSectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Sectores_2 !== 'undefined' ? crearFeatures(json_Sectores_2, 'sector') : [] }), style: styleSectoresFn, declutter: true, zIndex: 8 });
var vectorSubsectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_subsectores_1 !== 'undefined' ? crearFeatures(json_subsectores_1, 'subsector') : [] }), style: styleSubsectoresFn, declutter: true, zIndex: 9 });
var vectorUrbJuan = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Polgonopista_0 !== 'undefined' ? crearFeatures(json_Polgonopista_0, 'urb-juan') : [] }), style: styleUrbJuan, zIndex: 11 });
var vectorJuanAlamedas = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_ALAMEDASDESUBMANZANAS_2 !== 'undefined' ? crearFeatures(json_ALAMEDASDESUBMANZANAS_2, 'juan-alameda') : [] }), style: styleJuanAlamedas, zIndex: 12 });
var vectorJuanPasajesCalles = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_BORDEDESUBMANZANAYREALIBRE_3 !== 'undefined' ? crearFeatures(json_BORDEDESUBMANZANAYREALIBRE_3, 'juan-pasaje-calle') : [] }), style: styleJuanPasajesCalles, zIndex: 13 });
var vectorSurcoUsoRestringido = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Zonadeusosrestringidos_1 !== 'undefined' ? crearFeatures(json_Zonadeusosrestringidos_1, 'surco-uso-restringido') : [] }), style: styleSurcoUsoRestringido, zIndex: 9 });
var vectorSurcoFajaMarginal = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Fajamarginal_0 !== 'undefined' ? crearFeatures(json_Fajamarginal_0, 'surco-faja') : [] }), style: styleSurcoFajaMarginal, zIndex: 9 });
var vectorSurcoZonaReglamentada = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Zonareglamentada_2 !== 'undefined' ? crearFeatures(json_Zonareglamentada_2, 'surco-zona-reglamentada') : [] }), style: styleSurcoZonaReglamentada, zIndex: 10 });
var vectorRioSurco = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_LneaderoSurco_3 !== 'undefined' ? crearFeatures(json_LneaderoSurco_3, 'rio-surco') : [] }), style: styleRioSurcoFn, zIndex: 15 });
var featuresHuacaSanBorja = typeof json_Bienes_culturales_Inmuebles_0 !== 'undefined'
    ? crearFeatures(json_Bienes_culturales_Inmuebles_0, 'bien-cultural-huaca').filter(function (feature) {
        return normalizarTextoFiltro(feature.get('NOMBRE')).includes('huaca san borja');
    })
    : [];
var vectorHuacaSanBorja = new ol.layer.Vector({ source: new ol.source.Vector({ features: featuresHuacaSanBorja }), style: styleHuacaSanBorja, zIndex: 11 });
var vectorJardinesAislamiento = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_Jardndeaislamiento_1 !== 'undefined' ? crearFeatures(json_Jardndeaislamiento_1, 'jardin-aislamiento') : [] }), style: styleJardinesAislamiento, zIndex: 12 });
var vectorParques = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_ParquesOf_5 !== 'undefined' ? crearFeatures(json_ParquesOf_5, 'parque') : [] }), style: styleParquesFn, declutter: true, zIndex: 12 });
var vectorRedVial = new ol.layer.Vector({ source: new ol.source.Vector({ features: typeof json_red_vial_4 !== 'undefined' ? crearFeatures(json_red_vial_4, 'via') : [] }), style: styleRedVialFn, declutter: true, zIndex: 14 });
var sourceArbolesCopa = new ol.source.Vector();
var sourceArbolesPunto = new ol.source.Vector();
var vectorArbolesCopa = new ol.layer.Vector({ source: sourceArbolesCopa, style: styleArbolCopa, minZoom: ARBOLES_ZOOM_VISIBLE, zIndex: 17 });
var vectorArbolesPunto = new ol.layer.Vector({ source: sourceArbolesPunto, style: styleArbolPunto, minZoom: ARBOLES_ZOOM_VISIBLE, renderBuffer: 48, updateWhileInteracting: false, updateWhileAnimating: false, zIndex: 18 });

var sourceHighlight = new ol.source.Vector();
var layerHighlight = new ol.layer.Vector({ source: sourceHighlight, style: styleHighlight, zIndex: 20 });

var map = new ol.Map({
    target: 'map', renderer: ['webgl', 'canvas'],
    layers: [googleSat, vectorAtu, vectorSectores, vectorSubsectores, vectorSurcoUsoRestringido, vectorSurcoFajaMarginal, vectorSurcoZonaReglamentada, vectorHuacaSanBorja, vectorManzanas, vectorManzanasLimatambo, vectorEpiLimatambo, vectorEpiTorres, vectorServidumbres, vectorUrbJuan, vectorJuanAlamedas, vectorJuanPasajesCalles, vectorParques, vectorJardinesAislamiento, vectorRedVial, vectorRioSurco, vectorLimiteDistrital, vectorArbolesCopa, vectorArbolesPunto, layerHighlight],
    view: new ol.View({ center: ol.proj.fromLonLat([-76.9933, -12.0951]), zoom: 14, minZoom: 13, maxZoom: 22 }),
    controls: [new ol.control.Zoom(), new ol.control.ScaleLine({ units: 'metric' })]
});

var arbolPopupEl = document.createElement('div');
arbolPopupEl.className = 'tree-popover ol-tree-popover hidden';
overlayArbol = new ol.Overlay({
    element: arbolPopupEl,
    offset: [0, -12],
    positioning: 'bottom-center',
    stopEvent: true
});
map.addOverlay(overlayArbol);

// NORTE Y CENTRADO DE ROTACIÓN
var northBtn = document.getElementById('btn-north');
var inclinacionMapaActiva = false;
var rotandoMapaConBotonDerecho = false;
var rotacionMouseX = 0;
var inclinacionVisual = 0;

northBtn.onclick = function () {
    var view = map.getView();
    inclinacionMapaActiva = false;
    inclinacionVisual = 0;
    map.getViewport().style.setProperty('--map-pitch', '0deg');
    map.getViewport().style.setProperty('--map-pitch-scale', '1');
    map.getViewport().style.setProperty('--map-pitch-shift', '0%');
    map.getViewport().classList.remove('is-pitched');
    view.animate({ rotation: 0, duration: 500, easing: ol.easing.easeOut });
};
map.getView().on('change:rotation', function () { document.getElementById('compass-icon').style.transform = `rotate(${map.getView().getRotation()}rad)`; });

map.getViewport().addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function moverRotacionMapaDerecho(event) {
    if (!rotandoMapaConBotonDerecho) return;
    var dx = event.clientX - rotacionMouseX;
    var dy = event.movementY || 0;
    rotacionMouseX = event.clientX;
    map.getView().setRotation(map.getView().getRotation() + dx * 0.004);
    inclinacionVisual = Math.max(0, Math.min(45, inclinacionVisual + dy * 0.25));
    var factorInclinacion = inclinacionVisual / 45;
    var escalaInclinacion = 1 + factorInclinacion * .55;
    map.getViewport().style.setProperty('--map-pitch', inclinacionVisual + 'deg');
    map.getViewport().style.setProperty('--map-pitch-scale', escalaInclinacion.toFixed(2));
    map.getViewport().style.setProperty('--map-pitch-shift', (4 * factorInclinacion).toFixed(1) + '%');
    map.getViewport().classList.toggle('is-pitched', inclinacionVisual > 1);
    inclinacionMapaActiva = inclinacionVisual > 1;
}

map.getViewport().addEventListener('mousedown', function (event) {
    if (event.button !== 2) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    rotandoMapaConBotonDerecho = true;
    rotacionMouseX = event.clientX;
    map.getViewport().style.cursor = 'grabbing';
    window.addEventListener('mousemove', moverRotacionMapaDerecho);
}, true);

window.addEventListener('mouseup', function (event) {
    if (event.button !== 2) return;
    rotandoMapaConBotonDerecho = false;
    window.removeEventListener('mousemove', moverRotacionMapaDerecho);
    map.getViewport().style.cursor = '';
});

function pixelOriginalDesdeVistaInclinada(pixel) {
    var viewport = map.getViewport();
    if (!viewport.classList.contains('is-pitched') || typeof DOMMatrixReadOnly === 'undefined' || typeof DOMPoint === 'undefined') {
        return pixel;
    }

    var layer = viewport.querySelector('.ol-layer');
    if (!layer) return pixel;
    var transform = window.getComputedStyle(layer).transform;
    if (!transform || transform === 'none') return pixel;

    try {
        var rect = viewport.getBoundingClientRect();
        var originX = rect.width / 2;
        var originY = rect.height;
        var matrix = new DOMMatrixReadOnly(transform);
        var inverse = matrix.inverse();
        var point = inverse.transformPoint(new DOMPoint(pixel[0] - originX, pixel[1] - originY, 0, 1));
        var w = point.w || 1;
        return [point.x / w + originX, point.y / w + originY];
    } catch (error) {
        return pixel;
    }
}

function ellipsePolygonArbolLonLat(center, radioEW, radioNS, steps) {
    var lon = center[0];
    var lat = center[1];
    var metrosLon = 111320 * Math.cos(lat * Math.PI / 180);
    var metrosLat = 110540;
    var ring = [];
    var total = steps || 28;
    for (var i = 0; i <= total; i++) {
        var a = i / total * Math.PI * 2;
        ring.push([
            lon + (radioEW * Math.cos(a)) / metrosLon,
            lat + (radioNS * Math.sin(a)) / metrosLat
        ]);
    }
    return { type: 'Polygon', coordinates: [ring] };
}

function crearFeatureArbolMapa(tree, index) {
    var props = tree.properties || {};
    var coords = tree.geometry && tree.geometry.coordinates;
    if (!coords || coords.length < 2) return null;
    var metricas = metricasArbolPark3D(props);
    var propiedades = Object.assign({}, props, { __tipo: 'arbol', __treeId: index, __metricasArbol: metricas });
    var punto = formatJSON.readFeature({
        type: 'Feature',
        properties: propiedades,
        geometry: { type: 'Point', coordinates: coords }
    }, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    punto.set('__tipo', 'arbol', true);
    punto.set('__treeId', index, true);
    punto.set('__metricasArbol', metricas, true);
    return { punto: punto };
}

function poblarArbolesMapa() {
    if (arbolesMapaCargados || typeof json_rboles_parque_0 === 'undefined') return;
    var puntos = [];
    (json_rboles_parque_0.features || []).forEach(function (tree, index) {
        if (!tree.geometry || tree.geometry.type !== 'Point') return;
        var features = crearFeatureArbolMapa(tree, index);
        if (!features) return;
        puntos.push(features.punto);
    });
    sourceArbolesPunto.addFeatures(puntos);
    arbolesMapaCargados = true;
}

function asegurarArbolesMapa() {
    if (arbolesMapaCargados) return Promise.resolve();
    if (typeof json_rboles_parque_0 !== 'undefined') {
        poblarArbolesMapa();
        return Promise.resolve();
    }
    if (!arbolesMapaPromise) {
        arbolesMapaPromise = cargarScriptPark3D('data/rboles_parque_0.js', function () {
            return typeof json_rboles_parque_0 !== 'undefined';
        }).then(function () {
            poblarArbolesMapa();
        }).catch(function (error) {
            console.error('No se pudo cargar el inventario de árboles', error);
        });
    }
    return arbolesMapaPromise;
}

function revisarCargaArbolesPorZoom() {
    if (map.getView().getZoom() >= ARBOLES_ZOOM_VISIBLE - .2) asegurarArbolesMapa();
}

map.getView().on('change:resolution', revisarCargaArbolesPorZoom);
revisarCargaArbolesPorZoom();

function marcarArbolSeleccionado(id) {
    [sourceArbolesCopa, sourceArbolesPunto].forEach(function (source) {
        if (arbolSeleccionadoId !== null) {
            var anterior = source.getFeatures().find(function (feature) { return feature.get('__treeId') === arbolSeleccionadoId; });
            if (anterior) anterior.set('__treeSelected', false);
        }
        if (id !== null) {
            var actual = source.getFeatures().find(function (feature) { return feature.get('__treeId') === id; });
            if (actual) actual.set('__treeSelected', true);
        }
    });
    arbolSeleccionadoId = id;
}

function siluetaArbolSvg(propiedades) {
    var texto = normalizarPark3D((propiedades.NOMBRE_COM || '') + ' ' + (propiedades.NOMBRE_CIE || ''));
    if (/palmera|phoenix|washingtonia|arecaceae/.test(texto)) {
        return '<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M60 44 C40 30 24 30 18 22 C34 26 44 30 56 40 C40 20 30 10 30 4 C46 14 52 26 60 40 C68 26 74 14 90 4 C90 10 80 20 64 40 C76 30 86 26 102 22 C96 30 80 30 60 44 Z" fill="#4f8a3c"/><rect x="57" y="42" width="6" height="48" fill="#7a5b3a"/></svg>';
    }
    if (/pino|cipres|casuarina|eucalipto/.test(texto)) {
        return '<svg viewBox="0 0 120 100" aria-hidden="true"><polygon points="60,7 84,48 36,48" fill="#3d6b34"/><polygon points="60,28 91,78 29,78" fill="#4f8a3c"/><rect x="56" y="72" width="8" height="22" fill="#7a5b3a"/></svg>';
    }
    return '<svg viewBox="0 0 120 100" aria-hidden="true"><circle cx="60" cy="37" r="29" fill="#5d9649"/><circle cx="40" cy="46" r="20" fill="#6aa854"/><circle cx="81" cy="48" r="22" fill="#4f8a3c"/><rect x="55" y="58" width="10" height="34" rx="4" fill="#7a5b3a"/></svg>';
}

function textoValorArbol(valor) {
    if (valor === null || valor === undefined || String(valor).trim() === '' || String(valor).trim() === '-') return '—';
    return String(valor);
}

function htmlSeguroArbol(valor) {
    return textoValorArbol(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function mostrarPopupArbol(feature, coordinate) {
    if (!feature) return;
    var p = feature.getProperties();
    var id = feature.get('__treeId');
    marcarArbolSeleccionado(id);
    var metricas = metricasArbolPark3D(p);
    var condicion = String(p.CONDICION_ || '').toLowerCase();
    var condClass = /buen|sano|optim|óptim/.test(condicion) ? 'ok' : (/mal|riesgo|muerto|seco|peligr/.test(condicion) ? 'bad' : 'neutral');
    arbolPopupEl.innerHTML = ''
        + '<button class="tree-popover-close" type="button" aria-label="Cerrar">×</button>'
        + '<div class="tree-popover-top">'
        + '<div class="tree-popover-sil">' + siluetaArbolSvg(p) + '</div>'
        + '<div class="tree-popover-title">'
        + '<strong>' + htmlSeguroArbol(p.NOMBRE_COM || 'Ejemplar') + '</strong>'
        + '<em>' + htmlSeguroArbol(p.NOMBRE_CIE) + '</em>'
        + '<span class="tree-popover-badge ' + condClass + '">' + htmlSeguroArbol(p.CONDICION_) + '</span>'
        + '</div></div>'
        + '<div class="tree-popover-chips">'
        + '<div><span>Altura</span><strong>' + valorMetricoPark3D(numeroFlexiblePark3D(p.ALTURA_TOT), ' m') + '</strong></div>'
        + '<div><span>DAP</span><strong>' + valorMetricoPark3D(numeroFlexiblePark3D(p.DAP), ' cm') + '</strong></div>'
        + '<div><span>Copa</span><strong>' + recortarNumeroPark3D(metricas.ew) + '×' + recortarNumeroPark3D(metricas.ns) + ' m</strong></div>'
        + '</div>';
    arbolPopupEl.classList.remove('hidden');
    overlayArbol.setPosition(coordinate);
    var close = arbolPopupEl.querySelector('.tree-popover-close');
    if (close) close.onclick = function () {
        arbolPopupEl.classList.add('hidden');
        overlayArbol.setPosition(undefined);
        marcarArbolSeleccionado(null);
    };
}

function actualizarEstadoLeyendaVial() {
    var movilidadActiva = filtroActivo('chk-movilidad-general');
    var metActiva = movilidadActiva && filtroActivo('chk-vial-met');
    var localActiva = movilidadActiva && filtroActivo('chk-vial-local');
    var prefActiva = localActiva && filtroActivo('chk-vial-prin');
    var secActiva = localActiva && filtroActivo('chk-vial-sec');
    var grupos = {
        'chk-vial-met': movilidadActiva,
        'chk-vial-expresa': metActiva,
        'chk-vial-arterial': metActiva,
        'chk-vial-colectora': metActiva,
        'chk-vial-local': movilidadActiva,
        'chk-vial-prin': localActiva,
        'chk-pref-avenida': prefActiva,
        'chk-pref-calle': prefActiva,
        'chk-pref-jiron': prefActiva,
        'chk-pref-pasaje': prefActiva,
        'chk-vial-sec': localActiva,
        'chk-sec-transito': secActiva,
        'chk-sec-restriccion': secActiva,
        'chk-sec-pasaje': secActiva,
        'chk-sec-alameda': secActiva
    };

    Object.keys(grupos).forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !grupos[id];
    });

    vectorRedVial.setVisible(movilidadActiva);
    vectorRedVial.changed();
}

function actualizarEstadoCanalSurco() {
    var naturalActivo = filtroActivo('chk-natural-general');
    var canalActivo = naturalActivo && filtroActivo('chk-canal-surco');
    var canalInput = document.getElementById('chk-canal-surco');
    var huacaInput = document.getElementById('chk-huaca-san-borja');
    if (canalInput) canalInput.disabled = !naturalActivo;
    if (huacaInput) huacaInput.disabled = !naturalActivo;

    [
        'chk-surco-zona-reglamentada',
        'chk-surco-faja-marginal',
        'chk-surco-usos-restringidos',
        'chk-surco-zona-cubierta',
        'chk-surco-zona-descubierta'
    ].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !canalActivo;
    });

    vectorSurcoZonaReglamentada.setVisible(canalActivo && filtroActivo('chk-surco-zona-reglamentada'));
    vectorSurcoFajaMarginal.setVisible(canalActivo && filtroActivo('chk-surco-faja-marginal'));
    vectorSurcoUsoRestringido.setVisible(canalActivo && filtroActivo('chk-surco-usos-restringidos'));
    vectorHuacaSanBorja.setVisible(naturalActivo && filtroActivo('chk-huaca-san-borja'));
    vectorRioSurco.changed();
}

function actualizarEstadoAtu() {
    var atuActiva = filtroActivo('chk-atu');
    var grupos = {
        'chk-atu-conservacion': atuActiva,
        'chk-atu-conservacion-1': atuActiva && filtroActivo('chk-atu-conservacion'),
        'chk-atu-conservacion-2': atuActiva && filtroActivo('chk-atu-conservacion'),
        'chk-atu-conservacion-3': atuActiva && filtroActivo('chk-atu-conservacion'),
        'chk-atu-consolidacion': atuActiva,
        'chk-atu-consolidacion-1': atuActiva && filtroActivo('chk-atu-consolidacion'),
        'chk-atu-consolidacion-2': atuActiva && filtroActivo('chk-atu-consolidacion'),
        'chk-atu-consolidacion-3': atuActiva && filtroActivo('chk-atu-consolidacion'),
        'chk-atu-generacion': atuActiva,
        'chk-atu-generacion-1': atuActiva && filtroActivo('chk-atu-generacion'),
        'chk-atu-generacion-2': atuActiva && filtroActivo('chk-atu-generacion'),
        'chk-atu-dinamizacion': atuActiva,
        'chk-atu-dinamizacion-1': atuActiva && filtroActivo('chk-atu-dinamizacion'),
        'chk-atu-dinamizacion-2': atuActiva && filtroActivo('chk-atu-dinamizacion'),
        'chk-atu-renovacion': atuActiva,
        'chk-atu-renovacion-1': atuActiva && filtroActivo('chk-atu-renovacion'),
        'chk-atu-renovacion-2': atuActiva && filtroActivo('chk-atu-renovacion'),
        'chk-atu-renovacion-3': atuActiva && filtroActivo('chk-atu-renovacion')
    };

    Object.keys(grupos).forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !grupos[id];
    });

    vectorAtu.setVisible(atuActiva);
    vectorAtu.changed();
}

function actualizarEstadoJuan() {
    var juanActivo = filtroActivo('chk-urb-juan');
    ['chk-juan-alamedas', 'chk-juan-pasajes-calles'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !juanActivo;
    });

    vectorUrbJuan.setVisible(juanActivo && filtroActivo('chk-juan-pasajes-calles'));
    vectorJuanAlamedas.setVisible(juanActivo && filtroActivo('chk-juan-alamedas'));
    vectorJuanPasajesCalles.setVisible(juanActivo && filtroActivo('chk-juan-pasajes-calles'));
}

function actualizarEstadoSectores() {
    var activo = filtroActivo('chk-sectores-general');
    ['chk-sectores', 'chk-subsectores'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !activo;
    });
    vectorSectores.setVisible(activo && filtroActivo('chk-sectores'));
    vectorSubsectores.setVisible(activo && filtroActivo('chk-subsectores'));
}

function actualizarEstadoRecreacion() {
    var activo = filtroActivo('chk-recreacion-general');
    ['chk-parques', 'chk-jardines-aislamiento'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !activo;
    });
    var parquesActivos = activo && filtroActivo('chk-parques');
    vectorParques.setVisible(parquesActivos);
    vectorArbolesCopa.setVisible(parquesActivos);
    vectorArbolesPunto.setVisible(parquesActivos);
    if (!parquesActivos) {
        if (overlayArbol) overlayArbol.setPosition(undefined);
        if (arbolPopupEl) arbolPopupEl.classList.add('hidden');
        marcarArbolSeleccionado(null);
    }
    vectorJardinesAislamiento.setVisible(activo && filtroActivo('chk-jardines-aislamiento'));
}

function actualizarEstadoTorresSanBorja() {
    var activo = filtroActivo('chk-tsb-general');
    ['chk-epi-tsb', 'chk-manzanas'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !activo;
    });
    vectorEpiTorres.setVisible(activo && filtroActivo('chk-epi-tsb'));
    vectorManzanas.setVisible(activo && filtroActivo('chk-manzanas'));
}

function actualizarEstadoLimatambo() {
    var activo = filtroActivo('chk-limatambo-general');
    ['chk-epi-lt', 'chk-servidumbres', 'chk-manzanas-lt'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.disabled = !activo;
    });
    vectorEpiLimatambo.setVisible(activo && filtroActivo('chk-epi-lt'));
    vectorServidumbres.setVisible(activo && filtroActivo('chk-servidumbres'));
    vectorManzanasLimatambo.setVisible(activo && filtroActivo('chk-manzanas-lt'));
}

document.querySelectorAll('.legend-branch summary input[type="checkbox"], .legend-group>summary input[type="checkbox"]').forEach(function (input) {
    input.addEventListener('click', function (event) {
        event.stopPropagation();
    });
});

document.querySelectorAll('.legend-title[data-toggle-desc]').forEach(function (title) {
    title.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var definition = document.getElementById(title.getAttribute('data-toggle-desc'));
        if (definition) definition.classList.toggle('is-visible');
    });
});

[
    'chk-movilidad-general',
    'chk-vial-met',
    'chk-vial-expresa',
    'chk-vial-arterial',
    'chk-vial-colectora',
    'chk-vial-local',
    'chk-vial-prin',
    'chk-pref-avenida',
    'chk-pref-calle',
    'chk-pref-jiron',
    'chk-pref-pasaje',
    'chk-vial-sec',
    'chk-sec-transito',
    'chk-sec-restriccion',
    'chk-sec-pasaje',
    'chk-sec-alameda'
].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = function () {
        actualizarEstadoLeyendaVial();
    };
});
actualizarEstadoLeyendaVial();

[
    'chk-atu',
    'chk-atu-conservacion',
    'chk-atu-conservacion-1',
    'chk-atu-conservacion-2',
    'chk-atu-conservacion-3',
    'chk-atu-consolidacion',
    'chk-atu-consolidacion-1',
    'chk-atu-consolidacion-2',
    'chk-atu-consolidacion-3',
    'chk-atu-generacion',
    'chk-atu-generacion-1',
    'chk-atu-generacion-2',
    'chk-atu-dinamizacion',
    'chk-atu-dinamizacion-1',
    'chk-atu-dinamizacion-2',
    'chk-atu-renovacion',
    'chk-atu-renovacion-1',
    'chk-atu-renovacion-2',
    'chk-atu-renovacion-3'
].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoAtu;
});
actualizarEstadoAtu();

['chk-sectores-general', 'chk-sectores', 'chk-subsectores'].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoSectores;
});
actualizarEstadoSectores();

document.getElementById('chk-limite-distrital').onchange = e => vectorLimiteDistrital.setVisible(e.target.checked);

['chk-recreacion-general', 'chk-parques', 'chk-jardines-aislamiento'].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoRecreacion;
});
actualizarEstadoRecreacion();

['chk-tsb-general', 'chk-manzanas', 'chk-epi-tsb'].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoTorresSanBorja;
});
actualizarEstadoTorresSanBorja();

['chk-limatambo-general', 'chk-manzanas-lt', 'chk-epi-lt', 'chk-servidumbres'].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoLimatambo;
});
actualizarEstadoLimatambo();

['chk-urb-juan', 'chk-juan-alamedas', 'chk-juan-pasajes-calles'].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoJuan;
});
actualizarEstadoJuan();
[
    'chk-natural-general',
    'chk-canal-surco',
    'chk-surco-zona-reglamentada',
    'chk-surco-faja-marginal',
    'chk-surco-usos-restringidos',
    'chk-surco-zona-cubierta',
    'chk-surco-zona-descubierta',
    'chk-huaca-san-borja'
].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.onchange = actualizarEstadoCanalSurco;
});
actualizarEstadoCanalSurco();
document.getElementById('sat-opacity').oninput = function (e) {
    var opacity = parseFloat(e.target.value);
    googleSat.setOpacity(opacity);
};

var satOpacityButton = document.getElementById('btn-sat-opacity');
var satOpacityPanel = document.getElementById('sat-opacity-panel');
satOpacityButton.addEventListener('click', function (event) {
    event.stopPropagation();
    var isOpen = satOpacityButton.getAttribute('aria-expanded') === 'true';
    satOpacityButton.setAttribute('aria-expanded', String(!isOpen));
    satOpacityPanel.hidden = isOpen;
});
satOpacityPanel.addEventListener('click', function (event) {
    event.stopPropagation();
});
document.addEventListener('click', function () {
    satOpacityButton.setAttribute('aria-expanded', 'false');
    satOpacityPanel.hidden = true;
});

// ==========================================
// LÓGICA DE LA FICHA TÉCNICA Y STREET VIEW
// ==========================================
function agregarFilaValida(htmlArr, etiqueta, valor) {
    if (valor && valor !== 'null' && String(valor).trim() !== '' && valor !== '-') {
        htmlArr.push(`<tr><td>${etiqueta}</td><td>${valor}</td></tr>`);
    }
}

function numeroSeguro(valor) {
    var numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function rutaPdfVia(propiedades) {
    var codigo = String(propiedades['CÓDIGO'] || propiedades.CODIGO || '').trim();
    return /^[A-Z0-9-]+$/.test(codigo) ? 'pdf/' + encodeURIComponent(codigo) + '.pdf' : '';
}

var PDF_FICHAS_PARQUES = [
    '9_de_Julio.pdf', 'Alameda_de_la_Paz.pdf', 'Alameda_de_los_Héroes_1.pdf',
    'Alameda_de_los_Héroes_2.pdf', 'Alameda_de_los_Héroes_3.pdf', 'Alfredo_Maúrtua.pdf',
    'Almirante_Grau.pdf', 'Andrés_Avelino_Cáceres.pdf', 'Antonia_Moreno_de_Cáceres.pdf',
    'Aramburu_y_Salinas.pdf', 'Arq._Fernando_Belaunde_Terry.pdf',
    'Augusto_Benavides___Polideportivo_Limatambo.pdf', 'Beethoven.pdf', 'Belizario_Suarez.pdf',
    'Bolivariano.pdf', 'Confraternidad_de_las_Américas.pdf', 'De_la_Felicidad.pdf',
    'De_la_Inmigración_China.pdf', 'De_la_Mujer.pdf', 'De_los_Periodistas.pdf',
    'De_Regoyos.pdf', 'Del_Niño.pdf', 'Donatello.pdf', 'Duque_Caxias.pdf', 'El_Greco.pdf',
    'El_Pinar.pdf', 'Euler.pdf', 'Felipe_Santiago_Salaverry.pdf', 'Héroes_del_Cenepa.pdf',
    'Ignacio_Marino.pdf', 'Islas_Malvinas.pdf', 'Jacarandá.pdf', 'Japonés.pdf',
    'Javier_Prado_N°2.pdf', 'Juan_Gris.pdf', 'Juan_Pablo_II.pdf', 'Juan_XXIII.pdf',
    'Julio_C.Tello.pdf', 'Julio_Ponce_Antúnez_de_Mayolo.pdf', 'La_Amistad.pdf',
    'La_Junventud.pdf', 'La_Merced.pdf', 'La_Pradera.pdf', 'Lady_Olave_Badem_Powell.pdf',
    'Las_Begonias.pdf', 'Las_Lomas.pdf', 'Libertador_San_Martín.pdf', 'Los_Sauces.pdf',
    'María_Teresa_de_la_Cruz_Candamo.pdf', 'Mariano_Bustamante.pdf', 'Mariano_Santos.pdf',
    'Mario_Moreno.pdf', 'Mario_Polar_Ugarteche.pdf', 'Mariscal_Castilla.pdf',
    'Medio_Ambiente.pdf', 'Minería.pdf', 'N°3.pdf', 'N°5.pdf',
    'Nuestra_Señora_de_las_Nubes.pdf', 'Olímpico.pdf', 'Pallardelli.pdf', 'Plumereros.pdf',
    'Renacimiento.pdf', 'República_de_Grecia.pdf', 'República_de_Uruguay.pdf',
    'República_Popular_China.pdf', 'San_Borja_Portinari.pdf', 'San_Borja_Ramat_Gam_Israel.pdf',
    'San_Francisco_de_Borja.pdf', 'San_Francisco.pdf', 'San_Juan_Masias.pdf',
    'San_Tomás.pdf', 'SEDAPAL.pdf', 'Strauss.pdf', 'Venecia.pdf', 'Veronés.pdf',
    'Violeta_Correa_de_Belaunde.pdf', 'Virgen_Inmaculada_Concepción.pdf',
    'Virgen_Maria_Auxiliadora.pdf', 'Virgen_Milagrosa.pdf'
];

var PDF_FICHAS_RIO_SURCO = {
    paisaje: 'Paisaje_Arqueológico_Río_Surco_Segmento_3.pdf',
    calera1: 'Sitio_Arqueológico_La_Calera_Sectores_1.pdf',
    calera2: 'Sitio_Arqueológico_La_Calera_Sectores_2.pdf',
    huaca: 'Zona_Arqueológica_Huaca_San_Borja.pdf'
};

var PDF_FICHAS_PARQUES_POR_CODIGO = {
    'PR-03': 'Alameda_de_los_Héroes_1.pdf',
    'PR-20': 'Medio_Ambiente.pdf',
    'PR-29': 'Ignacio_Marino.pdf',
    'PR-33': 'Javier_Prado_N°2.pdf',
    'PR-40': 'La_Junventud.pdf',
    'PR-57': 'N°3.pdf',
    'PR-58': 'N°5.pdf',
    'PR-59': 'Nuestra_Señora_de_las_Nubes.pdf',
    'PR-69': 'San_Francisco.pdf',
    'PR-72': 'San_Tomás.pdf',
    'PR-80': 'San_Juan_Masias.pdf'
};

function clavePdfFicha(valor) {
    return String(valor || '')
        .replace(/\.pdf$/i, '')
        .replace(/^parque\s+/i, '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/n\s*[°º]/g, 'n')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\bn\s+(\d)/g, 'n$1')
        .replace(/\bn0+(\d)/g, 'n$1');
}

function rutaArchivoPdf(carpeta, archivo) {
    return carpeta + '/' + encodeURIComponent(archivo);
}

function rutaPdfParque(propiedades) {
    var nombre = String(propiedades.NOMBRE || '').trim();
    if (!nombre) return '';
    var codigo = String(propiedades['CÓDIGO'] || propiedades.CODIGO || '').trim();
    if (PDF_FICHAS_PARQUES_POR_CODIGO[codigo]) {
        return rutaArchivoPdf('pdf/parques', PDF_FICHAS_PARQUES_POR_CODIGO[codigo]);
    }
    var claves = [
        clavePdfFicha(nombre),
        clavePdfFicha(nombre.replace(/\bdel\b/gi, 'de')),
        clavePdfFicha(nombre.replace(/\bde los\b/gi, 'de_los')),
        clavePdfFicha(nombre.replace(/\bparque\s+de\s+/i, 'de ')),
        clavePdfFicha(nombre.replace(/^parque\s+(del|de la|de los|de)\s+/i, ''))
    ];
    var archivo = PDF_FICHAS_PARQUES.find(function (item) {
        var claveItem = clavePdfFicha(item);
        return claves.indexOf(claveItem) !== -1;
    });
    return archivo ? rutaArchivoPdf('pdf/parques', archivo) : '';
}

function rutaPdfRioSurco(tipo, propiedades) {
    var texto = normalizarPark3D([
        tipo,
        propiedades.NOMBRE,
        propiedades.DESCRIPCIO,
        propiedades.DESCRIPCION,
        propiedades.TIPO,
        propiedades['situación'],
        propiedades.situacion
    ].filter(Boolean).join(' '));
    var archivo = PDF_FICHAS_RIO_SURCO.paisaje;
    if (/huaca|san borja/.test(texto)) archivo = PDF_FICHAS_RIO_SURCO.huaca;
    else if (/calera.*2|sectores?\s*2/.test(texto)) archivo = PDF_FICHAS_RIO_SURCO.calera2;
    else if (/calera/.test(texto)) archivo = PDF_FICHAS_RIO_SURCO.calera1;
    return rutaArchivoPdf('pdf/rio-surco', archivo);
}

function botonPdfFicha(url, texto) {
    return url ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="btn-accion btn-accion--pdf"><i class="fas fa-file-pdf"></i> ' + texto + '</a>' : '';
}

function enlaceHttpSeguro(valor) {
    try {
        var url = new URL(String(valor || '').trim());
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (error) {
        return '';
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

function setTextoPark3D(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor || '—';
}

function numeroPark3D(valor, fallback) {
    var n = parseFloat(valor);
    return Number.isFinite(n) ? n : fallback;
}

function limitarPark3D(valor, min, max) {
    return Math.min(max, Math.max(min, valor));
}

function formatoAreaPark3D(valor) {
    var n = Number(valor);
    return Number.isFinite(n) ? n.toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '—';
}

function porcentajePark3D(valor) {
    var n = numeroSeguro(valor);
    if (n === null) return '—';
    return n.toFixed(1).replace('.0', '') + '%';
}

function promedioPositivoPark3D(a, b) {
    var valores = [a, b].filter(function (v) { return Number.isFinite(v) && v > 0; });
    return valores.length ? valores.reduce(function (s, v) { return s + v; }, 0) / valores.length : NaN;
}

function sumaPositivaPark3D(a, b) {
    var valores = [a, b].filter(function (v) { return Number.isFinite(v) && v > 0; });
    return valores.length ? valores.reduce(function (s, v) { return s + v; }, 0) : NaN;
}

function normalizarPark3D(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function cargarScriptPark3D(src, testFn) {
    return new Promise(function (resolve, reject) {
        if (testFn && testFn()) {
            resolve();
            return;
        }

        var existente = document.querySelector('script[data-park3d-src="' + src + '"]');
        if (existente) {
            existente.addEventListener('load', resolve, { once: true });
            existente.addEventListener('error', reject, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.park3dSrc = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function cargarDependenciasParque3D() {
    if (parque3DDependenciasPromise) return parque3DDependenciasPromise;
    parque3DDependenciasPromise = Promise.resolve()
        .then(function () {
            return cargarScriptPark3D('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', function () {
                return typeof THREE !== 'undefined';
            });
        })
        .then(function () {
            return cargarScriptPark3D('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', function () {
                return typeof THREE !== 'undefined' && !!THREE.OrbitControls;
            });
        })
        .then(function () {
            return cargarScriptPark3D('data/rboles_parque_0.js', function () {
                return typeof json_rboles_parque_0 !== 'undefined';
            });
        })
        .then(function () {
            return cargarScriptPark3D('assets/js/tree_assets.js', function () {
                return !!window.TREE_VISUAL_ASSETS;
            });
        });
    return parque3DDependenciasPromise;
}

function numeroFlexiblePark3D(valor) {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN;
    if (valor === null || valor === undefined) return NaN;
    var match = String(valor).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : NaN;
}

function numeroPositivoPark3D(valor) {
    var numero = numeroFlexiblePark3D(valor);
    return Number.isFinite(numero) && numero > 0 ? numero : NaN;
}

function porcentajeNumeroPark3D(valor) {
    var numero = numeroFlexiblePark3D(valor);
    return Number.isFinite(numero) ? numero : NaN;
}

function recortarNumeroPark3D(numero) {
    return Math.abs(numero - Math.round(numero)) < 1e-9 ? String(Math.round(numero)) : numero.toFixed(1);
}

function valorMetricoPark3D(valor, unidad) {
    return Number.isFinite(valor) ? recortarNumeroPark3D(valor) + (unidad || '') : '—';
}

function metricasArbolPark3D(propiedades) {
    var altura = numeroPositivoPark3D(propiedades.ALTURA_TOT);
    var alturaPunto = numeroPositivoPark3D(propiedades.ALTURA_PUN);
    var dap = numeroPositivoPark3D(propiedades.DAP);
    var este = numeroPositivoPark3D(propiedades['X1___E__']);
    var oeste = numeroPositivoPark3D(propiedades['X2__O_']);
    var norte = numeroPositivoPark3D(propiedades['Y1__N_']);
    var sur = numeroPositivoPark3D(propiedades['Y2__S_']);
    var ew = sumaPositivaPark3D(este, oeste);
    var ns = sumaPositivaPark3D(norte, sur);
    return {
        altura: limitarPark3D(Number.isFinite(altura) ? altura : 7, 2.5, 30),
        libre: limitarPark3D(Number.isFinite(alturaPunto) ? alturaPunto : (Number.isFinite(altura) ? altura * .42 : 3), .8, Number.isFinite(altura) ? altura * .78 : 6),
        dap: Number.isFinite(dap) ? dap : 25,
        ew: limitarPark3D(Number.isFinite(ew) ? ew : 4.8, 1.4, 20),
        ns: limitarPark3D(Number.isFinite(ns) ? ns : 4.8, 1.4, 20)
    };
}

function elegirTexturaArbolPark3D(propiedades, metricas, index) {
    var forma = normalizarPark3D(propiedades.FORMA_DE_C || '');
    var nombre = normalizarPark3D(propiedades.NOMBRE_COM || '');
    var ratio = metricas.ew / Math.max(metricas.altura, 1);
    if (/palmera|dypsis|washingtonia|phoenix|arecaceae/.test(nombre)) return 'slender';
    if (ratio > .78 || forma === 't') return index % 2 ? 'wide' : 'irregular';
    if (metricas.altura < 6) return 'young';
    if (ratio < .38) return 'slender';
    return index % 3 === 0 ? 'tall' : (index % 3 === 1 ? 'round' : 'irregular');
}

function crearTexturaImagenPark3D(uri) {
    var texture = new THREE.TextureLoader().load(uri);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
    return texture;
}

function crearTexturaCanvasPark3D(tipo) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    var ctx = canvas.getContext('2d');
    if (tipo === 'canopy') {
        var canopy = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
        canopy.addColorStop(0, 'rgba(100, 150, 68, .86)');
        canopy.addColorStop(.6, 'rgba(70, 125, 56, .56)');
        canopy.addColorStop(1, 'rgba(70, 125, 56, 0)');
        ctx.fillStyle = canopy;
    } else if (tipo === 'shadow') {
        var shadow = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
        shadow.addColorStop(0, 'rgba(20, 25, 20, .28)');
        shadow.addColorStop(.55, 'rgba(20, 25, 20, .13)');
        shadow.addColorStop(1, 'rgba(20, 25, 20, 0)');
        ctx.fillStyle = shadow;
    } else {
        ctx.fillStyle = '#b8caae';
        ctx.fillRect(0, 0, 128, 128);
        for (var i = 0; i < 900; i++) {
            ctx.fillStyle = Math.random() > .5 ? 'rgba(88, 132, 72, .18)' : 'rgba(214, 224, 190, .2)';
            ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
        }
    }
    if (tipo === 'canopy' || tipo === 'shadow') ctx.fillRect(0, 0, 128, 128);
    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

function anguloSemillaPark3D(propiedades) {
    var raw = String(propiedades.OBJECTID || propiedades['Nº'] || propiedades.GPS || '1');
    var hash = 0;
    for (var i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
    return (hash % 6283) / 1000;
}

function parqueFeatureAGeoJson(feature) {
    return formatJSON.writeFeatureObject(feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
}

function claveParque3D(feature) {
    var p = feature.getProperties ? feature.getProperties() : {};
    return String(p['CÓDIGO'] || p.ID || p.NOMBRE || feature.ol_uid || 'parque');
}

function bboxGeometriaPark3D(geometry) {
    var minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    function recorrer(valor) {
        if (!Array.isArray(valor)) return;
        if (valor.length >= 2 && typeof valor[0] === 'number' && typeof valor[1] === 'number') {
            minLon = Math.min(minLon, valor[0]);
            maxLon = Math.max(maxLon, valor[0]);
            minLat = Math.min(minLat, valor[1]);
            maxLat = Math.max(maxLat, valor[1]);
        } else {
            valor.forEach(recorrer);
        }
    }
    recorrer(geometry.coordinates);
    return { minLon: minLon, minLat: minLat, maxLon: maxLon, maxLat: maxLat };
}

function puntoEnAnilloPark3D(point, ring) {
    var x = point[0], y = point[1], inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0], yi = ring[i][1];
        var xj = ring[j][0], yj = ring[j][1];
        var hit = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi);
        if (hit) inside = !inside;
    }
    return inside;
}

function puntoEnPoligonoPark3D(point, rings) {
    if (!rings || !rings.length || !puntoEnAnilloPark3D(point, rings[0])) return false;
    for (var i = 1; i < rings.length; i++) {
        if (puntoEnAnilloPark3D(point, rings[i])) return false;
    }
    return true;
}

function puntoEnGeometriaPark3D(point, geometry) {
    if (!geometry) return false;
    if (geometry.type === 'Polygon') return puntoEnPoligonoPark3D(point, geometry.coordinates);
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(function (polygon) { return puntoEnPoligonoPark3D(point, polygon); });
    }
    return false;
}

function arbolesParaParque3D(feature) {
    if (typeof json_rboles_parque_0 === 'undefined') return [];
    var clave = claveParque3D(feature);
    if (parque3DCacheArboles.has(clave)) return parque3DCacheArboles.get(clave);

    var geojson = parqueFeatureAGeoJson(feature);
    var bbox = bboxGeometriaPark3D(geojson.geometry);
    var arboles = (json_rboles_parque_0.features || []).filter(function (tree) {
        var c = tree.geometry && tree.geometry.coordinates;
        if (!c || c.length < 2) return false;
        if (c[0] < bbox.minLon || c[0] > bbox.maxLon || c[1] < bbox.minLat || c[1] > bbox.maxLat) return false;
        return puntoEnGeometriaPark3D(c, geojson.geometry);
    });

    parque3DCacheArboles.set(clave, arboles);
    return arboles;
}

function cerrarParque3D() {
    var modal = document.getElementById('park3d-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
    var street = document.getElementById('park3d-street-frame');
    if (street) street.src = '';
    limpiarEscenaParque3D();
}

function limpiarEscenaParque3D() {
    if (!parque3DEstado) return;
    cancelAnimationFrame(parque3DEstado.raf);
    window.removeEventListener('resize', parque3DEstado.onResize);
    if (parque3DEstado.controls && parque3DEstado.controls.dispose) parque3DEstado.controls.dispose();
    parque3DEstado.scene.traverse(function (obj) {
        if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
        if (obj.material) {
            (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(function (mat) {
                if (mat.dispose) mat.dispose();
            });
        }
    });
    parque3DEstado.renderer.dispose();
    (parque3DEstado.extraTextures || []).forEach(function (texture) {
        if (texture && texture.dispose) texture.dispose();
    });
    if (parque3DEstado.renderer.domElement && parque3DEstado.renderer.domElement.parentNode) {
        parque3DEstado.renderer.domElement.parentNode.removeChild(parque3DEstado.renderer.domElement);
    }
    parque3DEstado = null;
}

function estadoCalculoPark3D(id, ok, nota) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = ok === null ? 'neutral' : (ok ? 'ok' : 'bad');
    el.textContent = (ok === null ? '' : (ok ? 'CUMPLE · ' : 'EXCEDE · ')) + nota;
}

var PARK3D_PIE_COLORS = {
    green: '#5a8a42',
    gray: '#8a8f94',
    footprint: '#5a4a3a',
    support: '#6f9fd8',
    recreation: '#e0a53a',
    commercial: '#b85fb0',
    other: '#9a8f80',
    free: '#dfe6da'
};

var PARK3D_PIE_LABELS = {
    green: 'Verde',
    gray: 'Piso duro',
    footprint: 'Techado',
    support: 'Soporte',
    recreation: 'Recreativo',
    commercial: 'Comercial',
    other: 'Otros',
    free: 'Sin asignar'
};

function formatoEnteroM2Park3D(valor) {
    return Number.isFinite(valor) ? Math.round(valor).toLocaleString('es-PE') + ' m²' : '—';
}

function renderOcupacionPiePark3D(datos) {
    var svg = document.getElementById('park3d-occ-pie');
    var leyenda = document.getElementById('park3d-occ-pie-legend');
    if (!svg || !leyenda) return;
    var area = datos.area || 1;
    var asignado = datos.green + datos.gray + datos.footprint + datos.support + datos.recreation + datos.commercial + datos.other;
    var libre = Math.max(0, area - asignado);
    var segmentos = [
        ['green', datos.green],
        ['gray', Math.max(0, datos.gray - datos.footprint)],
        ['footprint', datos.footprint],
        ['support', datos.support],
        ['recreation', datos.recreation],
        ['commercial', datos.commercial],
        ['other', datos.other],
        ['free', libre]
    ].filter(function (item) { return item[1] > 0; });
    var cx = 90, cy = 90, r = 78;
    var angle0 = -Math.PI / 2;
    var paths = [];
    if (!segmentos.length || asignado <= 0) {
        paths.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + PARK3D_PIE_COLORS.free + '"/>');
    } else {
        segmentos.forEach(function (item) {
            var key = item[0];
            var valor = item[1];
            var frac = Math.min(1, valor / area);
            var angle1 = angle0 + frac * Math.PI * 2;
            var x0 = cx + r * Math.cos(angle0);
            var y0 = cy + r * Math.sin(angle0);
            var x1 = cx + r * Math.cos(angle1);
            var y1 = cy + r * Math.sin(angle1);
            var big = frac > .5 ? 1 : 0;
            if (frac >= .999) {
                paths.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + PARK3D_PIE_COLORS[key] + '"/>');
            } else {
                paths.push('<path d="M' + cx + ',' + cy + ' L' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' A' + r + ',' + r + ' 0 ' + big + ',1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' Z" fill="' + PARK3D_PIE_COLORS[key] + '"/>');
            }
            angle0 = angle1;
        });
    }
    svg.innerHTML = paths.join('')
        + '<circle cx="' + cx + '" cy="' + cy + '" r="41" fill="#fff"/>'
        + '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#16261e">' + Math.round(area).toLocaleString('es-PE') + '</text>'
        + '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-size="9" fill="#5d6b62">m² totales</text>';
    leyenda.innerHTML = segmentos.map(function (item) {
        var key = item[0];
        var valor = item[1];
        return '<span><i style="background:' + PARK3D_PIE_COLORS[key] + '"></i>' + PARK3D_PIE_LABELS[key] + ' <b>' + Math.round(valor / area * 100) + '%</b></span>';
    }).join('');
}

function renderConsultaPark3D(feature, datos) {
    var card = document.getElementById('park3d-verdict-card');
    if (!card) return;
    var title = document.getElementById('park3d-verdict-title');
    var text = document.getElementById('park3d-verdict-text');
    var icon = document.getElementById('park3d-verdict-icon');
    var list = document.getElementById('park3d-allow-list');
    var p = feature.getProperties ? feature.getProperties() : {};
    var problemas = [];
    if (datos.greenShort) problemas.push('el área verde queda por debajo del mínimo normativo');
    if (datos.grayOverLimit) problemas.push('el piso duro supera el máximo permitido');
    if (datos.footOver) problemas.push('el área techada supera el tope de ocupación');
    if (!datos.anyInput) {
        card.className = 'park3d-verdict-card neutral';
        if (icon) icon.textContent = '–';
        if (title) title.textContent = 'Sin propuesta ingresada';
        if (text) text.textContent = 'Ingresa las áreas propuestas para evaluar su conformidad con los parámetros normativos del parque.';
    } else if (problemas.length) {
        card.className = 'park3d-verdict-card bad';
        if (icon) icon.textContent = '×';
        if (title) title.textContent = 'No conforme con la norma';
        if (text) text.textContent = 'La propuesta no cumple: ' + problemas.join('; ') + '. Revisa las áreas señaladas.';
    } else {
        card.className = 'park3d-verdict-card ok';
        if (icon) icon.textContent = '✓';
        if (title) title.textContent = 'Conforme con la norma';
        if (text) text.textContent = 'La propuesta se encuentra dentro de los parámetros de ocupación establecidos para este parque.';
    }
    if (!list) return;
    var rows = [];
    if (Number.isFinite(datos.minGreen)) rows.push(['Área verde mínima a conservar', formatoEnteroM2Park3D(datos.area * datos.minGreen / 100), 'propuesto: ' + formatoEnteroM2Park3D(datos.green)]);
    if (Number.isFinite(datos.maxGray)) rows.push(['Piso duro máximo', formatoEnteroM2Park3D(datos.area * datos.maxGray / 100), 'propuesto: ' + formatoEnteroM2Park3D(datos.gray)]);
    if (datos.effectiveFinite !== null) rows.push(['Área techada máxima', formatoEnteroM2Park3D(datos.effective), 'propuesto: ' + formatoEnteroM2Park3D(datos.footprint)]);
    [
        ['Servicios de apoyo · máximo', p.SOPORTE],
        ['Uso recreativo · máximo', p.RECREATIVO],
        ['Uso comercial · máximo', p.COMERCIAL],
        ['Otros usos · máximo', p.OTR_USOS]
    ].forEach(function (item) {
        var max = porcentajeNumeroPark3D(item[1]);
        if (Number.isFinite(max) && max > 0) rows.push([item[0], formatoEnteroM2Park3D(datos.area * max / 100), '']);
    });
    list.innerHTML = rows.map(function (row) {
        return '<div class="park3d-allow-row"><span>' + row[0] + '</span><strong>' + row[1] + (row[2] ? '<em>' + row[2] + '</em>' : '') + '</strong></div>';
    }).join('');
}

function calcularOcupacionPark3D(feature) {
    var p = feature.getProperties ? feature.getProperties() : {};
    var area = numeroPositivoPark3D(p['ÁREA']) || 0;
    if (!area) return;
    var val = function (id) {
        var input = document.getElementById(id);
        return Math.max(0, numeroFlexiblePark3D(input ? input.value : 0) || 0);
    };
    var green = val('park3d-calc-green');
    var gray = val('park3d-calc-gray');
    var footprint = val('park3d-calc-footprint');
    var support = val('park3d-calc-support');
    var recreation = val('park3d-calc-recreation');
    var commercial = val('park3d-calc-commercial');
    var other = val('park3d-calc-other');

    var greenPct = green / area * 100;
    var grayPct = gray / area * 100;
    var io = footprint / area;
    var minGreen = porcentajeNumeroPark3D(p['AREA VERDE']);
    var maxGray = porcentajeNumeroPark3D(p.O_GRIS_MAX);
    var ioMax = numeroFlexiblePark3D(p['ÍNDIC_OCU']);
    var absMax = numeroPositivoPark3D(p['HT_MAX(m2)']);
    var byIO = Number.isFinite(ioMax) ? area * ioMax : Infinity;
    var effective = Math.min(byIO, Number.isFinite(absMax) ? absMax : Infinity);
    var effectiveFinite = Number.isFinite(effective) ? effective : null;
    var unassigned = area - green - gray;
    var greenShort = Number.isFinite(minGreen) && greenPct < minGreen;
    var grayOverLimit = Number.isFinite(maxGray) && grayPct > maxGray;
    var footOver = Number.isFinite(ioMax) && effectiveFinite !== null && footprint > effective;

    setTextoPark3D('park3d-calc-green-pct', recortarNumeroPark3D(greenPct) + '%');
    setTextoPark3D('park3d-calc-gray-pct', recortarNumeroPark3D(grayPct) + '%');
    setTextoPark3D('park3d-calc-io', io.toFixed(4));
    setTextoPark3D('park3d-calc-effective-footprint', effectiveFinite !== null ? formatoAreaPark3D(effective) : '—');
    setTextoPark3D('park3d-calc-unassigned', Math.abs(unassigned).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' m² ' + (unassigned >= 0 ? 'libres' : 'excedidos'));

    estadoCalculoPark3D('park3d-calc-green-status', Number.isFinite(minGreen) ? greenPct >= minGreen : null, Number.isFinite(minGreen) ? 'mínimo ' + recortarNumeroPark3D(minGreen) + '%' : 'sin parámetro');
    estadoCalculoPark3D('park3d-calc-gray-status', Number.isFinite(maxGray) ? grayPct <= maxGray : null, Number.isFinite(maxGray) ? 'máximo ' + recortarNumeroPark3D(maxGray) + '%' : 'sin parámetro');
    estadoCalculoPark3D('park3d-calc-io-status', Number.isFinite(ioMax) && effectiveFinite !== null ? footprint <= effective : null, Number.isFinite(ioMax) ? 'IO normativo ' + ioMax + (effectiveFinite !== null ? ' · tope ' + formatoAreaPark3D(effective) : '') : 'sin parámetro');

    var allocation = document.getElementById('park3d-calc-allocation-status');
    if (allocation) {
        allocation.className = Math.abs(unassigned) <= Math.max(1, area * .002) ? 'ok' : (unassigned < 0 ? 'bad' : 'neutral');
        allocation.textContent = Math.abs(unassigned) <= Math.max(1, area * .002)
            ? 'superficie total asignada'
            : (unassigned < 0 ? 'verde + gris supera el área del parque' : 'área todavía no asignada');
    }

    var usos = [
        ['Soporte', support, p.SOPORTE],
        ['Recreativo', recreation, p.RECREATIVO],
        ['Comercial', commercial, p.COMERCIAL],
        ['Otros usos', other, p.OTR_USOS]
    ];
    var contenedor = document.getElementById('park3d-calc-use-results');
    if (contenedor) {
        contenedor.innerHTML = usos.map(function (item) {
            var pct = item[1] / area * 100;
            var max = porcentajeNumeroPark3D(item[2]);
            var ok = Number.isFinite(max) ? pct <= max : null;
            return '<div class="park3d-calc-use-row"><span>' + item[0] + '</span><strong>' + recortarNumeroPark3D(pct) + '% / ' + (Number.isFinite(max) ? recortarNumeroPark3D(max) + '%' : '—') + '</strong><em class="' + (ok === null ? '' : (ok ? 'ok' : 'bad')) + '">' + (ok === null ? '—' : (ok ? 'CUMPLE' : 'EXCEDE')) + '</em></div>';
        }).join('');
    }
    var overlay = document.getElementById('park3d-calc-overlay-warn');
    if (overlay) {
        var problemas = [];
        if (greenShort) problemas.push('área verde por debajo del mínimo');
        if (grayOverLimit) problemas.push('piso duro sobre el máximo');
        if (footOver) problemas.push('área techada sobre el tope');
        overlay.className = problemas.length ? 'park3d-status-box warn' : 'park3d-status-box ok';
        overlay.textContent = problemas.length
            ? 'No conforme: ' + problemas.join(' · ') + '.'
            : 'Conforme: la propuesta respeta el mínimo de área verde y los topes de ocupación.';
    }
    var datos = {
        area: area,
        green: green,
        gray: gray,
        footprint: footprint,
        support: support,
        recreation: recreation,
        commercial: commercial,
        other: other,
        minGreen: minGreen,
        maxGray: maxGray,
        effective: effective,
        effectiveFinite: effectiveFinite,
        greenShort: greenShort,
        grayOverLimit: grayOverLimit,
        footOver: footOver,
        anyInput: green > 0 || gray > 0 || footprint > 0 || support > 0 || recreation > 0 || commercial > 0 || other > 0
    };
    renderOcupacionPiePark3D(datos);
    renderConsultaPark3D(feature, datos);
}

function iniciarCalculadoraPark3D(feature) {
    var p = feature.getProperties ? feature.getProperties() : {};
    var area = numeroPositivoPark3D(p['ÁREA']) || 0;
    var greenActual = porcentajeNumeroPark3D(p['%OCUP_VERD']);
    var grayActual = porcentajeNumeroPark3D(p['%OCUP_GRIS']);
    var ids = ['park3d-calc-green', 'park3d-calc-gray', 'park3d-calc-footprint', 'park3d-calc-support', 'park3d-calc-recreation', 'park3d-calc-commercial', 'park3d-calc-other'];
    var input = function (id) { return document.getElementById(id); };
    if (input('park3d-calc-green')) input('park3d-calc-green').value = Number.isFinite(greenActual) ? (area * greenActual / 100).toFixed(1) : '';
    if (input('park3d-calc-gray')) input('park3d-calc-gray').value = Number.isFinite(grayActual) ? (area * grayActual / 100).toFixed(1) : '';
    ['park3d-calc-footprint', 'park3d-calc-support', 'park3d-calc-recreation', 'park3d-calc-commercial', 'park3d-calc-other'].forEach(function (id) {
        if (input(id)) input(id).value = 0;
    });
    ids.forEach(function (id) {
        if (input(id)) input(id).oninput = function () { calcularOcupacionPark3D(feature); };
    });
    var reset = document.getElementById('park3d-reset-calc');
    if (reset) reset.onclick = function () { iniciarCalculadoraPark3D(feature); };
    document.querySelectorAll('[data-park3d-calc-view]').forEach(function (tab) {
        tab.onclick = function () {
            var view = tab.getAttribute('data-park3d-calc-view');
            document.querySelectorAll('[data-park3d-calc-view]').forEach(function (other) {
                other.classList.toggle('active', other === tab);
            });
            var consulta = document.getElementById('park3d-view-consulta');
            var tecnica = document.getElementById('park3d-view-tecnica');
            if (consulta) consulta.classList.toggle('hidden', view !== 'consulta');
            if (tecnica) tecnica.classList.toggle('hidden', view !== 'tecnica');
        };
    });
    calcularOcupacionPark3D(feature);
}

async function construirEscenaParque3D(feature, arboles) {
    if (typeof THREE === 'undefined') return;
    limpiarEscenaParque3D();

    var container = document.getElementById('park3d-container');
    if (!container) return;
    var width = Math.max(container.clientWidth, 320);
    var height = Math.max(container.clientHeight, 320);
    var geojson = parqueFeatureAGeoJson(feature);
    var bbox = bboxGeometriaPark3D(geojson.geometry);
    var lon0 = (bbox.minLon + bbox.maxLon) / 2;
    var lat0 = (bbox.minLat + bbox.maxLat) / 2;
    var cosLat = Math.cos(lat0 * Math.PI / 180);
    var toLocal = function (coord) {
        return {
            x: (coord[0] - lon0) * 111320 * cosLat,
            z: -(coord[1] - lat0) * 110540
        };
    };

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd8e4e9);
    scene.fog = new THREE.Fog(0xd8e4e9, 220, 760);
    var camera = new THREE.PerspectiveCamera(42, width / height, .1, 5000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .07;
    controls.screenSpacePanning = true;
    controls.minPolarAngle = Math.PI * .16;
    controls.maxPolarAngle = Math.PI * .46;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x839078, 1.2));
    var sun = new THREE.DirectionalLight(0xfff4dd, 1.7);
    sun.position.set(130, 220, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    var group = new THREE.Group();
    scene.add(group);
    var polygons = geojson.geometry.type === 'Polygon' ? [geojson.geometry.coordinates] : geojson.geometry.coordinates;
    var visuals = window.TREE_VISUAL_ASSETS || {};
    var spanX = (bbox.maxLon - bbox.minLon) * 111320 * cosLat;
    var spanZ = (bbox.maxLat - bbox.minLat) * 110540;
    var span = Math.max(spanX, spanZ, 35);
    var grass = visuals.grass ? crearTexturaImagenPark3D(visuals.grass) : crearTexturaCanvasPark3D('grass');
    grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
    grass.repeat.set(Math.max(2, spanX / 25), Math.max(2, spanZ / 25));
    var groundMat = new THREE.MeshStandardMaterial({ map: grass, color: 0xb8caae, roughness: 1, metalness: 0, side: THREE.DoubleSide });
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x2f6946, transparent: true, opacity: .75 });

    polygons.forEach(function (poly) {
        if (!poly || !poly.length) return;
        var shape = new THREE.Shape();
        poly[0].forEach(function (coord, i) {
            var p = toLocal(coord);
            if (i === 0) shape.moveTo(p.x, -p.z);
            else shape.lineTo(p.x, -p.z);
        });
        for (var h = 1; h < poly.length; h++) {
            var hole = new THREE.Path();
            poly[h].forEach(function (coord, i) {
                var p = toLocal(coord);
                if (i === 0) hole.moveTo(p.x, -p.z);
                else hole.lineTo(p.x, -p.z);
            });
            shape.holes.push(hole);
        }
        var geom = new THREE.ShapeGeometry(shape);
        geom.rotateX(-Math.PI / 2);
        var mesh = new THREE.Mesh(geom, groundMat);
        mesh.receiveShadow = true;
        group.add(mesh);

        var pts = poly[0].map(function (coord) {
            var p = toLocal(coord);
            return new THREE.Vector3(p.x, .04, p.z);
        });
        group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), edgeMat));
    });

    var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(2500, 2500),
        new THREE.MeshStandardMaterial({ color: 0xb6b9ad, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -.12;
    floor.receiveShadow = true;
    scene.add(floor);

    var textureKeys = ['wide', 'tall', 'slender', 'young', 'irregular', 'round'];
    var treeTextures = {};
    var treeMaterials = {};
    textureKeys.forEach(function (key) {
        var source = visuals[key] || visuals.irregular || visuals.tall || visuals.wide;
        treeTextures[key] = source ? crearTexturaImagenPark3D(source) : crearTexturaCanvasPark3D('canopy');
        treeMaterials[key] = new THREE.MeshBasicMaterial({
            map: treeTextures[key],
            transparent: true,
            alphaTest: .13,
            side: THREE.DoubleSide,
            depthWrite: true,
            toneMapped: false
        });
    });
    var canopyTexture = crearTexturaCanvasPark3D('canopy');
    var canopyMat = new THREE.MeshBasicMaterial({ map: canopyTexture, transparent: true, depthWrite: false, toneMapped: false });
    var shadowTexture = crearTexturaCanvasPark3D('shadow');
    var shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false });
    var planeGeom = new THREE.PlaneGeometry(1, 1);
    var canopyGeom = new THREE.CircleGeometry(1, 32);
    var shadowGeom = new THREE.PlaneGeometry(1, 1);
    shadowGeom.rotateX(-Math.PI / 2);
    canopyGeom.rotateX(-Math.PI / 2);
    var canopySegments = [];
    var canopySteps = 28;
    var conteoTexturas = { wide: 0, tall: 0, slender: 0, young: 0, irregular: 0, round: 0 };

    arboles.forEach(function (tree, index) {
        var lp = toLocal(tree.geometry.coordinates);
        var pr = tree.properties || {};
        var metricas = metricasArbolPark3D(pr);
        var key = elegirTexturaArbolPark3D(pr, metricas, index);
        conteoTexturas[key] = (conteoTexturas[key] || 0) + 1;
        var root = new THREE.Group();
        root.position.set(lp.x, 0, lp.z);
        root.rotation.y = anguloSemillaPark3D(pr);

        var ancho = limitarPark3D((metricas.ew + metricas.ns) / 2, 1.4, 20);
        var planoA = new THREE.Mesh(planeGeom, treeMaterials[key]);
        planoA.position.y = metricas.altura / 2;
        planoA.scale.set(ancho, metricas.altura, 1);
        planoA.renderOrder = 2;
        root.add(planoA);

        var planoB = planoA.clone();
        planoB.rotation.y = Math.PI / 2;
        root.add(planoB);

        var copaSuperior = new THREE.Mesh(canopyGeom, canopyMat);
        copaSuperior.position.y = metricas.libre + Math.max(1.1, (metricas.altura - metricas.libre) * .52);
        copaSuperior.scale.set(metricas.ew / 2, metricas.ns / 2, 1);
        copaSuperior.renderOrder = 1;
        root.add(copaSuperior);

        var sombra = new THREE.Mesh(shadowGeom, shadowMat);
        sombra.position.y = .025;
        sombra.scale.set(metricas.ew * 1.15, metricas.ns * .8, 1);
        root.add(sombra);
        group.add(root);

        for (var s = 0; s < canopySteps; s++) {
            var a1 = s / canopySteps * Math.PI * 2;
            var a2 = (s + 1) / canopySteps * Math.PI * 2;
            canopySegments.push(
                lp.x + Math.cos(a1) * metricas.ew / 2, .1, lp.z + Math.sin(a1) * metricas.ns / 2,
                lp.x + Math.cos(a2) * metricas.ew / 2, .1, lp.z + Math.sin(a2) * metricas.ns / 2
            );
        }
    });

    var metricGeom = new THREE.BufferGeometry();
    metricGeom.setAttribute('position', new THREE.Float32BufferAttribute(canopySegments, 3));
    var metricMat = new THREE.LineBasicMaterial({ color: 0xd18b22, transparent: true, opacity: .62 });
    var metricLayer = new THREE.LineSegments(metricGeom, metricMat);
    metricLayer.visible = false;
    scene.add(metricLayer);

    setTextoPark3D('park3d-model-info', 'Realista: ' + arboles.length.toLocaleString('es-PE') + ' árboles · texturas bajo demanda · sin carga GLB externa');

    var vistaGeneral = function () {
        camera.position.set(span * .92, Math.max(24, span * .32), span * 1.18);
        controls.target.set(0, Math.min(7, span * .035), 0);
        controls.minDistance = span * .12;
        controls.maxDistance = span * 4.2;
        controls.update();
    };
    var vistaPeatonal = function () {
        camera.position.set(span * .72, 3.2, span * .75);
        controls.target.set(0, 4.2, 0);
        controls.update();
    };
    vistaGeneral();

    var reset = document.getElementById('park3d-reset');
    if (reset) reset.onclick = vistaGeneral;
    var pedestrian = document.getElementById('park3d-pedestrian');
    if (pedestrian) pedestrian.onclick = vistaPeatonal;
    var canopyBtn = document.getElementById('park3d-toggle-canopy');
    if (canopyBtn) {
        canopyBtn.classList.remove('active');
        canopyBtn.textContent = 'Copas métricas';
        canopyBtn.onclick = function () {
            metricLayer.visible = !metricLayer.visible;
            canopyBtn.classList.toggle('active', metricLayer.visible);
            canopyBtn.textContent = metricLayer.visible ? 'Ocultar copas' : 'Copas métricas';
        };
    }

    var raf = null;
    var animate = function () {
        raf = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    var onResize = function () {
        if (!container.isConnected) return;
        var w = Math.max(container.clientWidth, 320);
        var h = Math.max(container.clientHeight, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    parque3DEstado = {
        scene: scene,
        renderer: renderer,
        controls: controls,
        raf: raf,
        onResize: onResize,
        extraTextures: Object.values(treeTextures).concat([grass, canopyTexture, shadowTexture]),
        sharedGeometries: [planeGeom, canopyGeom, shadowGeom, metricGeom],
        sharedMaterials: Object.values(treeMaterials).concat([groundMat, edgeMat, canopyMat, shadowMat, metricMat])
    };
}

async function abrirParque3D(feature) {
    var targetFeature = feature || parque3DSeleccionado;
    if (!targetFeature) return;

    parque3DSeleccionado = targetFeature;
    var p = targetFeature.getProperties();
    setTextoPark3D('park3d-code', p['CÓDIGO'] || ('ID ' + (p.ID || '—')));
    setTextoPark3D('park3d-title', p.NOMBRE || 'Ficha del parque');
    setTextoPark3D('park3d-area', formatoAreaPark3D(p['ÁREA']));
    setTextoPark3D('park3d-trees', 'Cargando…');
    setTextoPark3D('park3d-green-actual', porcentajePark3D(p['%OCUP_VERD']));
    setTextoPark3D('park3d-green-min', p['AREA VERDE'] || '—');
    setTextoPark3D('park3d-gray-actual', porcentajePark3D(p['%OCUP_GRIS']));
    setTextoPark3D('park3d-gray-max', p.O_GRIS_MAX || '—');
    setTextoPark3D('park3d-tree-cover', p.CO_ARBOREA || '—');
    iniciarCalculadoraPark3D(targetFeature);
    limpiarEscenaParque3D();

    var modal = document.getElementById('park3d-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    var centro = ol.extent.getCenter(targetFeature.getGeometry().getExtent());
    var lonLat = ol.proj.toLonLat(centro);
    var street = document.getElementById('park3d-street-frame');
    var streetLink = document.getElementById('park3d-street-link');
    if (street) {
        street.src = 'https://maps.google.com/maps?q=&layer=c&cbll=' + lonLat[1] + ',' + lonLat[0] + '&cbp=11,0,0,0,0&output=svembed';
    }
    if (streetLink) {
        streetLink.href = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + lonLat[1] + ',' + lonLat[0];
    }

    try {
        await asegurarArbolesMapa();
        setTextoPark3D('park3d-trees', arbolesParaParque3D(targetFeature).length.toLocaleString('es-PE'));
        setTextoPark3D('park3d-model-info', 'Ficha del parque · Street View · arbolado inventariado');
    } catch (error) {
        console.error(error);
        setTextoPark3D('park3d-trees', '—');
    }
}

window.abrirParque3DSeleccionado = function () {
    abrirParque3D(parque3DSeleccionado);
};

function mostrarFicha(feature, coordinate) {
    if (!feature || feature.get('__tipo') === 'manzana') { cerrarFicha(); return; }

    despejarAnexosParaFicha();

    var p = feature.getProperties();
    var tipo = feature.get('__tipo');
    parque3DSeleccionado = tipo === 'parque' ? feature : null;
    sourceHighlight.clear();
    sourceHighlight.addFeature(feature);

    var title = document.getElementById('ficha-title');
    var content = document.getElementById('ficha-content');
    var htmlRows = [];
    var finalHtml = construirStreetView(coordinate);

    if (tipo === 'parque') {
        // La capa actualizada ya incluye la información normativa completa.
        var pd2 = (typeof PARQUES_DATA !== 'undefined' && p['CÓDIGO']) ? (PARQUES_DATA[p['CÓDIGO']] || null) : null;
        var atuTipo = (pd2 ? pd2.atu : null) || (p.ATU || '').split('/')[0].trim() || '—';
        var apBase = ATU_PARAMS[atuTipo] || null;
        var ap = {
            ovLim: p['AREA VERDE'] || (apBase && apBase.ovLim),
            ca: p.CO_ARBOREA || (apBase && apBase.ca),
            ogLim: p.O_GRIS_MAX || (apBase && apBase.ogLim),
            ms: p.SOPORTE || (apBase && apBase.ms),
            mr: p.RECREATIVO || (apBase && apBase.mr),
            mc: p.COMERCIAL || (apBase && apBase.mc),
            mu: p.OTR_USOS || (apBase && apBase.mu),
            ioe: p['ÍNDIC_OCU'] || (apBase && apBase.ioe),
            hu: numeroSeguro(p['HT_MAX(m2)']) !== null ? numeroSeguro(p['HT_MAX(m2)']).toLocaleString('es-PE') + ' m²' : (apBase && apBase.hu),
            alt: numeroSeguro(p['ALT_MAX(m)']) !== null ? numeroSeguro(p['ALT_MAX(m)']).toLocaleString('es-PE') + ' m' : (apBase && apBase.alt)
        };
        var atuClass = 'atu-' + atuTipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        var ocv = numeroSeguro(p['%OCUP_VERD']);
        var ocg = numeroSeguro(p['%OCUP_GRIS']);
        if (ocv === null && pd2) ocv = numeroSeguro(pd2.ocv);
        if (ocg === null && pd2) ocg = numeroSeguro(pd2.ocg);

        title.innerHTML = '<i class="fas fa-tree"></i> ' + p.NOMBRE;
        finalHtml += '<button type="button" class="btn-accion btn-accion--3d" onclick="window.abrirParque3DSeleccionado()"><i class="fas fa-chart-pie"></i> Ver ficha del parque</button>';

        var areaNum = parseFloat(p['ÁREA']);
        var areaFmt = isNaN(areaNum) ? '—' : areaNum.toLocaleString('es-PE', { maximumFractionDigits: 0 }) + ' m²';

        // ── Header ─────────────────────────────────────────────────
        finalHtml += '<div class="park-summary ' + atuClass + '">'
            + '<span class="atu-badge">' + atuTipo + '</span>'
            + '<div class="park-metadata">'
            + (p['CÓDIGO'] ? '<strong class="park-code">' + p['CÓDIGO'] + '</strong> · ' : '')
            + areaFmt
            + (p.CLASIFICAC ? '<br><span class="park-classification">' + p.CLASIFICAC + '</span>' : '')
            + '</div></div>';

        // helpers
        var pct = function (v) { return v !== null && v !== undefined ? v.toFixed(1).replace('.0', '') + '%' : '—'; };
        var TH = 'class="norm-section"';
        var TL = 'class="norm-label"';
        var TLA = 'class="norm-label norm-label--strong"';
        var TR = 'class="norm-value"';
        var TR2 = 'class="norm-value norm-value--secondary"';
        var SEP = 'class="norm-row"';

        finalHtml += '<table class="norm-table">';

        // ── BLOQUE 1: Situación actual (del Excel) ─────────────────
        if (ocv !== null) {
            var ovLimNum = ap ? parseFloat(ap.ovLim) : null;
            var ogLimNum = ap ? parseFloat(ap.ogLim) : null;
            var ovOk = ovLimNum !== null ? ocv >= ovLimNum : null;
            var ogOk = ogLimNum !== null ? ocg <= ogLimNum : null;
            var tick = function (ok) { return ok === null ? '' : (ok ? ' <span class="status status--ok">✓</span>' : ' <span class="status status--error">✗</span>'); };

            finalHtml += '<tr><td colspan="3" ' + TH + '>Situación Actual del Parque</td></tr>'
                // verde bar + value
                + '<tr ' + SEP + '>'
                + '<td ' + TLA + '>Ocupación verde</td>'
                + '<td class="progress-cell">'
                + '<progress class="occupancy-progress occupancy-progress--green" value="' + ocv + '" max="100">' + pct(ocv) + '</progress>'
                + '</td>'
                + '<td class="norm-value norm-value--green">' + pct(ocv) + tick(ovOk) + '</td></tr>'
                // gris bar + value
                + '<tr ' + SEP + '>'
                + '<td ' + TL + '>Ocupación gris</td>'
                + '<td class="progress-cell">'
                + '<progress class="occupancy-progress occupancy-progress--gray" value="' + ocg + '" max="100">' + pct(ocg) + '</progress>'
                + '</td>'
                + '<td class="norm-value norm-value--gray">' + pct(ocg) + tick(ogOk) + '</td></tr>';

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
            finalHtml += '<tr><td colspan="3" ' + TH + '>Límites Normativos — Art. 43 RGEP</td></tr>'
                + '<tr ' + SEP + '><td ' + TLA + '>Áreas verdes mínimas</td><td></td><td class="norm-value norm-value--green">' + (ap.ovLim || '—') + '</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '>Cobertura arbórea mínima</td><td></td><td class="norm-value norm-value--green-secondary">' + (ap.ca || '—') + '</td></tr>'
                + '<tr class="norm-row norm-row--section-end"><td ' + TL + '>Gris máxima absoluta</td><td></td><td class="norm-value norm-value--red">' + (ap.ogLim || '—') + '</td></tr>';
        }

        // ── BLOQUE 3: Módulos Funcionales ─────────────────────────
        if (ap) {
            finalHtml += '<tr><td colspan="3" ' + TH + '>Módulos Funcionales</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '> Soporte <span class="module-code">(MS)</span></td><td></td><td ' + TR2 + '>' + (ap.ms || '—') + '</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '> Recreativo <span class="module-code">(MR)</span></td><td></td><td ' + TR2 + '>' + (ap.mr || '—') + '</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '> Comercial <span class="module-code">(MC)</span></td><td></td><td ' + TR2 + '>' + (ap.mc || '—') + '</td></tr>'
                + '<tr class="norm-row norm-row--section-end"><td ' + TL + '> Otros Usos <span class="module-code">(MU)</span></td><td></td><td ' + TR2 + '>' + (ap.mu || '—') + '</td></tr>'
                + '<tr><td colspan="3" class="norm-note">* MC + MU ≤ 15% del área total</td></tr>';
        }

        // ── BLOQUE 4: Máximo de Área Techada para Módulos Funcionales ─────────────────────────────────
        if (ap) {
            finalHtml += '<tr><td colspan="3" ' + TH + '>Máximo de Área Techada para Módulos Funcionales</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '>Índice de Ocupación para Infraestructura (IOE)</td><td></td><td ' + TR2 + '>' + (ap.ioe || '—') + '</td></tr>'
                + '<tr ' + SEP + '><td ' + TL + '>Huella máxima</td><td></td><td ' + TR2 + '>' + (ap.hu || '—') + '</td></tr>'
                + '<tr><td ' + TL + '>Altura máxima</td><td></td><td ' + TR2 + '>' + (ap.alt || '—') + '</td></tr>';
        }

        finalHtml += '</table>';
    } else if (tipo === 'via') {
        title.innerHTML = `<i class="fas fa-road"></i> ${p.NOMBRE_FIN}`;
        var detalleSeccion = seccionesPorCodigo[p['CÓDIGO']] || {};
        agregarFilaValida(htmlRows, "Clasificación Normativa", p.CLASIFIC || detalleSeccion.CLASIFICA);
        agregarFilaValida(htmlRows, "Código", p['CÓDIGO'] || detalleSeccion.CODIGO);
        agregarFilaValida(htmlRows, "Tramo", p.TRAMO || detalleSeccion.TRAMO);
        var anchoVia = p.ANCHO || detalleSeccion.ANCHO;
        if (anchoVia && anchoVia !== '-') htmlRows.push(`<tr><td>Ancho Normativo Vigente</td><td>${anchoVia} m</td></tr>`);

        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;

        var pdfVia = rutaPdfVia(p);
        if (pdfVia) {
            finalHtml += `<a href="${pdfVia}" target="_blank" rel="noopener noreferrer" class="btn-accion"><i class="fas fa-file-pdf"></i> Diseño de Franjas (PDF)</a>`;
        }
    } else if (tipo === 'epi') {
        title.innerHTML = `<i class="fas fa-draw-polygon"></i> ${p.NOMBRE}`;
        agregarFilaValida(htmlRows, "Clasificación", p.CLASIFICAC);
        agregarFilaValida(htmlRows, "Subclasificación", p.SUBCLASIFI);
        agregarFilaValida(htmlRows, "Código", p['CÓDIGO']);
        agregarFilaValida(htmlRows, "Supermanzana", p.SUPERMANZA);
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;

        var enlaceEpi = enlaceHttpSeguro(p.LINK);
        if (enlaceEpi) {
            finalHtml += `<a href="${enlaceEpi}" target="_blank" rel="noopener noreferrer" class="btn-accion btn-accion--green"><i class="fas fa-file-pdf"></i> Documento del espacio integrado</a>`;
        }
    } else if (tipo === 'servidumbre') {
        title.innerHTML = '<i class="fas fa-route"></i> Servidumbre de paso';
        finalHtml += '<p class="feature-description">Área destinada a servidumbre de paso dentro del espacio público integrado.</p>';
    } else if (tipo === 'atu') {
        title.innerHTML = '<i class="fas fa-layer-group"></i> Área de Tratamiento Urbano';
        agregarFilaValida(htmlRows, 'Tratamiento', p.TRAT_URB1);
        agregarFilaValida(htmlRows, 'Subtratamiento', p.TRAT_URB2);
        agregarFilaValida(htmlRows, 'Área', p.AREA_M2 ? Number(p.AREA_M2).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
    } else if (tipo === 'jardin-aislamiento') {
        title.innerHTML = '<i class="fas fa-seedling"></i> Jardín de Aislamiento';
        agregarFilaValida(htmlRows, 'Sector', p.SECTOR);
        agregarFilaValida(htmlRows, 'Código de lote', p.COD_LOTE);
        agregarFilaValida(htmlRows, 'Zonificación vigente', p.ZON_VIG || p.ZONIFI_DUS);
        agregarFilaValida(htmlRows, 'Área', p.Area_m2 ? Number(p.Area_m2).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
    } else if (tipo === 'sector') {
        title.innerHTML = '<i class="fas fa-border-all"></i> Sector ' + (p.Sectores || '');
        agregarFilaValida(htmlRows, 'Sector', p.Sectores);
        agregarFilaValida(htmlRows, 'Población 2024', p.POB__2024 ? Number(p.POB__2024).toLocaleString('es-PE') : '');
        agregarFilaValida(htmlRows, 'Área', p.AREA ? Number(p.AREA).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
    } else if (tipo === 'subsector') {
        title.innerHTML = '<i class="fas fa-vector-square"></i> Subsector ' + (p.RefName || '');
        agregarFilaValida(htmlRows, 'Subsector', p.RefName);
        agregarFilaValida(htmlRows, 'Área', p.AREA ? Number(p.AREA).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
    } else if (tipo === 'limite-distrital') {
        title.innerHTML = '<i class="fas fa-draw-polygon"></i> Límite Distrital';
        agregarFilaValida(htmlRows, 'Área', p.AREA_M2 ? Number(p.AREA_M2).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m²' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
    } else if (tipo === 'urb-juan') {
        title.innerHTML = '<i class="fas fa-draw-polygon"></i> Urb. Juan XXIII';
        finalHtml += '<p class="feature-description">Espacios Públicos destinados a la movilidad urbana</p>';
    } else if (tipo === 'juan-alameda') {
        title.innerHTML = '<i class="fas fa-road"></i> ' + (p.NOMBRE_1 || 'Alameda - Urb. Juan XXIII');
        agregarFilaValida(htmlRows, 'Clasificación', p.CLASIFICAC);
        agregarFilaValida(htmlRows, 'Subclasificación', p.SUBCLASIFI);
        agregarFilaValida(htmlRows, 'Categoría', p['CATEGORÍA']);
        agregarFilaValida(htmlRows, 'Código anexo', p['CÓDIGO AN']);
        agregarFilaValida(htmlRows, 'Código', p['CÓDIGO']);
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;

    } else if (tipo === 'juan-pasaje-calle') {
        title.innerHTML = '<i class="fas fa-vector-square"></i> Pasajes/Calles - Urb. Juan XXIII';
        agregarFilaValida(htmlRows, 'Identificador', p.FID || p.FID_2);
        finalHtml += htmlRows.length
            ? `<table class="tabla-attr">${htmlRows.join('')}</table>`
            : '<p class="feature-description">Borde de submanzana y área libre de la Urb. Juan XXIII.</p>';
    } else if (tipo === 'surco-zona-reglamentada') {
        title.innerHTML = '<i class="fas fa-landmark"></i> Zona Reglamentada';
        finalHtml += '<p class="feature-description">Zona Reglamentada como Paisaje Arqueológico R.VM. N.º 041-2019-VMPCIC-MC.</p>';
        finalHtml += botonPdfFicha(rutaPdfRioSurco(tipo, p), 'Ver PDF');
    } else if (tipo === 'surco-faja') {
        title.innerHTML = '<i class="fas fa-water"></i> Faja marginal del Canal de Río Surco';
        finalHtml += '<p class="feature-description">Faja marginal del Canal de Río Surco según Resolución Jefatural N.º 332-2016-ANA.</p>';
        finalHtml += botonPdfFicha(rutaPdfRioSurco(tipo, p), 'Ver PDF');
    } else if (tipo === 'surco-uso-restringido') {
        title.innerHTML = '<i class="fas fa-leaf"></i> Zona de usos restringidos';
        finalHtml += '<p class="feature-description">Área asociada al Canal de Río Surco con usos restringidos.</p>';
        finalHtml += botonPdfFicha(rutaPdfRioSurco(tipo, p), 'Ver PDF');
    } else if (tipo === 'rio-surco') {
        var situacionSurco = p['situación'] || p.situacion || p.TIPO || 'Canal de Río Surco';
        title.innerHTML = '<i class="fas fa-water"></i> Río Surco';
        agregarFilaValida(htmlRows, 'Situación', situacionSurco);
        agregarFilaValida(htmlRows, 'Longitud', p.LONGITUD ? Number(p.LONGITUD).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' m' : '');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
        finalHtml += botonPdfFicha(rutaPdfRioSurco(tipo, p), 'Ver PDF');
    } else if (tipo === 'bien-cultural-huaca') {
        title.innerHTML = '<i class="fas fa-landmark"></i> Zona Arqueológica Huaca San Borja';
        agregarFilaValida(htmlRows, 'Nombre', 'Zona Arqueológica Huaca San Borja');
        finalHtml += `<table class="tabla-attr">${htmlRows.join('')}</table>`;
        finalHtml += botonPdfFicha(rutaPdfRioSurco(tipo, p), 'Ver PDF');
    }

    if (tipo === 'parque') {
        var pdfParque = rutaPdfParque(p);
        finalHtml = construirStreetView(coordinate)
            + '<button type="button" class="btn-accion btn-accion--3d" onclick="window.abrirParque3DSeleccionado()"><i class="fas fa-chart-pie"></i> VER FICHA DEL PARQUE</button>'
            + botonPdfFicha(pdfParque, 'Ver PDF');
    }

    content.innerHTML = finalHtml;
    ficha.style.display = 'flex';
    resaltarLeyendaParaFeature(feature);
}

var PRIORIDAD_CLICK_FEATURE = {
    'arbol': 5,
    'via': 10,
    'rio-surco': 12,
    'juan-pasaje-calle': 14,
    'parque': 20,
    'jardin-aislamiento': 21,
    'epi': 22,
    'servidumbre': 23,
    'juan-alameda': 24,
    'surco-zona-reglamentada': 30,
    'surco-faja': 31,
    'surco-uso-restringido': 32,
    'bien-cultural-huaca': 33,
    'urb-juan': 45,
    'atu': 80,
    'subsector': 90,
    'sector': 95
};

function areaFeatureParaPrioridad(feature) {
    var geometry = feature && feature.getGeometry ? feature.getGeometry() : null;
    if (!geometry || !geometry.getArea) return 0;
    return geometry.getArea();
}

function featureInteractivaEnPixel(pixel, hitTolerance) {
    var candidatos = [];
    var pixelBusqueda = pixelOriginalDesdeVistaInclinada(pixel);

    map.forEachFeatureAtPixel(pixelBusqueda, function (feature, layer) {
        var tipo = feature && feature.get('__tipo');
        if (!feature || layer === layerHighlight || tipo === 'manzana' || tipo === 'limite-distrital') return;

        candidatos.push({
            feature: feature,
            prioridad: PRIORIDAD_CLICK_FEATURE[tipo] || 70,
            area: areaFeatureParaPrioridad(feature)
        });
    }, { hitTolerance: hitTolerance });

    if (!candidatos.length) return null;

    candidatos.sort(function (a, b) {
        if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
        return a.area - b.area;
    });

    return candidatos[0].feature;
}

map.on('singleclick', function (evt) {
    if (document.body.classList.contains('streetview-targeting')) return;
    var feature = featureInteractivaEnPixel(evt.pixel, inclinacionMapaActiva ? 9 : 5);
    var pixelBusqueda = pixelOriginalDesdeVistaInclinada(evt.pixel);
    if (feature && feature.get('__tipo') === 'arbol') {
        mostrarPopupArbol(feature, map.getCoordinateFromPixel(pixelBusqueda));
        return;
    }
    if (overlayArbol) overlayArbol.setPosition(undefined);
    if (arbolPopupEl) arbolPopupEl.classList.add('hidden');
    marcarArbolSeleccionado(null);
    mostrarFicha(feature, map.getCoordinateFromPixel(pixelBusqueda));
});

var pointerMovePendiente = null;
var pointerMoveRAF = null;
map.on('pointermove', function (evt) {
    if (evt.dragging) return;
    pointerMovePendiente = evt.pixel;
    if (pointerMoveRAF) return;
    pointerMoveRAF = requestAnimationFrame(function () {
        pointerMoveRAF = null;
        if (!pointerMovePendiente) return;
        var hit = featureInteractivaEnPixel(pointerMovePendiente, inclinacionMapaActiva ? 8 : 4);
        map.getViewport().classList.toggle('is-hovering', !!hit);
    });
});

// ==========================================
// BUSCADOR CON ENMARCADO Y AUTO-CLICK
// ==========================================
var dictBusqueda = [];
[vectorRedVial, vectorParques, vectorEpiLimatambo, vectorEpiTorres].forEach(layer => {
    layer.getSource().getFeatures().forEach(f => {
        var p = f.getProperties();
        var nom = p.NOMBRE_FIN || p.NOMBRE || "";
        if (nom && nom.trim() !== "") {
            var tipoFeature = f.get('__tipo');
            var tipoResultado = tipoFeature === 'via' ? 'Vía' : (tipoFeature === 'parque' ? 'Parque' : 'EPI');
            dictBusqueda.push({ label: nom, searchToken: nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), tipo: tipoResultado, feature: f });
        }
    });
});
dictBusqueda.sort((a, b) => a.label.localeCompare(b.label));

var inputBuscador = document.getElementById('buscador-rgep');
var resDiv = document.getElementById('lista-resultados');

inputBuscador.addEventListener('input', function () {
    var val = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    resDiv.innerHTML = '';
    if (val.length < 2) { resDiv.style.display = 'none'; return; }

    var matches = dictBusqueda.filter(v => v.searchToken.includes(val)).slice(0, 8);

    if (matches.length === 0) {
        resDiv.innerHTML = '<div class="search-empty">Sin resultados.</div>';
    } else {
        matches.forEach(v => {
            var item = document.createElement('div');
            item.className = 'resultado-item resultado-item--' + (v.tipo === 'Parque' ? 'parque' : (v.tipo === 'EPI' ? 'epi' : 'via'));
            item.setAttribute('role', 'option');
            item.innerHTML = `<span class="res-titulo">${v.label}</span><span class="res-sub">${v.tipo}</span>`;
            item.onclick = function () {
                inputBuscador.value = v.label;
                resDiv.style.display = 'none';
                inputBuscador.blur();

                var ext = v.feature.getGeometry().getExtent();
                var center = ol.extent.getCenter(ext);

                var pLeft = window.innerWidth <= 896 ? 20 : 400;
                var pBottom = window.innerWidth <= 896 ? 120 : 50;
                map.getView().fit(ext, { padding: [50, 50, pBottom, pLeft], maxZoom: 18, duration: 800 });

                setTimeout(function () { mostrarFicha(v.feature, center); }, 850);
            };
            resDiv.appendChild(item);
        });
    }
    resDiv.style.display = 'block';
});

document.addEventListener('click', function (event) {
    if (!document.getElementById('search-box').contains(event.target)) {
        resDiv.style.display = 'none';
    }
});
