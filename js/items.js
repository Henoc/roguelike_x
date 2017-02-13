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
    items.type = {
        onigiri: new Item("\u304A\u306B\u304E\u308A", ["use", "put"], battle.Status.of_food(5), "none", "\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B"),
        orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9", ["use", "put"], battle.Status.of_drink(10), "none", "\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B"),
        knife: new Item("\u30CA\u30A4\u30D5", ["equip", "put"], battle.Status.of_knife(2), "hand", "\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064"),
        flying_pan: new Item("\u30D5\u30E9\u30A4\u30D1\u30F3", ["equip", "put"], battle.Status.of_knife(1), "hand", "\u53E4\u4EE3\u306E\u920D\u5668\u3060\u304C\u8ABF\u7406\u306B\u3082\u4F7F\u7528\u3067\u304D\u308B"),
        dead_mame_mouse: new Item("\u8C46\u306D\u305A\u307F\u306E\u8089", ["use", "put"], battle.Status.of_food(1), "none", "\u8C46\u306E\u5473\u304C\u3059\u308B"),
        soramame_head: new Item("\u305D\u3089\u8C46\u306E\u5E3D\u5B50", ["equip", "put"], new battle.Status(2, 0, 0, 1), "head", "\u305D\u3089\u8C46\u306E\u5F62\u3092\u3057\u305F\u98DF\u3079\u3089\u308C\u308B\u5E3D\u5B50"),
        mame_mouse_ibukuro: new Item("\u8C46\u306D\u305A\u307F\u306E\u80C3\u888B", ["use", "put"], new battle.Status(0, 0, 0, 0, 1), "none", "\u98DF\u3079\u308B\u3068\u6D88\u5316\u3092\u7269\u7406\u7684\u306B\u52A9\u3051\u3066\u304F\u308C\u308B\u3068\u3044\u3046"),
        dead_lang_dog: new Item("\u4EBA\u8A9E\u3092\u89E3\u3059\u72AC\u306E\u8089", ["use", "put"], battle.Status.of_food(1), "none", "\u72AC\u3068\u4EBA\u3068\u306E\u30AD\u30E1\u30E9\u3060\u3068\u3044\u3046\u8AAC\u304C\u3042\u308B"),
        lang_dog_shoes: new Item("\u72AC\u306E\u9774", ["equip", "put"], new battle.Status(0, 0, 0, 0, 2), "foot", "\u77E5\u6027\u3092\u611F\u3058\u3055\u305B\u308B\u5E03\u88FD\u306E\u9774"),
        lang_dog_paper: new Item("\u6570\u5F0F\u306E\u30E1\u30E2", ["decode", "put"], battle.Status.zero(), "none", "\u7D19\u4E00\u9762\u306B\u3073\u3063\u3057\u308A\u3068\u8A18\u53F7\u304C\u66F8\u3044\u3066\u3042\u308B", { exp: 50 }),
        dead_sacred_slime: new Item("\u8056\u30B9\u30E9\u30A4\u30E0\u306E\u8089", ["use", "put"], battle.Status.of_food(1), "none", "\u8B0E\u591A\u304D\u4E0D\u6B7B\u8EAB\u306E\u30B9\u30E9\u30A4\u30E0")
    };
    items.commands = {
        use: "\u4F7F\u3046",
        put: "\u6368\u3066\u308B",
        equip: "\u88C5\u5099",
        decode: "\u89E3\u8AAD\u3059\u308B"
    };
    var ItemEntity = (function () {
        function ItemEntity(item) {
            this.item = item;
            this.more_props = utils.shallow_copy(item.more_props);
        }
        return ItemEntity;
    }());
    items.ItemEntity = ItemEntity;
    items.item_entities = [];
    items.equips = {};
    items.equips["head"] = utils.none();
    items.equips["body"] = utils.none();
    items.equips["hand"] = utils.none();
    items.equips["foot"] = utils.none();
    function equips_status_sum() {
        var ret = new battle.Status(0, 0, 0, 0);
        for (var _i = 0, _a = ["head", "body", "hand", "foot"]; _i < _a.length; _i++) {
            var region = _a[_i];
            if (items.equips[region].exist()) {
                ret = ret.add(items.equips[region].get().item.delta_status);
            }
        }
        return ret;
    }
    items.equips_status_sum = equips_status_sum;
    /**
     * equips sum replacing one equipment
     */
    function equips_status_sum_replace(item_entity) {
        var ret = new battle.Status(0, 0, 0, 0);
        for (var _i = 0, _a = ["head", "body", "hand", "foot"]; _i < _a.length; _i++) {
            var region = _a[_i];
            if (item_entity.item.equip_region == region) {
                ret = ret.add(item_entity.item.delta_status);
            }
            else if (items.equips[region].exist()) {
                ret = ret.add(items.equips[region].get().item.delta_status);
            }
        }
        return ret;
    }
    items.equips_status_sum_replace = equips_status_sum_replace;
})(items || (items = {}));
