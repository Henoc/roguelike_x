namespace utils{
  /**
   * board[pre_y][pre_x] へ二次元的に paper を代入する
   * @param board 破壊的変更を受ける
   */
  export function paste(board:number[][], paper:number[][], pre_y:number,pre_x:number){
    for(var i = pre_y; i < pre_y + paper.length; i++){
      for(var j = pre_x; j < pre_x + paper[i - pre_y].length; j++){
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
  
  /**
   * [min,max)
   */
  export function limit(n:number,min:number,max:number){
    return n < min ? min : (n >= max ? max - 1 : n)
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
    var strs = text.split("\n")
    for(var i = 0; i < strs.length; i++){
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
    constructor(x:number,y:number,w:number,h:number,margin:number,color:string){
      this.pos = new Pos(x,y)
      this.wh = new Pos(w,h)
      this.color = color
      this.margin = margin
      this.font_size = 14
      this.text_color = "white"
      this.contents = []
      this.start_points = [this.pos.add(new Pos(margin,margin))]
    }
    insert_text(text:string){
      this.contents.push({
        type:"text",
        text:text,
        font_size:this.font_size,
        color:this.text_color
      })
      var last = this.start_points[this.start_points.length - 1]
      this.start_points.push(last.add(new Pos(0,this.font_size * 1.2)))
    }
    insert_subframe(width:Option<number>,height:Option<number>,color:string,margin?:number){
      if(margin == undefined) margin = this.margin
      var last = this.start_points[this.start_points.length - 1]
      var width2 = width.get_or_else(this.pos.x + this.wh.x - last.x - this.margin)
      var height2 = height.get_or_else(this.pos.y + this.wh.y - last.y - this.margin)
      // inherits parent frame properties
      var inner = new Frame(last.x,last.y,width2,height2,margin,color)
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
      var inner_width = this.wh.x - 2 * this.margin
      var last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(inner_width * per,0))
    }

    move_point_y(per:number){
      var inner_height = this.wh.y - 2 * this.margin
      var last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(0,inner_height * per))
    }


    reset_point(){
      this.start_points.pop()
      this.start_points.push(this.pos.add(new Pos(this.margin,this.margin)))
    }

    print(ctx:CanvasRenderingContext2D){
      ctx.fillStyle = this.color
      ctx.fillRect(this.pos.x,this.pos.y,this.wh.x,this.wh.y)
      for(var i = 0; i < this.contents.length; i++){
        var pos = this.start_points[i]
        var content = this.contents[i]
        switch(content["type"]){
          case "text":
          ctx.font = "normal " + content["font_size"] + "px sans-serif"
          ctx.fillStyle = content["color"]
          ctx.fillText(content["text"],pos.x,pos.y)
          break
          case "frame":
          (<Frame>content["frame"]).print(ctx)
          break
        }
      }
    }
  }
}