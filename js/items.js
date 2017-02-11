var items;
(function (items) {
    /**
     * item type exclude item status
     */
    var Item = (function () {
        function Item(name, commands, add_status, equip_region, text) {
            this.name = name;
            this.commands = commands;
            this.delta_status = add_status;
            this.equip_region = equip_region;
            this.text = text;
        }
        return Item;
    }());
    items.Item = Item;
    items.type = {
        onigiri: new Item("\u304A\u306B\u304E\u308A", ["use", "put"], battle.Status.of_food(5), "none", "\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B"),
        orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9", ["use", "put"], battle.Status.of_drink(10), "none", "\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B"),
        knife: new Item("\u30CA\u30A4\u30D5", ["equip", "put"], battle.Status.of_knife(2), "hand", "\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064"),
        flying_pan: new Item("\u30D5\u30E9\u30A4\u30D1\u30F3", ["equip", "put"], battle.Status.of_knife(1), "hand", "\u53E4\u4EE3\u306E\u920D\u5668\u3060\u304C\u8ABF\u7406\u306B\u3082\u4F7F\u7528\u3067\u304D\u308B")
    };
    items.commands = {
        use: "\u4F7F\u3046",
        put: "\u6368\u3066\u308B",
        equip: "\u88C5\u5099"
    };
    var ItemEntity = (function () {
        function ItemEntity(item) {
            this.item = item;
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
