define(["./UtilityCase"], function (UtilityCase) {
    /*
    * @description: Objeto que contiene las funciones para la inactivacion de lotes
    */
    var Deactivate = {
        nameCase: 'Inactivar',
        codRequest: null, // @params: Código de la solicitud
        caseRequest: null, // @params
        user: null, // @params
        ubigeo: null, // @params
        config: null, // @calculate
        // pointLotUrl: null, // @param
        landUrl: null, // @param
        cpu: null, // @param
        // currentLotsRows: null, //@param
        currentLandsRows: null,
        currentLotsRows: null,

        executeDeactivate: function executeDeactivate() {
            var self = this;
            return UtilityCase.getLandsOriginByQuery(self.landUrl, self.cpu).then(function (results) {
                self.currentLandsRows = results.features;
                return UtilityCase.sendDataOriginToHistoric(self.config, null, null, self.currentLandsRows);
            }).then(function (results) {
                self.currentLandsRows = UtilityCase.updateRowsGeneric(self.currentLandsRows, self.codRequest, self.user);
                return UtilityCase.updateDataDeactivate(self.currentLandsRows, self.config);
            }).then(function (results) {
                return UtilityCase.checkLandsWithinLot(self.currentLotsRows[0], self.landUrl);
            }).then(function (results) {
                var lot = new UtilityCase.Lot();
                self.currentLotsRows[0].attributes[lot.estadoIns] = results;
                return UtilityCase.updateDataLotsDeactivate(self.currentLotsRows, self.config);
            }).then(function (results) {
                return UtilityCase.updateStatusRequests(self.currentLandsRows, self.codRequest, self.caseRequest, self.ubigeo, self.config);
            }).catch(function (err) {
                throw err;
            });
        }
    };
    return Deactivate;
});
//# sourceMappingURL=Deactivate.js.map
