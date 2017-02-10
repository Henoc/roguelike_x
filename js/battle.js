var battle;
(function (battle) {
    var Status = (function () {
        function Status(max_hp, atk, def) {
            this.max_hp = max_hp;
            this.hp = max_hp;
            this.atk = atk;
            this.def = def;
        }
        Status.prototype.copy = function () {
            var copied = new Status(this.max_hp, this.atk, this.def);
            copied.max_hp = this.max_hp;
            copied.hp = this.hp;
            copied.atk = this.atk;
            copied.def = this.def;
            return copied;
        };
        /**
         * return new attacked status of that
         */
        Status.prototype.attackTo = function (that) {
            var that2 = that.copy();
            that2.hp = utils.limit(that2.hp + that.def - this.atk, 0, that2.hp);
            return that2;
        };
        return Status;
    }());
    battle.Status = Status;
})(battle || (battle = {}));
