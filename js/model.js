var model;
(function (model) {
    // 壁，床，キャラクター
    var Tile = (function () {
        function Tile(jp_name, color, name, isWall, isDired, status, level, drop_list, more_props) {
            this.jp_name = jp_name;
            this.color = color;
            this.name = name;
            this.isWall = isWall;
            this.isDired = isDired;
            this.status = status;
            this.level = level;
            this.drop_list = drop_list;
            this.more_props = more_props;
        }
        Tile.prototype.print = function (ctx, realPos, direction, cnt) {
            ctx.fillStyle = this.color;
            var dired_image_name = this.name;
            if (direction != "none")
                dired_image_name += "_" + direction;
            var frms = main.Asset.image_frames[dired_image_name];
            ctx.drawImage(main.Asset.images[dired_image_name], 0, (Math.floor(cnt / utils.limit(Math.floor(utils.limit(64 / frms / main.sp60f, 1, 64)), 1, 64)) % frms) * view.unit_size.y, 32, 32, realPos.x, realPos.y, view.unit_size.x, view.unit_size.y);
        };
        return Tile;
    }());
    // タイルインスタンス
    model.tiles = {};
    model.tiles["floor"] = new Tile("\u5e8a", "rgba(20,40,40,1)", "floor", false, false, utils.none(), 0, [], {});
    model.tiles["wall"] = new Tile("\u58c1", "rgba(50,30,10,1)", "wall", true, false, utils.none(), 0, [], {});
    model.tiles["player"] = new Tile("\u30d7\u30ec\u30a4\u30e4\u30fc", "rgba(180,110,180,1)", "player", true, true, utils.some(new battle.Status(10, 10, 1, 0, 20, 10)), 1, [], {});
    model.tiles["mame_mouse"] = new Tile("\u8C46\u306D\u305A\u307F", "rgba(15,140,15,1)", "mame_mouse", true, true, utils.some(new battle.Status(2, 2, 1, 0)), 1, [{ name: "soramame_head", per: 0.2 }, { name: "mame_mouse_ibukuro", per: 0.05 }], {});
    model.tiles["lang_dog"] = new Tile("\u4EBA\u8A9E\u3092\u89E3\u3059\u72AC", "", "lang_dog", true, true, utils.some(new battle.Status(3, 3, 1, 0)), 2, [{ name: "lang_dog_shoes", per: 0.2 }, { name: "lang_dog_paper", per: 0.03 }], {});
    model.tiles["sacred_slime"] = new Tile("\u8056\u30B9\u30E9\u30A4\u30E0", "", "sacred_slime", true, true, utils.some(new battle.Status(4, 4, 2, 1)), 3, [{ name: "potion", per: 0.1 }], { revive: 5 });
    // 実際の配置物
    var Entity = (function () {
        function Entity(ux, uy, tile) {
            this.upos = new utils.Pos(ux, uy);
            this.tile = tile;
            this.status = tile.status.get();
            this.level = tile.level;
            this.anim_tasks = [];
            this.direction = tile.isDired ? "down" : "none";
            this.more_props = utils.shallow_copy(tile.more_props);
        }
        Entity.of = function (upos, tile) {
            return new Entity(upos.x, upos.y, tile);
        };
        Entity.prototype.print = function (ctx, realPos, cnt) {
            this.tile.print(ctx, realPos, this.direction, this.status.hp != 0 ? cnt : 0);
            if (this.status.hp != 0) {
                ctx.fillStyle = "white";
                var font_size = view.window_usize.y * view.unit_size.y / 40;
                ctx.font = "normal " + font_size + "px sans-serif";
                utils.fillText_n(ctx, this.tile.jp_name + "\n" + this.status.hp + "/" + this.status.max_hp, realPos.x, realPos.y - view.unit_size.y, font_size, font_size);
            }
        };
        /**
         * アニメーション挿入，当たり判定もここでやる
         */
        Entity.prototype.move = function (udelta) {
            // change character direction
            if (udelta.x > 0 && udelta.y == 0)
                this.direction = "right";
            if (udelta.x < 0 && udelta.y == 0)
                this.direction = "left";
            if (udelta.x == 0 && udelta.y < 0)
                this.direction = "up";
            if (udelta.x == 0 && udelta.y > 0)
                this.direction = "down";
            var moved = this.upos.add(udelta);
            if (map.inner(moved) &&
                utils.all(get_entities_at(moved), function (e) { return !e.tile.isWall || e.status.hp == 0; }) &&
                !map.field_at_tile(moved).isWall) {
                this.anim_tasks.push(new view.MoveAnim(this.upos));
                this.upos = moved;
                // 落ちているものを拾う
                var picked_names = [];
                for (var _i = 0, _a = delete_entities_at(moved, function (ent) { return ent.status.hp == 0; }); _i < _a.length; _i++) {
                    var dead = _a[_i];
                    if (dead.tile.name == "player")
                        continue;
                    var pickeds = [new items.ItemEntity(items.type["dead_" + dead.tile.name])];
                    dead.tile.drop_list.forEach(function (obj) {
                        if (Math.random() < obj.per)
                            pickeds.push(new items.ItemEntity(items.type[obj.name]));
                    });
                    pickeds.forEach(function (picked) {
                        items.item_entities.push(picked);
                        picked_names.push(picked.item.name);
                    });
                }
                // tmp frame で記述
                if (picked_names.length != 0)
                    view.tmp_frame = utils.some(new view.TmpFrame(picked_names));
            }
        };
        Entity.prototype.attack = function () {
            // 壁を壊す | 攻撃する
            for (var _i = 0, dir_ary_1 = model.dir_ary; _i < dir_ary_1.length; _i++) {
                var v = dir_ary_1[_i];
                var directed = this.upos.add(v);
                if (!map.inner(directed))
                    continue;
                if (map.field_at_tile(directed).isWall) {
                    map.field_set_by_name(directed, "floor");
                }
                // 誰かいれば当たる
                for (var _a = 0, _b = get_entities_at(directed); _a < _b.length; _a++) {
                    var entity = _b[_a];
                    if (entity.status.hp == 0)
                        continue;
                    entity.status = this.status.attackTo(entity);
                    if (entity.status.hp == 0)
                        battle.add_exp(Math.floor(1 * Math.pow(1.2, entity.level)));
                }
            }
            this.anim_tasks.push(new view.AttackAnim());
        };
        /**
         * that が隣接しているか
         */
        Entity.prototype.reach = function (that) {
            for (var _i = 0, dir_ary_2 = model.dir_ary; _i < dir_ary_2.length; _i++) {
                var v = dir_ary_2[_i];
                var directed = this.upos.add(v);
                if (that.upos.equals(directed))
                    return true;
            }
            return false;
        };
        Entity.prototype.near = function (that, r) {
            return Math.sqrt(Math.pow(this.upos.x - that.upos.x, 2) + Math.pow(this.upos.y - that.upos.y, 2)) < r;
        };
        Entity.prototype.dir_to = function (that) {
            if (that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y)
                return "down";
            if (that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)
                return "up";
            if (that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)
                return "left";
            if (that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y)
                return "right";
            if (that.upos.y == (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y)
                return utils.randInt(2) == 0 ? "down" : "right";
            if (that.upos.y == (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)
                return utils.randInt(2) == 0 ? "up" : "left";
            if (that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y == -(that.upos.x - this.upos.x) + this.upos.y)
                return utils.randInt(2) == 0 ? "down" : "left";
            if (that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y == -(that.upos.x - this.upos.x) + this.upos.y)
                return utils.randInt(2) == 0 ? "up" : "right";
            return "down";
        };
        return Entity;
    }());
    model.Entity = Entity;
    // 実際の配置物のインスタンス
    model.entities = [];
    function initEntities() {
        map.makeMap();
        // enemy をランダムに数匹配置
        for (var i = 0; i < 50; i++) {
            var upos = randomUpos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
            var ptn = [];
            ptn[0] = "mame_mouse";
            ptn[1] = "lang_dog";
            ptn[2] = "sacred_slime";
            model.entities.push(model.Entity.of(upos, model.tiles[ptn[utils.randInt(3)]]));
        }
        // player を壁でないところにランダム配置
        var player_upos = randomUpos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
        model.player = new model.Entity(player_upos.x, player_upos.y, model.tiles["player"]);
        model.entities.push(model.player);
        // player を中心とする画面にする
        view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size);
        // items
        items.item_entities = [
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.potion),
            new items.ItemEntity(items.type.knife),
            new items.ItemEntity(items.type.flying_pan),
        ];
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
    model.dir_ary = [model.dir.down, model.dir.up, model.dir.left, model.dir.right];
    function move() {
        monsters_action();
        model.player.move(keys.dir_key);
        on_each_actions();
    }
    model.move = move;
    function attack() {
        model.player.attack();
        monsters_action();
        on_each_actions();
    }
    model.attack = attack;
    model.action_counters = {
        effi: 0,
        heal: 0
    };
    /**
     * hungry
     */
    function on_each_actions() {
        if (model.action_counters.effi >= model.player.status.effi) {
            model.player.status.max_hp = utils.limit(model.player.status.max_hp - 1, 0, model.player.status.max_hp);
            model.player.status.hp = utils.limit(model.player.status.hp, 0, model.player.status.max_hp + 1);
            model.action_counters.effi = 0;
        }
        if (model.action_counters.heal >= model.player.status.heal) {
            model.player.status.hp = utils.limit(model.player.status.hp + 1, 0, model.player.status.max_hp + 1);
            model.action_counters.heal = 0;
        }
        model.action_counters.effi++;
        model.action_counters.heal++;
        if (model.player.status.hp == 0)
            main.menu_mode = ["dead"];
    }
    function monsters_action() {
        // monsters をランダムに移動させる
        for (var _i = 0, entities_1 = model.entities; _i < entities_1.length; _i++) {
            var ent = entities_1[_i];
            if (ent == model.player)
                continue;
            if (ent.status.hp == 0) {
                // additional property: revive
                if ("revive" in ent.more_props && ent.more_props["revive"] > 0) {
                    ent.more_props["revive"]--;
                    if (ent.more_props["revive"] == 0) {
                        ent.status = ent.tile.status.get();
                        ent.more_props = utils.shallow_copy(ent.tile.more_props);
                    }
                }
                continue;
            }
            if (ent.reach(model.player)) {
                ent.direction = ent.dir_to(model.player);
                ent.attack();
            }
            else if (ent.near(model.player, 4)) {
                ent.move(model.dir[ent.dir_to(model.player)]);
            }
            else {
                ent.move(model.dir_ary[utils.randInt(4)]);
            }
        }
    }
    function get_entities_at(upos) {
        var ret = [];
        for (var _i = 0, entities_2 = model.entities; _i < entities_2.length; _i++) {
            var v = entities_2[_i];
            if (v.upos.equals(upos)) {
                ret.push(v);
            }
        }
        return ret;
    }
    model.get_entities_at = get_entities_at;
    function delete_entities_at(upos, cond) {
        var ret = [];
        for (var i = 0; i < model.entities.length; i++) {
            if (model.entities[i].upos.equals(upos) && cond(model.entities[i])) {
                ret.push(model.entities[i]);
                model.entities.splice(i, 1);
                i--;
            }
        }
        return ret;
    }
    model.delete_entities_at = delete_entities_at;
})(model || (model = {}));
/**
 * keyboard の状態を管理する singleton
 */
var keys;
(function (keys) {
    /**
     * continuouse key press looking by keydown & keyup
     */
    keys.dir_key = model.dir.none;
    /**
     * original keydown
     */
    keys.dir_key2 = model.dir.none;
    keys.z_key = false;
    keys.x_key = false;
    keys.c_key = false;
    function keyReset() {
        //dir_key = model.dir.none
        keys.dir_key2 = model.dir.none;
        keys.z_key = false;
        keys.x_key = false;
        keys.c_key = false;
    }
    keys.keyReset = keyReset;
})(keys || (keys = {}));
