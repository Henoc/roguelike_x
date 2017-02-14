namespace view{

  export var window_usize = new utils.Pos(640 / 32, 480 / 32)
  export var unit_size = new utils.Pos(32,32)
  export var prefix_pos = new utils.Pos(0,0)
  var PROGRESS = 0.2

  /**
   * animation 中なので key 入力をブロック
   * print() 内で更新する
   */
  export var action_lock = false

  /**
   * use only when item dropped
   */
  export class TmpFrame{
    live:number
    frame:utils.Frame
    constructor(texts:string[]){
      this.live = 60
      var window_w = window_usize.x * unit_size.x
      var window_h = window_usize.y * unit_size.y
      this.frame = new utils.Frame(window_w * 0.6, window_h * 0.4, window_w * 0.2, window_h * 0.2, window_h * 0.03, "rgba(0,0,0,0.6)")
      this.frame.font_size = window_h / 32
      for(let v of texts){
        this.frame.insert_text(v)
      }
    }
    print(ctx:CanvasRenderingContext2D){
        this.frame.print(ctx)
        this.live--
        if(this.live == 0) tmp_frame = utils.none<TmpFrame>()
    }
  }
  export var tmp_frame : utils.Option<TmpFrame> = utils.none<TmpFrame>()

  export interface Anim{
    /**
     * animation の1進捗
     * @returns animation is ended
     */
    advance():boolean
    get_upos(current_upos:utils.Pos):utils.Pos
  }

  export class MoveAnim implements Anim{
    pre_upos:utils.Pos
    progress:number
    constructor(pre_upos:utils.Pos){
      this.pre_upos = pre_upos
      this.progress = 0
    }
    advance(){
      this.progress += PROGRESS
      if(this.progress >= 1) {
        this.progress = 1
        return true
      }
      return false
    }
    get_upos(current_upos:utils.Pos){
        return this.pre_upos.mul_bloadcast(1 - this.progress).add(current_upos.mul_bloadcast(this.progress))
    }
  }

  export class AttackAnim implements Anim{
    progress:number = 0
    advance(){
      this.progress += PROGRESS
      if(this.progress >= 1) {
        this.progress = 1
        return true
      }
      return false
    }
    get_upos(current_upos:utils.Pos){
      var theta = Math.PI * 2 * this.progress
      return current_upos.add(new utils.Pos(Math.cos(theta),Math.sin(theta)).mul_bloadcast(0.4))
    }
  }

  export function print(ctx : CanvasRenderingContext2D, cnt:number){
    ctx.clearRect(0,0,
    window_usize.x * unit_size.x,
    window_usize.y * unit_size.y)

    // 画面外は黒
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,
    window_usize.x * unit_size.x,
    window_usize.y * unit_size.y)

    // player を中心とする画面にする
    var tmp = model.player.upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5,0.5)).mul(view.unit_size)
    prefix_pos = tmp.sub(prefix_pos).map(d => utils.limit(d,-unit_size.x * PROGRESS, unit_size.x * PROGRESS)).add(prefix_pos)

    // draw a map
    for(var i = 0; i < map.height; i++){
      for(var j = 0; j < map.width; j++){
        var upos = new utils.Pos(j,i)
        var realPos = upos.mul(unit_size).sub(prefix_pos)
        var field_tile = map.field_at_tile(upos)
        field_tile.print(ctx,realPos,"none",cnt)
      }
    }

    action_lock = false

    // エンティティを描画
    for (let entity of model.entities) {
      // アニメーションがあれば
      var entity_upos = entity.upos
      if(entity.anim_tasks.length != 0){
        action_lock = true

        var firstAnim = entity.anim_tasks[0]
        // アニメーション更新
        if(firstAnim.advance()){
          entity.anim_tasks.shift()
        }
        entity_upos = firstAnim.get_upos(entity.upos)
      }

      var realEntityPos = entity_upos.mul(unit_size).sub(prefix_pos)
      entity.print(ctx,realEntityPos,cnt)
    }


    var window_w = window_usize.x * unit_size.x
    var window_h = window_usize.y * unit_size.y
    var top_frame = new utils.Frame(0,0,window_w,window_h,window_h * 0.03,"rgba(0,0,0,0)")

    if(main.menu_mode[0] == "explore"){
      // hp gage
      top_frame.font_size = window_h / 32
      top_frame.insert_text("level " + model.player.level + "  next " + Math.floor(battle.player_exp) + "/" + battle.max_exp())
      top_frame.insert_text("HP " + model.player.status.hp + "/" + model.player.status.max_hp)
      var max_hp_frame_w = window_w * model.player.status.max_hp / 100
      var max_hp_frame = top_frame.insert_subframe(utils.some(max_hp_frame_w),utils.some(window_h * 0.03), "rgba(0,0,0,1)", window_h * 0.002)
      max_hp_frame.insert_subframe(utils.some((max_hp_frame_w - max_hp_frame.margin * 2) * model.player.status.hp / model.player.status.max_hp),utils.none<number>(), "rgba(0,200,50,1)")
    }
    // menu mode = items
    else if(main.menu_mode[0] == "items"){
      top_frame.move_point_x(0.6)
      var item_top = top_frame.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(0,0,0,0.6)")
      
      item_top.font_size = window_h / 32
      item_top.insert_text("\u30A2\u30A4\u30C6\u30E0")
      for(var i = 0; i < items.item_entities.length; i++){
        var itemEntity = items.item_entities[i]
        item_top.insert_text((main.cursor["items"] == i ? ">" : " ") + itemEntity.item.name)
      }

      top_frame.reset_point()
      var status_frame = top_frame.insert_subframe(utils.some(window_w * 0.3),utils.some(window_h * 0.5),"rgba(0,0,0,0.6)")
      status_frame.insert_text("\u30B9\u30C6\u30FC\u30BF\u30B9")
      
      // 装備品と食べ物でステータス変動の計算が異なる（装備品は付け替えることがある）
      var modified_status = new battle.Status(0,0,0,0)
      var delta_status = new battle.Status(0,0,0,0)
      if(main.cursor_max["items"] != 0){
        if(items.item_entities[main.cursor["items"]].item.equip_region == "none"){
          delta_status = items.item_entities[main.cursor["items"]].item.delta_status
          modified_status = model.player.status.add(delta_status)
        }else{
          var item_entity = items.item_entities[main.cursor["items"]]
          delta_status = item_entity.item.delta_status
          modified_status = model.player.tile.status.get().add(items.equips_status_sum_replace(item_entity))
        }
      }

      status_frame.insert_text("HP " + model.player.status.hp + "/" + model.player.status.max_hp 
        + (delta_status.hp != 0 || delta_status.max_hp != 0 ? " \u2192 " + modified_status.hp + "/" + modified_status.max_hp : "") )
      status_frame.insert_text("\u653B\u6483 " + model.player.status.atk
        + (delta_status.atk != 0 ? " \u2192 " + modified_status.atk : ""))
      status_frame.insert_text("\u9632\u5FA1 " + model.player.status.def
        + (delta_status.def != 0 ? " \u2192 " + modified_status.def : ""))
      status_frame.insert_text("\u71C3\u8CBB " + model.player.status.effi
        + (delta_status.effi != 0 ? " \u2192 " + modified_status.effi : ""))
      status_frame.insert_text("")
      status_frame.insert_text("\u88C5\u5099")
      status_frame.insert_text("\u982D " + items.equips["head"].map(e => e.item.name).get_or_else(""))
      status_frame.insert_text("\u4F53 " + items.equips["body"].map(e => e.item.name).get_or_else(""))
      status_frame.insert_text("\u624B " + items.equips["hand"].map(e => e.item.name).get_or_else(""))
      status_frame.insert_text("\u8DB3 " + items.equips["foot"].map(e => e.item.name).get_or_else(""))

      top_frame.move_point_y(0.2)
      var message = top_frame.insert_subframe(utils.some(window_w * 0.5),utils.none<number>(),"rgba(0,0,0,0.6)")
      if(main.cursor_max["items"] != 0) message.insert_text(items.item_entities[main.cursor["items"]].item.text)
      
      if(main.menu_mode[1] == "command"){
        var command = message.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(100,0,0,0.6)")
        for(var i = 0; i < items.item_entities[main.cursor["items"]].item.commands.length; i++){
          var command_name = items.item_entities[main.cursor["items"]].item.commands[i]
          command.insert_text((main.cursor["items>command"] == i ? ">" : " ") + items.commands[command_name])
        }
      }
    }else if(main.menu_mode[0] == "dist"){
      top_frame.move_point_x(0.2)
      top_frame.move_point_y(0.2)
      var dist_frame = top_frame.insert_subframe(utils.some((window_w - top_frame.margin * 2) * 0.6), utils.some((window_h - top_frame.margin * 2) * 0.6), "rgba(0,0,0,0.6)", window_h * 0.05)
      dist_frame.font_size = window_h / 32
      dist_frame.insert_text("\u30B9\u30C6\u30FC\u30BF\u30B9\u632F\u308A\u5206\u3051")
      dist_frame.insert_text("")
      dist_frame.insert_text("\u632F\u308A\u5206\u3051\u53EF\u80FD\u30DD\u30A4\u30F3\u30C8 " + main.point_distributed.rest)
      dist_frame.insert_text((main.cursor["dist"] == 0 ? ">" : " ") + "\u653B\u6483 " + model.player.status.atk + " + " + main.point_distributed.atk)
      dist_frame.insert_text((main.cursor["dist"] == 1 ? ">" : " ") + "\u9632\u5FA1 " + model.player.status.def + " + " + main.point_distributed.def)
      dist_frame.insert_text((main.cursor["dist"] == 2 ? ">" : " ") + "\u71C3\u8CBB " + model.player.status.effi + " + " + main.point_distributed.effi)
      dist_frame.insert_text("")
      dist_frame.insert_text("\u2190\u2192\u30AD\u30FC\u3067\u632F\u308A\u5206\u3051 Z\u30AD\u30FC\u3067\u6C7A\u5B9A")
    }else if(main.menu_mode[0] == "dead"){
      var dead_frame = top_frame.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(0,0,0,0.6)")
      dead_frame.font_size = window_h / 32
      dead_frame.insert_text("\u6B7B\u306B\u307E\u3057\u305F")
    }
    top_frame.print(ctx)

    // tmp frame
    tmp_frame.foreach(f => f.print(ctx))

    // draw temporal animations
    utils.print_anims(ctx)

    // draw temporal damage animations
    utils.print_tmp_num(ctx)

    // menu mode
    // ctx.fillStyle = "white"
    // ctx.fillText(main.menu_mode.join(" > "),0,0)
  }
}