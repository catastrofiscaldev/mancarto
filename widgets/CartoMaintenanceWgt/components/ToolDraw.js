define(['esri/toolbars/draw', 'esri/graphic', 'esri/symbols/CartographicLineSymbol', 'esri/Color', 'esri/SnappingManager', 'esri/layers/FeatureLayer', 'esri/geometry/webMercatorUtils', 'esri/symbols/Font', 'esri/geometry/Point', 'esri/geometry/Polyline', 'esri/symbols/TextSymbol', 'https://unpkg.com/@turf/turf@6/turf.min.js'], function (Draw, Graphic, CartographicLineSymbol, Color, SnappingManager, FeatureLayer, webMercatorUtils, Font, Point, Polyline, TextSymbol, turf)
// getLength,
{
    /*
    * @description: Objeto que contiene los componentes para la herramienta de dibujo
    */
    var ToolDraw = {
        // @params
        toolbarDraw: null, // @params
        map: null, // @params
        controlMeasurementRealTime: null, // @params
        controlMeasurementTable: null, // @params
        lotFeatureLayer: null, // @params
        anotherToolbar: null, // @params
        linearDivision: null, // @params
        callbackAddLineDivision: null, // @params

        // @const
        lineSymbol: null,
        statusDraw: false,
        currentDistance: 0,
        currentCoordinates: [],
        landsFeature: null,
        controllerId: 0,
        measurements: {},

        initToolDraw: function initToolDraw() {
            var _this = this;

            this.toolbarDraw = new Draw(this.map);
            this.toolbarDraw.on('draw-end', this.addGraphic.bind(this));
            this.lineSymbol = new CartographicLineSymbol(CartographicLineSymbol.STYLE_SHORTDASH, new Color([40, 40, 40, 1]), 3);
            this.lineSymbol.setMarker({
                style: 'arrow',
                placement: 'begin-end',
                size: 1
            });

            this.map.on('click', this.clickIntoMap.bind(this));
            this.map.on('mouse-move', this.moveMouseMap.bind(this));
            this.map.on('key-up', function (evt) {
                if (evt.key === 'Escape' && _this.statusDraw) {
                    _this.currentCoordinates = [];
                    _this.currentDistance = 0.00;
                }
            });

            // document.addEventListener('keyup', (evt) => {
            //     if (evt.key === 'Escape' && this.statusDraw) {
            //         this.currentCoordinates = [];
            //         this.currentDistance = 0.00;
            //     }
            // });

            // this.landsFeature = new FeatureLayer(this.lotUrl, {
            //     mode: FeatureLayer.MODE_ONDEMAND,
            //     outFields: ["*"]
            // });
        },
        getUUID: function getUUID() {
            var uuid = crypto.randomUUID();
            uuid = 'a' + uuid.replace('-', '');
            return uuid;
        },
        addGraphic: function addGraphic(evt) {
            this.toolbarDraw.deactivate();
            this.controllerId = this.controllerId + 1;
            var idPolylineGraphic = this.getUUID();
            var idLabelGraphic = this.getUUID();
            var graphic = new Graphic(evt.geometry, this.lineSymbol, { id: idPolylineGraphic });
            this.map.graphics.add(graphic);
            this.addLabelToCenterLine(evt.geometry, this.currentDistance, idLabelGraphic);
            this.measurements[idPolylineGraphic] = {
                distance: this.currentDistance.toFixed(2),
                // geometry: evt.geometry,
                // extent: evt.geometry.getExtent(),
                idLabel: idLabelGraphic
            };
            this.addRowToTable(this.measurements[idPolylineGraphic], idPolylineGraphic);
            this.map.enableMapNavigation();
            this.map.setInfoWindowOnClick(true);
            this.statusDraw = false;
            // disable snapping
            // this.map.disableSnapping();
        },
        activateToolDraw: function activateToolDraw(evt) {
            this.anotherToolbar.deactivate();
            var snapManager = this.map.enableSnapping();
            // this.map.enableSnapping();
            snapManager.alwaysSnap = true;

            var layerInfos = [{
                layer: this.lotFeatureLayer
            }];
            snapManager.setLayerInfos(layerInfos);

            this.map.disableMapNavigation();
            this.map.setInfoWindowOnClick(false);
            this.statusDraw = true;
            this.currentCoordinates = [];
            this.toolbarDraw.activate('polyline');
        },
        deactivateToolbarAnotherToolbar: function deactivateToolbarAnotherToolbar() {
            this.toolbarDraw.deactivate();
            this.map.enableMapNavigation();
            this.map.setInfoWindowOnClick(true);
            this.statusDraw = false;
            this.currentDistance = 0.00;
            this.controlMeasurementRealTime.innerHTML = this.currentDistance.toFixed(2);
        },
        addRowToTable: function addRowToTable(measurementItem, id) {
            var _this2 = this;

            // console.log(measurementItem);
            var row = '\n                <tr data-idPolyline=' + id + '>\n                    <td class="center-aligned" contenteditable="true" >\n                        ' + measurementItem.distance + '\n                    </td>\n                    <td class="center-aligned">\n                        <i class="fas fa-route"></i>\n                    </td>\n                    <td class="center-aligned">\n                        <span><i class="fas fa-search"></i></span>\n                    </td>\n                    <td class="center-aligned">\n                        <span style="color: #FF5722;"><i class="far fa-trash-alt"></i></span>\n                    </td>\n                </tr>\n            ';

            // const table = this.controlMeasurementTable.querySelector('tbody');

            // add function to clic delete row in last column
            this.controlMeasurementTable.insertAdjacentHTML('beforeend', row);
            var deleteRow = this.controlMeasurementTable.querySelector('tr[data-idPolyline="' + id + '"] td:last-child');
            var zoomToGraphic = this.controlMeasurementTable.querySelector('tr[data-idPolyline="' + id + '"] td:nth-child(3)');
            var editDistance = this.controlMeasurementTable.querySelector('tr[data-idPolyline="' + id + '"] td:first-child');
            // add listener when click checkbox
            var convertDivisionLine = this.controlMeasurementTable.querySelector('tr[data-idPolyline="' + id + '"] td:nth-child(2)');

            deleteRow.addEventListener('click', this.deleteRowTable.bind(this));
            zoomToGraphic.addEventListener('click', this.zoomToGraphic.bind(this));
            // add listener when press enter in cell
            editDistance.addEventListener('keydown', function (evt) {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    _this2.editDistance(evt);
                }
            });
            editDistance.addEventListener('input', this.validateNumericInput);
            convertDivisionLine.addEventListener('click', this.parseToLineDivision.bind(this));
        },
        validateNumericInput: function validateNumericInput(evt) {
            var value = evt.target.innerText;
            var regex = /^[0-9]*\.?[0-9]*$/; // Permite números y un punto decimal

            if (!regex.test(value)) {
                evt.target.innerText = value.slice(0, -1); // Elimina el último carácter si no es válido
            }
        },
        deleteRowTable: function deleteRowTable(evt) {
            var graphic = this.getGraphicById(evt.currentTarget.parentElement.dataset.idpolyline);
            this.map.graphics.remove(graphic);
            var idLabel = this.measurements[evt.currentTarget.parentElement.dataset.idpolyline].idLabel;
            var graphicLabel = this.getGraphicById(idLabel);
            this.map.graphics.remove(graphicLabel);
            evt.currentTarget.parentElement.remove();
        },
        zoomToGraphic: function zoomToGraphic(evt) {
            var graphic = this.getGraphicById(evt.currentTarget.parentElement.dataset.idpolyline);
            this.map.setExtent(graphic.geometry.getExtent());
        },
        editDistance: function editDistance(evt) {
            var idPolyline = evt.currentTarget.parentElement.dataset.idpolyline;
            var newDistance = parseFloat(evt.currentTarget.textContent);
            var idLabel = this.measurements[idPolyline].idLabel;
            var polyline = this.getGraphicById(idPolyline).geometry;
            var distance = parseFloat(this.measurements[idPolyline].distance);
            var newGeometry = this.updatePolylineLength(newDistance, distance, polyline);
            if (!newGeometry) {
                return;
            }

            this.map.graphics.graphics.forEach(function (graphic) {
                if (graphic.attributes && graphic.attributes.id === idPolyline) {
                    graphic.setGeometry(newGeometry);
                }
            });

            this.measurements[idPolyline].distance = newDistance.toFixed(2);
            var graphicLabel = this.getGraphicById(idLabel);
            this.map.graphics.remove(graphicLabel);
            this.addLabelToCenterLine(newGeometry, newDistance, idLabel);
        },
        parseToLineDivision: function parseToLineDivision(evt) {
            var idPolyline = evt.currentTarget.parentElement.dataset.idpolyline;
            var graphic = this.getGraphicById(idPolyline);
            this.callbackAddLineDivision(graphic.geometry);
            this.deleteRowTable(evt);
            // if (evt.currentTarget.checked) {
            //     const graphic = this.getGraphicById(id);
            //     this.callbackAddLineDivision(graphic.geometry);
            //     // this.linearDivision.add(graphic);
            //     // this.map.addLayer(this.linearDivision);
            // } else {
            //     const graphic = this.getGraphicById(id);

            //     this.linearDivision.remove(graphic);
            // }
        },
        getGraphicById: function getGraphicById(id) {
            var graphic = this.map.graphics.graphics.filter(function (graphic) {
                if (graphic.attributes && graphic.attributes.id === id) {
                    return graphic;
                }
            });
            if (graphic.length === 0) {
                return null;
            }
            return graphic[0];
        },
        getDistance: function getDistance(arrayPoints) {
            var totalDistance = 0;
            if (arrayPoints.length < 2) {
                return totalDistance;
            }
            for (var i = 0; i < arrayPoints.length - 1; i++) {
                var distance = esri.geometry.getLength(arrayPoints[i], arrayPoints[i + 1]);
                totalDistance += distance;
            }
            return totalDistance;
        },
        clickIntoMap: function clickIntoMap(evt) {
            if (this.statusDraw) {
                this.currentCoordinates.push(evt.mapPoint);
            }
        },
        moveMouseMap: function moveMouseMap(evt) {
            if (this.statusDraw) {
                if (this.currentCoordinates.length > 0) {
                    this.currentDistance = esri.geometry.getLength(this.currentCoordinates[this.currentCoordinates.length - 1], evt.mapPoint) + this.getDistance(this.currentCoordinates);
                    this.controlMeasurementRealTime.innerHTML = this.currentDistance.toFixed(2);
                }
            }
        },
        addLabelToCenterLine: function addLabelToCenterLine(geometry, distance, idLabelGraphic) {
            var midPoint = this.findMidPoint(geometry, distance);
            var xMidPoint = midPoint.geometry.coordinates[0];
            var yMidPoint = midPoint.geometry.coordinates[1];
            var pointLabel = new Point({
                x: xMidPoint,
                y: yMidPoint,
                spatialReference: { wkid: 4326 }
            });

            var font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
            var txtSym = new TextSymbol(distance.toFixed(2), font, new Color([87, 88, 90, 1]));
            txtSym.setOffset(0, 0).setAlign(TextSymbol.DECORATION_OVERLINE);
            // //align vertical center
            txtSym.setVerticalAlignment("middle");
            txtSym.setHaloColor(new Color([255, 255, 255]));
            txtSym.setHaloSize(4);

            // console.log(geometry, midPoint.geometry.coordinates)
            var angle = this.getAngleByLabel(pointLabel, geometry);
            // // rotate text symbol
            txtSym.setAngle(angle);
            var graphicLabel = new Graphic(pointLabel, txtSym, { id: idLabelGraphic });
            this.map.graphics.add(graphicLabel);
            // return idLabelGraphic;
        },
        findMidPoint: function findMidPoint(polyline, distance) {
            var polylineGeomUtm = webMercatorUtils.webMercatorToGeographic(polyline);
            var line = turf.lineString(polylineGeomUtm.paths[0]);
            var options = { units: 'meters' };
            var along = turf.along(line, distance / 2, options);
            return along;
        },
        getAngleByLabel: function getAngleByLabel(centerPoint, polyline) {
            var polylineGeomUtm = webMercatorUtils.webMercatorToGeographic(polyline);
            var startPoint = polylineGeomUtm.paths[0][0];
            var startPointTurf = turf.point([startPoint[0], startPoint[1]]);
            var centerPointTurf = turf.point([centerPoint.x, centerPoint.y]);
            var slice = turf.lineSlice(startPointTurf, centerPointTurf, turf.lineString(polylineGeomUtm.paths[0]));
            var points = slice.geometry.coordinates.slice(-2);
            var angle = turf.bearing(turf.point(points[0]), turf.point(points[1]));
            angle = angle < 0 ? 180 + angle : angle;
            return angle - 90;
        },
        updatePolylineLength: function updatePolylineLength(newDistamce, distance, polyline) {
            var polylineGeomUtm = webMercatorUtils.webMercatorToGeographic(polyline);
            var vertices = polylineGeomUtm.paths[0];
            if (newDistamce === 0) {
                return false;
            } else if (newDistamce < distance) {
                var line = turf.lineString(vertices);
                var options = { units: 'meters' };
                var sliced = turf.lineSliceAlong(line, 0, newDistamce, options);
                vertices = sliced.geometry.coordinates;
            } else if (newDistamce > distance) {
                var lastTwoCoords = vertices.slice(-2);
                var _line = turf.lineString(lastTwoCoords);
                var bearing = turf.bearing(turf.point(_line.geometry.coordinates[0]), turf.point(_line.geometry.coordinates[1]));
                var _options = { units: 'meters' };
                var addDistance = newDistamce - distance;
                var point = turf.point(_line.geometry.coordinates[1]);
                var destintation = turf.destination(point, addDistance, bearing, _options);
                vertices[vertices.length - 1] = destintation.geometry.coordinates;
            }

            // console.log(vertices);
            // map.graphics.clear();

            polyline = new Polyline({
                paths: [vertices],
                spatialReference: polylineGeomUtm.spatialReference
            });

            var response = webMercatorUtils.geographicToWebMercator(polyline);
            return response;
            // map.graphics.add(new Graphic(a, lineSymbol));
            // distance = newDistamce;
            // addLabelToCenter(a, distance);
            // window.polyline = a;
            // return vertices;
        },
        removeAllGraphicsIntoMeasurements: function removeAllGraphicsIntoMeasurements() {
            this.controlMeasurementTable.innerHTML = '';
            // iterame this.measurements and delete all graphics by id
            for (var key in this.measurements) {
                var graphic = this.getGraphicById(key);
                this.map.graphics.remove(graphic);
                var idLabel = this.measurements[key].idLabel;
                var graphicLabel = this.getGraphicById(idLabel);
                this.map.graphics.remove(graphicLabel);
            }
            this.measurements = {};

            this.controlMeasurementRealTime.innerHTML = '0.00';
        }
    };
    return ToolDraw;
});
//# sourceMappingURL=ToolDraw.js.map
