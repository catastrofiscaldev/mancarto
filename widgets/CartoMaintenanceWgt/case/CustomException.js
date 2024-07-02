function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// CustomException.js
define([], function () {
    var ErrorEqualUrbanLotWithinBlock = function (_Error) {
        _inherits(ErrorEqualUrbanLotWithinBlock, _Error);

        function ErrorEqualUrbanLotWithinBlock(message) {
            _classCallCheck(this, ErrorEqualUrbanLotWithinBlock);

            var _this = _possibleConstructorReturn(this, (ErrorEqualUrbanLotWithinBlock.__proto__ || Object.getPrototypeOf(ErrorEqualUrbanLotWithinBlock)).call(this, message || "Se ha encontrado un lote urbano con la misma denominación dentro del mismo ámbito de unidad urbana y manzana urbana."));

            _this.name = "ErrorEqualUrbanLotWithinBlock";
            return _this;
        }

        return ErrorEqualUrbanLotWithinBlock;
    }(Error);

    return {
        ErrorEqualUrbanLotWithinBlock: ErrorEqualUrbanLotWithinBlock
    };
});
//# sourceMappingURL=CustomException.js.map
