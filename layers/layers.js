var wms_layers = [];

var format_lotes_0 = new ol.format.GeoJSON();
var features_lotes_0 = format_lotes_0.readFeatures(json_lotes_0, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_lotes_0 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_lotes_0.addFeatures(features_lotes_0);
var lyr_lotes_0 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_lotes_0, 
                style: style_lotes_0,
                popuplayertitle: 'lotes',
                interactive: true,
                title: '<img src="styles/legend/lotes_0.png" /> lotes'
            });
var format_reastechadas_1 = new ol.format.GeoJSON();
var features_reastechadas_1 = format_reastechadas_1.readFeatures(json_reastechadas_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_reastechadas_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_reastechadas_1.addFeatures(features_reastechadas_1);
var lyr_reastechadas_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_reastechadas_1, 
                style: style_reastechadas_1,
                popuplayertitle: 'áreas techadas',
                interactive: true,
                title: '<img src="styles/legend/reastechadas_1.png" /> áreas techadas'
            });
var format_ParquesOf_2 = new ol.format.GeoJSON();
var features_ParquesOf_2 = format_ParquesOf_2.readFeatures(json_ParquesOf_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ParquesOf_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_ParquesOf_2.addFeatures(features_ParquesOf_2);
var lyr_ParquesOf_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_ParquesOf_2, 
                style: style_ParquesOf_2,
                popuplayertitle: 'Parques Of',
                interactive: true,
                title: '<img src="styles/legend/ParquesOf_2.png" /> Parques Of'
            });
var format_ParquesOfcopiar_3 = new ol.format.GeoJSON();
var features_ParquesOfcopiar_3 = format_ParquesOfcopiar_3.readFeatures(json_ParquesOfcopiar_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ParquesOfcopiar_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_ParquesOfcopiar_3.addFeatures(features_ParquesOfcopiar_3);
var lyr_ParquesOfcopiar_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_ParquesOfcopiar_3, 
                style: style_ParquesOfcopiar_3,
                popuplayertitle: 'Parques Of copiar',
                interactive: true,
    title: 'Parques Of copiar<br />\
    <img src="styles/legend/ParquesOfcopiar_3_0.png" /> Conservación 1<br />\
    <img src="styles/legend/ParquesOfcopiar_3_1.png" /> Conservación 2<br />\
    <img src="styles/legend/ParquesOfcopiar_3_2.png" /> Conservación 3<br />\
    <img src="styles/legend/ParquesOfcopiar_3_3.png" /> Consolidación 1<br />\
    <img src="styles/legend/ParquesOfcopiar_3_4.png" /> Consolidación 2<br />\
    <img src="styles/legend/ParquesOfcopiar_3_5.png" /> Consolidación 3<br />\
    <img src="styles/legend/ParquesOfcopiar_3_6.png" /> Dinamización 1<br />\
    <img src="styles/legend/ParquesOfcopiar_3_7.png" /> Dinamización 2<br />\
    <img src="styles/legend/ParquesOfcopiar_3_8.png" /> Generación 1<br />\
    <img src="styles/legend/ParquesOfcopiar_3_9.png" /> Generación 2<br />\
    <img src="styles/legend/ParquesOfcopiar_3_10.png" /> Renovación 1<br />\
    <img src="styles/legend/ParquesOfcopiar_3_11.png" /> Renovación 2<br />\
    <img src="styles/legend/ParquesOfcopiar_3_12.png" /> Renovación 3<br />' });
var format_red_vial_4 = new ol.format.GeoJSON();
var features_red_vial_4 = format_red_vial_4.readFeatures(json_red_vial_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_red_vial_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_red_vial_4.addFeatures(features_red_vial_4);
var lyr_red_vial_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_red_vial_4, 
                style: style_red_vial_4,
                popuplayertitle: 'red_vial',
                interactive: true,
    title: 'red_vial<br />\
    <img src="styles/legend/red_vial_4_0.png" /> Vía Local Preferencial<br />\
    <img src="styles/legend/red_vial_4_1.png" /> Vía Local Secundaria<br />\
    <img src="styles/legend/red_vial_4_2.png" /> Metropolitana<br />' });
var group_PDF = new ol.layer.Group({
                                layers: [lyr_ParquesOf_2,lyr_ParquesOfcopiar_3,],
                                fold: 'open',
                                title: 'PDF'});
var group_CONTEXTO = new ol.layer.Group({
                                layers: [lyr_lotes_0,lyr_reastechadas_1,],
                                fold: 'close',
                                title: 'CONTEXTO'});

lyr_lotes_0.setVisible(true);lyr_reastechadas_1.setVisible(true);lyr_ParquesOf_2.setVisible(true);lyr_ParquesOfcopiar_3.setVisible(true);lyr_red_vial_4.setVisible(true);
var layersList = [group_CONTEXTO,group_PDF,lyr_red_vial_4];
lyr_lotes_0.set('fieldAliases', {'CUC': 'CUC', 'Sector': 'Sector', 'COD_LOTE': 'COD_LOTE', 'subsectore': 'subsectore', 'periodo': 'periodo', 'M2_CONSTRU': 'M2_CONSTRU', 'AREA_M2': 'AREA_M2', 'ID': 'ID', });
lyr_reastechadas_1.set('fieldAliases', {'FID': 'FID', });
lyr_ParquesOf_2.set('fieldAliases', {'sector': 'sector', 'NOMBRE': 'NOMBRE', 'CÓDIGO': 'CÓDIGO', 'ÁREA': 'ÁREA', 'ATU': 'ATU', 'ID': 'ID', 'CLASIFICAC': 'CLASIFICAC', '%OCUP_VERD': '%OCUP_VERD', '%OCUP_GRIS': '%OCUP_GRIS', 'ATU DETALL': 'ATU DETALL', 'AREA VERDE': 'AREA VERDE', 'CO_ARBOREA': 'CO_ARBOREA', 'O_GRIS_MAX': 'O_GRIS_MAX', 'SOPORTE': 'SOPORTE', 'RECREATIVO': 'RECREATIVO', 'COMERCIAL': 'COMERCIAL', 'OTR_USOS': 'OTR_USOS', 'ÍNDIC_OCU': 'ÍNDIC_OCU', 'HT_MAX(m2)': 'HT_MAX(m2)', 'ALT_MAX(m)': 'ALT_MAX(m)', });
lyr_ParquesOfcopiar_3.set('fieldAliases', {'sector': 'sector', 'NOMBRE': 'NOMBRE', 'CÓDIGO': 'CÓDIGO', 'ÁREA': 'ÁREA', 'ATU': 'ATU', 'ID': 'ID', 'CLASIFICAC': 'CLASIFICAC', '%OCUP_VERD': '%OCUP_VERD', '%OCUP_GRIS': '%OCUP_GRIS', 'ATU DETALL': 'ATU DETALL', 'AREA VERDE': 'AREA VERDE', 'CO_ARBOREA': 'CO_ARBOREA', 'O_GRIS_MAX': 'O_GRIS_MAX', 'SOPORTE': 'SOPORTE', 'RECREATIVO': 'RECREATIVO', 'COMERCIAL': 'COMERCIAL', 'OTR_USOS': 'OTR_USOS', 'ÍNDIC_OCU': 'ÍNDIC_OCU', 'HT_MAX(m2)': 'HT_MAX(m2)', 'ALT_MAX(m)': 'ALT_MAX(m)', });
lyr_red_vial_4.set('fieldAliases', {'TIPOVIA': 'TIPOVIA', 'COMPETENCI': 'COMPETENCI', 'NOMBRE_FIN': 'NOMBRE_FIN', 'SUBCLASIFI': 'SUBCLASIFI', 'ID': 'ID', 'CATEGORÍA': 'CATEGORÍA', 'CLASIFIC': 'CLASIFIC', 'CÓDIGO AN': 'CÓDIGO AN', 'TRAMO': 'TRAMO', 'CÓDIGO': 'CÓDIGO', 'ANCHO': 'ANCHO', 'LINK': 'LINK', 'FRANJAS': 'FRANJAS', 'COMPA_USO': 'COMPA_USO', });
lyr_lotes_0.set('fieldImages', {'CUC': 'TextEdit', 'Sector': 'TextEdit', 'COD_LOTE': 'TextEdit', 'subsectore': 'TextEdit', 'periodo': 'TextEdit', 'M2_CONSTRU': 'TextEdit', 'AREA_M2': '', 'ID': '', });
lyr_reastechadas_1.set('fieldImages', {'FID': 'TextEdit', });
lyr_ParquesOf_2.set('fieldImages', {'sector': 'TextEdit', 'NOMBRE': 'TextEdit', 'CÓDIGO': 'TextEdit', 'ÁREA': 'TextEdit', 'ATU': 'TextEdit', 'ID': 'TextEdit', 'CLASIFICAC': 'TextEdit', '%OCUP_VERD': 'TextEdit', '%OCUP_GRIS': 'TextEdit', 'ATU DETALL': 'TextEdit', 'AREA VERDE': 'TextEdit', 'CO_ARBOREA': 'TextEdit', 'O_GRIS_MAX': 'TextEdit', 'SOPORTE': 'TextEdit', 'RECREATIVO': 'TextEdit', 'COMERCIAL': 'TextEdit', 'OTR_USOS': 'TextEdit', 'ÍNDIC_OCU': 'TextEdit', 'HT_MAX(m2)': 'TextEdit', 'ALT_MAX(m)': 'TextEdit', });
lyr_ParquesOfcopiar_3.set('fieldImages', {'sector': 'TextEdit', 'NOMBRE': 'TextEdit', 'CÓDIGO': 'TextEdit', 'ÁREA': 'TextEdit', 'ATU': 'TextEdit', 'ID': 'TextEdit', 'CLASIFICAC': 'TextEdit', '%OCUP_VERD': 'TextEdit', '%OCUP_GRIS': 'TextEdit', 'ATU DETALL': 'TextEdit', 'AREA VERDE': '', 'CO_ARBOREA': '', 'O_GRIS_MAX': '', 'SOPORTE': '', 'RECREATIVO': '', 'COMERCIAL': '', 'OTR_USOS': '', 'ÍNDIC_OCU': '', 'HT_MAX(m2)': '', 'ALT_MAX(m)': '', });
lyr_red_vial_4.set('fieldImages', {'TIPOVIA': 'TextEdit', 'COMPETENCI': 'TextEdit', 'NOMBRE_FIN': 'TextEdit', 'SUBCLASIFI': 'UniqueValues', 'ID': 'TextEdit', 'CATEGORÍA': 'TextEdit', 'CLASIFIC': 'TextEdit', 'CÓDIGO AN': 'TextEdit', 'TRAMO': 'TextEdit', 'CÓDIGO': 'TextEdit', 'ANCHO': 'TextEdit', 'LINK': 'TextEdit', 'FRANJAS': 'TextEdit', 'COMPA_USO': 'CheckBox', });
lyr_lotes_0.set('fieldLabels', {'CUC': 'no label', 'Sector': 'no label', 'COD_LOTE': 'no label', 'subsectore': 'no label', 'periodo': 'no label', 'M2_CONSTRU': 'no label', 'AREA_M2': 'no label', 'ID': 'no label', });
lyr_reastechadas_1.set('fieldLabels', {'FID': 'no label', });
lyr_ParquesOf_2.set('fieldLabels', {'sector': 'no label', 'NOMBRE': 'no label', 'CÓDIGO': 'no label', 'ÁREA': 'no label', 'ATU': 'no label', 'ID': 'no label', 'CLASIFICAC': 'no label', '%OCUP_VERD': 'no label', '%OCUP_GRIS': 'no label', 'ATU DETALL': 'no label', 'AREA VERDE': 'no label', 'CO_ARBOREA': 'no label', 'O_GRIS_MAX': 'no label', 'SOPORTE': 'no label', 'RECREATIVO': 'no label', 'COMERCIAL': 'no label', 'OTR_USOS': 'no label', 'ÍNDIC_OCU': 'no label', 'HT_MAX(m2)': 'no label', 'ALT_MAX(m)': 'no label', });
lyr_ParquesOfcopiar_3.set('fieldLabels', {'sector': 'no label', 'NOMBRE': 'no label', 'CÓDIGO': 'header label - visible with data', 'ÁREA': 'no label', 'ATU': 'no label', 'ID': 'no label', 'CLASIFICAC': 'no label', '%OCUP_VERD': 'no label', '%OCUP_GRIS': 'no label', 'ATU DETALL': 'no label', 'AREA VERDE': 'no label', 'CO_ARBOREA': 'no label', 'O_GRIS_MAX': 'no label', 'SOPORTE': 'no label', 'RECREATIVO': 'no label', 'COMERCIAL': 'no label', 'OTR_USOS': 'no label', 'ÍNDIC_OCU': 'no label', 'HT_MAX(m2)': 'no label', 'ALT_MAX(m)': 'no label', });
lyr_red_vial_4.set('fieldLabels', {'TIPOVIA': 'no label', 'COMPETENCI': 'no label', 'NOMBRE_FIN': 'no label', 'SUBCLASIFI': 'no label', 'ID': 'no label', 'CATEGORÍA': 'no label', 'CLASIFIC': 'no label', 'CÓDIGO AN': 'no label', 'TRAMO': 'no label', 'CÓDIGO': 'no label', 'ANCHO': 'no label', 'LINK': 'no label', 'FRANJAS': 'no label', 'COMPA_USO': 'no label', });
lyr_red_vial_4.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});