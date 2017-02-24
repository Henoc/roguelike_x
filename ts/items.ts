namespace items{
  /**
   * item type exclude item status
   */
  export class Item{
    name:string
    commands:string[]
    delta_status:battle.Status
    text:string
    equip_region:"head" | "body" | "hand" | "foot" | "none"
    more_props:any
    constructor(name:string, commands:string[], add_status:battle.Status,equip_region:"head" | "body" | "hand" | "foot" | "none",
    text:string,more_props?:any){
      this.name = name
      this.commands = commands
      this.delta_status = add_status
      this.equip_region = equip_region
      this.text = text
      this.more_props = more_props
    }
  }

  /**
   * max_hp, hp を上げる装備品は禁止(装備計算が面倒なので)
   * 
   * アイテムの型
   * more_props:
   * equip_level(x) player level x 以上で装備コマンド解放
   * sharpen(x,y) x の確率で武器の攻撃力+y
   * exp(x) xの経験値を得る
   * revive(x) HP x で蘇生
   * view(x) 所持で視野が x 広がる
   * camouflage(x) 装備すると 敵の視力を x カット の more_props がプレイヤーに着く 
   */
  export let type = {
    hamburger: new Item("ハンバーガー",["use","put"],battle.Status.of_food(5),"none",
    `食べると最大HPが5上昇する`),
    potion: new Item("ポーション",["use","put"],battle.Status.of_drink(10),"none",
    `飲むとHPが10回復する`),

    /* 
    hand, body 装備
    基本セット */
    knife: new Item("ナイフ", ["equip","put"], battle.Status.of_knife(2),"hand",
    `サバイバル生活で役立つ`),
    copper_armor: new Item("銅の鎧",["equip","put"], battle.Status.of_guard(2), "body", `とりあえず安心感が出る防具`),

    /* level 10 */
    silver_knife:new Item("シルバーナイフ", ["equip","put"], battle.Status.of_knife(5),"hand",`異様に切れ味が鋭いナイフ`,{equip_level:10}),
    iron_armor: new Item("鉄の鎧",["equip","put"], battle.Status.of_guard(5), "body", `戦う前から勝った気になってしまう防具`,{equip_level:10}),

    /* level 20 */
    gold_knife:new Item("ゴールドナイフ", ["equip","put"], battle.Status.of_knife(10), "hand", `黄金に輝く美しいナイフ`,{equip_level:20}),
    gold_armor:new Item("金の鎧",["equip","put"],battle.Status.of_guard(10), "body", `体当たりだけで敵を倒せるという`,{equip_level:20}),

    /*
    砥石
    期待値 E[sharpen(p,x)] = x * p - x * (1 - p)
    */
    sharpener: new Item("砥石", ["sharpen","put"], battle.Status.zero(), "none", `装備中の武器を研ぎ、攻撃力を上下させる`, {sharpen:[0.9,1]}),
    magic_sharpener: new Item("魔法の砥石", ["sharpen","put"], battle.Status.zero(), "none", `装備中の武器を研ぎ、攻撃力を上下させる`, {sharpen:[0.65,3]}),
    fairy_sharpener: new Item("妖精の砥石", ["sharpen","put"], battle.Status.zero(), "none", `装備中の武器を研ぎ、攻撃力を上下させる`, {sharpen:[0.6,5]}),
    dragon_sharpener: new Item("ドラゴンの砥石", ["sharpen","put"], battle.Status.zero(), "none", `装備中の武器を研ぎ、攻撃力を上下させる`, {sharpen:[0.58,7]}),

    //flying_pan: new Item("フライパン", ["equip","put"], battle.Status.of_knife(1),"hand",`古代の鈍器だが調理にも使用できる`),
    //dead_mame_mouse: new Item("豆ねずみの肉",["use","put"],battle.Status.of_food(1),"none",`豆の味がする`),
    soramame_head: new Item("そら豆の帽子",["equip","put"],new battle.Status(0,0,0,0,2,0),"head",`そら豆の形をした帽子。常に豆の匂いがする`),
    mame_mouse_ibukuro: new Item("豆ねずみの胃袋",["use","put"],new battle.Status(0,0,0,0,0,0),"none",`食べると消化を物理的に助けてくれるという`,{effi:1}),
    //dead_lang_dog: new Item("人語を解す犬の肉",["use","put"],battle.Status.of_food(1),"none",`犬と人とのキメラだという説がある`),
    lang_dog_shoes: new Item("犬の靴",["equip","put"],new battle.Status(0,0,0,0,0,2),"foot",`知性を感じさせる布製の靴`,{effi:2}),
    lang_dog_paper: new Item("数式のメモ",["decode","put"],battle.Status.zero(),"none",`紙一面にびっしりと記号が書いてある`,{exp:30}),
    dead_sacred_slime: new Item("聖スライムの肉", ["use","put"], battle.Status.of_food(1),"none",`謎多き不死身のスライム`),
    revival: new Item("蘇生薬",["put"],battle.Status.zero(),"none",`持っているだけで1度自動で蘇生できる`,{revive:10}),
    candle: new Item("ろうそく", ["put"], battle.Status.zero(), "none", `火のついたろうそく`,{view:0.05}),
    ghost_camouflage: new Item("幽体迷彩", ["equip","put"],new battle.Status(0,0,0,1,0,0),"head",`被ると敵に気づかれにくくなる`,{camouflage:0.5}),
    shadow_wing: new Item("黒い翼", ["equip","put"], new battle.Status(0,0,0,1,0,4),"body",`素早い動きで相手を翻弄できる翼`,{equip_level:5}),
    black_paint: new Item("黒いペンキ", ["put"], battle.Status.zero(), "none", `真っ黒な色のペンキ`),

    preserved_food: new Item("保存食",["use","put"],battle.Status.of_food(6),"none",`持ち歩きやすい携行用保存食`),
    gourd: new Item("ひょうたん",["put"],battle.Status.zero(),"none",`魔法植物を加工して作られた、内部が四次元空間になっているひょうたん`,{capacity:3}),
    gunpowder: new Item("火薬",["put"],battle.Status.zero(),"none",`容器に詰めると爆弾になる、取り扱い注意の粉`),
    roller_skates: new Item("ローラースケート",["equip","put"],new battle.Status(0,0,0,0,0,0),"foot",`高速移動できるが軌道を読まれがちな靴`,{effi:7})
  }

  /**
   * cond: condition of validating the command  
   * no_hide: show the command even if cond fails. Then cannot_command appears
   */
  export let commands_info: { [key: string]: {name_jp:string, cond?:(ient:ItemEntity)=>boolean, no_hide?:boolean }} = {}
  commands_info["use"] = {name_jp:"使う"}
  commands_info["put"] = {name_jp:"捨てる"}
  commands_info["equip"] = {name_jp:"装備", cond:(ient:ItemEntity) => {
    return ("equip_level" in ient.more_props && ient.more_props["equip_level"] <= model.player.level) || (!("equip_level" in ient.more_props))
  }, no_hide:true}
  commands_info["cannot_equip"] = {name_jp:"装備不能"}
  commands_info["decode"] = {name_jp:"解読する"}
  commands_info["sharpen"] = {name_jp:"研ぐ", cond:(ient) => equips["hand"].exist(), no_hide:true}
  commands_info["cannot_sharpen"] = {name_jp:"武器装備無し"}

  export class ItemEntity{
    item:Item
    status:battle.Status
    more_props:any
    constructor(item:Item){
      this.item = item
      this.status = item.delta_status.copy()
      this.more_props = utils.shallow_copy(item.more_props)
    }
    get_valid_commands():string[]{
      let ret:string[] = []
      this.item.commands.forEach(command_name => {
        if(commands_info[command_name].cond == undefined || commands_info[command_name].cond(this)) ret.push(command_name)
        else if("no_hide" in commands_info[command_name]) ret.push("cannot_" + command_name)
      })
      return ret
    }
  }

  export let item_entities : ItemEntity[] = []
  export function item_entities_max():number {
    let capacity = 20
    item_entities.forEach(ent => {
      if("capacity" in ent.more_props) capacity += ent.more_props["capacity"]
    })
    return capacity
  }
  export let equips: { [key: string]: utils.Option<ItemEntity>; } = {}
  equips["head"] = utils.none<ItemEntity>()
  equips["body"] = utils.none<ItemEntity>()
  equips["hand"] = utils.none<ItemEntity>()
  equips["foot"] = utils.none<ItemEntity>()

  export function equips_status_sum(){
    let ret = battle.Status.zero()
    for(let region of ["head","body","hand","foot"]){
      if(equips[region].exist()){
        ret = ret.add(equips[region].get().status)
      }
    }
    return ret
  }

  export function equips_more_props_sum(default_more_props:any){
    let ret = default_more_props
    for(let region of ["head","body","hand","foot"]){
      if(equips[region].exist()){
        let more_props = equips[region].get().more_props
        for(let prop_name in more_props){
          if(prop_name in ret) ret[prop_name] += more_props[prop_name]
          else ret[prop_name] = more_props[prop_name]
        }
      }
    }
    return ret
  }

  /**
   * equips sum replacing one equipment
   */
  export function equips_status_sum_replace(item_entity:ItemEntity){
    let ret = battle.Status.zero()
    for(let region of ["head","body","hand","foot"]){
      if(item_entity.item.equip_region == region){
        ret = ret.add(item_entity.status)
      }else if(equips[region].exist()){
        ret = ret.add(equips[region].get().status)
      }
    }
    return ret
  }
}