define(['esri/toolbars/draw', 'esri/graphic', 'esri/symbols/CartographicLineSymbol', 'esri/Color', 'esri/SnappingManager', 'esri/layers/FeatureLayer', 'esri/geometry/webMercatorUtils', 'esri/symbols/Font', 'esri/geometry/Point', 'esri/symbols/TextSymbol', 'https://unpkg.com/@turf/turf@6/turf.min.js'], function (Draw, Graphic, CartographicLineSymbol, Color, SnappingManager, FeatureLayer, webMercatorUtils, Font, Point, TextSymbol, turf)
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
        lotFeatureLayer: null, // @params
        anotherToolbar: null, // @params

        // @const
        lineSymbol: null,
        statusDraw: false,
        currentDistance: 0,
        currentCoordinates: [],
        landsFeature: null,

        initToolDraw: function initToolDraw() {
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

            // this.landsFeature = new FeatureLayer(this.lotUrl, {
            //     mode: FeatureLayer.MODE_ONDEMAND,
            //     outFields: ["*"]
            // });
        },
        addGraphic: function addGraphic(evt) {
            this.toolbarDraw.deactivate();
            var graphic = new Graphic(evt.geometry, this.lineSymbol);
            this.map.graphics.add(graphic);
            this.addLabelToCenterLine(evt.geometry, this.currentDistance);
            this.map.enableMapNavigation();
            this.map.setInfoWindowOnClick(true);
            this.statusDraw = false;
            // disable snapping
            // this.map.disableSnapping();
        },
        activateToolDraw: function activateToolDraw(evt) {
            var snapManager = this.map.enableSnapping();
            // this.map.enableSnapping();
            // snapManager.alwaysSnap = true;

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
        addRowToTable: function addRowToTable() {},
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
        addLabelToCenterLine: function addLabelToCenterLine(geometry, distance) {
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
            var graphicLabel = new Graphic(pointLabel, txtSym, { id: 'asdasd' });
            this.map.graphics.add(graphicLabel);
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
        }

        // stringToObjectHtml(htmlString) {
        //     // const htmlObject = dojo.create('div', { innerHTML: htmlString });
        //     // return htmlObject;
        // },
        // renderTableMatrixLand() {
        //     const renderString = `<div class="ctnParamsCm">
        //                 <div class="lblParamCm">
        //                     <span class="alignVCenter">
        //                         Predio matriz
        //                     </span>
        //                 </div>
        //             </div>
        //             <div class="ctnParamsCm ctnTablesClsCm">
        //                 <table class="tableClsCm">
        //                     <thead>
        //                         <tr>
        //                             <th class="center-aligned">Nro</th>
        //                             <th>Cod. Predio<br>Municipal</th>
        //                             <th>Dirección</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         <tr data-id=${this.matrixLand[0].cpm}>
        //                             <td>1</td>
        //                             <td>${this.matrixLand[0].cpm}</td>
        //                             <td>${this.matrixLand[0].address}</td>
        //                         </tr>
        //                     </tbody>
        //                 </table>
        //             </div>`;
        //     return this.stringToObjectHtml(renderString);
        // },

    };
    return ToolDraw;
});
//# sourceMappingURL=ToolDraw.js.map
