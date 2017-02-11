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

  export namespace Asset{
    interface Ast{
      type:string;
      name:string;
      src:string;
      frames:number
    }
    export var assets : Ast[] = [
      {type: "image", name: "back", src: "assets/back.png", frames:1},
      {type: "image", name: "box", src: "assets/box.png", frames:1},
      {type: "image", name: "mame_mouse_left", src: "assets/mame_mouse_left.png", frames:4},
      {type: "image", name: "mame_mouse_right", src: "assets/mame_mouse_right.png", frames:4},
      {type: "image", name: "mame_mouse_up", src: "assets/mame_mouse_up.png", frames:4},
      {type: "image", name: "mame_mouse_down", src: "assets/mame_mouse_down.png", frames:4},
      {type: "image", name: "floor", src: "assets/floor.png", frames:1},
      {type: "image", name: "wall", src: "assets/wall.png", frames:1},
      {type: "image", name: "player_left", src: "assets/player_left.png", frames:1},
      {type: "image", name: "player_right", src: "assets/player_right.png", frames:1},
      {type: "image", name: "player_up", src: "assets/player_up.png", frames:1},
      {type: "image", name: "player_down", src: "assets/player_down.png", frames:1},
    ];
    export var images = {}
    export var image_frames = {}
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
        image.onload = onLoad;
        image.src = asset.src;
        images[asset.name] = image
    }
  }

  export function init() {
    canvas = <HTMLCanvasElement> document.getElementById('maincanvas');
    ctx = canvas.getContext('2d');
    canvas.width = view.window_usize.x * view.unit_size.x;
    canvas.height = view.window_usize.y * view.unit_size.y;

    ctx.textBaseline = "top"

    // image_frames
    Asset.assets.forEach(asset => {
      Asset.image_frames[asset.name] = asset.frames
    })

    // エンティティの配置
    model.initEntities()

    Asset.loadAssets(() => {
      requestAnimationFrame(update)
    })

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
      }else if(keys.z_key){
        switch(menu_mode.join(">")){
          case "items":
          if(main.cursor_max["items"] != 0){
            menu_mode.push("command")
            var mode = menu_mode.join(">")
            cursor[mode] = 0
            cursor_max[mode] = items.item_entities[cursor["items"]].item.commands.length
          }
          break
          case "items>command":
          var selected = items.item_entities[cursor["items"]]
          switch(selected.item.commands[cursor["items>command"]]){
            case "use":
            model.player.status = model.player.status.add(selected.item.delta_status)
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
            case "put":
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
            case "equip":
            var old_eq : utils.Option<items.ItemEntity> = items.equips[selected.item.equip_region]
            if(old_eq.exist()){
              items.item_entities.push(old_eq.get())
              cursor_max["items"]++
            }
            items.equips[selected.item.equip_region] = utils.some(selected)
            model.player.status = model.tiles["player"].status.get().add(items.equips_status_sum())
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
          }
          break
        }
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

  var render_cnt = 0
  function render(){
    view.print(ctx,render_cnt)
    render_cnt++
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