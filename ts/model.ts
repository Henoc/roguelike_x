namespace model{

  interface Print{
    print():void
  }

  // 壁，床，キャラクター
  class Tile{
    color:string
    type:string
    isWall:boolean
    constructor(color:string, type:string, isWall:boolean){
      this.color = color
      this.type = type
      this.isWall = isWall
    }
    print(ctx:CanvasRenderingContext2D, realPos: utils.Pos){
      ctx.fillStyle = this.color

      switch(this.type){
        case "square":
        ctx.fillRect(realPos.x, realPos.y,
          view.unit_size.x, view.unit_size.y
        )
        break;
        case "minisq":
        var uw02 = view.unit_size.x * 0.2
        var uh02 = view.unit_size.y * 0.2
        ctx.fillRect(realPos.x + uw02, realPos.y + uh02,
          view.unit_size.x * 0.6, view.unit_size.y * 0.6
        )
        break;
      }
    }
  }

  // タイルインスタンス
  export var tiles: { [key: string]: Tile; } = {}
  tiles["floor"] = new Tile("rgba(20,40,40,1)","square",false)
  tiles["wall"] = new Tile("rgba(50,30,10,1)","square",true)
  tiles["player"] = new Tile("rgba(180,110,180,1)","minisq",true)
  tiles["enemy1"] = new Tile("rgba(15,140,15,1)","minisq",true)

  // 実際の配置物
  export class Entity{
    upos:utils.Pos // unit position
    tile:Tile
    anim_tasks:view.Anim[]
    constructor(ux:number, uy:number, tile:Tile){
      this.upos = new utils.Pos(ux,uy)
      this.tile = tile;
      this.anim_tasks = []
    }
    static of(upos:utils.Pos,tile:Tile){
      return new Entity(upos.x,upos.y,tile)
    }

    /**
     * アニメーション挿入，当たり判定もここでやる
     */
    move(udelta:utils.Pos){
      var moved = this.upos.add(udelta)
      if(
        map.inner(moved) &&
        utils.all(get_entities_at(moved),e => !e.tile.isWall) &&
        !map.field_at_tile(moved).isWall
      ){
        this.anim_tasks.push(new view.MoveAnim(this.upos))
        this.upos = moved
      }
    }

    attack(){
      // 壁を壊す
      for(let v of dir_ary){
        var directed = this.upos.add(v)
        if(map.inner(directed) && map.field_at_tile(directed).isWall){
          map.field_set_by_name(directed,"floor")
        }
      }
      this.anim_tasks.push(new view.AttackAnim())
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
        model.Entity.of(upos,model.tiles["enemy1"])
      )
    }

    // player を壁でないところにランダム配置
    var player_upos = randomUpos(n => !tiles[map.entity_names[n]].isWall)
    player = new model.Entity(player_upos.x,player_upos.y,model.tiles["player"])
    entities.push(player)

    // player を中心とする画面にする
    view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5,0.5)).mul(view.unit_size)
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
    player.move(keys.dir_key)
    monsters_action()
  }

  export function attack(){
    player.attack()
    monsters_action()
  }

  function monsters_action(){
    // monsters をランダムに移動させる
    for(let ent of entities){
      if(ent == player) continue
      ent.move(new utils.Pos(
        utils.randInt(2) - 1,
        utils.randInt(2) - 1))
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
  export function keyReset(){
    dir_key = model.dir.none
    z_key = false
  }
}