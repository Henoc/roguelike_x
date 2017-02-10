var map;
(function (map) {
    map.width = 60;
    map.height = 60;
    map.fields = new Array();
    for (var i = 0; i < map.height; i++) {
        map.fields[i] = new Array();
        for (var j = 0; j < map.width; j++) {
            map.fields[i][j] = 0;
        }
    }
    function inner(pos) {
        return pos.x >= 0 && pos.x < map.width &&
            pos.y >= 0 && pos.y < map.height;
    }
    map.inner = inner;
    function field_at(pos) {
        return map.fields[pos.y][pos.x];
    }
    map.field_at = field_at;
    function field_at_tile(pos) {
        return model.tiles[map.entity_names[map.fields[pos.y][pos.x]]];
    }
    map.field_at_tile = field_at_tile;
    function field_set(pos, value) {
        map.fields[pos.y][pos.x] = value;
    }
    map.field_set = field_set;
    function field_set_by_name(pos, name) {
        map.fields[pos.y][pos.x] = map.entity_number[name];
    }
    map.field_set_by_name = field_set_by_name;
    /**
     * fields 上の番号 -> 名前
     */
    map.entity_names = [
        "floor",
        "wall"
    ];
    map.entity_number = {
        floor: 0,
        wall: 1
    };
    var minimap_usize = new utils.Pos(10, 10);
    /**
     * ランダムなマップの自動生成
     */
    function makeMap() {
        for (var i = 0; i < map.height; i += minimap_usize.y) {
            for (var j = 0; j < map.width; j += minimap_usize.x) {
                utils.paste(map.fields, makeMiniMap(), i, j);
            }
        }
    }
    map.makeMap = makeMap;
    /**
     * このミニマップをつなぎ合わせる
     */
    function makeMiniMap() {
        var p1 = [
            "1111111111",
            "1111111111",
            "1111001111",
            "1111001111",
            "1000000011",
            "1111001111",
            "1111001111",
            "1111001111",
            "1111111111",
            "1111111111",
        ];
        function patternTo2darray(pattern) {
            var ary = new Array();
            for (var _i = 0, pattern_1 = pattern; _i < pattern_1.length; _i++) {
                var str = pattern_1[_i];
                ary.push(strToArray(str));
            }
            return ary;
        }
        function strToArray(str) {
            var ary = new Array();
            for (var i = 0; i < str.length; i++) {
                ary.push(Number(str.charAt(i)));
            }
            return ary;
        }
        return patternTo2darray(p1);
    }
})(map || (map = {}));
