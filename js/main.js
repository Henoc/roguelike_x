var main;
(function (main) {
    var canvas;
    var ctx;
    var buffer_canvas;
    var buffer_ctx;
    /**
     * expore, items
     */
    main.menu_mode = ["explore"];
    /**
     * cursur[menu_mode.join(">")] にカーソルの位置が入る
     */
    main.cursor = {};
    /**
     * max
     */
    main.cursor_max = {};
    var point_dist_rate = { atk: 1, def: 1, dex: 1, eva: 1 };
    /**
     * second per 60 frames
     */
    main.sp60f = 1;
    var Asset;
    (function (Asset) {
        Asset.assets = [
            { type: "image", name: "mame_mouse_left", src: "assets/mame_mouse_left.png", frames: 4 },
            { type: "image", name: "mame_mouse_right", src: "assets/mame_mouse_right.png", frames: 4 },
            { type: "image", name: "mame_mouse_up", src: "assets/mame_mouse_up.png", frames: 4 },
            { type: "image", name: "mame_mouse_down", src: "assets/mame_mouse_down.png", frames: 4 },
            { type: "image", name: "lang_dog_left", src: "assets/lang_dog_left.png", frames: 8 },
            { type: "image", name: "lang_dog_right", src: "assets/lang_dog_right.png", frames: 8 },
            { type: "image", name: "lang_dog_up", src: "assets/lang_dog_up.png", frames: 4 },
            { type: "image", name: "lang_dog_down", src: "assets/lang_dog_down.png", frames: 4 },
            { type: "image", name: "sacred_slime_left", src: "assets/sacred_slime_left.png", frames: 2 },
            { type: "image", name: "sacred_slime_right", src: "assets/sacred_slime_right.png", frames: 2 },
            { type: "image", name: "sacred_slime_up", src: "assets/sacred_slime_up.png", frames: 2 },
            { type: "image", name: "sacred_slime_down", src: "assets/sacred_slime_down.png", frames: 2 },
            { type: "image", name: "violent_ghost_left", src: "assets/violent_ghost_left.png", frames: 4 },
            { type: "image", name: "violent_ghost_right", src: "assets/violent_ghost_right.png", frames: 4 },
            { type: "image", name: "violent_ghost_up", src: "assets/violent_ghost_up.png", frames: 4 },
            { type: "image", name: "violent_ghost_down", src: "assets/violent_ghost_down.png", frames: 4 },
            { type: "image", name: "treasure_box", src: "assets/treasure_box.png", frames: 1 },
            { type: "image", name: "shadow_bird_left", src: "assets/shadow_bird_left.png", frames: 6 },
            { type: "image", name: "shadow_bird_right", src: "assets/shadow_bird_right.png", frames: 6 },
            { type: "image", name: "shadow_bird_up", src: "assets/shadow_bird_up.png", frames: 4 },
            { type: "image", name: "shadow_bird_down", src: "assets/shadow_bird_down.png", frames: 4 },
            { type: "image", name: "trolley_mouse_left", src: "assets/trolley_mouse_left.png", frames: 2 },
            { type: "image", name: "trolley_mouse_right", src: "assets/trolley_mouse_right.png", frames: 2 },
            { type: "image", name: "trolley_mouse_up", src: "assets/trolley_mouse_up.png", frames: 2 },
            { type: "image", name: "trolley_mouse_down", src: "assets/trolley_mouse_down.png", frames: 2 },
            { type: "image", name: "floor", src: "assets/floor.png", frames: 1 },
            { type: "image", name: "wall", src: "assets/wall.png", frames: 1 },
            { type: "image", name: "soil", src: "assets/soil.png", frames: 1 },
            { type: "image", name: "weed", src: "assets/weed.png", frames: 1 },
            { type: "image", name: "goal", src: "assets/goal.png", frames: 1 },
            { type: "image", name: "player_left", src: "assets/player_left.png", frames: 7 },
            { type: "image", name: "player_right", src: "assets/player_right.png", frames: 7 },
            { type: "image", name: "player_up", src: "assets/player_up.png", frames: 7 },
            { type: "image", name: "player_down", src: "assets/player_down.png", frames: 7 },
            { type: "image", name: "level_up", src: "assets/level_up.png", frames: 20 },
            { type: "image", name: "treasure", src: "assets/treasure.png", frames: 1 },
            { type: "image", name: "twinkle", src: "assets/twinkle.png", frames: 5 },
            { type: "image", name: "bom", src: "assets/bom.png", frames: 5 },
        ];
        Asset.images = {};
        Asset.image_frames = {};
        Asset.loadAssets = function (onComplete) {
            var total = Asset.assets.length;
            var loadCount = 0;
            function onLoad() {
                loadCount++;
                if (loadCount >= total) {
                    onComplete();
                }
            }
            Asset.assets.forEach(function (asset) {
                switch (asset.type) {
                    case "image":
                        loadImage(asset, onLoad);
                        break;
                }
            });
        };
        function loadImage(asset, onLoad) {
            var image = new Image();
            image.onload = onLoad;
            image.src = asset.src;
            Asset.images[asset.name] = image;
        }
    })(Asset = main.Asset || (main.Asset = {}));
    function init() {
        canvas = document.getElementById('canvas1');
        ctx = canvas.getContext('2d');
        canvas.width = view.window_w;
        canvas.height = view.window_h;
        canvas.addEventListener("touchstart", main.touchstart);
        canvas.addEventListener("touchmove", main.touchmove);
        ctx.textBaseline = "top";
        // buffer_canvas
        buffer_canvas = document.createElement("canvas");
        buffer_canvas.width = view.window_w;
        buffer_canvas.height = view.window_h;
        buffer_ctx = buffer_canvas.getContext("2d");
        buffer_ctx.textBaseline = "top";
        // image_frames
        Asset.assets.forEach(function (asset) {
            Asset.image_frames[asset.name] = asset.frames;
        });
        model.rank = 1;
        // エンティティの配置
        model.init_entities();
        // アイテム支給
        items.item_entities = [
            new items.ItemEntity(items.type.hamburger),
            new items.ItemEntity(items.type.hamburger),
            new items.ItemEntity(items.type.hamburger),
            new items.ItemEntity(items.type.potion),
            new items.ItemEntity(items.type.knife),
            new items.ItemEntity(items.type.revival),
            new items.ItemEntity(items.type.sharpener),
            new items.ItemEntity(items.type.sharpener),
            new items.ItemEntity(items.type.gourd),
            new items.ItemEntity(items.type.gourd),
            new items.ItemEntity(items.type.gunpowder),
        ];
        mkfrms.set_top_frame();
        mkfrms.set_explore_frame();
        Asset.loadAssets(function () {
            requestAnimationFrame(update);
        });
    }
    main.init = init;
    var lastTimestamp = null;
    function update(timestamp) {
        requestAnimationFrame(update);
        if (lastTimestamp != null) {
            main.sp60f = (timestamp - lastTimestamp) / 1000 * 60;
        }
        lastTimestamp = timestamp;
        // key inputs
        switch (main.menu_mode[0]) {
            case "dead":
                break;
            case "explore":
                if (!view.action_lock) {
                    var moved = keys.dir_key.add(model.player.upos);
                    if (!keys.dir_key.equals(model.dir.none) &&
                        /* 壁判定は move() と重複するが仕方なし */
                        map.inner(moved) &&
                        utils.all(model.get_entities_at(moved), function (e) { return !e.tile.isWall || e.status.hp == 0; }) &&
                        !map.field_at_tile(moved).isWall) {
                        model.move();
                    }
                    else if (keys.z_key) {
                        model.attack();
                    }
                    else if (keys.x_key) {
                        main.menu_mode = ["items"];
                        main.cursor["items"] = 0;
                        main.cursor_max["items"] = items.item_entities.length;
                        mkfrms.remove_explore_frame();
                        mkfrms.set_items_frame();
                    }
                    else if (keys.c_key) {
                        main.menu_mode = ["dist"];
                        main.cursor["dist"] = 0;
                        main.cursor_max["dist"] = 4;
                        main.point_distributed = { atk: 0, def: 0, dex: 0, eva: 0, rest: battle.dist_point };
                        mkfrms.remove_explore_frame();
                        mkfrms.set_dist_frame();
                    }
                }
                break;
            case "items":
                if (keys.x_key) {
                    switch (main.menu_mode.join(">")) {
                        case "items":
                            mkfrms.remove_items_frame();
                            mkfrms.set_explore_frame();
                            break;
                        case "items>command":
                            mkfrms.remove_command_frame();
                            break;
                        default:
                            throw "default reached";
                    }
                    main.menu_mode.pop();
                    if (main.menu_mode.length == 0)
                        main.menu_mode = ["explore"];
                }
                else if (keys.z_key) {
                    switch (main.menu_mode.join(">")) {
                        case "items":
                            if (main.cursor_max["items"] != 0) {
                                main.menu_mode.push("command");
                                var mode_1 = main.menu_mode.join(">");
                                main.cursor[mode_1] = 0;
                                main.cursor_max[mode_1] = items.item_entities[main.cursor["items"]].get_valid_commands().length;
                                mkfrms.set_command_frame();
                            }
                            break;
                        case "items>command":
                            var selected_1 = items.item_entities[main.cursor["items"]];
                            var selected_command_name = selected_1.get_valid_commands()[main.cursor["items>command"]];
                            if (selected_command_name.indexOf("cannot_") == 0) {
                            }
                            else
                                switch (selected_command_name) {
                                    case "use":
                                        if (selected_1.status.hp > 0)
                                            utils.start_tmp_num(selected_1.status.hp, "springgreen", model.player.upos.mul(view.unit_size));
                                        model.player.status = model.player.status.add(selected_1.status);
                                        var more_prop_names = ["effi", "heal"];
                                        more_prop_names.forEach(function (name) {
                                            if (name in selected_1.more_props)
                                                model.player.more_props[name] += selected_1.more_props[name];
                                        });
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "put":
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "equip":
                                        var old_eq = items.equips[selected_1.item.equip_region];
                                        if (old_eq.exist()) {
                                            items.item_entities.push(old_eq.get());
                                            main.cursor_max["items"]++;
                                        }
                                        items.equips[selected_1.item.equip_region] = utils.some(selected_1);
                                        var equipped_status = model.tiles["player"].status.get().add(items.equips_status_sum());
                                        equipped_status.max_hp = model.player.status.max_hp;
                                        equipped_status.hp = model.player.status.hp;
                                        model.player.status = equipped_status;
                                        model.player.more_props = items.equips_more_props_sum(model.player.more_props);
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "sharpen":
                                        var _a = selected_1.more_props["sharpen"], success_rate = _a[0], delta_atk = _a[1];
                                        if (Math.random() < success_rate) {
                                            items.equips["hand"].get().status.atk += delta_atk;
                                            utils.log.push(selected_1.item.name_jp + "で武器の強化... 成功! 武器攻撃力 +" + delta_atk);
                                        }
                                        else {
                                            items.equips["hand"].get().status.atk = utils.lower_bound(items.equips["hand"].get().status.atk - delta_atk, 0);
                                            utils.log.push(selected_1.item.name_jp + "で武器の強化... 失敗! 武器攻撃力 -" + delta_atk);
                                        }
                                        // 武器のステータスを変えたので装備計算を再度実行
                                        model.player.status = model.tiles["player"].status.get().add(items.equips_status_sum());
                                        model.player.more_props = items.equips_more_props_sum(model.player.more_props);
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "decode":
                                        battle.add_exp(selected_1.item.more_props["exp"]);
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "fill_with_gunpowder":
                                        var name_1 = selected_1.item.name;
                                        items.item_entities[main.cursor["items"]] = new items.ItemEntity(items.type[name_1 + "_bom"]);
                                        for (var i = 0; items.item_entities.length; i++) {
                                            if (items.item_entities[i].item.name == "gunpowder") {
                                                items.item_entities.splice(i, 1);
                                                break;
                                            }
                                        }
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        mkfrms.reflesh_items_frame();
                                        break;
                                    case "throw":
                                        mkfrms.hide_subframes_of_top(true);
                                        main.menu_mode = ["throw"];
                                        main.cursor["throw"] = model.dir.left;
                                        break;
                                    default:
                                        throw "default reached";
                                }
                            break;
                        default:
                            throw "default reached";
                    }
                }
                else if (keys.dir_key2.equals(model.dir.down)) {
                    var mode_2 = main.menu_mode.join(">");
                    main.cursor[mode_2] = utils.limit(main.cursor[mode_2] + 1, 0, main.cursor_max[mode_2]);
                }
                else if (keys.dir_key2.equals(model.dir.up)) {
                    var mode_3 = main.menu_mode.join(">");
                    main.cursor[mode_3] = utils.limit(main.cursor[mode_3] - 1, 0, main.cursor_max[mode_3]);
                }
                else if (keys.dir_key2.equals(model.dir.left)) {
                    var mode_4 = main.menu_mode.join(">");
                    main.cursor[mode_4] = utils.limit(main.cursor[mode_4] - 20, 0, main.cursor_max[mode_4]);
                }
                else if (keys.dir_key2.equals(model.dir.right)) {
                    var mode_5 = main.menu_mode.join(">");
                    main.cursor[mode_5] = utils.limit(main.cursor[mode_5] + 20, 0, main.cursor_max[mode_5]);
                }
                break;
            case "dist":
                var mode = main.menu_mode.join(">");
                var dist_props = ["atk", "def", "dex", "eva"];
                if (keys.x_key || keys.c_key) {
                    main.menu_mode.pop();
                    main.menu_mode = ["explore"];
                    mkfrms.remove_dist_frame();
                    mkfrms.set_explore_frame();
                }
                else if (keys.z_key) {
                    for (var _i = 0, dist_props_1 = dist_props; _i < dist_props_1.length; _i++) {
                        var name_2 = dist_props_1[_i];
                        model.player.status[name_2] += main.point_distributed[name_2];
                    }
                    main.point_distributed = { atk: 0, def: 0, dex: 0, eva: 0, rest: main.point_distributed.rest };
                    battle.dist_point = main.point_distributed.rest;
                }
                else if (keys.dir_key2.equals(model.dir.down)) {
                    main.cursor[mode] = utils.limit(main.cursor[mode] + 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.up)) {
                    main.cursor[mode] = utils.limit(main.cursor[mode] - 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.left)) {
                    if (main.point_distributed[dist_props[main.cursor[mode]]] > 0) {
                        main.point_distributed[dist_props[main.cursor[mode]]] -= point_dist_rate[dist_props[main.cursor[mode]]];
                        main.point_distributed.rest++;
                    }
                }
                else if (keys.dir_key2.equals(model.dir.right)) {
                    if (main.point_distributed.rest > 0) {
                        main.point_distributed.rest--;
                        main.point_distributed[dist_props[main.cursor[mode]]] += point_dist_rate[dist_props[main.cursor[mode]]];
                    }
                }
                break;
            case "throw":
                switch (main.menu_mode.join(">")) {
                    case "throw":
                        if (keys.z_key) {
                            var pos_fn = function (frm) { return model.player.upos.add(main.cursor["throw"].mul_bloadcast(frm / 2))
                                .mul(view.unit_size); };
                            // 爆弾が当たればアニメーション終了 & throw_attack により1ターン経過
                            var end_fn = function (pos) {
                                var bom_upos = utils.pos_to_upos(pos.add(view.unit_size.div_bloadcast(2)));
                                var ents = model.get_entities_at(bom_upos);
                                if (Math.abs(bom_upos.x - model.player.upos.x) >= 5 || Math.abs(bom_upos.y - model.player.upos.y) >= 5 || utils.exist(ents, function (ent) { return ent.tile.image_name != "player"; })) {
                                    model.throw_attack(ents.filter(function (ent) { return ent.tile.image_name != "player"; }), 30);
                                    mkfrms.remove_items_frame();
                                    mkfrms.set_explore_frame();
                                    main.menu_mode = ["explore"];
                                    return true;
                                }
                                return false;
                            };
                            utils.start_anim("bom", 4 / main.sp60f, false, pos_fn, view.unit_size, undefined, end_fn);
                            main.menu_mode.push("away");
                            items.item_entities.splice(main.cursor["items"], 1);
                            main.cursor_max["items"]--;
                            main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                        }
                        else if (keys.x_key) {
                            mkfrms.hide_subframes_of_top(false);
                            main.menu_mode = ["items", "command"];
                        }
                        else if (!keys.dir_key.equals(model.dir.none)) {
                            main.cursor["throw"] = keys.dir_key;
                        }
                        break;
                    case "throw>away":
                        // 投げているアニメーションの途中なので待機
                        break;
                    default:
                        throw "default reached";
                }
                break;
            default:
                throw "default reached";
        }
        keys.keyReset();
        render();
    }
    var render_cnt = 0;
    function render() {
        view.print(buffer_ctx, render_cnt);
        var imageData = buffer_ctx.getImageData(0, 0, view.window_w, view.window_h);
        ctx.putImageData(imageData, 0, 0);
        render_cnt++;
    }
    function keydown(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:
                keys.dir_key = model.dir.left;
                keys.dir_key2 = model.dir.left;
                break;
            case 38:
                keys.dir_key = model.dir.up;
                keys.dir_key2 = model.dir.up;
                break;
            case 39:
                keys.dir_key = model.dir.right;
                keys.dir_key2 = model.dir.right;
                break;
            case 40:
                keys.dir_key = model.dir.down;
                keys.dir_key2 = model.dir.down;
                break;
            case 90:
                keys.z_key = true;
                break;
            case 88:
                keys.x_key = true;
            case 67:
                keys.c_key = true;
            default:
                break;
        }
    }
    main.keydown = keydown;
    function keyup(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:
                if (keys.dir_key.equals(model.dir.left))
                    keys.dir_key = model.dir.none;
                break;
            case 38:
                if (keys.dir_key.equals(model.dir.up))
                    keys.dir_key = model.dir.none;
                break;
            case 39:
                if (keys.dir_key.equals(model.dir.right))
                    keys.dir_key = model.dir.none;
                break;
            case 40:
                if (keys.dir_key.equals(model.dir.down))
                    keys.dir_key = model.dir.none;
                break;
            default:
                break;
        }
    }
    main.keyup = keyup;
    function touchstart(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.targetTouches[0].clientX - rect.left;
        var y = e.targetTouches[0].clientY - rect.top;
        keys.touch_start_pos = utils.some(new utils.Pos(x, y));
    }
    main.touchstart = touchstart;
    function touchmove(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.changedTouches[0].clientX - rect.left;
        var y = e.changedTouches[0].clientY - rect.top;
        keys.touch_move_pos = utils.some(new utils.Pos(x, y));
    }
    main.touchmove = touchmove;
})(main || (main = {}));
window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown);
window.addEventListener("keyup", main.keyup);
