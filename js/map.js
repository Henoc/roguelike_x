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
    function field_at(pos) {
        return map.fields[pos.y][pos.x];
    }
    map.field_at = field_at;
    function field_at_tile(pos) {
        return model.tiles[map.entity_names[map.fields[pos.y][pos.x]]];
    }
    map.field_at_tile = field_at_tile;
    /**
     * fields 上の番号 -> 名前
     */
    map.entity_names = [
        "floor",
        "wall"
    ];
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
            for (var _i = 0; _i < pattern.length; _i++) {
                var str = pattern[_i];
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
