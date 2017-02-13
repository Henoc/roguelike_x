var main;
(function (main) {
    var canvas;
    var ctx;
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
    var point_dist_rate = {
        atk: 1, def: 1, effi: 2
    };
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
            { type: "image", name: "floor", src: "assets/floor.png", frames: 1 },
            { type: "image", name: "wall", src: "assets/wall.png", frames: 1 },
            { type: "image", name: "player_left", src: "assets/player_left.png", frames: 1 },
            { type: "image", name: "player_right", src: "assets/player_right.png", frames: 1 },
            { type: "image", name: "player_up", src: "assets/player_up.png", frames: 1 },
            { type: "image", name: "player_down", src: "assets/player_down.png", frames: 1 },
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
        canvas = document.getElementById('maincanvas');
        ctx = canvas.getContext('2d');
        canvas.width = view.window_usize.x * view.unit_size.x;
        canvas.height = view.window_usize.y * view.unit_size.y;
        ctx.textBaseline = "top";
        // image_frames
        Asset.assets.forEach(function (asset) {
            Asset.image_frames[asset.name] = asset.frames;
        });
        // エンティティの配置
        model.initEntities();
        Asset.loadAssets(function () {
            requestAnimationFrame(update);
        });
    }
    main.init = init;
    var lastTimestamp = null;
    function update(timestamp) {
        requestAnimationFrame(update);
        // key inputs
        switch (main.menu_mode[0]) {
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
                    }
                    else if (keys.c_key) {
                        main.menu_mode = ["dist"];
                        main.cursor["dist"] = 0;
                        main.cursor_max["dist"] = 3;
                        main.point_distributed = { atk: 0, def: 0, effi: 0, rest: battle.dist_point };
                    }
                }
                break;
            case "items":
                if (keys.x_key) {
                    main.menu_mode.pop();
                    if (main.menu_mode.length == 0)
                        main.menu_mode = ["explore"];
                }
                else if (keys.z_key) {
                    switch (main.menu_mode.join(">")) {
                        case "items":
                            if (main.cursor_max["items"] != 0) {
                                main.menu_mode.push("command");
                                var mode = main.menu_mode.join(">");
                                main.cursor[mode] = 0;
                                main.cursor_max[mode] = items.item_entities[main.cursor["items"]].item.commands.length;
                            }
                            break;
                        case "items>command":
                            var selected = items.item_entities[main.cursor["items"]];
                            switch (selected.item.commands[main.cursor["items>command"]]) {
                                case "use":
                                    model.player.status = model.player.status.add(selected.item.delta_status);
                                    items.item_entities.splice(main.cursor["items"], 1);
                                    main.cursor_max["items"]--;
                                    main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                    main.menu_mode.pop();
                                    break;
                                case "put":
                                    items.item_entities.splice(main.cursor["items"], 1);
                                    main.cursor_max["items"]--;
                                    main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                    main.menu_mode.pop();
                                    break;
                                case "equip":
                                    var old_eq = items.equips[selected.item.equip_region];
                                    if (old_eq.exist()) {
                                        items.item_entities.push(old_eq.get());
                                        main.cursor_max["items"]++;
                                    }
                                    items.equips[selected.item.equip_region] = utils.some(selected);
                                    model.player.status = model.tiles["player"].status.get().add(items.equips_status_sum());
                                    items.item_entities.splice(main.cursor["items"], 1);
                                    main.cursor_max["items"]--;
                                    main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                    main.menu_mode.pop();
                                    break;
                                case "decode":
                                    battle.add_exp(selected.item.more_props["exp"]);
                                    items.item_entities.splice(main.cursor["items"], 1);
                                    main.cursor_max["items"]--;
                                    main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                    main.menu_mode.pop();
                                default:
                                    throw "default reached";
                            }
                            break;
                        default:
                            throw "default reached";
                    }
                }
                else if (keys.dir_key2.equals(model.dir.down)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] + 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.up)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] - 1, 0, main.cursor_max[mode]);
                }
                break;
            case "dist":
                var mode = main.menu_mode.join(">");
                var dist_props = ["atk", "def", "effi"];
                if (keys.x_key || keys.c_key) {
                    main.menu_mode.pop();
                    if (main.menu_mode.length == 0)
                        main.menu_mode = ["explore"];
                }
                else if (keys.z_key) {
                    model.player.status.atk += main.point_distributed.atk;
                    model.player.status.def += main.point_distributed.def;
                    model.player.status.effi += main.point_distributed.effi;
                    main.point_distributed = { atk: 0, def: 0, effi: 0, rest: main.point_distributed.rest };
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
            default:
                throw "default reached";
        }
        keys.keyReset();
        render();
    }
    var render_cnt = 0;
    function render() {
        view.print(ctx, render_cnt);
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
})(main || (main = {}));
window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown);
window.addEventListener("keyup", main.keyup);
