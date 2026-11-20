/* Search the complete inventory independently of map visibility and zoom. */
function normalizarBusquedaArbol(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function indexarBusquedaArboles(features) {
    var groups = new Map();
    features.forEach(function (feature) {
        var p = feature.properties || {};
        var common = String(p.NOMBRE_COM || 'Sin nombre común').trim();
        var scientific = String(p.NOMBRE_CIE || '').trim();
        var key = normalizarBusquedaArbol(common) + '|' + normalizarBusquedaArbol(scientific);
        if (!groups.has(key)) groups.set(key, { common: common, scientific: scientific, families: new Set(), total: 0, locations: new Map() });
        var group = groups.get(key);
        group.total++;
        if (p.FAMILIA) group.families.add(String(p.FAMILIA).trim());
        var name = String(p['UBICACIÓN'] || 'Sin ubicación registrada').trim();
        var park = normalizarBusquedaArbol(p.Tipo_de_V) === 'parque' || /^parque\b/.test(normalizarBusquedaArbol(name));
        var locationKey = normalizarBusquedaArbol(name);
        if (!group.locations.has(locationKey)) group.locations.set(locationKey, { name: name, park: park, count: 0 });
        group.locations.get(locationKey).count++;
    });
    return Array.from(groups.values()).sort(function (a, b) { return a.common.localeCompare(b.common, 'es'); });
}

(function () {
    var modal = document.getElementById('tree-search-modal');
    var input = document.getElementById('tree-search-input');
    var status = document.getElementById('tree-search-status');
    var results = document.getElementById('tree-search-results');
    var index = null;
    var loading = false;
    var resultPage = 0;
    var clear = document.getElementById('tree-search-clear');
    var format = new Intl.NumberFormat('es-PE');
    function element(tag, text, className) {
        var node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }
    function pagination(page, pages, change) {
        var nav = element('nav', undefined, 'tree-search-pagination');
        nav.setAttribute('aria-label', 'Páginas de resultados');
        var previous = element('button', '‹ Anterior');
        var next = element('button', 'Siguiente ›');
        previous.type = next.type = 'button';
        previous.disabled = page === 0;
        next.disabled = page === pages - 1;
        previous.addEventListener('click', function () { change(page - 1); });
        next.addEventListener('click', function () { change(page + 1); });
        var label = element('span', (page + 1) + ' / ' + pages);
        label.setAttribute('aria-live', 'polite');
        nav.append(previous, label, next);
        return nav;
    }
    function render() {
        clear.hidden = !input.value;
        results.replaceChildren();
        if (!index) return;
        var terms = normalizarBusquedaArbol(input.value).split(' ').filter(Boolean);
        var matches = index.filter(function (group) {
            var name = normalizarBusquedaArbol(group.common + ' ' + group.scientific);
            return terms.every(function (term) { return name.includes(term); });
        });
        status.textContent = matches.length
            ? matches.length + (matches.length === 1 ? ' opción · ' : ' opciones · ') + format.format(matches.reduce(function (sum, group) { return sum + group.total; }, 0)) + ' árboles registrados. Selecciona una opción para ver sus ubicaciones.'
            : 'No se encontraron árboles con ese nombre. Prueba otro nombre común o científico.';
        matches.slice(resultPage * 6, resultPage * 6 + 6).forEach(function (group) {
            var detail = element('details', undefined, 'tree-search-option');
            var summary = element('summary');
            var names = element('span');
            names.append(element('strong', group.common), element('em', group.scientific));
            summary.append(names, element('span', format.format(group.total) + ' en el distrito', 'tree-search-count'));
            detail.append(summary);
            // Populate location rows only when the user opens a suggestion.
            detail.addEventListener('toggle', function () {
                if (detail.open) results.querySelectorAll('details').forEach(function (other) { if (other !== detail) other.open = false; });
                if (!detail.open || detail.dataset.loaded) return;
                detail.dataset.loaded = 'true';
                var body = element('div', undefined, 'tree-search-breakdown');
                if (group.families.size) body.append(element('p', 'Familia: ' + Array.from(group.families).join(', ')));
                var locations = Array.from(group.locations.values()).sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, 'es'); });
                [true, false].forEach(function (parks) {
                    var subset = locations.filter(function (location) { return location.park === parks; });
                    if (!subset.length) return;
                    var total = subset.reduce(function (sum, location) { return sum + location.count; }, 0);
                    body.append(element('h3', (parks ? 'Parques' : 'Otras ubicaciones') + ' · ' + format.format(total) + ' árboles'));
                    var list = element('ul');
                    body.append(list);
                    var pager;
                    function showLocations(page) {
                        list.replaceChildren();
                        subset.slice(page * 6, page * 6 + 6).forEach(function (location) {
                            var row = element('li');
                            row.append(element('span', location.name), element('strong', format.format(location.count)));
                            list.append(row);
                        });
                        if (subset.length > 6) {
                            var nextPager = pagination(page, Math.ceil(subset.length / 6), showLocations);
                            if (pager) pager.replaceWith(nextPager);
                            else list.after(nextPager);
                            pager = nextPager;
                        }
                    }
                    showLocations(0);
                });
                detail.append(body);
            });
            results.append(detail);
        });
        if (matches.length > 6) results.append(pagination(resultPage, Math.ceil(matches.length / 6), function (page) {
            resultPage = page;
            render();
            modal.scrollTop = 0;
        }));
    }
    async function load() {
        if (loading) return;
        if (index) { render(); return; }
        loading = true;
        status.textContent = 'Cargando inventario de árboles…';
        results.replaceChildren();
        try {
            await asegurarInventarioArboles();
            index = indexarBusquedaArboles(window.json_rboles_parque_0.features || []);
            render();
        } catch (error) {
            status.textContent = 'No se pudo cargar el inventario. Intenta nuevamente.';
            var retry = element('button', 'Reintentar');
            retry.type = 'button';
            retry.addEventListener('click', load);
            results.append(retry);
        } finally { loading = false; }
    }
    document.getElementById('btn-tree-search').addEventListener('click', function () {
        modal.showModal();
        input.focus();
        load();
    });
    document.getElementById('tree-search-close').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (event) {
        var rect = modal.getBoundingClientRect();
        if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) modal.close();
    });
    input.addEventListener('input', function () { resultPage = 0; render(); });
    clear.addEventListener('click', function () {
        input.value = '';
        resultPage = 0;
        render();
        input.focus();
    });
})();
