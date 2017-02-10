var items;
(function (items) {
    /**
     * item type exclude item status
     */
    var Item = (function () {
        function Item(name, commands, add_status, text) {
            this.name = name;
            this.commands = commands;
            this.add_status = add_status;
            this.text = text;
        }
        return Item;
    }());
    items.Item = Item;
    items.type = {
        onigiri: new Item("\u304A\u306B\u304E\u308A", ["eat", "put"], battle.Status.of_food(5), "\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B"),
        orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9", ["eat", "put"], battle.Status.of_drink(10), "\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B")
    };
    items.commands = {
        eat: "\u98DF\u3079\u308B",
        put: "\u7F6E\u304F"
    };
    var ItemEntity = (function () {
        function ItemEntity(item) {
            this.item = item;
        }
        return ItemEntity;
    }());
    items.ItemEntity = ItemEntity;
    items.item_entities = [];
})(items || (items = {}));
