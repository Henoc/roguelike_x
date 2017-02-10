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

  export function print(ctx : CanvasRenderingContext2D){
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
        field_tile.print(ctx,realPos)
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
      entity.print(ctx,realEntityPos)
    }

    // menu mode = items
    if(main.menu_mode[0] == "items"){
      var window_w = window_usize.x * unit_size.x
      var window_h = window_usize.y * unit_size.y

      var top_frame = new utils.Frame(0,0,window_w,window_h,window_h * 0.05,"rgba(0,0,0,0)")
      top_frame.move_point_x(0.6)
      var item_top = top_frame.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(0,0,0,0.6)")
      
      item_top.insert_text(window_h / 32, "white","\u30A2\u30A4\u30C6\u30E0")
      for(var i = 0; i < items.item_entities.length; i++){
        var itemEntity = items.item_entities[i]
        item_top.insert_text(window_h / 32,"white", (main.cursor["items"] == i ? ">" : " ") + itemEntity.item.name)
      }

      top_frame.print(ctx)
    }

    // menu mode
    ctx.fillStyle = "white"
    ctx.fillText(main.menu_mode.join(" > "),0,0)
  }
}