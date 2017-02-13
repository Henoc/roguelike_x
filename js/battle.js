var battle;
(function (battle) {
    var Status = (function () {
        function Status(max_hp, hp, atk, def, effi, heal) {
            this.max_hp = max_hp;
            this.hp = hp;
            this.atk = atk;
            this.def = def;
            this.effi = effi == undefined ? 0 : effi;
            this.heal = heal == undefined ? 0 : heal;
        }
        Status.zero = function () {
            return new Status(0, 0, 0, 0);
        };
        Status.of_food = function (max_hp) {
            return new Status(max_hp, 0, 0, 0);
        };
        Status.of_drink = function (hp) {
            return new Status(0, hp, 0, 0);
        };
        Status.of_knife = function (atk) {
            return new Status(0, 0, atk, 0);
        };
        Status.of_guard = function (def) {
            return new Status(0, 0, 0, def);
        };
        Status.prototype.copy = function () {
            var copied = new Status(this.max_hp, this.hp, this.atk, this.def, this.effi, this.heal);
            return copied;
        };
        Status.prototype.add = function (that) {
            return new Status(this.max_hp + that.max_hp, utils.limit(this.hp + that.hp, 0, this.max_hp + that.max_hp + 1), this.atk + that.atk, this.def + that.def, this.effi + that.effi, this.heal + that.heal);
        };
        /**
         * return new attacked status of that
         * 必ず1は毎回減る
         */
        Status.prototype.attackTo = function (that) {
            var that2 = that.copy();
            // [0, hp - 1]
            that2.hp = utils.limit(that2.hp + that.def - this.atk, 0, that2.hp);
            return that2;
        };
        return Status;
    }());
    battle.Status = Status;
    battle.player_exp = 0;
    battle.dist_point = 0;
    function add_exp(exp) {
        battle.player_exp += exp;
        while (battle.player_exp >= max_exp()) {
            battle.player_exp -= max_exp();
            model.player.level++;
            battle.dist_point++;
        }
    }
    battle.add_exp = add_exp;
    function max_exp() {
        return Math.floor(5 * Math.pow(1.2, model.player.level));
    }
    battle.max_exp = max_exp;
})(battle || (battle = {}));
