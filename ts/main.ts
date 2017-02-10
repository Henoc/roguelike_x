namespace main{

  var canvas: HTMLCanvasElement;
  var ctx: CanvasRenderingContext2D;
  /**
   * expore, items
   */
  export var menu_mode = ["explore"]

  /**
   * cursur[menu_mode.join(">")] にカーソルの位置が入る
   */
  export var cursor = {}
  /**
   * max
   */
  export var cursor_max = {}

  namespace Asset{
    interface Ast{
      type:string;
      name:string;
      src:string;
    }
    export var assets : Ast[] = [
      {type: "image", name: "back", src: "assets/back.png"},
      {type: "image", name: "box", src: "assets/box.png"}
    ];
    export var images : HTMLImageElement[] = [];
    export var loadAssets = (onComplete:() => void) => {
      var total = assets.length;
      var loadCount = 0;

      function onLoad(){
        loadCount++
        if(loadCount >= total){
          onComplete();
        }
      }

      assets.forEach(asset => {
        switch(asset.type){
          case "image":
            loadImage(asset,onLoad);
            break;
        }
      })
    }
    function loadImage(asset : Ast, onLoad:() => void) {
        var image = new Image();
        image.src = asset.src;
        image.onload = onLoad;
        images[asset.name] = image;
    }
  }

  export function init() {
    canvas = <HTMLCanvasElement> document.getElementById('maincanvas');
    ctx = canvas.getContext('2d');
    canvas.width = view.window_usize.x * view.unit_size.x;
    canvas.height = view.window_usize.y * view.unit_size.y;

    ctx.textBaseline = "top"

    Asset.loadAssets(() => {
      requestAnimationFrame(update)
    })

    // エンティティの配置
    model.initEntities()
  }

  var lastTimestamp = null

  function update(timestamp : number){
    requestAnimationFrame(update)

    // key inputs
    switch(menu_mode[0]){
      case "explore":
      if(!view.action_lock){
        var moved = keys.dir_key.add(model.player.upos)
        if(
          !keys.dir_key.equals(model.dir.none) &&
          /* 壁判定は move() と重複するが仕方なし */
          map.inner(moved) &&
          utils.all(model.get_entities_at(moved),e => !e.tile.isWall || e.status.hp == 0) &&
          !map.field_at_tile(moved).isWall
        ) {
          model.move()
        }else if(keys.z_key){
          model.attack()
        }else if(keys.x_key){
          menu_mode = ["items"]
          cursor["items"] = 0
          cursor_max["items"] = items.item_entities.length
        }
      }
      break
      case "items":
      if(keys.x_key){
        menu_mode.pop()
        if(menu_mode.length == 0) menu_mode = ["explore"]
      }else if(keys.dir_key.equals(model.dir.down)){
        var mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] + 1, 0, cursor_max[mode])
      }else if(keys.dir_key.equals(model.dir.up)){
        var mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] - 1, 0, cursor_max[mode])
      }
      break
    }
    keys.keyReset()

    render()
  }

  function render(){
    view.print(ctx)

    //ctx.drawImage(Asset.images["back"],0,0)
    //ctx.drawImage(Asset.images["box"],mikanX,0)
  }

  export function keydown(e:KeyboardEvent){
    var keyCode = e.keyCode
    switch (keyCode) {
      case 37:
        keys.dir_key = model.dir.left
        break
      case 38:
        keys.dir_key = model.dir.up
        break;
      case 39:
        keys.dir_key = model.dir.right
        break
      case 40:
        keys.dir_key = model.dir.down
        break
      case 90:
        keys.z_key = true
        break
      case 88:
        keys.x_key = true
    
      default:
        break;
    }
  }
}

window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown)