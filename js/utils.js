var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils;
(function (utils) {
    /**
     * board[pre_y][pre_x] へ二次元的に paper を代入する
     * @param board 破壊的変更を受ける
     */
    function paste(board, paper, pre_y, pre_x) {
        for (var i = pre_y; i < pre_y + paper.length; i++) {
            for (var j = pre_x; j < pre_x + paper[i - pre_y].length; j++) {
                board[i][j] = paper[i - pre_y][j - pre_x];
            }
        }
    }
    utils.paste = paste;
    function randInt(max) {
        return Math.floor(Math.random() * max);
    }
    utils.randInt = randInt;
    var Pos = (function () {
        function Pos(x, y) {
            this.x = x;
            this.y = y;
        }
        Pos.prototype.add = function (that) {
            return new Pos(this.x + that.x, this.y + that.y);
        };
        Pos.prototype.sub = function (that) {
            return new Pos(this.x - that.x, this.y - that.y);
        };
        Pos.prototype.mul = function (that) {
            return new Pos(this.x * that.x, this.y * that.y);
        };
        Pos.prototype.mul_bloadcast = function (n) {
            return new Pos(this.x * n, this.y * n);
        };
        Pos.prototype.div_bloadcast = function (divisor) {
            return new Pos(this.x / divisor, this.y / divisor);
        };
        Pos.prototype.equals = function (that) {
            return this.x == that.x && this.y == that.y;
        };
        Pos.prototype.map = function (f) {
            return new Pos(f(this.x), f(this.y));
        };
        return Pos;
    }());
    utils.Pos = Pos;
    function all(ary, fn) {
        for (var _i = 0, ary_1 = ary; _i < ary_1.length; _i++) {
            var v = ary_1[_i];
            if (!fn(v))
                return false;
        }
        return true;
    }
    utils.all = all;
    function limit(n, min, max) {
        return n < min ? min : (n > max ? max : n);
    }
    utils.limit = limit;
    var Option = (function () {
        function Option() {
        }
        return Option;
    }());
    utils.Option = Option;
    var Some = (function (_super) {
        __extends(Some, _super);
        function Some(t) {
            var _this = _super.call(this) || this;
            _this.t = t;
            return _this;
        }
        Some.prototype.get = function () {
            return this.t;
        };
        Some.prototype.foreach = function (fn) {
            fn(this.t);
        };
        return Some;
    }(Option));
    utils.Some = Some;
    var None = (function (_super) {
        __extends(None, _super);
        function None() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        None.prototype.get = function () {
            throw "get() call of none";
        };
        None.prototype.foreach = function (fn) {
        };
        return None;
    }(Option));
    utils.None = None;
    function none() {
        return new None();
    }
    utils.none = none;
    function some(t) {
        return new Some(t);
    }
    utils.some = some;
})(utils || (utils = {}));
