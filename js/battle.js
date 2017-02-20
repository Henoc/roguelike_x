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
        /**
         * that の被弾後ステータスを返す
         * * 最小1ダメージ
         * * 最大回避95%
         */
        Status.prototype.attackTo = function (that) {
            var that_status = that.status;
            var that_status2 = that_status.copy();
            var hit_rate = (20 - utils.included_limit(that.status.eva - this.dex, 0, 19)) / 20;
            var damage = Math.random() < hit_rate ?
                (this.atk - that_status.def <= 0 ?
                    1
                    : this.atk - that_status.def)
                : "miss";
            // damage expression
            utils.start_tmp_num(damage, "red", that.upos.mul(view.unit_size).sub(view.prefix_pos));
            if (damage != "miss")
                that_status2.hp = that_status2.hp - damage <= 0 ? 0 : that_status2.hp - damage;
            return that_status2;
        };
        return Status;
    }());
    battle.Status = Status;
    battle.status_jp_names = { max_hp: "\u6700\u5927HP", hp: "HP", atk: "\u653B\u6483", def: "\u9632\u5FA1", dex: "\u547D\u4E2D", eva: "\u56DE\u907F" };
    battle.player_exp = 0;
    battle.dist_point = 0;
    function add_exp(exp) {
        battle.player_exp += exp;
        while (battle.player_exp >= max_exp()) {
            battle.player_exp -= max_exp();
            model.player.level++;
            battle.dist_point++;
            utils.start_anim("level_up", 4 / main.sp60f, model.player.upos.sub(new utils.Pos(1, 2)).mul(view.unit_size).sub(view.prefix_pos), new utils.Pos(96, 96));
            utils.log.push("\u30EC\u30D9\u30EB\u304C\u4E0A\u304C\u3063\u305F");
        }
    }
    battle.add_exp = add_exp;
    function max_exp() {
        return Math.floor(5 * Math.pow(1.2, model.player.level));
    }
    battle.max_exp = max_exp;
})(battle || (battle = {}));
