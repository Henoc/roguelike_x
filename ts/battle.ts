namespace battle{

  export class Status{
    hp:number
    max_hp:number
    atk:number
    def:number
    dex:number
    eva:number

    constructor(max_hp:number,hp:number,atk:number,def:number,dex:number,eva:number){
      this.max_hp = max_hp
      this.hp = hp
      this.atk = atk
      this.def = def
      this.dex = dex
      this.eva = eva
    }

    static zero(){
      return new Status(0,0,0,0,0,0)
    }

    static of_food(max_hp){
      return new Status(max_hp,0,0,0,0,0)
    }

    static of_drink(hp){
      return new Status(0,hp,0,0,0,0)
    }

    static of_knife(atk){
      return new Status(0,0,atk,0,0,0)
    }

    static of_guard(def){
      return new Status(0,0,0,def,0,0)
    }

    copy(){
      let copied = new Status(this.max_hp,this.hp,this.atk,this.def,this.dex,this.eva)
      return copied
    }

    add(that:Status){
      return new Status(this.max_hp + that.max_hp, utils.limit(this.hp + that.hp, 0, this.max_hp + that.max_hp + 1), this.atk + that.atk, this.def + that.def, this.dex + that.dex, this.eva + that.eva)
    }
  }

  export let status_jp_names = {max_hp:"最大HP",hp:"HP",atk:"攻撃",def:"防御",dex:"命中",eva:"回避"}

  export let player_exp = 0
  export let dist_point = 0
  export function add_exp(exp:number){
    player_exp += exp
    while(player_exp >= max_exp()){
      player_exp -= max_exp()
      model.player.level++
      dist_point++
      let real_pos = model.player.upos.sub(new utils.Pos(1,2)).mul(view.unit_size).sub(view.prefix_pos)
      utils.start_anim("level_up",4 / main.sp60f,true,(frame) => real_pos, new utils.Pos(96,96), 1)
      utils.log.push("レベルが上がった")
    }
  }
  export function max_exp(){
    return Math.floor(5 * Math.pow(1.2, model.player.level))
  }

}