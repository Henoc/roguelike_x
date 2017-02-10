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
  
  export function limit(n:number,min:number,max:number){
    return n < min ? min : (n > max ? max : n)
  }

  export abstract class Option<T>{
    abstract get():T;
    abstract foreach(fn:(e:T) => void):void
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
  }

  export class None<T> extends Option<T>{
    get():T{
      throw "get() call of none";
    }
    foreach(fn:(e:T) => void):void{
    }
  }

  export function none<T>(){
    return new None<T>()
  }

  export function some<T>(t:T){
    return new Some(t)
  }
}