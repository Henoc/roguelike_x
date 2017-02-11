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
    var Asset;
    (function (Asset) {
        Asset.assets = [
            { type: "image", name: "back", src: "assets/back.png" },
            { type: "image", name: "box", src: "assets/box.png" }
        ];
        Asset.images = [];
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
            image.src = asset.src;
            image.onload = onLoad;
            Asset.images[asset.name] = image;
        }
    })(Asset || (Asset = {}));
    function init() {
        canvas = document.getElementById('maincanvas');
        ctx = canvas.getContext('2d');
        canvas.width = view.window_usize.x * view.unit_size.x;
        canvas.height = view.window_usize.y * view.unit_size.y;
        ctx.textBaseline = "top";
        Asset.loadAssets(function () {
            requestAnimationFrame(update);
        });
        // エンティティの配置
        model.initEntities();
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
                            }
                            break;
                    }
                }
                else if (keys.dir_key.equals(model.dir.down)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] + 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key.equals(model.dir.up)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] - 1, 0, main.cursor_max[mode]);
                }
                break;
        }
        keys.keyReset();
        render();
    }
    function render() {
        view.print(ctx);
        //ctx.drawImage(Asset.images["back"],0,0)
        //ctx.drawImage(Asset.images["box"],mikanX,0)
    }
    function keydown(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:
                keys.dir_key = model.dir.left;
                break;
            case 38:
                keys.dir_key = model.dir.up;
                break;
            case 39:
                keys.dir_key = model.dir.right;
                break;
            case 40:
                keys.dir_key = model.dir.down;
                break;
            case 90:
                keys.z_key = true;
                break;
            case 88:
                keys.x_key = true;
            default:
                break;
        }
    }
    main.keydown = keydown;
})(main || (main = {}));
window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown);
