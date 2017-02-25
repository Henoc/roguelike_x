var battle;
(function (battle) {
    var Status = (function () {
        function Status(max_hp, hp, atk, def, dex, eva) {
            this.max_hp = max_hp;
            this.hp = hp;
            this.atk = atk;
            this.def = def;
            this.dex = dex;
            this.eva = eva;
        }
        Status.zero = function () {
            return new Status(0, 0, 0, 0, 0, 0);
        };
        Status.of_food = function (max_hp) {
            return new Status(max_hp, 0, 0, 0, 0, 0);
        };
        Status.of_drink = function (hp) {
            return new Status(0, hp, 0, 0, 0, 0);
        };
        Status.of_knife = function (atk) {
            return new Status(0, 0, atk, 0, 0, 0);
        };
        Status.of_guard = function (def) {
            return new Status(0, 0, 0, def, 0, 0);
        };
        Status.prototype.copy = function () {
            var copied = new Status(this.max_hp, this.hp, this.atk, this.def, this.dex, this.eva);
            return copied;
        };
        Status.prototype.add = function (that) {
            return new Status(this.max_hp + that.max_hp, utils.limit(this.hp + that.hp, 0, this.max_hp + that.max_hp + 1), this.atk + that.atk, this.def + that.def, this.dex + that.dex, this.eva + that.eva);
        };
        return Status;
    }());
    battle.Status = Status;
    battle.status_jp_names = { max_hp: "最大HP", hp: "HP", atk: "攻撃", def: "防御", dex: "命中", eva: "回避" };
    battle.player_exp = 0;
    battle.dist_point = 0;
    function add_exp(exp) {
        battle.player_exp += exp;
        var _loop_1 = function () {
            battle.player_exp -= max_exp();
            model.player.level++;
            battle.dist_point++;
            var real_pos = model.player.upos.sub(new utils.Pos(1, 2)).mul(view.unit_size).sub(view.prefix_pos);
            utils.start_anim("level_up", 4 / main.sp60f, true, function (frame) { return real_pos; }, new utils.Pos(96, 96), 1);
            utils.log.push("レベルが上がった");
        };
        while (battle.player_exp >= max_exp()) {
            _loop_1();
        }
    }
    battle.add_exp = add_exp;
    function max_exp() {
        return Math.floor(5 * Math.pow(1.2, model.player.level));
    }
    battle.max_exp = max_exp;
})(battle || (battle = {}));
