namespace main{

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let buffer_canvas: HTMLCanvasElement;
  let buffer_ctx: CanvasRenderingContext2D;

  /**
   * expore, items
   */
  export let menu_mode = ["explore"]

  /**
   * cursur[menu_mode.join(">")] にカーソルの位置が入る
   */
  export let cursor = {}
  /**
   * max
   */
  export let cursor_max = {}

  /**
   * for status distribution
   */
  export let point_distributed: {
    atk:number, def:number, dex:number, eva:number, rest:number
  }
  let point_dist_rate = {atk:1,def:1,dex:1,eva:1}

  /**
   * second per 60 frames
   */
  export let sp60f = 1

  export namespace Asset{
    interface Ast{
      type:string;
      name:string;
      src:string;
      frames:number
    }
    export let assets : Ast[] = [
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
      {type: "image", name: "shadow_bird_left", src: "assets/shadow_bird_left.png", frames:6},
      {type: "image", name: "shadow_bird_right", src: "assets/shadow_bird_right.png", frames:6},
      {type: "image", name: "shadow_bird_up", src: "assets/shadow_bird_up.png", frames:4},
      {type: "image", name: "shadow_bird_down", src: "assets/shadow_bird_down.png", frames:4},

      {type: "image", name: "floor", src: "assets/floor.png", frames:1},
      {type: "image", name: "wall", src: "assets/wall.png", frames:1},
      {type: "image", name: "soil", src: "assets/soil.png", frames:1},
      {type: "image", name: "weed", src: "assets/weed.png", frames:1},

      {type: "image", name: "goal", src: "assets/goal.png", frames:1},
      {type: "image", name: "player_left", src: "assets/player_left.png", frames:7},
      {type: "image", name: "player_right", src: "assets/player_right.png", frames:7},
      {type: "image", name: "player_up", src: "assets/player_up.png", frames:7},
      {type: "image", name: "player_down", src: "assets/player_down.png", frames:7},
      {type: "image", name: "level_up", src: "assets/level_up.png", frames:20},
      {type: "image", name: "treasure", src: "assets/treasure.png", frames:1},
      {type: "image", name: "twinkle", src: "assets/twinkle.png", frames:5},
    ];
    export let images = {}
    export let image_frames = {}
    export let loadAssets = (onComplete:() => void) => {
      let total = assets.length;
      let loadCount = 0;

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
        let image = new Image();
        image.onload = onLoad;
        image.src = asset.src;
        images[asset.name] = image
    }
  }

  export function init() {
    canvas = <HTMLCanvasElement> document.getElementById('canvas1');
    ctx = canvas.getContext('2d');
    canvas.width = view.window_w;
    canvas.height = view.window_h;

    canvas.addEventListener("touchstart",main.touchstart)
    canvas.addEventListener("touchmove",main.touchmove)

    ctx.textBaseline = "top"

    // buffer_canvas
    buffer_canvas = document.createElement("canvas")
    buffer_canvas.width = view.window_w
    buffer_canvas.height = view.window_h
    buffer_ctx = buffer_canvas.getContext("2d")
    buffer_ctx.textBaseline = "top"

    // image_frames
    Asset.assets.forEach(asset => {
      Asset.image_frames[asset.name] = asset.frames
    })

    model.rank = 5

    // エンティティの配置
    model.init_entities()

    // アイテム支給
    items.item_entities = [
      new items.ItemEntity(items.type.hamburger),
      new items.ItemEntity(items.type.hamburger),
      new items.ItemEntity(items.type.hamburger),
      new items.ItemEntity(items.type.potion),
      new items.ItemEntity(items.type.knife),
      new items.ItemEntity(items.type.revival),
      new items.ItemEntity(items.type.sharpener),
      new items.ItemEntity(items.type.sharpener),
      new items.ItemEntity(items.type.gourd),
    ]

    Asset.loadAssets(() => {
      requestAnimationFrame(update)
    })

  }

  let lastTimestamp = null

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
        let moved = keys.dir_key.add(model.player.upos)
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
          cursor_max["dist"] = 4
          point_distributed = {atk:0,def:0,dex:0,eva:0,rest:battle.dist_point}
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
            let mode = menu_mode.join(">")
            cursor[mode] = 0
            cursor_max[mode] = items.item_entities[cursor["items"]].get_valid_commands().length
          }
          break
          case "items>command":
          let selected = items.item_entities[cursor["items"]]
          let selected_command_name = selected.get_valid_commands()[cursor["items>command"]]
          if(selected_command_name.indexOf("cannot_") == 0) {
            // nothing to do
          }else switch(selected_command_name){
            case "use":
            if(selected.status.hp > 0) utils.start_tmp_num(selected.status.hp, "springgreen", model.player.upos.mul(view.unit_size).sub(view.prefix_pos))
            model.player.status = model.player.status.add(selected.status)
            let more_prop_names = ["effi","heal"]
            more_prop_names.forEach(name => {
              if(name in selected.more_props) model.player.more_props[name] += selected.more_props[name]
            })
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
            let old_eq : utils.Option<items.ItemEntity> = items.equips[selected.item.equip_region]
            if(old_eq.exist()){
              items.item_entities.push(old_eq.get())
              cursor_max["items"]++
            }
            items.equips[selected.item.equip_region] = utils.some(selected)
            let equipped_status =  model.tiles["player"].status.get().add(items.equips_status_sum())
            equipped_status.max_hp = model.player.status.max_hp
            equipped_status.hp = model.player.status.hp
            model.player.status = equipped_status
            model.player.more_props = items.equips_more_props_sum(model.player.more_props)
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
            break
            case "sharpen":
            let [success_rate, delta_atk] = selected.more_props["sharpen"]
            if(Math.random() < success_rate) {
              items.equips["hand"].get().status.atk += delta_atk
              utils.log.push(selected.item.name + "\u3067\u6B66\u5668\u306E\u5F37\u5316... \u6210\u529F! \u6B66\u5668\u653B\u6483\u529B +" + delta_atk)
            }else{
              items.equips["hand"].get().status.atk = utils.lower_bound(items.equips["hand"].get().status.atk - delta_atk, 0)
              utils.log.push(selected.item.name + "\u3067\u6B66\u5668\u306E\u5F37\u5316... \u5931\u6557! \u6B66\u5668\u653B\u6483\u529B -" + delta_atk)
            }
            // 武器のステータスを変えたので装備計算を再度実行
            model.player.status = model.tiles["player"].status.get().add(items.equips_status_sum())
            model.player.more_props = items.equips_more_props_sum(model.player.more_props)
            items.item_entities.splice(cursor["items"],1)
            cursor_max["items"]--
            cursor["items"] = utils.limit(cursor["items"], 0, cursor_max["items"])
            menu_mode.pop()
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
        let mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] + 1, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.up)){
        let mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] - 1, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.left)){
        let mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] - 20, 0, cursor_max[mode])
      }else if(keys.dir_key2.equals(model.dir.right)){
        let mode = menu_mode.join(">")
        cursor[mode] = utils.limit(cursor[mode] + 20, 0, cursor_max[mode])
      }
      break
      case "dist":
      let mode = menu_mode.join(">")
      let dist_props = ["atk","def","dex","eva"]
      if(keys.x_key || keys.c_key){
        menu_mode.pop()
        if(menu_mode.length == 0) menu_mode = ["explore"]
      }else if(keys.z_key){
        for(let name of dist_props){
          model.player.status[name] += point_distributed[name]
        }
        point_distributed = {atk:0,def:0,dex:0,eva:0,rest:point_distributed.rest}
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

  let render_cnt = 0
  function render(){
    view.print(buffer_ctx,render_cnt)
    let imageData = buffer_ctx.getImageData(0,0,view.window_w,view.window_h)
    ctx.putImageData(imageData,0,0)
    render_cnt++
  }

  export function keydown(e:KeyboardEvent){
    let keyCode = e.keyCode
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
    let keyCode = e.keyCode
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
    let rect = canvas.getBoundingClientRect()
    let x = e.targetTouches[0].clientX - rect.left
    let y = e.targetTouches[0].clientY - rect.top
    keys.touch_start_pos = utils.some(new utils.Pos(x,y))
  }

  export function touchmove(e:TouchEvent){
    let rect = canvas.getBoundingClientRect()
    let x = e.changedTouches[0].clientX - rect.left
    let y = e.changedTouches[0].clientY - rect.top
    keys.touch_move_pos = utils.some(new utils.Pos(x,y))
  }
}

window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown)
window.addEventListener("keyup", main.keyup)