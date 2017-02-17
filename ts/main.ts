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

  /**
   * for status distribution
   */
  export var point_distributed: {
    atk:number, def:number, effi:number, rest:number
  }
  var point_dist_rate = {
    atk:1,def:1,effi:2
  }

  /**
   * second per 60 frames
   */
  export var sp60f = 1

  export namespace Asset{
    interface Ast{
      type:string;
      name:string;
      src:string;
      frames:number
    }
    export var assets : Ast[] = [
      {type: "image", name: "mame_mouse_left", src: "assets/mame_mouse_left.png", frames:4},
      {type: "image", name: "mame_mouse_right", src: "assets/mame_mouse_right.png", frames:4},
      {type: "image", name: "mame_mouse_up", src: "assets/mame_mouse_up.png", frames:4},
      {type: "image", name: "mame_mouse_down", src: "assets/mame_mouse_down.png", frames:4},
      {type: "image", name: "lang_dog_left", src: "assets/lang_dog_left.png", frames:8},
      {type: "image", name: "lang_dog_right", src: "assets/lang_dog_right.png", frames:8},
      {type: "image", name: "lang_dog_up", src: "assets/lang_dog_up.png", frames:4},
      {type: "image", name: "lang_dog_down", src: "assets/lang_dog_down.png", frames:4},
      {type: "image", name: "sacred_slime_left", src: "assets/sacred_slime_left.png", frames:2},
      {type: "image", name: "sacred_slime_right", src: "assets/sacred_slime_right.png", frames:2},
      {type: "image", name: "sacred_slime_up", src: "assets/sacred_slime_up.png", frames:2},
      {type: "image", name: "sacred_slime_down", src: "assets/sacred_slime_down.png", frames:2},
      {type: "image", name: "violent_ghost_left", src: "assets/violent_ghost_left.png", frames:4},
      {type: "image", name: "violent_ghost_right", src: "assets/violent_ghost_right.png", frames:4},
      {type: "image", name: "violent_ghost_up", src: "assets/violent_ghost_up.png", frames:4},
      {type: "image", name: "violent_ghost_down", src: "assets/violent_ghost_down.png", frames:4},
      {type: "image", name: "treasure_box", src: "assets/treasure_box.png", frames:1},

      {type: "image", name: "floor", src: "assets/floor.png", frames:1},
      {type: "image", name: "wall", src: "assets/wall.png", frames:1},
      {type: "image", name: "goal", src: "assets/goal.png", frames:1},
      {type: "image", name: "player_left", src: "assets/player_left.png", frames:7},
      {type: "image", name: "player_right", src: "assets/player_right.png", frames:7},
      {type: "image", name: "player_up", src: "assets/player_up.png", frames:7},
      {type: "image", name: "player_down", src: "assets/player_down.png", frames:7},
      {type: "image", name: "level_up", src: "assets/level_up.png", frames:20},
      {type: "image", name: "treasure", src: "assets/treasure.png", frames:1},
      {type: "image", name: "twinkle", src: "assets/twinkle.png", frames:5},
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

    canvas.addEventListener("touchstart",main.touchstart)
    canvas.addEventListener("touchmove",main.touchmove)

    ctx.textBaseline = "top"

    // image_frames
    Asset.assets.forEach(asset => {
      Asset.image_frames[asset.name] = asset.frames
    })

    model.rank = 1

    // エンティティの配置
    model.init_entities()

    // アイテム支給
    items.item_entities = [
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.potion),
      new items.ItemEntity(items.type.silver_knife),
      new items.ItemEntity(items.type.revival),
      new items.ItemEntity(items.type.ghost_camouflage),
    ]

    Asset.loadAssets(() => {
      requestAnimationFrame(update)
    })

  }

  var lastTimestamp = null

  function update(timestamp : number){
    requestAnimationFrame(update)
    if (lastTimestamp != null) {
      sp60f = (timestamp - lastTimestamp) / 1000 * 60;
    }
    lastTimestamp = timestamp;

    // key inputs
    switch(menu_mode[0]){
      case "dead":
      break
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
        }else if(keys.c_key){
          menu_mode = ["dist"]
          cursor["dist"] = 0
          cursor_max["dist"] = 3
          point_distributed = {atk:0,def:0,effi:0,rest:battle.dist_point}
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
            cursor_max[mode] = items.item_entities[cursor["items"]].get_valid_commands().length
          }
          break
          case "items>command":
          var selected = items.item_entities[cursor["items"]]
          var selected_command_name = selected.get_valid_commands()[cursor["items>command"]]
          if(selected_command_name.indexOf("cannot_") == 0) {
            // nothing to do
          }else switch(selected_command_name){
            case "use":
            if(selected.item.delta_status.hp > 0) utils.start_tmp_num(selected.item.delta_status.hp, "springgreen", model.player.upos.mul(view.unit_size).sub(view.prefix_pos))
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
            model.player.more_props = items.equips_more_props_sum()
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
            case "cannot_equip":
            break
            case "decode":
            battle.add_exp(selected.item.more_props["exp"])
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
            default:
            throw "default reached"
          }
          break
          default:
          throw "default reached"
        }
      }else if(keys.dir_key2.equals(model.dir.down)){
        var mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] + 1, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.up)){
        var mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] - 1, 0, cursor_max[mode])
      }
      break
      case "dist":
      var mode = menu_mode.join(">")
      var dist_props = ["atk","def","effi"]
      if(keys.x_key || keys.c_key){
        menu_mode.pop()
        if(menu_mode.length == 0) menu_mode = ["explore"]
      }else if(keys.z_key){
        model.player.status.atk += point_distributed.atk
        model.player.status.def += point_distributed.def
        model.player.status.effi += point_distributed.effi
        point_distributed = {atk:0,def:0,effi:0,rest:point_distributed.rest}
        battle.dist_point = point_distributed.rest
      }else if(keys.dir_key2.equals(model.dir.down)){
        cursor[mode] = utils.limit(cursor[mode] + 1, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.up)){
        cursor[mode] = utils.limit(cursor[mode] - 1, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.left)){
        if(point_distributed[dist_props[cursor[mode]]] > 0) {
          point_distributed[dist_props[cursor[mode]]] -= point_dist_rate[dist_props[cursor[mode]]]
          point_distributed.rest++
        }
      }else if(keys.dir_key2.equals(model.dir.right)){
        if(point_distributed.rest > 0){
          point_distributed.rest--
          point_distributed[dist_props[cursor[mode]]]+=point_dist_rate[dist_props[cursor[mode]]]
        }
      }
      break
      default:
      throw "default reached"
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
        keys.dir_key2 = model.dir.left
        break
      case 38:
        keys.dir_key = model.dir.up
        keys.dir_key2 = model.dir.up
        break;
      case 39:
        keys.dir_key = model.dir.right
        keys.dir_key2 = model.dir.right
        break
      case 40:
        keys.dir_key = model.dir.down
        keys.dir_key2 = model.dir.down
        break
      case 90:
        keys.z_key = true
        break
      case 88:
        keys.x_key = true
      case 67:
        keys.c_key = true
    
      default:
        break;
    }
  }

  export function keyup(e:KeyboardEvent){
    var keyCode = e.keyCode
    switch (keyCode) {
      case 37:
        if(keys.dir_key.equals(model.dir.left)) keys.dir_key = model.dir.none
        break
      case 38:
        if(keys.dir_key.equals(model.dir.up)) keys.dir_key = model.dir.none
        break;
      case 39:
        if(keys.dir_key.equals(model.dir.right)) keys.dir_key = model.dir.none
        break
      case 40:
        if(keys.dir_key.equals(model.dir.down)) keys.dir_key = model.dir.none
        break
      default:
        break;
    }
  }

  export function touchstart(e:TouchEvent){
    var rect = canvas.getBoundingClientRect()
    var x = e.targetTouches[0].clientX - rect.left
    var y = e.targetTouches[0].clientY - rect.top
    keys.touch_start_pos = utils.some(new utils.Pos(x,y))
  }

  export function touchmove(e:TouchEvent){
    var rect = canvas.getBoundingClientRect()
    var x = e.changedTouches[0].clientX - rect.left
    var y = e.changedTouches[0].clientY - rect.top
    keys.touch_move_pos = utils.some(new utils.Pos(x,y))
  }
}

window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown)
window.addEventListener("keyup", main.keyup)