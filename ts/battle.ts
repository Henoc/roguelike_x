namespace battle{
  
  export class Status{
    hp:number
    max_hp:number
    atk:number
    def:number
    constructor(max_hp,atk,def){
      this.max_hp = max_hp
      this.hp = max_hp
      this.atk = atk
      this.def = def
    }

    copy(){
      var copied = new Status(this.max_hp,this.atk,this.def)
      copied.max_hp = this.max_hp
      copied.hp = this.hp
      copied.atk = this.atk
      copied.def = this.def
      return copied
    }

    /**
     * return new attacked status of that
     */
    attackTo(that:Status){
      var that2 = that.copy()
      that2.hp = utils.limit(that2.hp + that.def - this.atk, 0, that2.hp)
      return that2
    }
  }

}