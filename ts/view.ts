namespace view{

  export var window_usize = new utils.Pos(16,16)
  export var unit_size = new utils.Pos(32,32)
  export var prefix_pos = new utils.Pos(0,0)

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
      this.progress += 0.2
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

  export function print(ctx : CanvasRenderingContext2D){
    ctx.clearRect(0,0,
    window_usize.x * unit_size.x,
    window_usize.y * unit_size.y)

    // 画面外は黒
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,
    window_usize.x * unit_size.x,
    window_usize.y * unit_size.y)

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
      entity.tile.print(ctx,realEntityPos)
    }
  }
}