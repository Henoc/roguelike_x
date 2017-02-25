namespace view{

  export const window_usize = new utils.Pos(640 / 32, 480 / 32)
  export const unit_size = new utils.Pos(32,32)
  export let prefix_pos = new utils.Pos(0,0)
  export const window_w = window_usize.x * unit_size.x
  export const window_h = window_usize.y * unit_size.y
  export const move_center = new utils.Pos(-80,0)

  export function progress_rate(){
    return 0.1 * main.sp60f
  }

  function visual_field_size(){
    const vf = window_h / 2 * 0.75
    let vf_rate = 1
    items.item_entities.forEach(ent => {
      if("view" in ent.more_props) vf_rate += ent.more_props["view"]
    })
    return vf * vf_rate
  }

  /**
   * animation 中なので key 入力をブロック
   * print() 内で更新する
   */
  export let action_lock = false

  export interface EntityAnim{
    /**
     * animation の1進捗
     * @returns animation is ended
     */
    advance():boolean
    get_upos(current_upos:utils.Pos):utils.Pos
  }

  export class MoveAnim implements EntityAnim{
    pre_upos:utils.Pos
    progress:number
    constructor(pre_upos:utils.Pos){
      this.pre_upos = pre_upos
      this.progress = 0
    }
    advance(){
      this.progress += progress_rate()
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

  export class AttackAnim implements EntityAnim{
    progress:number = 0
    advance(){
      this.progress += progress_rate()
      if(this.progress >= 1) {
        this.progress = 1
        return true
      }
      return false
    }
    get_upos(current_upos:utils.Pos){
      let theta = Math.PI * 2 * this.progress
      return current_upos.add(new utils.Pos(Math.cos(theta),Math.sin(theta)).mul_bloadcast(0.4))
    }
  }

  export function print_throw(ctx : CanvasRenderingContext2D, len:number){
    let pos = model.player.upos
    ctx.fillStyle = "rgba(255,0,0,0.3)"
    for(let i = 0; i < len; i++){
      pos = pos.add(main.cursor["throw"])
      let real_pos = pos.mul(unit_size).sub(prefix_pos)
      ctx.fillRect(real_pos.x, real_pos.y, unit_size.x, unit_size.y)
    }
  }

  export function print(ctx : CanvasRenderingContext2D, cnt:number){

    //ctx.clearRect(0,0,window_w,window_h)

    // 画面外は黒
    ctx.fillStyle = "rgba(30,30,30,1)"
    ctx.fillRect(0,0,window_w,window_h)

    // player を中心とする画面にする
    let tmp = model.player.upos.sub(window_usize.div_bloadcast(2)).add(new utils.Pos(0.5,0.5)).mul(view.unit_size).sub(move_center)
    prefix_pos = tmp.sub(prefix_pos).map(d => utils.included_limit(d,-unit_size.x * progress_rate(), unit_size.x * progress_rate())).add(prefix_pos)

    // draw a map
    for(let i = 0; i < map.height; i++){
      for(let j = 0; j < map.width; j++){
        let upos = new utils.Pos(j,i)
        let realPos = upos.mul(unit_size).sub(prefix_pos)
        let field_tile = map.field_at_tile(upos)
        field_tile.print(ctx,realPos,"none",cnt)
      }
    }

    action_lock = false

    // エンティティを描画
    for (let entity of model.entities) {
      // アニメーションがあれば
      let entity_upos = entity.upos
      if(entity.anim_tasks.length != 0){
        action_lock = true

        let firstAnim = entity.anim_tasks[0]
        // アニメーション更新
        if(firstAnim.advance()){
          entity.anim_tasks.shift()
        }
        entity_upos = firstAnim.get_upos(entity.upos)
      }

      let realEntityPos = entity_upos.mul(unit_size).sub(prefix_pos)
      entity.print(ctx,realEntityPos,cnt)
    }

    // 視野
    ctx.drawImage(utils.reversal_circle(visual_field_size()),0,0)

    if(main.menu_mode[0] == "throw") print_throw(ctx, 5)
    
    utils.print_log(ctx)
    utils.print_frame(ctx)
    //utils.print_tmp_frame(ctx)

    // draw temporal animations
    utils.print_anims(ctx)

    // draw temporal damage animations
    utils.print_tmp_num(ctx)
  }
}