(function() {
    var button = document.getElementById('btn-streetview');
    var ghost = document.getElementById('streetview-drag-ghost');
    var mapElement = document.getElementById('map');
    var targeting = false;
    var dragging = false;
    var startPoint = null;
    var wasTargetingBeforeDrag = false;
    var highlightedRoad = null;
    var pendingPixel = null;
    var highlightFrame = null;

    if (!button || !ghost || !mapElement || typeof map === 'undefined' || typeof ol === 'undefined') return;

    function setTargeting(active) {
        targeting = active;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
        document.body.classList.toggle('streetview-targeting', active);
        if (!active) clearStreetViewHighlight();
    }

    function updateGhost(clientX, clientY) {
        ghost.style.transform = 'translate3d(' + (clientX - 13) + 'px,' + (clientY - 12) + 'px,0)';
        ghost.classList.add('is-visible');
    }

    function hideGhost() {
        ghost.classList.remove('is-visible');
    }

    function clearStreetViewHighlight() {
        if (highlightFrame) cancelAnimationFrame(highlightFrame);
        highlightFrame = null;
        pendingPixel = null;
        highlightedRoad = null;
        if (typeof sourceHighlight !== 'undefined') sourceHighlight.clear();
    }

    function highlightRoadAtPixel(pixel) {
        if (!pixel || typeof sourceHighlight === 'undefined' || typeof vectorRedVial === 'undefined') return;
        pendingPixel = pixel;
        if (highlightFrame) return;
        highlightFrame = requestAnimationFrame(function () {
            highlightFrame = null;
            if (!targeting || !pendingPixel) return;
            var road = map.forEachFeatureAtPixel(pendingPixel, function(feature) { return feature; }, {
                hitTolerance: 12,
                layerFilter: function (layer) { return layer === vectorRedVial; }
            }) || null;
            if (road === highlightedRoad) return;
            highlightedRoad = road;
            sourceHighlight.clear();
            if (road) sourceHighlight.addFeature(road);
        });
    }

    function highlightRoadAtClient(clientX, clientY) {
        var rect = mapElement.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            clearStreetViewHighlight();
            return;
        }

        highlightRoadAtPixel([clientX - rect.left, clientY - rect.top]);
    }

    function cancelStreetViewMode() {
        dragging = false;
        setTargeting(false);
        hideGhost();
    }

    function getCoordinateFromClient(clientX, clientY) {
        var rect = mapElement.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
        return map.getCoordinateFromPixel([clientX - rect.left, clientY - rect.top]);
    }

    function calculateHeading(start, end) {
        if (!start || !end) return 0;
        var dx = end[0] - start[0];
        var dy = start[1] - end[1];
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return 0;
        return Math.round((Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360);
    }

    function openStreetView(coordinate, heading) {
        if (!coordinate) {
            cancelStreetViewMode();
            return;
        }

        var lonLat = ol.proj.toLonLat(coordinate);
        var longitude = lonLat[0].toFixed(7);
        var latitude = lonLat[1].toFixed(7);
        var url = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
            latitude + ',' + longitude +
            '&heading=' + (heading || 0) +
            '&pitch=10&fov=90';

        window.open(url, '_blank', 'noopener,noreferrer');
        setTargeting(false);
        hideGhost();
    }

    button.addEventListener('pointerdown', function(event) {
        if (event.button !== 0) return;
        dragging = true;
        startPoint = [event.clientX, event.clientY];
        wasTargetingBeforeDrag = targeting;
        setTargeting(true);
        updateGhost(event.clientX, event.clientY);
        event.preventDefault();
    });

    document.addEventListener('pointermove', function(event) {
        if (!dragging) return;
        updateGhost(event.clientX, event.clientY);
        highlightRoadAtClient(event.clientX, event.clientY);
        event.preventDefault();
    });

    document.addEventListener('pointerup', function(event) {
        if (!dragging) return;
        dragging = false;

        var moved = Math.hypot(event.clientX - startPoint[0], event.clientY - startPoint[1]) > 8;
        var coordinate = getCoordinateFromClient(event.clientX, event.clientY);

        if (moved && coordinate) {
            openStreetView(coordinate, calculateHeading(startPoint, [event.clientX, event.clientY]));
        } else if (!moved) {
            setTargeting(!wasTargetingBeforeDrag);
            hideGhost();
        } else {
            cancelStreetViewMode();
        }

        event.preventDefault();
    });

    button.addEventListener('pointercancel', cancelStreetViewMode);
    button.addEventListener('click', function(event) {
        // Keyboard activation has no pointer sequence.
        if (event.detail === 0) setTargeting(!targeting);
    });

    map.on('pointermove', function(event) {
        if (!targeting || dragging || event.dragging || event.originalEvent.pointerType !== 'mouse') return;
        highlightRoadAtPixel(event.pixel);
    });

    map.on('singleclick', function(event) {
        if (!targeting || dragging) return;
        openStreetView(event.coordinate, 0);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && targeting) cancelStreetViewMode();
    });
})();
