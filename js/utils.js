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
        return Pos;
    })();
    utils.Pos = Pos;
    function all(ary, fn) {
        for (var _i = 0; _i < ary.length; _i++) {
            var v = ary[_i];
            if (!fn(v))
                return false;
        }
        return true;
    }
    utils.all = all;
})(utils || (utils = {}));
