var view;
(function (view) {
    view.window_usize = new utils.Pos(640 / 32, 480 / 32);
    view.unit_size = new utils.Pos(32, 32);
    view.prefix_pos = new utils.Pos(0, 0);
    view.window_w = view.window_usize.x * view.unit_size.x;
    view.window_h = view.window_usize.y * view.unit_size.y;
    function progress_rate() {
        return 0.2 * main.sp60f;
    }
    view.progress_rate = progress_rate;
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
            this.progress += progress_rate();
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
            this.progress += progress_rate();
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
    function print(ctx, cnt) {
        ctx.clearRect(0, 0, view.window_w, view.window_h);
        // 画面外は黒
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, view.window_w, view.window_h);
        // player を中心とする画面にする
        var tmp = model.player.upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size);
        view.prefix_pos = tmp.sub(view.prefix_pos).map(function (d) { return utils.limit(d, -view.unit_size.x * progress_rate(), view.unit_size.x * progress_rate()); }).add(view.prefix_pos);
        // draw a map
        for (var i = 0; i < map.height; i++) {
            for (var j = 0; j < map.width; j++) {
                var upos = new utils.Pos(j, i);
                var realPos = upos.mul(view.unit_size).sub(view.prefix_pos);
                var field_tile = map.field_at_tile(upos);
                field_tile.print(ctx, realPos, "none", cnt);
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
            entity.print(ctx, realEntityPos, cnt);
        }
        var top_frame = new utils.Frame(0, 0, view.window_w, view.window_h, view.window_h * 0.03, "rgba(0,0,0,0)", 1);
        utils.frame_tasks.push(top_frame);
        if (main.menu_mode[0] == "explore") {
            // hp gage
            top_frame.font_size = view.window_h / 32;
            top_frame.insert_text(model.rank + "\u968E");
            top_frame.insert_text("level " + model.player.level + "  next " + Math.floor(battle.player_exp) + "/" + battle.max_exp());
            top_frame.insert_text("HP " + model.player.status.hp + "/" + model.player.status.max_hp);
            var max_hp_frame_w = view.window_w * model.player.status.max_hp / 100;
            var max_hp_frame = top_frame.insert_subframe(utils.some(max_hp_frame_w), utils.some(view.window_h * 0.03), "rgba(0,0,0,1)", view.window_h * 0.002);
            max_hp_frame.insert_subframe(utils.some((max_hp_frame_w - max_hp_frame.margin * 2) * model.player.status.hp / model.player.status.max_hp), utils.none(), "rgba(0,200,50,1)");
        }
        else if (main.menu_mode[0] == "items") {
            top_frame.move_point_x(0.6);
            var item_top = top_frame.insert_subframe(utils.none(), utils.none(), "rgba(0,0,0,0.6)");
            var page_size = 20;
            var page_no = Math.floor(main.cursor["items"] / page_size);
            var page_max = Math.floor((main.cursor_max["items"] - 1) / page_size);
            item_top.font_size = view.window_h / 32;
            item_top.insert_text("\u30A2\u30A4\u30C6\u30E0 (\u30DA\u30FC\u30B8 " + (page_no + 1) + "/" + (page_max + 1) + ")");
            item_top.insert_text("");
            for (var i = page_no * page_size; i < Math.min((page_no + 1) * page_size, items.item_entities.length); i++) {
                var itemEntity = items.item_entities[i];
                item_top.insert_text((main.cursor["items"] == i ? ">" : " ") + itemEntity.item.name);
            }
            top_frame.reset_point();
            var status_frame = top_frame.insert_subframe(utils.some(view.window_w * 0.3), utils.some(view.window_h * 0.5), "rgba(0,0,0,0.6)");
            status_frame.insert_text("\u30B9\u30C6\u30FC\u30BF\u30B9");
            // 装備品と食べ物でステータス変動の計算が異なる（装備品は付け替えることがある）
            var modified_status = battle.Status.zero();
            var delta_status = battle.Status.zero();
            if (main.cursor_max["items"] != 0) {
                if (items.item_entities[main.cursor["items"]].item.equip_region == "none") {
                    delta_status = items.item_entities[main.cursor["items"]].status;
                    modified_status = model.player.status.add(delta_status);
                }
                else {
                    var item_entity = items.item_entities[main.cursor["items"]];
                    delta_status = item_entity.status;
                    modified_status = model.player.tile.status.get().add(items.equips_status_sum_replace(item_entity));
                }
            }
            status_frame.insert_text("HP " + model.player.status.hp + "/" + model.player.status.max_hp
                + (delta_status.hp != 0 || delta_status.max_hp != 0 ? " \u2192 " + modified_status.hp + "/" + modified_status.max_hp : ""));
            status_frame.insert_text("\u653B\u6483 " + model.player.status.atk
                + (delta_status.atk != 0 ? " \u2192 " + modified_status.atk : ""));
            status_frame.insert_text("\u9632\u5FA1 " + model.player.status.def
                + (delta_status.def != 0 ? " \u2192 " + modified_status.def : ""));
            status_frame.insert_text("\u547D\u4E2D " + model.player.status.dex + (delta_status.dex != 0 ? " \u2192 " + modified_status.dex : ""));
            status_frame.insert_text("\u56DE\u907F " + model.player.status.eva + (delta_status.eva != 0 ? " \u2192 " + modified_status.eva : ""));
            status_frame.insert_text("");
            status_frame.insert_text("\u88C5\u5099");
            status_frame.insert_text("\u982D " + items.equips["head"].map(function (e) { return e.item.name; }).get_or_else(""));
            status_frame.insert_text("\u4F53 " + items.equips["body"].map(function (e) { return e.item.name; }).get_or_else(""));
            status_frame.insert_text("\u624B " + items.equips["hand"].map(function (e) { return e.item.name; }).get_or_else(""));
            status_frame.insert_text("\u8DB3 " + items.equips["foot"].map(function (e) { return e.item.name; }).get_or_else(""));
            top_frame.move_point_y(0.2);
            var message = top_frame.insert_subframe(utils.some(view.window_w * 0.5), utils.none(), "rgba(0,0,0,0.6)");
            if (main.cursor_max["items"] != 0) {
                var item_ent = items.item_entities[main.cursor["items"]];
                message.insert_text(item_ent.item.text);
                if ("equip_level" in item_ent.more_props)
                    message.insert_text("Level " + item_ent.more_props["equip_level"] + " \u4EE5\u4E0A\u3067\u88C5\u5099\u53EF\u80FD");
                if ("sharpen" in item_ent.more_props)
                    message.insert_text("\u6210\u529F\u7387 " + item_ent.more_props["sharpen"][0] + " \u6B66\u5668\u306E\u653B\u6483 \u00B1" + item_ent.more_props["sharpen"][1]);
                if ("effi" in item_ent.more_props)
                    message.insert_text("\u71C3\u8CBB +" + item_ent.more_props["effi"]);
                if ("heal" in item_ent.more_props)
                    message.insert_text("\u81EA\u7136\u6CBB\u7652\u529B +" + item_ent.more_props["heal"]);
                if ("camouflage" in item_ent.more_props)
                    message.insert_text("\u8996\u8A8D\u6027 -" + (item_ent.more_props["camouflage"] * 100) + "%");
            }
            if (main.menu_mode[1] == "command") {
                var command = message.insert_subframe(utils.none(), utils.none(), "rgba(100,0,0,0.6)");
                var item_ent = items.item_entities[main.cursor["items"]];
                var valid_command_names = item_ent.get_valid_commands();
                for (var i = 0; i < valid_command_names.length; i++) {
                    command.insert_text((main.cursor["items>command"] == i ? ">" : " ") + items.commands_info[valid_command_names[i]].name_jp);
                }
            }
        }
        else if (main.menu_mode[0] == "dist") {
            top_frame.move_point_x(0.2);
            top_frame.move_point_y(0.2);
            var dist_frame = top_frame.insert_subframe(utils.some((view.window_w - top_frame.margin * 2) * 0.6), utils.some((view.window_h - top_frame.margin * 2) * 0.6), "rgba(0,0,0,0.6)", view.window_h * 0.05);
            dist_frame.font_size = view.window_h / 32;
            dist_frame.insert_text("\u30B9\u30C6\u30FC\u30BF\u30B9\u632F\u308A\u5206\u3051");
            dist_frame.insert_text("");
            dist_frame.insert_text("\u632F\u308A\u5206\u3051\u53EF\u80FD\u30DD\u30A4\u30F3\u30C8 " + main.point_distributed.rest);
            var status_names = ["atk", "def", "dex", "eva"];
            var status_names_jp = ["\u653B\u6483", "\u9632\u5FA1", "\u547D\u4E2D", "\u56DE\u907F"];
            for (var i = 0; i < status_names.length; i++) {
                dist_frame.insert_text((main.cursor["dist"] == i ? ">" : " ") + status_names_jp[i] + " " + model.player.status[status_names[i]] + " + " + main.point_distributed[status_names[i]]);
            }
            dist_frame.insert_text("");
            dist_frame.insert_text("\u2190\u2192\u30AD\u30FC\u3067\u632F\u308A\u5206\u3051 Z\u30AD\u30FC\u3067\u6C7A\u5B9A");
        }
        else if (main.menu_mode[0] == "dead") {
            var dead_frame = top_frame.insert_subframe(utils.none(), utils.none(), "rgba(0,0,0,0.6)");
            dead_frame.font_size = view.window_h / 32;
            dead_frame.insert_text("\u6B7B\u306B\u307E\u3057\u305F");
        }
        ctx.drawImage(utils.reversal_circle(view.window_h / 2 * 0.75), 0, 0);
        utils.print_frame(ctx);
        utils.print_tmp_frame(ctx);
        // draw temporal animations
        utils.print_anims(ctx);
        // draw temporal damage animations
        utils.print_tmp_num(ctx);
        // menu mode
        // ctx.fillStyle = "white"
        // ctx.fillText(main.menu_mode.join(" > "),0,0)
    }
    view.print = print;
})(view || (view = {}));
