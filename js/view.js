var view;
(function (view) {
    view.window_usize = new utils.Pos(16, 16);
    view.unit_size = new utils.Pos(32, 32);
    view.prefix_pos = new utils.Pos(0, 0);
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
            this.progress += 0.2;
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
    })();
    view.MoveAnim = MoveAnim;
    function print(ctx) {
        ctx.clearRect(0, 0, view.window_usize.x * view.unit_size.x, view.window_usize.y * view.unit_size.y);
        // 画面外は黒
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, view.window_usize.x * view.unit_size.x, view.window_usize.y * view.unit_size.y);
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
            entity.tile.print(ctx, realEntityPos);
        }
    }
    view.print = print;
})(view || (view = {}));
