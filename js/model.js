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
    /**
     * エンティティの型
     *
     * more_props:
     * no_attack 攻撃しない，移動しない
     * no_damage 攻撃を受けない
     * revive(x) HP0になったxターン後に復活
     * hide 移動の間にキャラが表示されない
     * camouflage(x) プレイヤー専用．x%敵の視力が下がる．元は半径4マス．
     */
    model.tiles = {};
    model.tiles["floor"] = new Tile("\u5e8a", "rgba(20,40,40,1)", "floor", false, false, utils.none(), 0, [], {});
    model.tiles["wall"] = new Tile("\u58c1", "rgba(50,30,10,1)", "wall", true, false, utils.none(), 0, [], {});
    model.tiles["player"] = new Tile("\u30d7\u30ec\u30a4\u30e4\u30fc", "rgba(180,110,180,1)", "player", true, true, utils.some(new battle.Status(10, 10, 1, 0, 0, 0)), 1, [{ name: "potion", per: 1 }], { effi: 20, heal: 13 });
    model.tiles["goal"] = new Tile("\u30B4\u30FC\u30EB", "", "goal", false, false, utils.some(new battle.Status(1, 1, 0, 0, 0, 0)), 0, [], { no_attack: true, no_damage: true });
    model.tiles["mame_mouse"] = new Tile("\u8C46\u306D\u305A\u307F", "rgba(15,140,15,1)", "mame_mouse", true, true, utils.some(new battle.Status(2, 2, 1, 0, 0, 0)), 1, [{ name: "soramame_head", per: 0.2 }, { name: "mame_mouse_ibukuro", per: 0.05 }], {});
    model.tiles["lang_dog"] = new Tile("\u4EBA\u8A9E\u3092\u89E3\u3059\u72AC", "", "lang_dog", true, true, utils.some(new battle.Status(3, 3, 1, 0, 0, 0)), 2, [{ name: "lang_dog_shoes", per: 0.2 }, { name: "lang_dog_paper", per: 0.03 }], {});
    model.tiles["sacred_slime"] = new Tile("\u8056\u30B9\u30E9\u30A4\u30E0", "", "sacred_slime", true, true, utils.some(new battle.Status(4, 4, 2, 1, 0, 0)), 3, [{ name: "dead_sacred_slime", per: 1 }, { name: "potion", per: 0.1 }, { name: "revival", per: 0.01 }], { revive: 5 });
    model.tiles["violent_ghost"] = new Tile("\u66B4\u308C\u30B4\u30FC\u30B9\u30C8", "", "violent_ghost", true, true, utils.some(new battle.Status(4, 4, 3, 0, 0, 0)), 4, [{ name: "candle", per: 0.2 }, { name: "ghost_camouflage", per: 0.05 }], { hide: true });
    model.tiles["treasure_box"] = new Tile("\u5B9D\u7BB1", "", "treasure_box", true, false, utils.some(new battle.Status(10, 10, 0, 4, 0, 0)), 4, [
        { name: "knife", per: 0.7 }, { name: "copper_armor", per: 0.7 }, { name: "silver_knife", per: 0.3 }, { name: "iron_armor", per: 0.3 }, { name: "gold_knife", per: 0.1 }, { name: "gold_armor", per: 0.1 }, { name: "sharpener", per: 0.2 }, { name: "magic_sharpener", per: 0.1 }, { name: "fairy_sharpener", per: 0.05 }, { name: "dragon_sharpener", per: 0.025 }
    ], { no_attack: true });
    // 実際の配置物
    var Entity = (function () {
        function Entity(ux, uy, tile) {
            var _this = this;
            this.upos = new utils.Pos(ux, uy);
            this.tile = tile;
            this.status = tile.status.get();
            this.level = tile.level;
            this.anim_tasks = [];
            this.direction = tile.isDired ? "down" : "none";
            this.more_props = utils.shallow_copy(tile.more_props);
            this.treasures = [];
            tile.drop_list.forEach(function (t) {
                if (t.per > Math.random())
                    _this.treasures.push(t.name);
            });
        }
        Entity.of = function (upos, tile) {
            return new Entity(upos.x, upos.y, tile);
        };
        Entity.prototype.print = function (ctx, realPos, cnt) {
            if ("hide" in this.more_props && this.more_props["hide"]) {
            }
            else if (this.status.hp != 0) {
                this.tile.print(ctx, realPos, this.direction, cnt);
                ctx.fillStyle = "white";
                var font_size = view.window_usize.y * view.unit_size.y / 40;
                ctx.font = "normal " + font_size + "px sans-serif";
                utils.fillText_n(ctx, this.tile.jp_name + ("no_damage" in this.more_props ? "" : "\n" + this.status.hp + "/" + this.status.max_hp), realPos.x, realPos.y - view.unit_size.y, font_size, font_size);
            }
            else {
                ctx.drawImage(main.Asset.images["treasure"], 0, 0, 32, 32, realPos.x, realPos.y, view.unit_size.x, view.unit_size.y);
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
                if (this.tile.name == "player") {
                    var picked_names_1 = [];
                    var picked_max_1 = items.item_entities_max - items.item_entities.length;
                    var max_flag_1 = false;
                    for (var _i = 0, _a = delete_entities_at(moved, function (ent) { return ent.status.hp == 0; }); _i < _a.length; _i++) {
                        var dead = _a[_i];
                        dead.treasures.forEach(function (t) {
                            if (picked_names_1.length < picked_max_1) {
                                items.item_entities.push(new items.ItemEntity(items.type[t]));
                                picked_names_1.push(items.type[t].name);
                            }
                            else
                                max_flag_1 = true;
                        });
                    }
                    // tmp frame
                    if (picked_names_1.length != 0) {
                        for (var _b = 0, picked_names_2 = picked_names_1; _b < picked_names_2.length; _b++) {
                            var v = picked_names_2[_b];
                            utils.start_tmp_frame(v + " \u3092\u53D6\u5F97");
                        }
                    }
                    if (max_flag_1)
                        utils.start_tmp_frame("\u30A2\u30A4\u30C6\u30E0\u304C\u4E00\u676F\u3067\u3059!");
                }
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
                    if (entity.status.hp == 0 || "no_damage" in entity.more_props)
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
    /**
     * character instances. Entity has Tile instance, a Tile is an abstract character or floor object.
     */
    model.entities = [];
    function init_entities() {
        map.make_map();
        // enemy をランダムに数匹配置
        for (var i = 0; i < 20; i++) {
            var upos = random_upos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
            var ptn = [];
            ptn[0] = "mame_mouse";
            ptn[1] = "lang_dog";
            ptn[2] = "sacred_slime";
            ptn[3] = "violent_ghost";
            ptn[4] = "treasure_box";
            model.entities.push(model.Entity.of(upos, model.tiles[ptn[utils.randInt(5)]]));
        }
        // player を壁でないところにランダム配置
        var player_upos = random_upos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
        if (model.player == undefined)
            model.player = new model.Entity(player_upos.x, player_upos.y, model.tiles["player"]);
        else {
            model.player.upos = player_upos;
        }
        model.entities.push(model.player);
        // goal
        var goal_upos = random_upos(function (n) { return !model.tiles[map.entity_names[n]].isWall; });
        model.goal = new model.Entity(goal_upos.x, goal_upos.y, model.tiles["goal"]);
        model.entities.push(model.goal);
        // player を中心とする画面にする
        view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size);
    }
    model.init_entities = init_entities;
    /**
     * cond を満たす filed の upos をとる
     */
    function random_upos(cond) {
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
        if (model.action_counters.effi >= model.player.more_props["effi"]) {
            model.player.status.max_hp = utils.limit(model.player.status.max_hp - 1, 0, model.player.status.max_hp);
            model.player.status.hp = utils.limit(model.player.status.hp, 0, model.player.status.max_hp + 1);
            model.action_counters.effi = 0;
            utils.start_tmp_frame("\u304A\u8179\u304C\u7A7A\u3044\u305F(\u6700\u5927HP-1)");
        }
        if (model.action_counters.heal >= model.player.more_props["heal"]) {
            model.player.status.hp = utils.limit(model.player.status.hp + 1, 0, model.player.status.max_hp + 1);
            model.action_counters.heal = 0;
            utils.start_tmp_frame("\u5C11\u3057\u75B2\u308C\u304C\u53D6\u308C\u305F(HP+1)");
        }
        model.action_counters.effi++;
        model.action_counters.heal++;
        if (model.player.status.hp == 0) {
            utils.start_tmp_frame("\u6B7B\u3093\u3067\u3057\u307E\u3063\u305F");
            // item property: revive
            for (var i = 0; i < items.item_entities.length; i++) {
                var ent = items.item_entities[i];
                if ("revive" in ent.more_props) {
                    model.player.status.max_hp = utils.limit(model.player.status.max_hp, ent.more_props["revive"], model.player.status.max_hp + 1);
                    model.player.status.hp = ent.more_props["revive"];
                    for (var j = 0; j < 9; j++) {
                        var delta_upos = new utils.Pos(j % 3 - 1, Math.floor(j / 3) - 1);
                        utils.start_anim("twinkle", 2, model.player.upos.add(delta_upos).mul(view.unit_size).sub(view.prefix_pos), new utils.Pos(32, 32), 12);
                    }
                    items.item_entities.splice(i, 1);
                    utils.start_tmp_frame("\u8607\u751F\u85AC\u3067\u751F\u304D\u8FD4\u3063\u305F");
                    break;
                }
            }
            if (model.player.status.hp == 0)
                main.menu_mode = ["dead"];
        }
        for (var i = 0; i < model.entities.length; i++) {
            if (model.entities[i].status.hp == 0 && model.entities[i].treasures.length == 0) {
                model.entities.splice(i, 1);
                i--;
            }
        }
        if (model.player.upos.equals(model.goal.upos)) {
            model.entities = [];
            model.rank++;
            init_entities();
            utils.start_tmp_frame(model.rank + "\u968E\u306B\u5230\u9054\u3057\u305F");
        }
    }
    function monsters_action() {
        // monsters をランダムに移動させる
        for (var _i = 0, entities_1 = model.entities; _i < entities_1.length; _i++) {
            var ent = entities_1[_i];
            if (ent == model.player || "no_attack" in ent.more_props)
                continue;
            if (ent.status.hp == 0) {
                // additional property: revive
                if ("revive" in ent.more_props && ent.more_props["revive"] > 0) {
                    ent.more_props["revive"]--;
                    if (ent.more_props["revive"] == 0) {
                        ent.status = ent.tile.status.get();
                        ent.more_props = utils.shallow_copy(ent.tile.more_props);
                        utils.start_tmp_frame(ent.tile.jp_name + "\u304C\u8607\u751F\u3057\u305F!");
                    }
                }
                continue;
            }
            // property: hide
            if (ent.reach(model.player)) {
                ent.direction = ent.dir_to(model.player);
                ent.attack();
                if ("hide" in ent.more_props && ent.more_props["hide"]) {
                    ent.more_props["hide"] = false;
                    utils.start_tmp_frame(ent.tile.jp_name + "\u304C\u59FF\u3092\u8868\u3057\u305F!");
                }
            }
            else if (ent.near(model.player, 4 * ("camouflage" in model.player.more_props ? (1 - model.player.more_props["camouflage"]) : 1))) {
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
            if (model.entities[i].tile.name != "player" && model.entities[i].upos.equals(upos) && cond(model.entities[i])) {
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
    keys.touch_start_pos = utils.none();
    keys.touch_move_pos = utils.none();
    function keyReset() {
        //dir_key = model.dir.none
        keys.dir_key2 = model.dir.none;
        keys.z_key = false;
        keys.x_key = false;
        keys.c_key = false;
        keys.touch_start_pos = utils.none();
        keys.touch_move_pos = utils.none();
    }
    keys.keyReset = keyReset;
})(keys || (keys = {}));
