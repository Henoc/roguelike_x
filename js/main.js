window.addEventListener('load', init);
window.addEventListener("keydown", keydown);
var canvas;
var ctx;
var Asset;
(function (Asset) {
    Asset.assets = [
        { type: "image", name: "back", src: "assets/back.png" },
        { type: "image", name: "box", src: "assets/box.png" }
    ];
    Asset.images = [];
    Asset.loadAssets = function (onComplete) {
        var total = Asset.assets.length;
        var loadCount = 0;
        function onLoad() {
            loadCount++;
            if (loadCount >= total) {
                onComplete();
            }
        }
        Asset.assets.forEach(function (asset) {
            switch (asset.type) {
                case "image":
                    loadImage(asset, onLoad);
                    break;
            }
        });
    };
    function loadImage(asset, onLoad) {
        var image = new Image();
        image.src = asset.src;
        image.onload = onLoad;
        Asset.images[asset.name] = image;
    }
})(Asset || (Asset = {}));
function init() {
    canvas = document.getElementById('maincanvas');
    ctx = canvas.getContext('2d');
    canvas.width = view.window_usize.x * view.unit_size.x;
    canvas.height = view.window_usize.y * view.unit_size.y;
    Asset.loadAssets(function () {
        requestAnimationFrame(update);
    });
    // エンティティの配置
    model.initEntities();
}
var lastTimestamp = null;
function update(timestamp) {
    requestAnimationFrame(update);
    render();
}
function render() {
    if (!view.action_lock && !keys.dir_key.equals(model.dir.none)) {
        model.move();
        keys.keyReset();
    }
    view.print(ctx);
    //ctx.drawImage(Asset.images["back"],0,0)
    //ctx.drawImage(Asset.images["box"],mikanX,0)
}
function keydown(e) {
    var keyCode = e.keyCode;
    switch (keyCode) {
        case 37:
            keys.dir_key = model.dir.left;
            break;
        case 38:
            keys.dir_key = model.dir.up;
            break;
        case 39:
            keys.dir_key = model.dir.right;
            break;
        case 40:
            keys.dir_key = model.dir.down;
            break;
        default:
            break;
    }
}
