namespace model{

  // 壁，床，キャラクター
  class Tile{
    name:string
    color:string
    image_name:string  // 形 画像にするときはこれを Image オブジェクトにする？
    isWall:boolean
    isDired:boolean
    status:utils.Option<battle.Status>
    constructor(name:string, color:string, image_name:string, isWall:boolean, isDired:boolean, status:utils.Option<battle.Status>){
      this.name = name
      this.color = color
      this.image_name = image_name
      this.isWall = isWall
      this.isDired = isDired
      this.status = status
    }
    print(ctx:CanvasRenderingContext2D, realPos: utils.Pos, direction:"left"|"right"|"up"|"down"|"none", cnt:number){
      ctx.fillStyle = this.color

      var dired_image_name = this.image_name
      if(direction != "none") dired_image_name += "_" + direction
      var frms = main.Asset.image_frames[dired_image_name]
      ctx.drawImage(main.Asset.images[dired_image_name],
        0,(Math.floor(cnt/4)%frms) * view.unit_size.y,32,32,realPos.x,realPos.y,view.unit_size.x,view.unit_size.y,)

      // switch(this.image_name){
      //   case "square":
      //   ctx.fillRect(realPos.x, realPos.y,
      //     view.unit_size.x, view.unit_size.y
      //   )
      //   break;
      //   case "minisq":
      //   var uw02 = view.unit_size.x * 0.2
      //   var uh02 = view.unit_size.y * 0.2
      //   ctx.fillRect(realPos.x + uw02, realPos.y + uh02,
      //     view.unit_size.x * 0.6, view.unit_size.y * 0.6
      //   )
      //   break;
      // }
    }
  }

  // タイルインスタンス
  export var tiles: { [key: string]: Tile; } = {}
  tiles["floor"] = new Tile("\u5e8a","rgba(20,40,40,1)","floor",false,false,utils.none<battle.Status>())
  tiles["wall"] = new Tile("\u58c1","rgba(50,30,10,1)","wall",true,false,utils.none<battle.Status>())
  tiles["player"] = new Tile("\u30d7\u30ec\u30a4\u30e4\u30fc","rgba(180,110,180,1)","player",true,true,utils.some(new battle.Status(10,10,1,0)))
  tiles["mame_mouse"] = new Tile("\u8C46\u306D\u305A\u307F","rgba(15,140,15,1)","mame_mouse",true,true,utils.some(new battle.Status(2,2,1,0)))

  // 実際の配置物
  export class Entity{
    upos:utils.Pos // unit position
    tile:Tile
    status:battle.Status
    anim_tasks:view.Anim[]
    direction:"left"|"right"|"up"|"down"|"none"
    constructor(ux:number, uy:number, tile:Tile){
      this.upos = new utils.Pos(ux,uy)
      this.tile = tile;
      this.status = tile.status.get()
      this.anim_tasks = []
      this.direction = tile.isDired ? "down" : "none"
    }
    static of(upos:utils.Pos,tile:Tile){
      return new Entity(upos.x,upos.y,tile)
    }

    print(ctx:CanvasRenderingContext2D,realPos:utils.Pos,cnt:number){
      this.tile.print(ctx,realPos,this.direction,this.status.hp != 0 ? cnt : 0)

      ctx.fillStyle = this.status.hp != 0 ? "white" : "red"
      var font_size = view.window_usize.y * view.unit_size.y / 40
      ctx.font = "normal " + font_size + "px sans-serif"
      utils.fillText_n(ctx,this.tile.name + "\n" + this.status.hp + "/" + this.status.max_hp, realPos.x, realPos.y - view.unit_size.y, font_size ,font_size)
    }

    /**
     * アニメーション挿入，当たり判定もここでやる
     */
    move(udelta:utils.Pos){
      if(udelta.x > 0 && udelta.y == 0) this.direction = "right"
      if(udelta.x < 0 && udelta.y == 0) this.direction = "left"
      if(udelta.x == 0 && udelta.y < 0) this.direction = "up"
      if(udelta.x == 0 && udelta.y > 0) this.direction = "down"

      var moved = this.upos.add(udelta)
      if(
        map.inner(moved) &&
        utils.all(get_entities_at(moved),e => !e.tile.isWall || e.status.hp == 0) &&
        !map.field_at_tile(moved).isWall
      ){
        this.anim_tasks.push(new view.MoveAnim(this.upos))
        this.upos = moved
      }
    }

    attack(){
      // 壁を壊す | 攻撃する
      for(let v of dir_ary){
        var directed = this.upos.add(v)
        if(!map.inner(directed)) continue
        if(map.field_at_tile(directed).isWall){
          map.field_set_by_name(directed,"floor")
        }
        // 誰かいれば当たる
        for(let entity of get_entities_at(directed)){
          entity.status = this.status.attackTo(entity.status)
        }
      }
      this.anim_tasks.push(new view.AttackAnim())
    }

    /**
     * that が隣接しているか
     */
    reach(that:Entity){
      for(let v of dir_ary){
        var directed = this.upos.add(v)
        if(that.upos.equals(directed)) return true
      }
      return false
    }

    near(that:Entity, r:number){
      return Math.sqrt(Math.pow(this.upos.x - that.upos.x,2)+Math.pow(this.upos.y-that.upos.y,2)) < r
    }

    dir_to(that:Entity):"left"|"right"|"up"|"down"{
      if(that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y) return "down"
      if(that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)   return "up"
      if(that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)  return "left"
      if(that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y)  return "right"
      if(that.upos.y == (that.upos.x - this.upos.x) + this.upos.y && that.upos.y > -(that.upos.x - this.upos.x) + this.upos.y)  return utils.randInt(2) == 0 ? "down" : "right"
      if(that.upos.y == (that.upos.x - this.upos.x) + this.upos.y && that.upos.y < -(that.upos.x - this.upos.x) + this.upos.y)  return utils.randInt(2) == 0 ? "up" : "left"
      if(that.upos.y > (that.upos.x - this.upos.x) + this.upos.y && that.upos.y == -(that.upos.x - this.upos.x) + this.upos.y)  return utils.randInt(2) == 0 ? "down" : "left"
      if(that.upos.y < (that.upos.x - this.upos.x) + this.upos.y && that.upos.y == -(that.upos.x - this.upos.x) + this.upos.y)  return utils.randInt(2) == 0 ? "up" : "right"
      return "down"
    }
  }

  // 実際の配置物のインスタンス
  export var entities : Array<Entity> = []

  export var player : Entity

  export function initEntities(){
    map.makeMap()

    // enemy をランダムに数匹配置
    for(var i = 0; i < 5; i++){
      var upos = randomUpos(n => !tiles[map.entity_names[n]].isWall)
      entities.push(
        model.Entity.of(upos,model.tiles["mame_mouse"])
      )
    }

    // player を壁でないところにランダム配置
    var player_upos = randomUpos(n => !tiles[map.entity_names[n]].isWall)
    player = new model.Entity(player_upos.x,player_upos.y,model.tiles["player"])
    entities.push(player)

    // player を中心とする画面にする
    view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5,0.5)).mul(view.unit_size)

    // items
    items.item_entities = [
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.onigiri),
      new items.ItemEntity(items.type.orange_juice),
      new items.ItemEntity(items.type.knife),
      new items.ItemEntity(items.type.flying_pan),
    ]
  }

  /**
   * cond を満たす filed の upos をとる
   */
  function randomUpos(cond : (n:number) => boolean){
    var upos:utils.Pos
    do{
      upos = new utils.Pos(
        utils.randInt(map.width),
        utils.randInt(map.height))
    }while(!cond(map.field_at(upos)))
    return upos
  }

  export var dir = {
    down : new utils.Pos(0,1),
    up : new utils.Pos(0,-1),
    left : new utils.Pos(-1,0),
    right : new utils.Pos(1,0),
    none : new utils.Pos(0,0)
  }

  export var dir_ary = [dir.down,dir.up,dir.left,dir.right]

  export function move(){
    monsters_action()
    player.move(keys.dir_key)
  }

  export function attack(){
    player.attack()
    monsters_action()
  }

  function monsters_action(){
    // monsters をランダムに移動させる
    for(let ent of entities){
      if(ent == player) continue
      if(ent.status.hp == 0) continue
      if(ent.reach(player)){
        ent.direction = ent.dir_to(player)
        ent.attack()
      }else if(ent.near(player,4)){
        ent.move(dir[ent.dir_to(player)])
      }else{
        ent.move(dir_ary[utils.randInt(3)])
      }
    }
  }

  export function get_entities_at(upos:utils.Pos){
    var ret : Entity[] = []
    for(let v of entities){
      if(v.upos.equals(upos)){
        ret.push(v)
      }
    }
    return ret
  }
}

/**
 * keyboard の状態を管理する singleton
 */
namespace keys{
  export var dir_key = model.dir.none
  export var z_key = false
  export var x_key = false
  export function keyReset(){
    dir_key = model.dir.none
    z_key = false
    x_key = false
  }
}