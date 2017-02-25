var view;
(function (view) {
    view.window_usize = new utils.Pos(640 / 32, 480 / 32);
    view.unit_size = new utils.Pos(32, 32);
    view.prefix_pos = new utils.Pos(0, 0);
    view.window_w = view.window_usize.x * view.unit_size.x;
    view.window_h = view.window_usize.y * view.unit_size.y;
    view.move_center = new utils.Pos(-80, 0);
    function progress_rate() {
        return 0.1 * main.sp60f;
    }
    view.progress_rate = progress_rate;
    function visual_field_size() {
        var vf = view.window_h / 2 * 0.75;
        var vf_rate = 1;
        items.item_entities.forEach(function (ent) {
            if ("view" in ent.more_props)
                vf_rate += ent.more_props["view"];
        });
        return vf * vf_rate;
    }
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
    function print_throw(ctx, len) {
        var pos = model.player.upos;
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        for (var i = 0; i < len; i++) {
            pos = pos.add(main.cursor["throw"]);
            var real_pos = pos.mul(view.unit_size).sub(view.prefix_pos);
            ctx.fillRect(real_pos.x, real_pos.y, view.unit_size.x, view.unit_size.y);
        }
    }
    view.print_throw = print_throw;
    function print(ctx, cnt) {
        //ctx.clearRect(0,0,window_w,window_h)
        // 画面外は黒
        ctx.fillStyle = "rgba(30,30,30,1)";
        ctx.fillRect(0, 0, view.window_w, view.window_h);
        // player を中心とする画面にする
        var tmp = model.player.upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5, 0.5)).mul(view.unit_size).sub(view.move_center);
        view.prefix_pos = tmp.sub(view.prefix_pos).map(function (d) { return utils.included_limit(d, -view.unit_size.x * progress_rate(), view.unit_size.x * progress_rate()); }).add(view.prefix_pos);
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
        // 視野
        ctx.drawImage(utils.reversal_circle(visual_field_size()), 0, 0);
        if (main.menu_mode[0] == "throw")
            print_throw(ctx, 5);
        utils.print_log(ctx);
        utils.print_frame(ctx);
        //utils.print_tmp_frame(ctx)
        // draw temporal animations
        utils.print_anims(ctx);
        // draw temporal damage animations
        utils.print_tmp_num(ctx);
    }
    view.print = print;
})(view || (view = {}));
