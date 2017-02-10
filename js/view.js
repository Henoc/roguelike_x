var view;
(function (view) {
    view.window_usize = new utils.Pos(640 / 32, 480 / 32);
    view.unit_size = new utils.Pos(32, 32);
    view.prefix_pos = new utils.Pos(0, 0);
    var PROGRESS = 0.2;
    /**
     * animation 中なので key 入力をブロック
     * print() 内で更新する
     */
    view.action_lock = false;
    var MoveAnim = (function () {
        function MoveAnim(pre_upos) {
            this.pre_upos = pre_upos;
            this.progress = 0;
        }
        MoveAnim.prototype.advance = function () {
            this.progress += PROGRESS;
            if (this.progress >= 1) {
                this.progress = 1;
                return true;
            }
            return false;
        };
        MoveAnim.prototype.get_upos = function (current_upos) {
            return this.pre_upos.mul_bloadcast(1 - this.progress).add(current_upos.mul_bloadcast(this.progress));
        };
        return MoveAnim;
    }());
    view.MoveAnim = MoveAnim;
    var AttackAnim = (function () {
        function AttackAnim() {
            this.progress = 0;
        }
        AttackAnim.prototype.advance = function () {
            this.progress += PROGRESS;
            if (this.progress >= 1) {
                this.progress = 1;
                return true;
            }
            return false;
        };
        AttackAnim.prototype.get_upos = function (current_upos) {
            var theta = Math.PI * 2 * this.progress;
            return current_upos.add(new utils.Pos(Math.cos(theta), Math.sin(theta)).mul_bloadcast(0.4));
        };
        return AttackAnim;
    }());
    view.AttackAnim = AttackAnim;
    function print(ctx) {
        ctx.clearRect(0, 0, view.window_usize.x * view.unit_size.x, view.window_usize.y * view.unit_size.y);
        // 画面外は黒
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, view.window_usize.x * view.unit_size.x, view.window_usize.y * view.unit_size.y);
        // player を中心とする画面にする
        var tmp = model.player.upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size);
        view.prefix_pos = tmp.sub(view.prefix_pos).map(function (d) { return utils.limit(d, -view.unit_size.x * PROGRESS, view.unit_size.x * PROGRESS); }).add(view.prefix_pos);
        // draw a map
        for (var i = 0; i < map.height; i++) {
            for (var j = 0; j < map.width; j++) {
                var upos = new utils.Pos(j, i);
                var realPos = upos.mul(view.unit_size).sub(view.prefix_pos);
                var field_tile = map.field_at_tile(upos);
                field_tile.print(ctx, realPos);
            }
        }
        view.action_lock = false;
        // エンティティを描画
        for (var _i = 0, _a = model.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            // アニメーションがあれば
            var entity_upos = entity.upos;
            if (entity.anim_tasks.length != 0) {
                view.action_lock = true;
                var firstAnim = entity.anim_tasks[0];
                // アニメーション更新
                if (firstAnim.advance()) {
                    entity.anim_tasks.shift();
                }
                entity_upos = firstAnim.get_upos(entity.upos);
            }
            var realEntityPos = entity_upos.mul(view.unit_size).sub(view.prefix_pos);
            entity.print(ctx, realEntityPos);
        }
        // menu mode = items
        if (main.menu_mode[0] == "items") {
            var window_w = view.window_usize.x * view.unit_size.x;
            var window_h = view.window_usize.y * view.unit_size.y;
            var top_frame = new utils.Frame(0, 0, window_w, window_h, window_h * 0.05, "rgba(0,0,0,0)");
            top_frame.move_point_x(0.6);
            var item_top = top_frame.insert_subframe(utils.none(), utils.none(), "rgba(0,0,0,0.6)");
            item_top.font_size = window_h / 32;
            item_top.insert_text("\u30A2\u30A4\u30C6\u30E0");
            for (var i = 0; i < items.item_entities.length; i++) {
                var itemEntity = items.item_entities[i];
                item_top.insert_text((main.cursor["items"] == i ? ">" : " ") + itemEntity.item.name);
            }
            top_frame.reset_point();
            var status_frame = top_frame.insert_subframe(utils.some(window_w * 0.3), utils.some(window_h * 0.5), "rgba(0,0,0,0.6)");
            status_frame.insert_text("\u30B9\u30C6\u30FC\u30BF\u30B9");
            var add_status = items.item_entities[main.cursor["items"]].item.add_status;
            var modified_status = model.player.status.add(add_status);
            status_frame.insert_text("hp " + model.player.status.hp + "/" + model.player.status.max_hp
                + (add_status.hp != 0 || add_status.max_hp != 0 ? " \u2192 " + modified_status.hp + "/" + modified_status.max_hp : ""));
            status_frame.insert_text("atk " + model.player.status.atk
                + (add_status.atk != 0 ? " \u2192 " + modified_status.atk : ""));
            status_frame.insert_text("def " + model.player.status.def
                + (add_status.def != 0 ? " \u2192 " + modified_status.def : ""));
            top_frame.move_point_y(0.1);
            var message = top_frame.insert_subframe(utils.some(window_w * 0.5), utils.none(), "rgba(0,0,0,0.6)");
            message.insert_text(items.item_entities[main.cursor["items"]].item.text);
            top_frame.print(ctx);
        }
        // menu mode
        ctx.fillStyle = "white";
        ctx.fillText(main.menu_mode.join(" > "), 0, 0);
    }
    view.print = print;
})(view || (view = {}));
