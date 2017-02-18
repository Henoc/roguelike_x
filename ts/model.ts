namespace model{

  // 壁，床，キャラクター
  class Tile{
    jp_name:string
    color:string
    name:string  // 形 画像にするときはこれを Image オブジェクトにする？
    isWall:boolean
    isDired:boolean
    status:utils.Option<battle.Status>
    level:number
    drop_list:{name:string,per:number}[]
    more_props:any
    constructor(jp_name:string, color:string, name:string, isWall:boolean, isDired:boolean, status:utils.Option<battle.Status>, level:number, drop_list:{name:string,per:number}[], more_props:any){
      this.jp_name = jp_name
      this.color = color
      this.name = name
      this.isWall = isWall
      this.isDired = isDired
      this.status = status
      this.level = level
      this.drop_list = drop_list
      this.more_props = more_props
    }
    print(ctx:CanvasRenderingContext2D, realPos: utils.Pos, direction:"left"|"right"|"up"|"down"|"none", cnt:number){
      ctx.fillStyle = this.color

      let dired_image_name = this.name
      if(direction != "none") dired_image_name += "_" + direction
      let frms = main.Asset.image_frames[dired_image_name]
      ctx.drawImage(main.Asset.images[dired_image_name],
        0,(Math.floor(cnt/utils.limit(Math.floor(utils.limit(64/frms/main.sp60f,1,64)),1,64))%frms) * view.unit_size.y,32,32,realPos.x,realPos.y,view.unit_size.x,view.unit_size.y,)
    }
  }

  /**
   * エンティティの型
   * 
   * more_props:
   * no_attack 攻撃しない，移動しない
   * no_damage 攻撃を受けない
   * revive(x) HP0になったxターン後に復活
   * hide 移動の間にキャラが表示されない
   * camouflage(x) プレイヤー専用．x%敵の視力が下がる．元は半径4マス．
   */
  export let tiles: { [key: string]: Tile; } = {}
  tiles["floor"] = new Tile("\u5e8a","rgba(20,40,40,1)","floor",false,false,utils.none<battle.Status>(),0,[],{})
  tiles["wall"] = new Tile("\u58c1","rgba(50,30,10,1)","wall",true,false,utils.none<battle.Status>(),0,[],{})
  tiles["player"] = new Tile("\u30d7\u30ec\u30a4\u30e4\u30fc","rgba(180,110,180,1)","player",true,true,utils.some(new battle.Status(10,10,1,0,0,0)),1,[{name:"potion",per:1}],{effi:20, heal:13})
  tiles["goal"] = new Tile("\u30B4\u30FC\u30EB","","goal",false,false,utils.some(new battle.Status(1,1,0,0,0,0)),0,[],{no_attack:true,no_damage:true})
  tiles["mame_mouse"] = new Tile("\u8C46\u306D\u305A\u307F","rgba(15,140,15,1)","mame_mouse",true,true,utils.some(new battle.Status(2,2,1,0,0,0)),1,[{name:"soramame_head",per:0.2},{name:"mame_mouse_ibukuro",per:0.05}],{})
  tiles["lang_dog"] = new Tile("\u4EBA\u8A9E\u3092\u89E3\u3059\u72AC","","lang_dog",true,true,utils.some(new battle.Status(3,3,1,0,0,0)),2,[{name:"lang_dog_shoes",per:0.2},{name:"lang_dog_paper",per:0.03}],{})
  tiles["sacred_slime"] = new Tile("\u8056\u30B9\u30E9\u30A4\u30E0","","sacred_slime",true,true,utils.some(new battle.Status(4,4,2,1,0,0)),3,[{name:"dead_sacred_slime",per:1},{name:"potion",per:0.1},{name:"revival",per:0.01}],{revive:5})
  tiles["violent_ghost"] = new Tile("\u66B4\u308C\u30B4\u30FC\u30B9\u30C8","","violent_ghost",true,true,utils.some(new battle.Status(4,4,3,0,0,0)),4,[{name:"candle",per:0.2},{name:"ghost_camouflage", per: 0.05}],{hide:true})
  tiles["treasure_box"] = new Tile("\u5B9D\u7BB1","","treasure_box",true,false,utils.some(new battle.Status(10,10,0,4,0,0)),4,[
    {name:"knife",per:0.7}, {name:"copper_armor", per:0.7}, {name:"silver_knife",per:0.3}, {name:"iron_armor",per:0.3}, {name:"gold_knife",per:0.1}, {name:"gold_armor", per:0.1}, {name:"sharpener", per:0.2},{name:"magic_sharpener", per:0.1},{name:"fairy_sharpener", per:0.05},{name:"dragon_sharpener", per:0.025}
    ],{no_attack:true})

  // 実際の配置物
  export class Entity{
    upos:utils.Pos // unit position
    tile:Tile
    status:battle.Status
    level:number
    anim_tasks:view.Anim[]
    direction:"left"|"right"|"up"|"down"|"none"
    more_props:any
    treasures:string[]
    constructor(ux:number, uy:number, tile:Tile){
      this.upos = new utils.Pos(ux,uy)
      this.tile = tile;
      this.status = tile.status.get()
      this.level = tile.level
      this.anim_tasks = []
      this.direction = tile.isDired ? "down" : "none"
      this.more_props = utils.shallow_copy(tile.more_props)
      this.treasures = []
      tile.drop_list.forEach(t => {
        if(t.per > Math.random()) this.treasures.push(t.name)
      })
    }
    static of(upos:utils.Pos,tile:Tile){
      return new Entity(upos.x,upos.y,tile)
    }

    print(ctx:CanvasRenderingContext2D,realPos:utils.Pos,cnt:number){
      if("hide" in this.more_props && this.more_props["hide"]){
        // nothing to show
      }else if(this.status.hp != 0){
        this.tile.print(ctx,realPos,this.direction,cnt)
        ctx.fillStyle ="white" 
        let font_size = view.window_usize.y * view.unit_size.y / 40
        ctx.font = "normal " + font_size + "px sans-serif"
        utils.fillText_n(ctx,this.tile.jp_name + ( "no_damage" in this.more_props ? "" : "\n" + this.status.hp + "/" + this.status.max_hp), realPos.x, realPos.y - view.unit_size.y, font_size ,font_size)
      }else{
        ctx.drawImage(main.Asset.images["treasure"],0,0,32,32,realPos.x,realPos.y,view.unit_size.x,view.unit_size.y,)
      }
    }

    /**
     * アニメーション挿入，当たり判定もここでやる
     */
    move(udelta:utils.Pos){
      // change character direction
      if(udelta.x > 0 && udelta.y == 0) this.direction = "right"
      if(udelta.x < 0 && udelta.y == 0) this.direction = "left"
      if(udelta.x == 0 && udelta.y < 0) this.direction = "up"
      if(udelta.x == 0 && udelta.y > 0) this.direction = "down"

      let moved = this.upos.add(udelta)
      if(
        map.inner(moved) &&
        utils.all(get_entities_at(moved),e => !e.tile.isWall || e.status.hp == 0) &&
        !map.field_at_tile(moved).isWall
      ){
        this.anim_tasks.push(new view.MoveAnim(this.upos))
        this.upos = moved
        // 落ちているものを拾う
        let picked_names:string[] = []
        for(let dead of delete_entities_at(moved, ent => ent.status.hp == 0)){
          dead.treasures.forEach(t => {
            items.item_entities.push(new items.ItemEntity(items.type[t]))
            picked_names.push(items.type[t].name)
          })
        }
        // tmp frame
        if(picked_names.length != 0) {
          for(let v of picked_names){
            utils.start_tmp_frame(v + " \u3092\u53D6\u5F97")
          }
        }
      }
    }

    attack(){
      // 壁を壊す | 攻撃する
      for(let v of dir_ary){
        let directed = this.upos.add(v)
        if(!map.inner(directed)) continue
        if(map.field_at_tile(directed).isWall){
          map.field_set_by_name(directed,"floor")
        }
        // 誰かいれば当たる
        for(let entity of get_entities_at(directed)){
          if(entity.status.hp == 0 || "no_damage" in entity.more_props) continue
          entity.status = this.status.attackTo(entity)
          if(entity.status.hp == 0) battle.add_exp(Math.floor(1 * Math.pow(1.2,entity.level)))
        }
      }
      this.anim_tasks.push(new view.AttackAnim())
    }

    /**
     * that が隣接しているか
     */
    reach(that:Entity){
      for(let v of dir_ary){
        let directed = this.upos.add(v)
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

  /**
   * character instances. Entity has Tile instance, a Tile is an abstract character or floor object.
   */
  export let entities : Array<Entity> = []

  export let player : Entity
  export let goal : Entity

  export let rank : number

  export function init_entities(){
    map.make_map()

    // enemy をランダムに数匹配置
    for(let i = 0; i < 20; i++){
      let upos = random_upos(n => !tiles[map.entity_names[n]].isWall)
      let ptn:string[] = []
      ptn[0] = "mame_mouse"
      ptn[1] = "lang_dog"
      ptn[2] = "sacred_slime"
      ptn[3] = "violent_ghost"
      ptn[4] = "treasure_box"
      entities.push(
        model.Entity.of(upos,model.tiles[ptn[utils.randInt(5)]])
      )
    }

    // player を壁でないところにランダム配置
    let player_upos = random_upos(n => !tiles[map.entity_names[n]].isWall)
    if(player == undefined) player = new model.Entity(player_upos.x,player_upos.y,model.tiles["player"])
    else {
      player.upos = player_upos
    }
    entities.push(player)

    // goal
    let goal_upos = random_upos(n => !tiles[map.entity_names[n]].isWall)
    goal = new model.Entity(goal_upos.x, goal_upos.y, model.tiles["goal"])
    entities.push(goal)

    // player を中心とする画面にする
    view.prefix_pos = player_upos.sub(view.window_usize.div_bloadcast(2)).add(new utils.Pos(0.5,0.5)).mul(view.unit_size)
  }

  /**
   * cond を満たす filed の upos をとる
   */
  function random_upos(cond : (n:number) => boolean){
    let upos:utils.Pos
    do{
      upos = new utils.Pos(
        utils.randInt(map.width),
        utils.randInt(map.height))
    }while(!cond(map.field_at(upos)))
    return upos
  }

  export let dir = {
    down : new utils.Pos(0,1),
    up : new utils.Pos(0,-1),
    left : new utils.Pos(-1,0),
    right : new utils.Pos(1,0),
    none : new utils.Pos(0,0)
  }

  export let dir_ary = [dir.down,dir.up,dir.left,dir.right]

  export function move(){
    monsters_action()
    player.move(keys.dir_key)
    on_each_actions()
  }

  export function attack(){
    player.attack()
    monsters_action()
    on_each_actions()
  }

  export let action_counters = {
    effi:0,
    heal:0
  }
  /**
   * hungry
   */
  function on_each_actions(){
    if(action_counters.effi >= player.more_props["effi"]) {
      player.status.max_hp = utils.limit(player.status.max_hp - 1,0,player.status.max_hp)
      player.status.hp = utils.limit(player.status.hp, 0, player.status.max_hp + 1)
      action_counters.effi = 0
      utils.start_tmp_frame("\u304A\u8179\u304C\u7A7A\u3044\u305F(\u6700\u5927HP-1)")
    }
    if(action_counters.heal >= player.more_props["heal"]) {
      player.status.hp = utils.limit(player.status.hp + 1, 0, player.status.max_hp + 1)
      action_counters.heal = 0
      utils.start_tmp_frame("\u5C11\u3057\u75B2\u308C\u304C\u53D6\u308C\u305F(HP+1)")
    }
    action_counters.effi++
    action_counters.heal++
    if(player.status.hp == 0) {
      utils.start_tmp_frame("\u6B7B\u3093\u3067\u3057\u307E\u3063\u305F")
      // item property: revive
      for(let i = 0; i < items.item_entities.length; i++){
        let ent = items.item_entities[i]
        if("revive" in ent.more_props){
          player.status.max_hp = utils.limit(player.status.max_hp, ent.more_props["revive"], player.status.max_hp + 1)
          player.status.hp = ent.more_props["revive"]
          for(let j = 0; j < 9; j++){
            let delta_upos = new utils.Pos(j%3-1,Math.floor(j/3)-1)
            utils.start_anim("twinkle",2,player.upos.add(delta_upos).mul(view.unit_size).sub(view.prefix_pos), new utils.Pos(32,32), 12)
          }
          items.item_entities.splice(i,1)
          utils.start_tmp_frame("\u8607\u751F\u85AC\u3067\u751F\u304D\u8FD4\u3063\u305F")
          break
        }
      }
      if(player.status.hp == 0) main.menu_mode = ["dead"]
    }
    for(let i = 0; i < entities.length; i++){
      if(entities[i].status.hp == 0 && entities[i].treasures.length == 0){
        entities.splice(i,1)
        i--
      }
    }
    if(player.upos.equals(goal.upos)){
      entities = []
      rank++
      init_entities()
      utils.start_tmp_frame(rank + "\u968E\u306B\u5230\u9054\u3057\u305F")
    }
  }

  function monsters_action(){
    // monsters をランダムに移動させる
    for(let ent of entities){
      if(ent == player || "no_attack" in ent.more_props) continue
      if(ent.status.hp == 0) {
        // additional property: revive
        if ("revive" in ent.more_props && ent.more_props["revive"] > 0){
          ent.more_props["revive"]--
          if(ent.more_props["revive"] == 0) {
            ent.status = ent.tile.status.get()
            ent.more_props = utils.shallow_copy(ent.tile.more_props)
            utils.start_tmp_frame(ent.tile.jp_name + "\u304C\u8607\u751F\u3057\u305F!")
          }
        }
        continue
      }
      // property: hide
      if(ent.reach(player)){
        ent.direction = ent.dir_to(player)
        ent.attack()
        if("hide" in ent.more_props && ent.more_props["hide"]) {
          ent.more_props["hide"] = false
          utils.start_tmp_frame(ent.tile.jp_name + "\u304C\u59FF\u3092\u8868\u3057\u305F!")
        }
        // property: camouflage
      }else if(ent.near(player,4 * ("camouflage" in player.more_props ? (1 - player.more_props["camouflage"]) : 1))){
        ent.move(dir[ent.dir_to(player)])
      }else{
        ent.move(dir_ary[utils.randInt(4)])
      }
    }
  }

  export function get_entities_at(upos:utils.Pos){
    let ret : Entity[] = []
    for(let v of entities){
      if(v.upos.equals(upos)){
        ret.push(v)
      }
    }
    return ret
  }

  export function delete_entities_at(upos:utils.Pos, cond: (entity:Entity) => boolean){
    let ret : Entity[] = []
    for(let i = 0; i< entities.length; i++){
      if(entities[i].tile.name != "player" && entities[i].upos.equals(upos) && cond(entities[i])){
        ret.push(entities[i])
        entities.splice(i,1)
        i--
      }
    }
    return ret
  }
}

/**
 * keyboard の状態を管理する singleton
 */
namespace keys{
  /**
   * continuouse key press looking by keydown & keyup
   */
  export let dir_key = model.dir.none
  /**
   * original keydown
   */
  export let dir_key2 = model.dir.none
  export let z_key = false
  export let x_key = false
  export let c_key = false
  export let touch_start_pos: utils.Option<utils.Pos> = utils.none<utils.Pos>()
  export let touch_move_pos: utils.Option<utils.Pos> = utils.none<utils.Pos>()
  export function keyReset(){
    //dir_key = model.dir.none
    dir_key2 = model.dir.none
    z_key = false
    x_key = false
    c_key = false
    touch_start_pos = utils.none<utils.Pos>()
    touch_move_pos = utils.none<utils.Pos>()
  }
}