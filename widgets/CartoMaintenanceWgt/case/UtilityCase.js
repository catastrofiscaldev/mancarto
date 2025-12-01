function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(["dojo/Deferred", "esri/tasks/QueryTask", "esri/tasks/query", "esri/tasks/StatisticDefinition", "esri/geometry/geometryEngine", "esri/geometry/Point", "jimu/dijit/Message", "dojo/promise/all", "esri/request", "./CustomException"], function (Deferred, QueryTask, Query, StatisticDefinition, geometryEngine, Point, Message, all, esriRequest, CustomException) {
    /*
    * @description: Objeto que contiene las funciones para la subdivisión de lotes
    */

    // class ErrorEqualUrbanLotWithinBlock extends Error {
    //     constructor(message) {
    //         super(message);
    //     }
    // }

    var UtilityCase = {

        ubigeoFieldName: 'UBIGEO',
        platformUpdate: 'PCF',
        estadoInsValue: 1,
        estadoValue: 1,
        codUiValue: 1,
        estadoPartidaValue: 0,
        tipoResolucionValue: "1",
        enCartografiaValue: 1,
        ntk: null,

        Land: function Land() {
            this.ubigeo = 'UBIGEO';
            this.codPre = 'COD_PRE';
            // this.codUi = 'COD_UI';
            // this.estado = 'ESTADO';
            this.coordX = 'COORD_X';
            this.coordY = 'COORD_Y';
            // this.codVer = 'COD_VER';
            // this.codCpu = 'COD_CPU';
            this.dirMun = 'DIR_MUN';
            this.dirUrb = 'DIR_URB';
            this.ranCpu = 'RAN_CPU';
            this.tipUu = 'TIPO_UU';
            this.nomUu = 'NOM_UU';
            this.tipVia = 'TIP_VIA';
            this.nomVia = 'NOM_VIA';
            this.numMun = 'NUM_MUN';
            this.idMznC = 'ID_MZN_C';
            this.mznUrb = 'MZN_URB';
            this.lotUrb = 'LOT_URB';
            this.subLote = 'SUB_LOTE';
            // this.idPred = 'ID_PRED';
            this.tipPred = 'TIP_PRED';
            // this.partida = 'PARTIDA';
            this.resolutionType = 'resolutionType';
            this.resolutionDocument = 'resolutionDocument';
            // this.estadoPartida = 'ESTADO_PARTIDA';
            this.piso = 'PISO';
            // this.subLote = 'SUB_LOTE';
            this.numEdificacion = 'NUM_EDIFICACION';
            this.numInterior = 'NUM_INTERIOR';
            this.tipEdificacion = 'TIP_EDIFICACION';
            this.tipInterior = 'TIP_INTERIOR';
        },
        Ubicacion: function Ubicacion() {
            this.ubigeo = 'UBIGEO';
            this.idUbicacion = 'ID_UBICACION';
            this.secuen = 'SECUEN';
            this.coordX = 'COORD_X';
            this.coordY = 'COORD_Y';
            this.zonaUtm = 'ZONA_UTM';
            this.estadoIns = 'ESTADO_INS';
            this.tipLot = 'TIP_LOT';
            this.tipDireccion = 'TIP_DIRECCION';
            this.enCartografia = 'EN_CARTOGRAFIA';
        },
        Lot: function Lot() {
            this.idLotP = 'ID_LOTE_P';
            this.ranCpu = 'RAN_CPU';
            this.anoCart = 'ANO_CART';
            this.fuente = 'FUENTE';
            this.nomPc = 'NOM_PC';
            this.nomUser = 'NOM_USER';
            this.codLot = 'COD_LOTE';
            this.lotUrb = 'LOT_URB';
            this.ubigeo = 'UBIGEO';
            this.tipLot = 'TIP_LOT';
            this.estadoIns = 'ESTADO_INS';
            this.subLote = 'SUB_LOTE';
            // this.numEdificacion = 'NUM_EDIFICACION';
            // this.numInterior = 'NUM_INTERIOR';
            // this.tipEdificacion = 'TIP_EDIFICACION';
            // this.tipInterior = 'TIP_INTERIOR';
        },
        Arancel: function Arancel() {
            this.secEjec = 'SEC_EJEC';
            this.idSvia = 'ID_SVIA';
            this.ubigeo = 'UBIGEO';
            this.fMzn = 'F_MZN';
        },
        receptionModelRequest: function receptionModelRequest() {
            return ["COD_PRE",
            // "COD_CPU",
            "COD_SECT", "COD_MZN", "COD_LOTE", "COD_UU", "COD_VIA", "TIPO_UU", "NOM_UU", "NOM_REF", "MZN_URB", "LOT_URB", "TIP_VIA", "NOM_VIA", "CUADRA", "LADO", "DIR_MUN", "DIR_URB", "COORD_X", "COORD_Y", "RAN_CPU", "ID_UBICACION",
            // "COD_UI",
            // "COD_VER",
            // "ID_LOTE_P",
            "ID", "NUM_EDIFICACION", "NUM_INTERIOR", "TIP_EDIFICACION", "TIP_INTERIOR", "SUB_LOTE", "ID_ARANC", "VAL_ACT", "ID_MZN_C", "resolutionType", "resolutionDocument", 'id_lote_puerta', 'longitude_puerta', 'latitude_puerta', 'lote_urbano_puerta', 'manzana_urbana_puerta'];
        },
        matchWithReceptionModel: function matchWithReceptionModel(object) {
            var modelRequests = this.receptionModelRequest();
            var response = object.map(function (land) {
                var arrayMatch = {};
                modelRequests.forEach(function (field) {
                    arrayMatch[field] = land.attributes[field];
                });
                return arrayMatch;
            });
            return response;
        },
        getFeatureSchema: function getFeatureSchema(url) {
            var geometry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var blankFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var deferred = new Deferred();
            var queryTask = new QueryTask(url);
            var query = new Query();
            query.where = "1=1";
            query.returnGeometry = geometry;
            query.outFields = ["*"];
            query.num = 1;
            queryTask.execute(query).then(function (result) {
                var feature = result.features[0];
                if (blankFields) {
                    for (var prop in feature.attributes) {
                        feature.attributes[prop] = null;
                    }
                }
                return deferred.resolve(feature);
            }).catch(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        },
        getFeatureSchemaLand: function getFeatureSchemaLand() {
            var response = {
                "geometry": {
                    "x": 0.0,
                    "y": 0.0,
                    "spatialReference": {
                        "wkid": 4326,
                        "latestWkid": 4326
                    }
                },
                "symbol": null,
                "attributes": {
                    // "ID_PRED": null,
                    "ID_UBICACION": null,
                    "ID_LOTE_P": null,
                    // "ZONA_UTM": null,
                    "UBIGEO": null,
                    // "SEC_EJEC": null,
                    "COD_PRE": null,
                    // "COD_CPU": null,
                    "ID_ARANC": null,
                    // "ID_LOTE": null,
                    "COD_SECT": null,
                    "COD_MZN": null,
                    "COD_LOTE": null,
                    "COD_UU": null,
                    "TIPO_UU": null,
                    "NOM_UU": null,
                    "NOM_REF": null,
                    "MZN_URB": null,
                    "LOT_URB": null,
                    "TIP_VIA": null,
                    "NOM_VIA": null,
                    "NOM_ALT": null,
                    "NUM_MUN": null,
                    "NUM_ALT": null,
                    "BLOCK": null,
                    "NUM_DEP": null,
                    "INTERIOR": null,
                    "KM": null,
                    "REFEREN": null,
                    "CUADRA": null,
                    "LADO": null,
                    "DIR_MUN": null,
                    "DIR_URB": null,
                    "PARTIDA": null,
                    "ANO_CART": null,
                    "FUENTE": null,
                    "COORD_X": null,
                    "COORD_Y": null,
                    "COD_CUC": null,
                    // "ESTADO": null,
                    "VAL_ACT": null,
                    "RAN_CPU": null,
                    // "COD_UI": null,
                    // "COD_VER": null,
                    "created_user": null,
                    "created_date": null,
                    "last_edited_user": null,
                    "last_edited_date": null,
                    // "GlobalID": null,
                    "NOM_PC": null,
                    "NOM_USER": null,
                    // "FOTO": null,
                    // "OBJECTID": null,
                    "ID_MZN_C": null,
                    "TIP_PRED": null,
                    // "L_FRENTE": null,
                    // "Area_terreno": null,
                    // "id_lote_sirv": null,
                    // "ESTADO_PARTIDA": null,
                    // "DIREC_COM": null,
                    // "OBS_VINC": null,
                    "NUM_EDIFICACION": null,
                    "NUM_INTERIOR": null,
                    "TIP_EDIFICACION": null,
                    "TIP_INTERIOR": null,
                    "ID_NUM": null,
                    // "CRCL": null,
                    "SUB_LOTE": null,
                    "PISO": null,
                    "COD_VIA": null
                }
            };
            return response;
        },
        attributeTransfer: function attributeTransfer(_ref) {
            var objTarget = _ref.objTarget,
                objBase = _ref.objBase,
                _ref$propsUse = _ref.propsUse,
                propsUse = _ref$propsUse === undefined ? [] : _ref$propsUse,
                _ref$propsOmit = _ref.propsOmit,
                propsOmit = _ref$propsOmit === undefined ? [] : _ref$propsOmit,
                _ref$updateOnlyNulls = _ref.updateOnlyNulls,
                updateOnlyNulls = _ref$updateOnlyNulls === undefined ? false : _ref$updateOnlyNulls,
                _ref$omitPropsDefault = _ref.omitPropsDefault,
                omitPropsDefault = _ref$omitPropsDefault === undefined ? true : _ref$omitPropsDefault,
                _ref$deletePropsDefau = _ref.deletePropsDefault,
                deletePropsDefault = _ref$deletePropsDefau === undefined ? true : _ref$deletePropsDefau;

            var fieldMatch = [];
            var propsOmitDefault = ['FUENTE', 'NOM_PC', 'NOM_USER', 'ANO_CART'];
            var propsDeleteDefault = ['OBJECTID', 'GlobalID', 'created_date', 'created_user', 'last_edited_date', 'last_edited_user', 'Shape.STArea()', 'Shape.STLength()'];

            if (deletePropsDefault) {
                for (var prop in objTarget) {
                    if (propsDeleteDefault.includes(prop)) {
                        delete objTarget[prop];
                    }
                }
            }

            if (propsUse.length > 0) {
                fieldMatch = propsUse;
            } else {
                var props1 = Object.keys(objTarget);
                var props2 = Object.keys(objBase);
                fieldMatch = props1.filter(function (prop) {
                    return props2.includes(prop);
                });
            }
            // retirar los campos omitidos
            if (propsOmit.length > 0) {
                fieldMatch = fieldMatch.filter(function (prop) {
                    return !propsOmit.includes(prop);
                });
            }

            // retirar los campos omitidos por defecto de objBase
            if (omitPropsDefault) {
                fieldMatch = fieldMatch.filter(function (prop) {
                    return !propsOmitDefault.includes(prop);
                });
            }

            fieldMatch.forEach(function (prop) {
                if (objBase.hasOwnProperty(prop)) {
                    if (updateOnlyNulls) {
                        if (objTarget[prop] === null) {
                            objTarget[prop] = objBase[prop];
                        }
                    } else {
                        objTarget[prop] = objBase[prop];
                    }
                }
            });

            return objTarget;
        },
        getValueCodVer: function getValueCodVer(ranCpu, codUi) {
            var factor = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
            // Obteniendo código concatenado
            var cod_ver_concatenate = ranCpu.toString() + ("0000" + codUi.toString()).slice(-4);

            // Reversa de código concatenado
            var cod_ver = cod_ver_concatenate.split('').reverse().join('');

            // Aplicando fórmula
            var response = 11 - cod_ver.split('').map(function (digit, index) {
                return parseInt(digit) * factor[index];
            }).reduce(function (a, b) {
                return a + b;
            }, 0) % 11;

            if (response > 9) {
                response = 11 - response;
            }

            return response;
        },
        getBlockFromLot: function getBlockFromLot(geometry, url) {
            var deferred = new Deferred();

            var queryBlock = new Query();
            queryBlock.geometry = geometry;
            queryBlock.outFields = ['*'];
            queryBlock.returnGeometry = true;
            var queryTaskBlock = new QueryTask(url);
            queryTaskBlock.execute(queryBlock).then(function (response) {
                if (response.features.length === 0) {
                    return deferred.reject(new Error("No se encontraron manzanas"));
                }
                return deferred.resolve(response.features[0]);
            }).catch(function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        },
        checkResolutionDocument: function checkResolutionDocument(ubigeo, newLandsGraphics, apiUrl, ntk) {
            var _this = this;

            var exceptLands = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

            var deferred = new Deferred();
            var resolutionDocument = [];
            newLandsGraphics.map(function (land) {
                if (land.attributes.resolutionType === _this.tipoResolucionValue) {
                    resolutionDocument.push(land.attributes.resolutionDocument);
                }
            });

            if (resolutionDocument.length === 0) {
                deferred.resolve();
                return deferred.promise;
            }
            var payload = {
                "ubigeo": ubigeo,
                "partidas": resolutionDocument,
                "cpuExcepcion": exceptLands.map(function (land) {
                    return land.cup;
                })
            };

            fetch(apiUrl, {
                method: 'POST',
                headers: this.buildHeaderNtk(ntk),
                body: JSON.stringify(payload)
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error("Error en la solicitud: " + response.status + " " + response.statusText);
                }
                return response.json();
            }).then(function (data) {
                if (!data.ok) {
                    var conflicts = data.conflicts.join(", ");
                    var err = new Error("La solicitud no se puede realizar porque se detectaron n\xFAmeros de partida que ya est\xE1n asignados a otros predios en el Catastro Fiscal.\nPartidas existentes: " + conflicts);
                    return deferred.reject(err);
                }
                return deferred.resolve();
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },


        // checkResolutionDocument(newLandsGraphics, ubigeo, urlLand, checkOnlyOutsideTheLot = false, currentLands = []) {

        //     const deferred = new Deferred();
        //     const LandCls = new this.Land();
        //     const resolutionDocument = [];
        //     newLandsGraphics.map(land => {
        //         if (land.attributes.resolutionType === this.tipoResolucionValue) {
        //             resolutionDocument.push(land.attributes.resolutionDocument);
        //         }
        //     });

        //     if (resolutionDocument.length === 0) {
        //         return deferred.resolve();
        //     }
        //     const queryLand = new Query();
        //     queryLand.where = `${LandCls.partida} in ('${resolutionDocument.join("','")}') and ${LandCls.ubigeo} = '${ubigeo}' and ${LandCls.estado} = ${this.estadoValue}`;

        //     if (checkOnlyOutsideTheLot) {
        //         const cpus = currentLands.map(land => land.cup);
        //         queryLand.where += ` and ${LandCls.codCpu} not in ('${cpus.join("','")}')`;
        //     }

        //     queryLand.returnGeometry = false;
        //     queryLand.outFields = [LandCls.partida, LandCls.codCpu];
        //     const queryTaskLand = new QueryTask(urlLand);
        //     queryTaskLand.execute(queryLand)
        //         .then(response => {
        //             if (response.features.length > 0) {
        //                 const partidas = response.features.map(land => land.attributes[LandCls.partida]);
        //                 const commonElements = resolutionDocument.filter(partida => partida.includes(partidas));
        //                 // if (commonElements.length > 0) {
        //                 const err = new Error(`La solicitud no se puede realizar porque se detectaron números de partida que ya están asignados a otros predios en el Catastro Fiscal.\nPartidas existentes: ${commonElements}`);
        //                 return deferred.reject(err);
        //                 // }
        //             }
        //             return deferred.resolve();
        //         })
        //         .catch(err => deferred.reject(err));
        //     return deferred.promise;
        // },

        checkExistLotUrban: function checkExistLotUrban(attributes, block, urlLots, currentLots, ubigeo) {
            var checkSublotUrban = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

            var deferred = new Deferred();
            var LotCls = new this.Lot();
            var queryLot = new Query();
            // const lotsUrban = attributes.map(attr => attr.lotUrb);
            // get lotsUrban from attributes and not null or empty

            var idLotPArray = currentLots.map(function (i) {
                return i.attributes[LotCls.idLotP];
            });
            queryLot.where = LotCls.ubigeo + " = '" + ubigeo + "' and " + LotCls.idLotP + " not in (" + idLotPArray.join(",") + ")";
            queryLot.geometry = block.geometry;
            queryLot.spatialRelationship = Query.SPATIAL_REL_CONTAINS;

            queryLot.outFields = [LotCls.lotUrb, LotCls.subLote];

            // if (checkSublotUrban) {
            //     queryLot.outFields.push(LotCls.subLote);
            // }
            var queryTaskLot = new QueryTask(urlLots);

            queryTaskLot.execute(queryLot).then(function (response) {
                // let lots = [];
                // let lotsUrban = [];
                // if (checkSublotUrban) {
                //     lotsUrban = attributes.map(attr => attr.lotUrb).filter(lot => lot && lot.trim() !== '');
                //     lots = response.features.map(feature => feature.attributes[LotCls.subLote]).filter(lot => lot && lot.trim() !== '');
                // } else if (response.features.length === 0) {
                var lots = response.features.map(function (feature) {
                    var lot = feature.attributes[LotCls.lotUrb] || '';
                    var sublot = feature.attributes[LotCls.subLote] || '';
                    return "" + lot + sublot;
                });
                var lotsUrban = attributes.map(function (attr) {
                    var lot = attr.loturb || '';
                    var sublot = attr.sublot || '';
                    return "" + lot + sublot;
                });
                // }
                var setLots = new Set(lots);
                var commonElements = lotsUrban.filter(function (lot) {
                    return setLots.has(lot);
                });
                // const exist = lotsUrban.some(lot => lots.includes(lot));
                if (commonElements.length > 0) {
                    return deferred.reject(new Error("La solicitud no se puede realizar porque los lotes resultantes de la subdivisi\xF3n tienen denominaciones de lotes y/o sublotes urbanos que ya existen en la manzana actual: " + commonElements));
                }
                return deferred.resolve(block);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        checkExistLotUrbanIntoLotsOriginal: function checkExistLotUrbanIntoLotsOriginal(attributes, currentLots, block) {
            var checkSublotUrban = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var deferred = new Deferred();
            var LotCls = new this.Lot();
            var lotUrbArray = currentLots.map(function (i) {
                var lot = i.attributes[LotCls.lotUrb] || '';
                var sublot = i.attributes[LotCls.subLote] || '';
                return "" + lot + sublot;
            });
            // if (checkSublotUrban) {
            // const subLotArray = currentLots.map(i => i.attributes[LotCls.subLote]).filter(lot => lot && lot.trim() !== '');
            // if (subLotArray.length > 0) {
            //     lotUrbArray.push(...subLotArray);
            // }
            // }
            var lotsUrban = attributes.map(function (attr) {
                var lot = attr.lotUrb || '';
                var sublot = attr.sublot || '';
                return "" + lot + sublot;
            });
            var setLotsUrban = new Set(lotsUrban);
            var repeatedElements = lotUrbArray.filter(function (lot) {
                return setLotsUrban.has(lot);
            });
            // const exist = lotsUrban.some(lot => lotUrbArray.includes(lot));
            if (repeatedElements.length == 1) {
                var mensaje = new Message({
                    message: "Uno de los lotes resultantes tiene la misma denominaci\xF3n de un lote urbano original: " + repeatedElements + ".\n\xBFDesea continuar con el proceso?",
                    type: "question",
                    buttons: [{
                        label: "Sí",
                        onClick: function onClick() {
                            deferred.resolve(block);
                            mensaje.hide();
                        }
                    }, {
                        label: "No",
                        onClick: function onClick() {
                            deferred.reject(new CustomException.ErrorEqualUrbanLotWithinBlock());
                            mensaje.hide();
                        }
                    }]
                });
            } else if (repeatedElements.length > 1) {
                return deferred.reject(new Error("La solicitud no se puede realizar porque existen muchos lotes resultantes que tienen la misma denominaci\xF3n de los lotes originales: " + repeatedElements));
            } else {
                return deferred.resolve(block);
            }
            return deferred.promise;
        },
        checkDuplicateLotUrbanResults: function checkDuplicateLotUrbanResults(lotUrbArray) {
            var elementCount = {};
            lotUrbArray.forEach(function (item) {
                if (elementCount[item]) {
                    elementCount[item]++;
                } else {
                    elementCount[item] = 1;
                }
            });
            var repeatedElements = Object.keys(elementCount).filter(function (key) {
                return elementCount[key] > 1;
            });
            return repeatedElements;
        },
        translateFieldsBlockToLot: function translateFieldsBlockToLot(url, block, lotsResults) {
            var _this2 = this;

            var deferred = new Deferred();
            var LotCls = new this.Lot();
            this.getFeatureSchema(url).then(function (lot) {
                var lots = lotsResults.map(function (graphic) {
                    var lotIdx = lot.clone();
                    lotIdx.attributes = _this2.attributeTransfer({
                        objTarget: lotIdx.attributes,
                        objBase: block.attributes
                    });
                    lotIdx.geometry = graphic.geometry;
                    lotIdx.attributes[LotCls.tipLot] = graphic.attributes.tipLot;
                    return lotIdx;
                });
                return deferred.resolve(lots);
            }).catch(function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        },
        calculateTipLot: function calculateTipLot(currentLotsRows) {
            var LotCls = new this.Lot();
            var tipLot = currentLotsRows.map(function (row) {
                return row.attributes[LotCls.tipLot];
            });
            tipLot = [].concat(_toConsumableArray(new Set(tipLot))) == [2] ? '2' : '1';
            return tipLot;
        },
        calculateFieldsOfLot: function calculateFieldsOfLot(lotUrl, lots, ubigeo, codRequests, user, attributes) {
            var _this3 = this;

            var deferred = new Deferred();
            var LotCls = new this.Lot();

            var queryLotTask = new QueryTask(lotUrl);

            var queryLot = new Query();

            queryLot.where = this.ubigeoFieldName + " = '" + ubigeo + "'";

            var statDefIdLoteP = new StatisticDefinition();
            statDefIdLoteP.statisticType = "max";
            statDefIdLoteP.onStatisticField = LotCls.idLotP;
            statDefIdLoteP.outStatisticFieldName = LotCls.idLotP + "_MAX";

            var statDefRanCpu = new StatisticDefinition();
            statDefRanCpu.statisticType = "max";
            statDefRanCpu.onStatisticField = LotCls.ranCpu;
            statDefRanCpu.outStatisticFieldName = LotCls.ranCpu + "_MAX";

            queryLot.returnGeometry = false;
            queryLot.outStatistics = [statDefIdLoteP, statDefRanCpu];

            attributes.forEach(function (attr) {
                var point = new Point({
                    x: attr.coords[0],
                    y: attr.coords[1],
                    spatialReference: { wkid: 4326 }
                });
                attr.geometry = point;
            });

            queryLotTask.execute(queryLot).then(function (response) {
                for (idx = 0; idx < lots.length; idx++) {
                    // lots.forEach((lot, idx) => {
                    lots[idx].attributes[LotCls.idLotP] = response.features[0].attributes[statDefIdLoteP.outStatisticFieldName] + idx + 1;
                    lots[idx].attributes[LotCls.ranCpu] = response.features[0].attributes[statDefRanCpu.outStatisticFieldName] + idx + 1;
                    lots[idx].attributes[LotCls.anoCart] = new Date().getFullYear();
                    lots[idx].attributes[LotCls.fuente] = codRequests;
                    lots[idx].attributes[LotCls.nomPc] = _this3.platformUpdate;
                    lots[idx].attributes[LotCls.nomUser] = user;
                    // lot.attributes[LotCls.tipLot] = tipLot;
                    lots[idx].attributes[LotCls.estadoIns] = _this3.estadoInsValue;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var attr = _step.value;

                            if (geometryEngine.intersects(lots[idx].geometry, attr.geometry)) {
                                lots[idx].attributes[LotCls.codLot] = attr.codLot;
                                lots[idx].attributes[LotCls.lotUrb] = attr.loturb || null;
                                lots[idx].attributes[LotCls.subLote] = attr.sublot || null;
                                break;
                            }
                        }

                        // lot.attributes[LotCls.codLot] = attributes[idx].codLot;
                        // lot.attributes[LotCls.lotUrb] = attributes[idx].lotUrb;
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                };
                return deferred.resolve(lots);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        translateFieldsLotToUbicacion: function translateFieldsLotToUbicacion(lots, ubicacionUrl, newUbicacionGraphics) {
            var _this4 = this;

            var deferred = new Deferred();
            var ubicaciones = [];

            this.getFeatureSchema(ubicacionUrl).then(function (ubicacion) {
                lots.forEach(function (lot) {
                    var ubicacionProps = ubicacion.clone();
                    ubicacionProps.attributes = _this4.attributeTransfer({
                        objTarget: ubicacionProps.attributes,
                        objBase: lot.attributes,
                        omitPropsDefault: false,
                        deletePropsDefault: true
                    });

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = newUbicacionGraphics[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var graph = _step2.value;

                            if (!geometryEngine.intersects(lot.geometry, graph.geometry)) {
                                continue;
                            }

                            var ubicacionPropsClone = ubicacionProps.clone();
                            ubicacionPropsClone.geometry = graph.geometry;
                            ubicaciones.push(ubicacionPropsClone);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    ;
                });
                return deferred.resolve(ubicaciones);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        translateFieldsArancelToUbicacion: function translateFieldsArancelToUbicacion(ubicaciones, arancelUrl) {
            var _this5 = this;

            var deferred = new Deferred();
            var LotCls = new this.Lot();
            var promises = ubicaciones.map(function (ubicacion) {
                var queryArancelTask = new QueryTask(arancelUrl);
                var queryArancel = new Query();
                queryArancel.returnGeometry = true;
                queryArancel.outFields = ["*"];
                queryArancel.geometry = ubicacion.geometry;
                queryArancel.geometryType = "esriGeometryPoint";
                return queryArancelTask.execute(queryArancel);
            });
            all(promises).then(function (arancels) {
                ubicaciones.forEach(function (element, index) {
                    if (element.attributes[LotCls.tipLot] !== 2) {
                        var attributes = element.clone().attributes;
                        var arancel = arancels[index].features[0].attributes;
                        ubicaciones[index].attributes = _this5.attributeTransfer({
                            objTarget: attributes,
                            objBase: arancel,
                            updateOnlyNulls: true
                        });
                    }
                });
                return deferred.resolve(ubicaciones);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        calculateFieldsOfUbicacion: function calculateFieldsOfUbicacion(ubicacionUrl, ubigeo, ubicaciones) {
            var _this6 = this;

            var deferred = new Deferred();
            var UbicacionCls = new this.Ubicacion();

            var queryUbicacionTask = new QueryTask(ubicacionUrl);

            var queryUbicacion = new Query();
            queryUbicacion.where = UbicacionCls.ubigeo + " = '" + ubigeo + "'";
            var statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = UbicacionCls.secuen;
            statDef.outStatisticFieldName = UbicacionCls.secuen + "_MAX";

            queryUbicacion.returnGeometry = false;
            queryUbicacion.outStatistics = [statDef];

            queryUbicacionTask.execute(queryUbicacion).then(function (response) {
                var secuen = response.features[0].attributes[statDef.outStatisticFieldName] + 1;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = ubicaciones[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _i = _step3.value;

                        _i.attributes[UbicacionCls.secuen] = secuen;
                        _i.attributes[UbicacionCls.idUbicacion] = "" + _i.attributes[UbicacionCls.zonaUtm] + ubigeo + secuen;
                        _i.attributes[UbicacionCls.estadoIns] = _this6.estadoInsValue;
                        _i.attributes[UbicacionCls.enCartografia] = _this6.enCartografiaValue;
                        secuen += 1;
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                return deferred.resolve(ubicaciones);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        generateCodCpu: function generateCodCpu(ranCpu, codVer) {
            var codUi = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            codUi = ("0000" + codUi.toString()).slice(-4);
            return ranCpu + "-" + codUi + "-" + codVer;
        },
        generateDirMun: function generateDirMun(tipUu, nomUu, tipVia, nomVia, tipEdificacion, numEdificacion, tipInterior, numInterior, piso, domains) {
            var pisoText = piso != null && String(piso).trim() !== "" ? "Piso " + piso : null;
            var tipUuItem = domains.uuType.find(function (item) {
                return item.id === tipUu && item.estado === 1;
            });
            var tipUuText = tipUuItem ? tipUuItem.name : tipUu;
            var tipViaItem = domains.codStreet.find(function (item) {
                return item.id === tipVia && item.estado === 1;
            });
            var tipViaText = tipViaItem ? tipViaItem.name : tipVia;
            var tipEdificacionItem = domains.tipoEdificacion.find(function (item) {
                return item.id === tipEdificacion && item.estado === 1;
            });
            var tipEdificacionText = tipEdificacionItem ? tipEdificacionItem.name : tipEdificacion;
            var tipInteriorItem = domains.tipoInterior.find(function (item) {
                return item.id === tipInterior && item.estado === 1;
            });
            var tipInteriorText = tipInteriorItem ? tipInteriorItem.name : tipInterior;

            var parts = [tipUuText, nomUu, tipViaText, nomVia, tipEdificacionText, numEdificacion, tipInteriorText, numInterior, pisoText];

            return parts.filter(function (x) {
                return x != null && String(x).trim() !== "";
            }).join(" ");
        },
        generateDirUrb: function generateDirUrb(tipUu, nomUu, mznUrb, lotUrb, subLotUrb, tipVia, nomVia, tipEdificacion, numEdificacion, tipInterior, numInterior, piso, domains) {
            var mznaText = mznUrb != null && String(mznUrb).trim() !== "" ? "Mz. " + mznUrb : null;
            var loteText = lotUrb != null && String(lotUrb).trim() !== "" ? "Lt. " + lotUrb : null;
            var pisoText = piso != null && String(piso).trim() !== "" ? "Piso " + piso : null;
            var tipUuItem = domains.uuType.find(function (item) {
                return item.id === tipUu && item.estado === 1;
            });
            var tipUuText = tipUuItem ? tipUuItem.name : tipUu;
            var tipViaItem = domains.codStreet.find(function (item) {
                return item.id === tipVia && item.estado === 1;
            });
            var tipViaText = tipViaItem ? tipViaItem.name : tipVia;
            var tipEdificacionItem = domains.tipoEdificacion.find(function (item) {
                return item.id === tipEdificacion && item.estado === 1;
            });
            var tipEdificacionText = tipEdificacionItem ? tipEdificacionItem.name : tipEdificacion;
            var tipInteriorItem = domains.tipoInterior.find(function (item) {
                return item.id === tipInterior && item.estado === 1;
            });
            var tipInteriorText = tipInteriorItem ? tipInteriorItem.name : tipInterior;

            var parts = [tipUuText, nomUu, mznaText, loteText, subLotUrb, tipViaText, nomVia, tipEdificacionText, numEdificacion, tipInteriorText, numInterior, pisoText];

            return parts.filter(function (x) {
                return x != null && String(x).trim() !== "";
            }).join(" ");
        },
        translateFieldsUbicacionToLand: function translateFieldsUbicacionToLand(ubicaciones, newLandsGraphics, domains) {
            var _this7 = this;

            var deferred = new Deferred();
            var LandCls = new this.Land();
            var lote = new this.Lot();
            var lands = [];

            // const land = this.getFeatureSchemaLand();

            // this.getFeatureSchema(landUrl)
            //     .then(land => {
            newLandsGraphics.forEach(function (landGraphic) {
                var attributes = landGraphic.attributes;

                for (i = 0; i < ubicaciones.length; i++) {
                    // Validate location
                    if (geometryEngine.intersects(landGraphic.geometry, ubicaciones[i].geometry)) {
                        // Validate attributes lotUrb
                        if (ubicaciones[i].attributes.LOT_URB != attributes.urbanLotNumber || ubicaciones[i].attributes.SUB_LOTE != attributes.urbanSublotNumber) {
                            throw new Error("La solicitud no se puede realizar porque el predio del lote " + attributes.urbanLotNumber + " se asign\xF3 al lote " + ubicaciones[i].attributes.LOT_URB);
                        }
                        var landProps = _this7.getFeatureSchemaLand();
                        landProps.attributes = _this7.attributeTransfer({
                            objTarget: landProps.attributes,
                            objBase: ubicaciones[i].attributes,
                            omitPropsDefault: false
                        });
                        landProps.attributes[LandCls.codPre] = attributes.cpm;
                        landProps.attributes[LandCls.tipEdificacion] = attributes.edificationType;
                        landProps.attributes[LandCls.tipInterior] = attributes.indoorType;
                        landProps.attributes[LandCls.numEdificacion] = attributes.edificationNumber;
                        landProps.attributes[LandCls.numInterior] = attributes.indoorNumber;
                        // landProps.attributes[LandCls.codUi] = codUiValue || this.codUiValue;
                        // landProps.attributes[LandCls.estado] = this.estadoValue;
                        landProps.attributes[LandCls.coordX] = landGraphic.geometry.x;
                        landProps.attributes[LandCls.coordY] = landGraphic.geometry.y;
                        // landProps.attributes[LandCls.codVer] = this.getValueCodVer(
                        //     landProps.attributes[LandCls.ranCpu],
                        //     codUiValue || this.codUiValue
                        // );
                        // landProps.attributes[LandCls.codCpu] = this.generateCodCpu(
                        //     landProps.attributes[LandCls.ranCpu],
                        //     landProps.attributes[LandCls.codVer],
                        //     codUiValue || this.codUiValue
                        // );

                        landProps.geometry = landGraphic.geometry;
                        // if (attributes.resolutionType === this.tipoResolucionValue) {
                        landProps.attributes[LandCls.resolutionType] = attributes.resolutionType;
                        landProps.attributes[LandCls.resolutionDocument] = attributes.resolutionDocument;
                        // landProps.attributes[LandCls.estadoPartida] = this.estadoPartidaValue;
                        // } else {
                        // landProps.attributes[LandCls.partida] = null;
                        // landProps.attributes[LandCls.estadoPartida] = null;
                        // }
                        // if (attributes.floor){
                        landProps.attributes[LandCls.piso] = attributes.floor;
                        // }
                        landProps.attributes['ID'] = parseInt(attributes.id.split('_')[1]);

                        if (attributes.tipLot === 2) {
                            var rightOfWay = attributes.mediterraneanCoords;
                            if (attributes.mediterraneanCoords.attributes.tipLot) {
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = ubicaciones[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var ubicacion = _step4.value;

                                        if (geometryEngine.intersects(rightOfWay.geometry, ubicacion.geometry)) {
                                            rightOfWay = ubicacion;
                                            break;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError4 = true;
                                    _iteratorError4 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                            _iterator4.return();
                                        }
                                    } finally {
                                        if (_didIteratorError4) {
                                            throw _iteratorError4;
                                        }
                                    }
                                }
                            }

                            landProps.attributes['ID_ARANC'] = rightOfWay.attributes['ID_ARANC'];
                            landProps.attributes['COD_VIA'] = rightOfWay.attributes['COD_VIA'];
                            landProps.attributes['TIP_VIA'] = rightOfWay.attributes['TIP_VIA'];
                            landProps.attributes['NOM_VIA'] = rightOfWay.attributes['NOM_VIA'];
                            landProps.attributes['CUADRA'] = rightOfWay.attributes['CUADRA'];
                            landProps.attributes['LADO'] = rightOfWay.attributes['LADO'];
                            landProps.attributes['VAL_ACT'] = rightOfWay.attributes['VAL_ACT'];
                            landProps.attributes['id_lote_sirv'] = rightOfWay.attributes['ID_LOTE'];

                            landProps.attributes['id_lote_puerta'] = rightOfWay.attributes['ID_LOTE'];
                            landProps.attributes['longitude_puerta'] = rightOfWay.geometry.x;
                            landProps.attributes['latitude_puerta'] = rightOfWay.geometry.y;
                            landProps.attributes['lote_urbano_puerta'] = rightOfWay.attributes['LOT_URB'];
                            landProps.attributes['manzana_urbana_puerta'] = rightOfWay.attributes['MZN_URB'];
                        }
                        landProps.attributes[LandCls.dirMun] = _this7.generateDirMun(landProps.attributes[LandCls.tipUu], landProps.attributes[LandCls.nomUu], landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia],
                        // landProps.attributes[LandCls.numMun]
                        landProps.attributes[LandCls.tipEdificacion], landProps.attributes[LandCls.numEdificacion], landProps.attributes[LandCls.tipInterior], landProps.attributes[LandCls.numInterior], landProps.attributes[LandCls.piso], domains);
                        landProps.attributes[LandCls.dirUrb] = _this7.generateDirUrb(landProps.attributes[LandCls.tipUu], landProps.attributes[LandCls.nomUu], landProps.attributes[LandCls.mznUrb], landProps.attributes[LandCls.lotUrb], landProps.attributes[LandCls.subLote], landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia],
                        // landProps.attributes[LandCls.numMun],
                        landProps.attributes[LandCls.tipEdificacion], landProps.attributes[LandCls.numEdificacion], landProps.attributes[LandCls.tipInterior], landProps.attributes[LandCls.numInterior], landProps.attributes[LandCls.piso], domains);

                        // if (codUiValue) {
                        //     codUiValue += 1;
                        // }

                        lands.push(JSON.parse(JSON.stringify(landProps)));

                        break;
                    }
                }
            });
            deferred.resolve(lands);
            // })
            // .catch(err => deferred.reject(err));
            return deferred.promise;
        },
        calculateIdMznC: function calculateIdMznC(lands, cadastralBlockUrl, ubigeo) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryCadastralBlockTask = new QueryTask(cadastralBlockUrl);
            var queryCadastralBlock = new Query();
            queryCadastralBlock.where = LandCls.ubigeo + " = '" + ubigeo + "'";
            queryCadastralBlock.returnGeometry = true;
            queryCadastralBlock.outFields = [LandCls.idMznC];
            queryCadastralBlock.geometry = lands[0].geometry;

            queryCadastralBlockTask.execute(queryCadastralBlock).then(function (response) {
                lands.forEach(function (land) {
                    land.attributes[LandCls.idMznC] = response.features[0].attributes[LandCls.idMznC];
                });
                return deferred.resolve(lands);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        calculateIdPred: function calculateIdPred(lands, landUrl, ubigeo) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryLandTask = new QueryTask(landUrl);
            var queryLand = new Query();
            queryLand.returnGeometry = false;
            queryLand.where = LandCls.ubigeo + " = '" + ubigeo + "'";
            var statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = LandCls.idPred;
            statDef.outStatisticFieldName = LandCls.idPred + "_MAX";
            queryLand.outStatistics = [statDef];

            queryLandTask.execute(queryLand).then(function (response) {
                lands.forEach(function (land, idx) {
                    land.attributes[LandCls.idPred] = response.features[0].attributes[statDef.outStatisticFieldName] + idx + 1;
                });
                return deferred.resolve(lands);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getUbicacionOrigin: function getUbicacionOrigin(ubicacionUrl, lots) {
            var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var queryUbicacionOriginTask = new QueryTask(ubicacionUrl);
            var queryUbicacionOrigin = new Query();
            queryUbicacionOrigin.returnGeometry = true;
            queryUbicacionOrigin.outFields = ["*"];
            if (query) {
                queryUbicacionOrigin.where = query;
            } else {
                queryUbicacionOrigin.geometry = lots.geometry;
                queryUbicacionOrigin.geometryType = "esriGeometryPolygon";
                queryUbicacionOrigin.distance = 0.2;
                queryUbicacionOrigin.units = "meters";
            }

            return queryUbicacionOriginTask.execute(queryUbicacionOrigin);
        },
        getLandsOrigin: function getLandsOrigin(landUrl, lots) {
            var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var queryLandsOriginTask = new QueryTask(landUrl);
            var queryLandsOrigin = new Query();
            queryLandsOrigin.returnGeometry = true;
            queryLandsOrigin.outFields = ["*"];
            if (query) {
                queryLandsOrigin.where = query;
            } else {
                queryLandsOrigin.geometry = lots.geometry;
                queryLandsOrigin.geometryType = "esriGeometryPolygon";
                queryLandsOrigin.distance = 0.2;
                queryLandsOrigin.units = "meters";
            }

            return queryLandsOriginTask.execute(queryLandsOrigin);
        },
        getLandsOriginByQuery: function getLandsOriginByQuery(landUrl, cpu) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryLandsOriginTask = new QueryTask(landUrl);
            var queryLandsOrigin = new Query();
            queryLandsOrigin.returnGeometry = true;
            queryLandsOrigin.outFields = ["*"];
            queryLandsOrigin.where = LandCls.codCpu + " = '" + cpu + "'";
            queryLandsOriginTask.execute(queryLandsOrigin).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateRowsGeneric: function updateRowsGeneric(features, codRequest, user) {
            var _this8 = this;

            var status = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var LandCls = new this.Land();
            var LotCls = new this.Lot();
            features.forEach(function (feature) {
                feature.attributes[LandCls.estado] = status;
                feature.attributes[LotCls.fuente] = codRequest;
                feature.attributes[LotCls.nomUser] = user;
                feature.attributes[LotCls.nomPc] = _this8.platformUpdate;
                feature.attributes[LotCls.anoCart] = new Date().getFullYear();
            });
            return features;
        },
        getDataOrigin: function getDataOrigin(ubicacionUrl, lots) {
            var queryLots = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            // const self = this;
            var deferred = new Deferred();

            if (!queryLots || queryLots.trim() === '' || queryLots === '1=1') {
                throw new Error('La consulta para obtener los datos originales no es válida.');
            }

            var promises = [this.getUbicacionOrigin(ubicacionUrl, lots, queryLots)];

            all(promises).then(function (results) {
                // self.currentPoinLotsRows = results[0].features;
                // self.currentLandsRows = results[1].features;
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        setParametersToAddFeatures: function setParametersToAddFeatures(url, params) {
            return {
                url: url + "/addFeatures",
                content: {
                    features: JSON.stringify(params),
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        setParametersToUpdateFeatures: function setParametersToUpdateFeatures(url, params) {
            return {
                url: url + "/updateFeatures",
                content: {
                    features: JSON.stringify(params),
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        setParametersToDeleteFeatures: function setParametersToDeleteFeatures(url, params) {
            return {
                url: url + "/deleteFeatures",
                content: {
                    where: params,
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        sendDataOriginToHistoric: function sendDataOriginToHistoric(config, currentLotsRows, currentUbicacionRows) {
            var deferred = new Deferred();
            var promises = [];

            if (currentLotsRows) {
                var lotsHistoricRequestOptions = this.setParametersToAddFeatures(config.lotHistoricUrl, currentLotsRows);
                promises.push(esriRequest(lotsHistoricRequestOptions, { usePost: true }));
            }

            if (currentUbicacionRows) {
                var pointsLotsHistoricRequestOptions = this.setParametersToAddFeatures(config.pointLotHistoricUrl, currentUbicacionRows);
                promises.push(esriRequest(pointsLotsHistoricRequestOptions, { usePost: true }));
            }

            // if (currentLandsRows) {
            //     const landsHistoricRequestOptions = this.setParametersToAddFeatures(
            //         config.landHistoricUrl,
            //         currentLandsRows
            //     );
            //     promises.push(esriRequest(landsHistoricRequestOptions, { usePost: true }));
            // }

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        deleteDataOrigin: function deleteDataOrigin(currentLotsRows, currentUbicacionRows, config) {
            var deferred = new Deferred();

            var objetidLot = currentLotsRows.map(function (row) {
                return row.attributes.OBJECTID;
            });
            var objetidPointLot = currentUbicacionRows.map(function (row) {
                return row.attributes.OBJECTID;
            });
            // const objetidLand = currentLandsRows.map(row => row.attributes.OBJECTID);

            var lotsDeleteRequestOptions = this.setParametersToDeleteFeatures(config.lotUrl, "OBJECTID IN (" + objetidLot.join(",") + ")");
            var pointsLotsDeleteRequestOptions = this.setParametersToDeleteFeatures(config.ubicacionUrl, "OBJECTID IN (" + objetidPointLot.join(",") + ")");
            // const landsDeleteRequestOptions = this.setParametersToDeleteFeatures(
            //     config.landUrl,
            //     `OBJECTID IN (${objetidLand.join(",")})`,
            // );

            var promises = [esriRequest(lotsDeleteRequestOptions, { usePost: true }), esriRequest(pointsLotsDeleteRequestOptions, { usePost: true })];

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateDataDeactivate: function updateDataDeactivate(lands, config) {
            var deferred = new Deferred();
            var deactivateFeatures = this.setParametersToUpdateFeatures(config.landUrl, lands);

            esriRequest(deactivateFeatures, { usePost: true }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateDataLotsDeactivate: function updateDataLotsDeactivate(lots, config) {
            var deferred = new Deferred();
            var updateLotFeature = this.setParametersToUpdateFeatures(config.lotUrl, lots);

            esriRequest(updateLotFeature, { usePost: true }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        addDataNew: function addDataNew(lots, ubicaciones, config) {
            var deferred = new Deferred();

            lots = Array.isArray(lots) ? lots : [lots];

            var lotNews = this.setParametersToAddFeatures(config.lotUrl, lots);

            ubicaciones = Array.isArray(ubicaciones) ? ubicaciones : [ubicaciones];

            var ubicacionesNews = this.setParametersToAddFeatures(config.ubicacionUrl, ubicaciones);

            // lands = Array.isArray(lands) ? lands : [lands]

            // const landsNews = this.setParametersToAddFeatures(
            //     config.landUrl,
            //     lands
            // );

            var promises = [esriRequest(lotNews, { usePost: true }), esriRequest(ubicacionesNews, { usePost: true })];

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },


        // updateStatusRequests(lands, codRequests, caseRequest, ubigeo, config, idLandInactive = []) {
        //     const deferred = new Deferred();
        //     const responseLands = UtilityCase.matchWithReceptionModel(lands)
        //     const messageText = `Se actualizó la cartografía, pero no se pudo actualizar el estado de la solicitud. Por favor, contacte al administrador de la plataforma.`;

        //     const response = {
        //         id: codRequests,
        //         results: responseLands,
        //         idType: parseInt(caseRequest),
        //         idLandInactive: idLandInactive
        //     }
        //     for (let predio of response.results) {
        //         predio['ubigeo'] = ubigeo;
        //     }

        //     fetch(config.updateStatusApplication, {
        //         method: 'POST',
        //         body: JSON.stringify(response),
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     })
        //         .then(response => {
        //             if (!response.ok) {
        //                 return response.json()
        //                     .then(errorData => {
        //                         throw new Error(`${messageText}.\nError: ${errorData.error}`);
        //                     })
        //                     .catch(() => {
        //                         throw new Error(messageText);
        //                     });
        //             }
        //             return response.json();
        //         })
        //         .then(data => deferred.resolve(data))
        //         .catch(err => deferred.reject(err));
        //     return deferred.promise;
        // },

        updateStatusRequests: function updateStatusRequests(lands, codRequests, caseRequest, ubigeo, config) {
            var _this9 = this;

            var idLandInactive = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

            var deferred = new Deferred();
            var responseLands = UtilityCase.matchWithReceptionModel(lands);
            var messageText = "Se actualiz\xF3 la cartograf\xEDa, pero no se pudo actualizar el estado de la solicitud. Por favor, contacte al administrador de la plataforma.";

            var response = {
                id: codRequests,
                results: responseLands,
                idType: parseInt(caseRequest),
                idLoteP: lands.map(function (land) {
                    return land.attributes.ID_LOTE_P;
                })
                // idLandInactive: idLandInactive
            };
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = response.results[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var predio = _step5.value;

                    predio['ubigeo'] = ubigeo;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            var fetchUpdateStatus = function fetchUpdateStatus() {
                var retry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                fetch(config.updateStatusApplication, {
                    method: 'POST',
                    body: JSON.stringify(response),
                    headers: _this9.buildHeaderNtk(config.ntk)
                }).then(function (response) {
                    if (!response.ok) {
                        return response.json().then(function (errorData) {
                            throw new Error(messageText + ".\nError: " + errorData.error);
                        }).catch(function () {
                            throw new Error(messageText);
                        });
                    }
                    return response.json();
                }).then(function (data) {
                    return deferred.resolve(data);
                }).catch(function (err) {
                    if (!retry) {
                        // Reintentar una vez más
                        fetchUpdateStatus(true);
                    } else {
                        deferred.reject(err);
                    }
                });
            };

            // Iniciar el primer intento de fetch
            fetchUpdateStatus();
            return deferred.promise;
        },
        checkLotsWithinLands: function checkLotsWithinLands(lots, lands) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = lots[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var lot = _step6.value;

                    var checkLands = [];
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = lands[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var land = _step7.value;

                            checkLands.push(geometryEngine.intersects(lot.geometry, land.geometry));
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    if (checkLands.every(function (i) {
                        return i === false;
                    })) {
                        return false;
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return true;
        },
        checkLandsWithinLot: function checkLandsWithinLot(lot, urlLands) {
            var deferred = new Deferred();
            var landCls = new this.Land();
            var queryLands = new Query();
            queryLands.geometry = lot.geometry;
            queryLands.distance = 0.5;
            queryLands.units = "meters";
            queryLands.where = landCls.estado + " = 1 ";
            var queryTaskLands = new QueryTask(urlLands);
            queryTaskLands.execute(queryLands).then(function (response) {
                var result = response.features.length > 0 ? 1 : 0;
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        buildHeaderNtk: function buildHeaderNtk(ntk) {
            return {
                "Authorization": "Bearer " + ntk,
                "Content-Type": "application/json"
            };
        }
    };

    return UtilityCase;
});
//# sourceMappingURL=UtilityCase.js.map
