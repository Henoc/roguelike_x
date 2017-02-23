var items;
(function (items) {
    /**
     * item type exclude item status
     */
    var Item = (function () {
        function Item(name, commands, add_status, equip_region, text, more_props) {
            this.name = name;
            this.commands = commands;
            this.delta_status = add_status;
            this.equip_region = equip_region;
            this.text = text;
            this.more_props = more_props;
        }
        return Item;
    }());
    items.Item = Item;
    /**
     * max_hp, hp を上げる装備品は禁止(装備計算が面倒なので)
     *
     * アイテムの型
     * more_props:
     * equip_level(x) player level x 以上で装備コマンド解放
     * sharpen(x,y) x の確率で武器の攻撃力+y
     * exp(x) xの経験値を得る
     * revive(x) HP x で蘇生
     * view(x) 所持で視野が x 広がる
     * camouflage(x) 装備すると 敵の視力を x カット の more_props がプレイヤーに着く
     */
    items.type = {
        hamburger: new Item("ハンバーガー", ["use", "put"], battle.Status.of_food(5), "none", "\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B"),
        potion: new Item("ポーション", ["use", "put"], battle.Status.of_drink(10), "none", "\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B"),
        /*
        hand, body 装備
        基本セット */
        knife: new Item("ナイフ", ["equip", "put"], battle.Status.of_knife(2), "hand", "\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064"),
        copper_armor: new Item("銅の鎧", ["equip", "put"], battle.Status.of_guard(2), "body", "\u3068\u308A\u3042\u3048\u305A\u5B89\u5FC3\u611F\u304C\u51FA\u308B\u9632\u5177"),
        /* level 10 */
        silver_knife: new Item("シルバーナイフ", ["equip", "put"], battle.Status.of_knife(5), "hand", "\u7570\u69D8\u306B\u5207\u308C\u5473\u304C\u92ED\u3044\u30CA\u30A4\u30D5", { equip_level: 10 }),
        iron_armor: new Item("鉄の鎧", ["equip", "put"], battle.Status.of_guard(5), "body", "\u6226\u3046\u524D\u304B\u3089\u52DD\u3063\u305F\u6C17\u306B\u306A\u3063\u3066\u3057\u307E\u3046\u9632\u5177", { equip_level: 10 }),
        /* level 20 */
        gold_knife: new Item("ゴールドナイフ", ["equip", "put"], battle.Status.of_knife(10), "hand", "\u9EC4\u91D1\u306B\u8F1D\u304F\u7F8E\u3057\u3044\u30CA\u30A4\u30D5", { equip_level: 20 }),
        gold_armor: new Item("金の鎧", ["equip", "put"], battle.Status.of_guard(10), "body", "\u4F53\u5F53\u305F\u308A\u3060\u3051\u3067\u6575\u3092\u5012\u305B\u308B\u3068\u3044\u3046", { equip_level: 20 }),
        /*
        砥石
        期待値 E[sharpen(p,x)] = x * p - x * (1 - p)
        */
        sharpener: new Item("砥石", ["sharpen", "put"], battle.Status.zero(), "none", "\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B", { sharpen: [0.9, 1] }),
        magic_sharpener: new Item("魔法の砥石", ["sharpen", "put"], battle.Status.zero(), "none", "\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B", { sharpen: [0.65, 3] }),
        fairy_sharpener: new Item("妖精の砥石", ["sharpen", "put"], battle.Status.zero(), "none", "\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B", { sharpen: [0.6, 5] }),
        dragon_sharpener: new Item("ドラゴンの砥石", ["sharpen", "put"], battle.Status.zero(), "none", "\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B", { sharpen: [0.58, 7] }),
        //flying_pan: new Item("フライパン", ["equip","put"], battle.Status.of_knife(1),"hand",`古代の鈍器だが調理にも使用できる`),
        //dead_mame_mouse: new Item("豆ねずみの肉",["use","put"],battle.Status.of_food(1),"none",`豆の味がする`),
        soramame_head: new Item("そら豆の帽子", ["equip", "put"], new battle.Status(0, 0, 0, 0, 2, 0), "head", "\u305D\u3089\u8C46\u306E\u5F62\u3092\u3057\u305F\u5E3D\u5B50\u3002\u5E38\u306B\u8C46\u306E\u5302\u3044\u304C\u3059\u308B"),
        mame_mouse_ibukuro: new Item("豆ねずみの胃袋", ["use", "put"], new battle.Status(0, 0, 0, 0, 0, 0), "none", "\u98DF\u3079\u308B\u3068\u6D88\u5316\u3092\u7269\u7406\u7684\u306B\u52A9\u3051\u3066\u304F\u308C\u308B\u3068\u3044\u3046", { effi: 1 }),
        //dead_lang_dog: new Item("人語を解す犬の肉",["use","put"],battle.Status.of_food(1),"none",`犬と人とのキメラだという説がある`),
        lang_dog_shoes: new Item("犬の靴", ["equip", "put"], new battle.Status(0, 0, 0, 0, 0, 2), "foot", "\u77E5\u6027\u3092\u611F\u3058\u3055\u305B\u308B\u5E03\u88FD\u306E\u9774", { effi: 2 }),
        lang_dog_paper: new Item("数式のメモ", ["decode", "put"], battle.Status.zero(), "none", "\u7D19\u4E00\u9762\u306B\u3073\u3063\u3057\u308A\u3068\u8A18\u53F7\u304C\u66F8\u3044\u3066\u3042\u308B", { exp: 30 }),
        dead_sacred_slime: new Item("聖スライムの肉", ["use", "put"], battle.Status.of_food(1), "none", "\u8B0E\u591A\u304D\u4E0D\u6B7B\u8EAB\u306E\u30B9\u30E9\u30A4\u30E0"),
        revival: new Item("蘇生薬", ["put"], battle.Status.zero(), "none", "\u6301\u3063\u3066\u3044\u308B\u3060\u3051\u30671\u5EA6\u81EA\u52D5\u3067\u8607\u751F\u3067\u304D\u308B", { revive: 10 }),
        candle: new Item("ろうそく", ["put"], battle.Status.zero(), "none", "\u706B\u306E\u3064\u3044\u305F\u308D\u3046\u305D\u304F", { view: 0.05 }),
        ghost_camouflage: new Item("幽体迷彩", ["equip", "put"], new battle.Status(0, 0, 0, 1, 0, 0), "head", "\u88AB\u308B\u3068\u6575\u306B\u6C17\u3065\u304B\u308C\u306B\u304F\u304F\u306A\u308B", { camouflage: 0.5 }),
        shadow_wing: new Item("黒い翼", ["equip", "put"], new battle.Status(0, 0, 0, 1, 0, 4), "body", "\u7D20\u65E9\u3044\u52D5\u304D\u3067\u76F8\u624B\u3092\u7FFB\u5F04\u3067\u304D\u308B\u7FFC", { equip_level: 5 }),
        black_paint: new Item("黒いペンキ", ["put"], battle.Status.zero(), "none", "\u771F\u3063\u9ED2\u306A\u8272\u306E\u30DA\u30F3\u30AD"),
        preserved_food: new Item("保存食", ["use", "put"], battle.Status.of_food(6), "none", "\u6301\u3061\u6B69\u304D\u3084\u3059\u3044\u643A\u884C\u7528\u4FDD\u5B58\u98DF"),
        gourd: new Item("ひょうたん", ["put"], battle.Status.zero(), "none", "\u9B54\u6CD5\u690D\u7269\u3092\u52A0\u5DE5\u3057\u3066\u4F5C\u3089\u308C\u305F\u3001\u5185\u90E8\u304C\u56DB\u6B21\u5143\u7A7A\u9593\u306B\u306A\u3063\u3066\u3044\u308B\u3072\u3087\u3046\u305F\u3093", { capacity: 3 })
    };
    /**
     * cond: condition of validating the command
     * no_hide: show the command even if cond fails. Then cannot_command appears
     */
    items.commands_info = {};
    items.commands_info["use"] = { name_jp: "使う" };
    items.commands_info["put"] = { name_jp: "捨てる" };
    items.commands_info["equip"] = { name_jp: "装備", cond: function (ient) {
            return ("equip_level" in ient.more_props && ient.more_props["equip_level"] <= model.player.level) || (!("equip_level" in ient.more_props));
        }, no_hide: true };
    items.commands_info["cannot_equip"] = { name_jp: "装備不能" };
    items.commands_info["decode"] = { name_jp: "解読する" };
    items.commands_info["sharpen"] = { name_jp: "研ぐ", cond: function (ient) { return items.equips["hand"].exist(); }, no_hide: true };
    items.commands_info["cannot_sharpen"] = { name_jp: "武器装備無し" };
    var ItemEntity = (function () {
        function ItemEntity(item) {
            this.item = item;
            this.status = item.delta_status.copy();
            this.more_props = utils.shallow_copy(item.more_props);
        }
        ItemEntity.prototype.get_valid_commands = function () {
            var _this = this;
            var ret = [];
            this.item.commands.forEach(function (command_name) {
                if (items.commands_info[command_name].cond == undefined || items.commands_info[command_name].cond(_this))
                    ret.push(command_name);
                else if ("no_hide" in items.commands_info[command_name])
                    ret.push("cannot_" + command_name);
            });
            return ret;
        };
        return ItemEntity;
    }());
    items.ItemEntity = ItemEntity;
    items.item_entities = [];
    function item_entities_max() {
        var capacity = 20;
        items.item_entities.forEach(function (ent) {
            if ("capacity" in ent.more_props)
                capacity += ent.more_props["capacity"];
        });
        return capacity;
    }
    items.item_entities_max = item_entities_max;
    items.equips = {};
    items.equips["head"] = utils.none();
    items.equips["body"] = utils.none();
    items.equips["hand"] = utils.none();
    items.equips["foot"] = utils.none();
    function equips_status_sum() {
        var ret = battle.Status.zero();
        for (var _i = 0, _a = ["head", "body", "hand", "foot"]; _i < _a.length; _i++) {
            var region = _a[_i];
            if (items.equips[region].exist()) {
                ret = ret.add(items.equips[region].get().status);
            }
        }
        return ret;
    }
    items.equips_status_sum = equips_status_sum;
    function equips_more_props_sum(default_more_props) {
        var ret = default_more_props;
        for (var _i = 0, _a = ["head", "body", "hand", "foot"]; _i < _a.length; _i++) {
            var region = _a[_i];
            if (items.equips[region].exist()) {
                var more_props = items.equips[region].get().more_props;
                for (var prop_name in more_props) {
                    if (prop_name in ret)
                        ret[prop_name] += more_props[prop_name];
                    else
                        ret[prop_name] = more_props[prop_name];
                }
            }
        }
        return ret;
    }
    items.equips_more_props_sum = equips_more_props_sum;
    /**
     * equips sum replacing one equipment
     */
    function equips_status_sum_replace(item_entity) {
        var ret = battle.Status.zero();
        for (var _i = 0, _a = ["head", "body", "hand", "foot"]; _i < _a.length; _i++) {
            var region = _a[_i];
            if (item_entity.item.equip_region == region) {
                ret = ret.add(item_entity.status);
            }
            else if (items.equips[region].exist()) {
                ret = ret.add(items.equips[region].get().status);
            }
        }
        return ret;
    }
    items.equips_status_sum_replace = equips_status_sum_replace;
})(items || (items = {}));
