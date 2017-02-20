namespace utils{
  /**
   * board[pre_y][pre_x] へ二次元的に paper を代入する
   * @param board 破壊的変更を受ける
   */
  export function paste(board:number[][], paper:number[][], pre_y:number,pre_x:number){
    for(let i = pre_y; i < pre_y + paper.length; i++){
      for(let j = pre_x; j < pre_x + paper[i - pre_y].length; j++){
        board[i][j] = paper[i - pre_y][j - pre_x]
      }
    }
  }

  export function randInt(max:number):number {
    return Math.floor( Math.random() * max )
  }

  export class Pos{
    x:number
    y:number
    constructor(x:number,y:number){
      this.x = x
      this.y = y
    }
    add(that:Pos){
      return new Pos(this.x + that.x, this.y + that.y)
    }
    sub(that:Pos){
      return new Pos(this.x - that.x, this.y - that.y)
    }
    mul(that:Pos){
      return new Pos(this.x * that.x, this.y * that.y)
    }
    mul_bloadcast(n:number){
      return new Pos(this.x * n, this.y * n)
    }
    div_bloadcast(divisor:number){
      return new Pos(this.x / divisor, this.y / divisor)
    }
    equals(that:Pos){
      return this.x == that.x && this.y == that.y
    }
    map(f:(n:number)=>number){
      return new Pos(f(this.x),f(this.y))
    }
  }

  export function all<T>(ary:T[],fn : (elem:T) => boolean){
    for(let v of ary){
      if(!fn(v)) return false
    }
    return true
  }

  export function exist<T>(ary:T[], fn: (elem:T) => boolean){
    for(let v of ary){
      if(fn(v)) return true
    }
    return false
  }
  
  /**
   * [min,max)
   */
  export function limit(n:number,min:number,max:number){
    return n < min ? min : (n >= max ? max - 1 : n)
  }

  /**
   * [min,max]
   */
  export function included_limit(n:number, min:number, max: number){
    return n < min ? min : (n > max ? max : n)
  }

  export function lower_bound(n:number, min:number){
    return n < min ? min : n
  }

  export abstract class Option<T>{
    abstract get():T;
    abstract foreach(fn:(e:T) => void):void
    abstract get_or_else(e:T):T
    abstract map<U>(fn:(e:T)=>U):Option<U>
    abstract exist():boolean
  }

  export class Some<T> extends Option<T>{
    constructor(private t:T){
      super()
    }
    get(){
      return this.t
    }
    foreach(fn:(e:T) => void):void{
      fn(this.t)
    }
    map<U>(fn:(e:T) => U):Option<U>{
      return some(fn(this.t))
    }
    get_or_else(e:T):T{
      return this.t
    }
    exist(){
      return true
    }
  }

  export class None<T> extends Option<T>{
    get():T{
      throw "get() call of none";
    }
    foreach(fn:(e:T) => void):void{
    }
    map<U>(fn:(e:T)=>U):Option<U>{
      return none<U>()
    }
    get_or_else(e:T):T{
      return e
    }
    exist(){
      return false
    }
  }

  export function none<T>(){
    return new None<T>()
  }

  export function some<T>(t:T){
    return new Some(t)
  }

  export function fillText_n(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, font_size:number, newline_size:number){
    let strs = text.split("\n")
    for(let i = 0; i < strs.length; i++){
      ctx.fillText(strs[i],x,y + newline_size * i)
    }
  }

  export class Frame{
    pos:Pos
    wh:Pos
    color:string
    contents:any[]
    /**
     * start points of contents
     */
    start_points:Pos[]
    margin:number
    font_size:number
    text_color:string
    life:number
    constructor(x:number,y:number,w:number,h:number,margin:number,color:string,life?:number){
      this.pos = new Pos(x,y)
      this.wh = new Pos(w,h)
      this.color = color
      this.margin = margin
      this.font_size = 14
      this.text_color = "white"
      this.contents = []
      this.start_points = [this.pos.add(new Pos(margin,margin))]
      this.life = life
    }
    insert_text(text:string){
      this.contents.push({
        type:"text",
        text:text,
        font_size:this.font_size,
        color:this.text_color
      })
      let last = this.start_points[this.start_points.length - 1]
      this.start_points.push(last.add(new Pos(0,this.font_size * 1.2)))
    }
    insert_subframe(width:Option<number>,height:Option<number>,color:string,margin?:number){
      if(margin == undefined) margin = this.margin
      let last = this.start_points[this.start_points.length - 1]
      let width2 = width.get_or_else(this.pos.x + this.wh.x - last.x - this.margin)
      let height2 = height.get_or_else(this.pos.y + this.wh.y - last.y - this.margin)
      // inherits parent frame properties
      let inner = new Frame(last.x,last.y,width2,height2,margin,color)
      inner.font_size = this.font_size
      inner.text_color = this.text_color

      this.contents.push({
        type:"frame",
        frame:inner
      })
      this.start_points.push(last.add(new Pos(0,height2)))
      return inner
    }

    /**
     * move a start point of next content to right
     * 
     * @param per percentage of moving
     */
    move_point_x(per:number){
      let inner_width = this.wh.x - 2 * this.margin
      let last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(inner_width * per,0))
    }

    move_point_y(per:number){
      let inner_height = this.wh.y - 2 * this.margin
      let last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(0,inner_height * per))
    }


    reset_point(){
      this.start_points.pop()
      this.start_points.push(this.pos.add(new Pos(this.margin,this.margin)))
    }

    print(ctx:CanvasRenderingContext2D){
      ctx.fillStyle = this.color
      ctx.fillRect(this.pos.x,this.pos.y,this.wh.x,this.wh.y)
      for(let i = 0; i < this.contents.length; i++){
        let pos = this.start_points[i]
        let content = this.contents[i]
        switch(content["type"]){
          case "text":
          ctx.font = "normal " + content["font_size"] + "px sans-serif"
          ctx.fillStyle = content["color"]
          ctx.fillText(content["text"],pos.x,pos.y)
          break
          case "frame":
          let sub_frame = (<Frame>content["frame"])
          if(sub_frame.life == undefined || sub_frame.life >=0 ) sub_frame.print(ctx)
          break
          default:
          throw "default reached"
        }
      }
      if(this.life != undefined && this.life >= 0){
        this.life -= main.sp60f
      }
    }
  }

  // export class ScrollableFrame extends Frame {
  //   inner_canvas : HTMLCanvasElement  // size w * h
  //   inner_pos : Pos
  //   inner_wh : Pos
  //   constructor(x:number,y:number,w:number,h:number,inner_w:number,inner_h:number,margin:number,color:string,life?:number){
  //     super(x,y,w,h,margin,color,life)
  //     this.inner_wh = new Pos(inner_w, inner_h)
  //     this.inner_pos = new Pos(inner_w - w, inner_h - h)
  //   }

  //   print(ctx:CanvasRenderingContext2D){

  //   }
  // }

  export let frame_tasks :Frame[] = []
  export function print_frame(ctx:CanvasRenderingContext2D){
    for(let i = 0; i < frame_tasks.length; i++){
      frame_tasks[i].print(ctx)
      if(frame_tasks[i].life != undefined && frame_tasks[i].life < 0) {
        frame_tasks.splice(i,1)
        i--
      }
    }
  }

  // let tmp_frame : Option<Frame> = none<Frame>()
  // export function start_tmp_frame(text:string){
  //   if(tmp_frame.exist()) tmp_frame.get().life = 80
  //   else{
  //     let tf = new utils.Frame(view.window_w * 0.75, view.window_h * 0.4, view.window_w * 0.25, view.window_h * 0.2, view.window_h * 0.03, "rgba(0,0,0,0)",80)
  //     tf.font_size = view.window_h / 40
  //     tmp_frame = some(tf)
  //   }
  //   tmp_frame.get().insert_text(text)
  // }
  // export function print_tmp_frame(ctx:CanvasRenderingContext2D){
  //   tmp_frame.foreach(t => {
  //     t.print(ctx)
  //     if(t.life != undefined && t.life < 0) tmp_frame = none<Frame>()
  //   })
  // }
  // export function delete_tmp_frame(){
  //   tmp_frame = none<Frame>()
  // }

  export let log : string[] = []
  export function print_log(ctx:CanvasRenderingContext2D){
    if(log.length >= 20) log.splice(0,log.length - 20 + 1)
    ctx.font = "normal " + (view.window_h / 40) + "px sans-serif"
    ctx.fillStyle = "white"
    for(let i = log.length - 1; i >= 0; i--){
      let y = view.window_h * 0.6 - (log.length - 1 - i) * view.window_h / 40 * 1.2
      ctx.fillText(log[i], view.window_w * 0.75, y)
      ctx.fillStyle = "gray"
    }
  }

  export function shallow_copy(obj:any):any {
    let clone = {}
    for(let str in obj){
      clone[str] = obj[str]
    }
    return clone
  }

  class TmpAnim{
    name:string
    counter:number
    fps:number
    pos:Pos
    src_wh:Pos
    repeat:number
    constructor(name:string, fps:number, pos:Pos,src_wh:Pos,repeat:number){
      this.name = name
      this.counter = 0
      this.fps = fps
      this.pos = pos
      this.src_wh = src_wh
      this.repeat = repeat
    }
    print(ctx:CanvasRenderingContext2D){
      let cnt = Math.floor(this.counter / this.fps) % main.Asset.image_frames[this.name]
      ctx.drawImage(main.Asset.images[this.name],0,this.src_wh.y * cnt,this.src_wh.x,this.src_wh.y,this.pos.x,this.pos.y,this.src_wh.x,this.src_wh.y)
      this.counter++
    }
  }
  let tmp_anim_tasks:TmpAnim[] = []
  export function start_anim(name:string, fps:number, pos:Pos, src_wh:Pos, repeat?:number){
    if(repeat == undefined) repeat = 1
    tmp_anim_tasks.push(new TmpAnim(name,fps,pos,src_wh,repeat))
  }
  export function print_anims(ctx:CanvasRenderingContext2D){
    for(let i = 0; i < tmp_anim_tasks.length; i++){
      tmp_anim_tasks[i].print(ctx)
      if(tmp_anim_tasks[i].counter / tmp_anim_tasks[i].fps >= main.Asset.image_frames[tmp_anim_tasks[i].name] * tmp_anim_tasks[i].repeat) {
        tmp_anim_tasks.splice(i,1)
        i--
      }
    }
  }

  let tmp_num_tasks:{number:number|"miss",color:string,pos:Pos,counter:number}[] = []
  /**
   * damage expression
   */
  export function start_tmp_num(n:number|"miss",color:string,pos:Pos){
    tmp_num_tasks.push({number:n, color:color, pos:pos, counter:80 / main.sp60f})
  }
  export function print_tmp_num(ctx:CanvasRenderingContext2D){
    function print_number(k:string, pos:Pos, cnt:number):Pos{
      if(cnt >= 0){
        cnt = limit(cnt, 0, 10 / main.sp60f)
        let delta = view.window_h / 240
        ctx.fillText(k, pos.x, pos.y - (10 / main.sp60f - cnt) * delta)
      }
      let w = ctx.measureText(k).width
      return pos.add(new Pos(w,0))
    }

    for(let i = 0; i < tmp_num_tasks.length; i++){
      let tmp_num_task = tmp_num_tasks[i]
      ctx.font = "normal " + (view.window_h / 40) + "px sans-serif"
      ctx.fillStyle = tmp_num_task.color
      let num_text = tmp_num_task.number + ""
      let pos = tmp_num_task.pos
      for(let j = 0; j < num_text.length; j++){
        pos = print_number(num_text[j],pos,80 / main.sp60f - tmp_num_task.counter - j * 10 / main.sp60f)
      }
      tmp_num_task.counter--
      if(tmp_num_task.counter <= 0) {
        tmp_num_tasks.splice(i,1)
        i--
      }
    }
  }

  let reversal_circle_memo: { [key: number]: HTMLCanvasElement; }  = {}
  export function reversal_circle(r:number):HTMLCanvasElement {
    if(r in reversal_circle_memo) return reversal_circle_memo[r]
    let canvas = document.createElement("canvas")
    canvas.width = view.window_w
    canvas.height = view.window_h
    let ctx = canvas.getContext("2d")
    let image_data = ctx.createImageData(view.window_w, view.window_h)
    let px = view.window_w / 2 + view.move_center.x
    let py = view.window_h / 2 + view.move_center.y
    let eps = r * 0.05
    for(let y = 0; y < view.window_h; y++){
      for(let x = 0; x < view.window_w; x++){
        let i = (y * view.window_w + x) * 4
        let d = Math.sqrt( Math.pow(px - x,2) + Math.pow(py - y,2) )
        if(d < r){
          // nothing to do
        }else{
          image_data.data[i+3] = d < r + eps ? 255 * (d - r) / eps : 255
        }
      }
    }
    ctx.putImageData(image_data,0,0)
    reversal_circle_memo = {} // 以前のものを破棄
    reversal_circle_memo[r] = canvas
    return canvas
  }
}