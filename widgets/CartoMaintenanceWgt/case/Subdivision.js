define(["./UtilityCase"], function (UtilityCase) {
    /*
    * @description: Objeto que contiene las funciones para la subdivisión de lotes
    */
    var SubDivision = {
        codRequests: null, // @params: Código de la solicitud
        // currentLots: null, // @param: Lotes actuales a modificar
        currentLotsRows: null, // @calculate []: Features de los lotes actuales
        currentUbicacionRows: null, // @calculate: Features de los puntos de los lotes actuales
        currentLandsRows: null, // @calculate: Features de los predios actuales
        landsRegisterByRequests: null, // @param: Predios registrados por solicitud
        // newubicaciones: null, // @param: nuevos puntos lote
        newUbicacionGraphics: null, // @params: nuevos puntos lote como graficos
        newLandsGraphics: null, // @params: nuevos predios como graficos
        attributes: null, // @param: 
        ubicacionUrl: null, // @param
        // landUrl: null, // @param
        lotUrl: null, // @param
        arancelUrl: null, // @param
        blockUrl: null, // @param
        lotGraphic: null, // @param
        cadastralBlockUrl: null, // @param
        ubigeo: null, // @param
        user: null, // @param
        // geometryLand: null, // @param []: coodernadas x,y de los predios resultantes
        config: null, // @param

        lands: null, // @calculate
        ubicaciones: [], // @calculate array
        lots: null, // @calculate
        // block: null, // @calculate
        // LandCls: new UtilityCase.Land(),
        // LotCls: new UtilityCase.Lot(),
        // PointLotCls: new UtilityCase.PointLot(),
        caseRequest: null, // @param
        queryBlock: null, // @param
        queryLots: null, // @param
        domains: null, // @param

        executeSubdivision: function executeSubdivision() {
            var _this = this;

            return UtilityCase.checkResolutionDocument(this.ubigeo, this.newLandsGraphics, this.config.checkResolutionDocument, this.config.ntk, exceptLands = this.landsRegisterByRequests).then(function () {
                return UtilityCase.getBlockFromLot(_this.currentLotsRows[0].geometry, _this.blockUrl);
            }).then(function (block) {
                return UtilityCase.checkExistLotUrban(_this.attributes, block, _this.lotUrl, _this.currentLotsRows, _this.ubigeo, checkSublotUrban = true);
            }).then(function (block) {
                return UtilityCase.checkExistLotUrbanIntoLotsOriginal(_this.attributes, _this.currentLotsRows, block, checkSublotUrban = true);
            }).then(function (block) {
                return UtilityCase.translateFieldsBlockToLot(_this.lotUrl, block, _this.lotGraphic);
            }).then(function (lots) {
                // const tipLot = UtilityCase.calculateTipLot(this.currentLotsRows);
                return UtilityCase.calculateFieldsOfLot(_this.lotUrl, lots, _this.ubigeo, _this.codRequests, _this.user, _this.attributes
                // tipLot
                );
            }).then(function (lots) {
                _this.lots = lots;
                return UtilityCase.translateFieldsLotToUbicacion(lots, _this.ubicacionUrl, _this.newUbicacionGraphics);
            }).then(function (ubicaciones) {
                return UtilityCase.translateFieldsArancelToUbicacion(ubicaciones, _this.arancelUrl);
            }).then(function (ubicaciones) {
                return UtilityCase.calculateFieldsOfUbicacion(_this.ubicacionUrl, _this.ubigeo, ubicaciones);
            }).then(function (ubicaciones) {
                _this.ubicaciones = ubicaciones;
                return UtilityCase.translateFieldsUbicacionToLand(ubicaciones, _this.newLandsGraphics, _this.domains);
            }).then(function (lands) {
                return UtilityCase.calculateIdMznC(lands, _this.cadastralBlockUrl, _this.ubigeo);
            })
            // .then(lands => UtilityCase.calculateIdPred(lands, this.landUrl, this.ubigeo))
            .then(function (lands) {
                _this.lands = lands;
                console.log('lands subdivison', lands);
                return UtilityCase.getDataOrigin(_this.ubicacionUrl, _this.currentLotsRows[0], _this.queryLots);
            }).then(function (results) {
                _this.currentUbicacionRows = results[0].features;
                // this.currentLandsRows = results[1].features;
                // this.idLandInactive = results[1].features.map(i => i.attributes.COD_CPU)
                return UtilityCase.sendDataOriginToHistoric(_this.config, _this.currentLotsRows, _this.currentUbicacionRows);
            }).then(function (results) {
                return UtilityCase.deleteDataOrigin(_this.currentLotsRows, _this.currentUbicacionRows, _this.config);
            }).then(function (results) {
                return UtilityCase.addDataNew(_this.lots, _this.ubicaciones, _this.config);
            }).then(function (results) {
                return UtilityCase.updateStatusRequests(_this.lands, _this.codRequests, _this.caseRequest, _this.ubigeo, _this.config, idLandInactive = _this.idLandInactive);
            }).catch(function (err) {
                throw err;
            });
        }
    };
    return SubDivision;
});
//# sourceMappingURL=Subdivision.js.map
