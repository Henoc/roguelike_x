var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils;
(function (utils) {
    /**
     * board[pre_y][pre_x] へ二次元的に paper を代入する
     * @param board 破壊的変更を受ける
     */
    function paste(board, paper, pre_y, pre_x) {
        for (var i = pre_y; i < pre_y + paper.length; i++) {
            for (var j = pre_x; j < pre_x + paper[i - pre_y].length; j++) {
                board[i][j] = paper[i - pre_y][j - pre_x];
            }
        }
    }
    utils.paste = paste;
    function randInt(max) {
        return Math.floor(Math.random() * max);
    }
    utils.randInt = randInt;
    var Pos = (function () {
        function Pos(x, y) {
            this.x = x;
            this.y = y;
        }
        Pos.prototype.add = function (that) {
            return new Pos(this.x + that.x, this.y + that.y);
        };
        Pos.prototype.sub = function (that) {
            return new Pos(this.x - that.x, this.y - that.y);
        };
        Pos.prototype.mul = function (that) {
            return new Pos(this.x * that.x, this.y * that.y);
        };
        Pos.prototype.mul_bloadcast = function (n) {
            return new Pos(this.x * n, this.y * n);
        };
        Pos.prototype.div_bloadcast = function (divisor) {
            return new Pos(this.x / divisor, this.y / divisor);
        };
        Pos.prototype.equals = function (that) {
            return this.x == that.x && this.y == that.y;
        };
        Pos.prototype.map = function (f) {
            return new Pos(f(this.x), f(this.y));
        };
        return Pos;
    }());
    utils.Pos = Pos;
    function all(ary, fn) {
        for (var _i = 0, ary_1 = ary; _i < ary_1.length; _i++) {
            var v = ary_1[_i];
            if (!fn(v))
                return false;
        }
        return true;
    }
    utils.all = all;
    function exist(ary, fn) {
        for (var _i = 0, ary_2 = ary; _i < ary_2.length; _i++) {
            var v = ary_2[_i];
            if (fn(v))
                return true;
        }
        return false;
    }
    utils.exist = exist;
    /**
     * [min,max)
     */
    function limit(n, min, max) {
        return n < min ? min : (n >= max ? max - 1 : n);
    }
    utils.limit = limit;
    /**
     * [min,max]
     */
    function included_limit(n, min, max) {
        return n < min ? min : (n > max ? max : n);
    }
    utils.included_limit = included_limit;
    function lower_bound(n, min) {
        return n < min ? min : n;
    }
    utils.lower_bound = lower_bound;
    var Option = (function () {
        function Option() {
        }
        return Option;
    }());
    utils.Option = Option;
    var Some = (function (_super) {
        __extends(Some, _super);
        function Some(t) {
            var _this = _super.call(this) || this;
            _this.t = t;
            return _this;
        }
        Some.prototype.get = function () {
            return this.t;
        };
        Some.prototype.foreach = function (fn) {
            fn(this.t);
        };
        Some.prototype.map = function (fn) {
            return some(fn(this.t));
        };
        Some.prototype.get_or_else = function (e) {
            return this.t;
        };
        Some.prototype.exist = function () {
            return true;
        };
        return Some;
    }(Option));
    utils.Some = Some;
    var None = (function (_super) {
        __extends(None, _super);
        function None() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        None.prototype.get = function () {
            throw "get() call of none";
        };
        None.prototype.foreach = function (fn) {
        };
        None.prototype.map = function (fn) {
            return none();
        };
        None.prototype.get_or_else = function (e) {
            return e;
        };
        None.prototype.exist = function () {
            return false;
        };
        return None;
    }(Option));
    utils.None = None;
    function none() {
        return new None();
    }
    utils.none = none;
    function some(t) {
        return new Some(t);
    }
    utils.some = some;
    function fillText_n(ctx, text, x, y, font_size, newline_size) {
        var strs = text.split("\n");
        for (var i = 0; i < strs.length; i++) {
            ctx.fillText(strs[i], x, y + newline_size * i);
        }
    }
    utils.fillText_n = fillText_n;
    var Frame = (function () {
        function Frame(x, y, w, h, margin, color, life) {
            this.pos = new Pos(x, y);
            this.wh = new Pos(w, h);
            this.color = color;
            this.margin = margin;
            this.font_size = 14;
            this.text_color = "white";
            this.contents = [];
            this.start_points = [this.pos.add(new Pos(margin, margin))];
            this.life = life;
        }
        Frame.prototype.insert_text = function (text) {
            this.contents.push({
                type: "text",
                text: text,
                font_size: this.font_size,
                color: this.text_color
            });
            var last = this.start_points[this.start_points.length - 1];
            this.start_points.push(last.add(new Pos(0, this.font_size * 1.2)));
        };
        Frame.prototype.insert_subframe = function (width, height, color, margin) {
            if (margin == undefined)
                margin = this.margin;
            var last = this.start_points[this.start_points.length - 1];
            var width2 = width.get_or_else(this.pos.x + this.wh.x - last.x - this.margin);
            var height2 = height.get_or_else(this.pos.y + this.wh.y - last.y - this.margin);
            // inherits parent frame properties
            var inner = new Frame(last.x, last.y, width2, height2, margin, color);
            inner.font_size = this.font_size;
            inner.text_color = this.text_color;
            this.contents.push({
                type: "frame",
                frame: inner
            });
            this.start_points.push(last.add(new Pos(0, height2)));
            return inner;
        };
        /**
         * move a start point of next content to right
         *
         * @param per percentage of moving
         */
        Frame.prototype.move_point_x = function (per) {
            var inner_width = this.wh.x - 2 * this.margin;
            var last = this.start_points.length - 1;
            this.start_points[last] = this.start_points[last].add(new Pos(inner_width * per, 0));
        };
        Frame.prototype.move_point_y = function (per) {
            var inner_height = this.wh.y - 2 * this.margin;
            var last = this.start_points.length - 1;
            this.start_points[last] = this.start_points[last].add(new Pos(0, inner_height * per));
        };
        Frame.prototype.reset_point = function () {
            this.start_points.pop();
            this.start_points.push(this.pos.add(new Pos(this.margin, this.margin)));
        };
        Frame.prototype.print = function (ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.pos.x, this.pos.y, this.wh.x, this.wh.y);
            for (var i = 0; i < this.contents.length; i++) {
                var pos = this.start_points[i];
                var content = this.contents[i];
                switch (content["type"]) {
                    case "text":
                        ctx.font = "normal " + content["font_size"] + "px sans-serif";
                        ctx.fillStyle = content["color"];
                        ctx.fillText(content["text"], pos.x, pos.y);
                        break;
                    case "frame":
                        var sub_frame = content["frame"];
                        if (sub_frame.life == undefined || sub_frame.life >= 0)
                            sub_frame.print(ctx);
                        break;
                    default:
                        throw "default reached";
                }
            }
            if (this.life != undefined && this.life >= 0) {
                this.life -= main.sp60f;
            }
        };
        return Frame;
    }());
    utils.Frame = Frame;
    // export class ScrollableFrame extends Frame {
    //   inner_canvas : HTMLCanvasElement  // size w * h
    //   inner_pos : Pos
    //   inner_wh : Pos
    //   constructor(x:number,y:number,w:number,h:number,inner_w:number,inner_h:number,margin:number,color:string,life?:number){
    //     super(x,y,w,h,margin,color,life)
    //     this.inner_wh = new Pos(inner_w, inner_h)
    //     this.inner_pos = new Pos(inner_w - w, inner_h - h)
    //   }
    //   print(ctx:CanvasRenderingContext2D){
    //   }
    // }
    utils.frame_tasks = [];
    function print_frame(ctx) {
        for (var i = 0; i < utils.frame_tasks.length; i++) {
            utils.frame_tasks[i].print(ctx);
            if (utils.frame_tasks[i].life != undefined && utils.frame_tasks[i].life < 0) {
                utils.frame_tasks.splice(i, 1);
                i--;
            }
        }
    }
    utils.print_frame = print_frame;
    var tmp_frame = none();
    function start_tmp_frame(text) {
        if (tmp_frame.exist())
            tmp_frame.get().life = 80;
        else {
            var tf = new utils.Frame(view.window_w * 0.75, view.window_h * 0.4, view.window_w * 0.25, view.window_h * 0.2, view.window_h * 0.03, "rgba(0,0,0,0.6)", 80);
            tf.font_size = view.window_h / 40;
            tmp_frame = some(tf);
        }
        tmp_frame.get().insert_text(text);
    }
    utils.start_tmp_frame = start_tmp_frame;
    function print_tmp_frame(ctx) {
        tmp_frame.foreach(function (t) {
            t.print(ctx);
            if (t.life != undefined && t.life < 0)
                tmp_frame = none();
        });
    }
    utils.print_tmp_frame = print_tmp_frame;
    function delete_tmp_frame() {
        tmp_frame = none();
    }
    utils.delete_tmp_frame = delete_tmp_frame;
    function shallow_copy(obj) {
        var clone = {};
        for (var str in obj) {
            clone[str] = obj[str];
        }
        return clone;
    }
    utils.shallow_copy = shallow_copy;
    var TmpAnim = (function () {
        function TmpAnim(name, fps, pos, src_wh, repeat) {
            this.name = name;
            this.counter = 0;
            this.fps = fps;
            this.pos = pos;
            this.src_wh = src_wh;
            this.repeat = repeat;
        }
        TmpAnim.prototype.print = function (ctx) {
            var cnt = Math.floor(this.counter / this.fps) % main.Asset.image_frames[this.name];
            ctx.drawImage(main.Asset.images[this.name], 0, this.src_wh.y * cnt, this.src_wh.x, this.src_wh.y, this.pos.x, this.pos.y, this.src_wh.x, this.src_wh.y);
            this.counter++;
        };
        return TmpAnim;
    }());
    var tmp_anim_tasks = [];
    function start_anim(name, fps, pos, src_wh, repeat) {
        if (repeat == undefined)
            repeat = 1;
        tmp_anim_tasks.push(new TmpAnim(name, fps, pos, src_wh, repeat));
    }
    utils.start_anim = start_anim;
    function print_anims(ctx) {
        for (var i = 0; i < tmp_anim_tasks.length; i++) {
            tmp_anim_tasks[i].print(ctx);
            if (tmp_anim_tasks[i].counter / tmp_anim_tasks[i].fps >= main.Asset.image_frames[tmp_anim_tasks[i].name] * tmp_anim_tasks[i].repeat) {
                tmp_anim_tasks.splice(i, 1);
                i--;
            }
        }
    }
    utils.print_anims = print_anims;
    var tmp_num_tasks = [];
    /**
     * damage expression
     */
    function start_tmp_num(n, color, pos) {
        tmp_num_tasks.push({ number: n, color: color, pos: pos, counter: 80 / main.sp60f });
    }
    utils.start_tmp_num = start_tmp_num;
    function print_tmp_num(ctx) {
        function print_number(k, pos, cnt) {
            if (cnt >= 0) {
                cnt = limit(cnt, 0, 10 / main.sp60f);
                var delta = view.window_h / 240;
                ctx.fillText(k, pos.x, pos.y - (10 / main.sp60f - cnt) * delta);
            }
            var w = ctx.measureText(k).width;
            return pos.add(new Pos(w, 0));
        }
        for (var i = 0; i < tmp_num_tasks.length; i++) {
            var tmp_num_task = tmp_num_tasks[i];
            ctx.font = "normal " + (view.window_h / 40) + "px sans-serif";
            ctx.fillStyle = tmp_num_task.color;
            var num_text = tmp_num_task.number + "";
            var pos = tmp_num_task.pos;
            for (var j = 0; j < num_text.length; j++) {
                pos = print_number(num_text[j], pos, 80 / main.sp60f - tmp_num_task.counter - j * 10 / main.sp60f);
            }
            tmp_num_task.counter--;
            if (tmp_num_task.counter <= 0) {
                tmp_num_tasks.splice(i, 1);
                i--;
            }
        }
    }
    utils.print_tmp_num = print_tmp_num;
    var reversal_circle_memo = {};
    function reversal_circle(r) {
        if (r in reversal_circle_memo)
            return reversal_circle_memo[r];
        var canvas = document.createElement("canvas");
        canvas.width = view.window_w;
        canvas.height = view.window_h;
        var ctx = canvas.getContext("2d");
        var image_data = ctx.createImageData(view.window_w, view.window_h);
        var px = view.window_w / 2 + view.move_center.x;
        var py = view.window_h / 2 + view.move_center.y;
        var eps = r * 0.05;
        for (var y = 0; y < view.window_h; y++) {
            for (var x = 0; x < view.window_w; x++) {
                var i = (y * view.window_w + x) * 4;
                var d = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
                if (d < r) {
                }
                else {
                    image_data.data[i + 3] = d < r + eps ? 255 * (d - r) / eps : 255;
                }
            }
        }
        ctx.putImageData(image_data, 0, 0);
        reversal_circle_memo = {}; // 以前のものを破棄
        reversal_circle_memo[r] = canvas;
        return canvas;
    }
    utils.reversal_circle = reversal_circle;
})(utils || (utils = {}));
