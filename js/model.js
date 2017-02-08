var model;
(function (model) {
    // 壁，床，キャラクター
    var Tile = (function () {
        function Tile(color, type, isWall) {
            this.color = color;
            this.type = type;
            this.isWall = isWall;
        }
        Tile.prototype.print = function (ctx, realPos) {
            ctx.fillStyle = this.color;
            switch (this.type) {
                case "square":
                    ctx.fillRect(realPos.x, realPos.y, view.unit_size.x, view.unit_size.y);
                    break;
                case "minisq":
                    var uw02 = view.unit_size.x * 0.2;
                    var uh02 = view.unit_size.y * 0.2;
                    ctx.fillRect(realPos.x + uw02, realPos.y + uh02, view.unit_size.x * 0.6, view.unit_size.y * 0.6);
                    break;
            }
        };
        return Tile;
    })();
    // タイルインスタンス
    model.tiles = {};
    model.tiles["floor"] = new Tile("rgba(20,40,40,1)", "square", false);
    model.tiles["wall"] = new Tile("rgba(50,30,10,1)", "square", true);
    model.tiles["player"] = new Tile("rgba(180,110,180,1)", "minisq", true);
    model.tiles["enemy1"] = new Tile("rgba(15,140,15,1)", "minisq", true);
    // 実際の配置物
    var Entity = (function () {
        function Entity(ux, uy, tile) {
            this.upos = new utils.Pos(ux, uy);
            this.tile = tile;
            this.anim_tasks = [];
        }
        Entity.of = function (upos, tile) {
            return new Entity(upos.x, upos.y, tile);
        };
        /**
         * アニメーション挿入，当たり判定もここでやる
         */
        Entity.prototype.move = function (udelta) {
            var moved = this.upos.add(udelta);
            if (moved.x >= 0 && moved.x < map.width &&
                moved.y >= 0 && moved.y < map.height &&
                utils.all(get_entities_at(moved), function (e) { return !e.tile.isWall; }) &&
                !map.field_at_tile(moved).isWall) {
                this.anim_tasks.push(new view.MoveAnim(this.upos));
                this.upos = moved;
            }
        };
        return Entity;
    })();
    model.Entity = Entity;
    // 実際の配置物のインスタンス
    model.entities = [];
    function initEntities() {
        map.makeMap();
        // enemy をランダムに数匹配置
        for (var i = 0; i < 5; i++) {
            var upos = randomUpos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
            model.entities.push(model.Entity.of(upos, model.tiles["enemy1"]));
        }
        // player を壁でないところにランダム配置
        var player_upos = randomUpos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
        model.player = new model.Entity(player_upos.x, player_upos.y, model.tiles["player"]);
        model.entities.push(model.player);
        // player を中心とする画面にする
        view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size);
    }
    model.initEntities = initEntities;
    /**
     * cond を満たす filed の upos をとる
     */
    function randomUpos(cond) {
        var upos;
        do {
            upos = new utils.Pos(utils.randInt(map.width), utils.randInt(map.height));
        } while (!cond(map.field_at(upos)));
        return upos;
    }
    model.dir = {
        down: new utils.Pos(0, 1),
        up: new utils.Pos(0, -1),
        left: new utils.Pos(-1, 0),
        right: new utils.Pos(1, 0),
        none: new utils.Pos(0, 0)
    };
    function move() {
        model.player.move(keys.dir_key);
        // monsters をランダムに移動させる
        for (var _i = 0; _i < model.entities.length; _i++) {
            var ent = model.entities[_i];
            if (ent == model.player)
                continue;
            ent.move(new utils.Pos(utils.randInt(2) - 1, utils.randInt(2) - 1));
        }
    }
    model.move = move;
    function get_entities_at(upos) {
        var ret = [];
        for (var _i = 0; _i < model.entities.length; _i++) {
            var v = model.entities[_i];
            if (v.upos.equals(upos)) {
                ret.push(v);
            }
        }
        return ret;
    }
    model.get_entities_at = get_entities_at;
})(model || (model = {}));
/**
 * keyboard の状態を管理する singleton
 */
var keys;
(function (keys) {
    keys.dir_key = model.dir.none;
    function keyReset() {
        keys.dir_key = model.dir.none;
    }
    keys.keyReset = keyReset;
})(keys || (keys = {}));
