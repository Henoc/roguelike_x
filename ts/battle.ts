namespace battle{

  export class Status{
    hp:number
    max_hp:number
    atk:number
    def:number
    effi:number
    heal:number

    constructor(max_hp,hp,atk,def,effi?,heal?){
      this.max_hp = max_hp
      this.hp = hp
      this.atk = atk
      this.def = def
      this.effi = effi == undefined ? 0 : effi
      this.heal = heal == undefined ? 0 : heal
    }

    static of_food(max_hp){
      return new Status(max_hp,0,0,0)
    }

    static of_drink(hp){
      return new Status(0,hp,0,0)
    }

    static of_knife(atk){
      return new Status(0,0,atk,0)
    }

    static of_guard(def){
      return new Status(0,0,0,def)
    }

    copy(){
      var copied = new Status(this.max_hp,this.hp,this.atk,this.def,this.effi,this.heal)
      return copied
    }

    add(that:Status){
      return new Status(this.max_hp + that.max_hp, utils.limit(this.hp + that.hp, 0, this.max_hp + that.max_hp + 1), this.atk + that.atk, this.def + that.def,this.effi + that.effi,this.heal + that.heal)
    }

    /**
     * return new attacked status of that
     * 必ず1は毎回減る
     */
    attackTo(that:Status){
      var that2 = that.copy()
      // [0, hp - 1]
      that2.hp = utils.limit(that2.hp + that.def - this.atk, 0, that2.hp)
      return that2
    }
  }

}