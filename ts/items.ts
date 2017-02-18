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
   * アイテムの型
   * more_props:
   * equip_level(x) player level x 以上で装備コマンド解放
   * sharpen(x,y) x の確率で武器の攻撃力+y
   * exp(x) xの経験値を得る
   * revive(x) HP x で蘇生
   * camouflage(x) 装備すると 敵の視力をx%カット の more_props がプレイヤーに着く 
   */
  export let type = {
    onigiri: new Item("\u304A\u306B\u304E\u308A",["use","put"],battle.Status.of_food(5),"none",
    `\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B`),
    potion: new Item("\u30DD\u30FC\u30B7\u30E7\u30F3",["use","put"],battle.Status.of_drink(10),"none",
    `\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B`),

    /* 
    hand, body 装備
    基本セット */
    knife: new Item("\u30CA\u30A4\u30D5", ["equip","put"], battle.Status.of_knife(2),"hand",
    `\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064`),
    copper_armor: new Item("\u9285\u306E\u93A7",["equip","put"], battle.Status.of_guard(2), "body", `\u3068\u308A\u3042\u3048\u305A\u5B89\u5FC3\u611F\u304C\u51FA\u308B\u9632\u5177`),

    /* level 10 */
    silver_knife:new Item("\u30B7\u30EB\u30D0\u30FC\u30CA\u30A4\u30D5", ["equip","put"], battle.Status.of_knife(5),"hand",`\u7570\u69D8\u306B\u5207\u308C\u5473\u304C\u92ED\u3044\u30CA\u30A4\u30D5`,{equip_level:10}),
    iron_armor: new Item("\u9244\u306E\u93A7",["equip","put"], battle.Status.of_guard(5), "body", `\u6226\u3046\u524D\u304B\u3089\u52DD\u3063\u305F\u6C17\u306B\u306A\u3063\u3066\u3057\u307E\u3046\u9632\u5177`,{equip_level:10}),

    /* level 20 */
    gold_knife:new Item("\u30B4\u30FC\u30EB\u30C9\u30CA\u30A4\u30D5", ["equip","put"], battle.Status.of_knife(10), "hand", `\u9EC4\u91D1\u306B\u8F1D\u304F\u7F8E\u3057\u3044\u30CA\u30A4\u30D5`,{equip_level:20}),
    gold_armor:new Item("\u91D1\u306E\u93A7",["equip","put"],battle.Status.of_guard(10), "body", `\u4F53\u5F53\u305F\u308A\u3060\u3051\u3067\u6575\u3092\u5012\u305B\u308B\u3068\u3044\u3046`,{equip_level:20}),

    /*
    砥石
    期待値 E[sharpen(p,x)] = x * p - x * (1 - p)
    */
    sharpener: new Item("\u7825\u77F3", ["sharpen","put"], battle.Status.zero(), "none", `\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B`, {sharpen:[0.9,1]}),
    magic_sharpener: new Item("\u9B54\u6CD5\u306E\u7825\u77F3", ["sharpen","put"], battle.Status.zero(), "none", `\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B`, {sharpen:[0.65,3]}),
    fairy_sharpener: new Item("\u5996\u7CBE\u306E\u7825\u77F3", ["sharpen","put"], battle.Status.zero(), "none", `\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B`, {sharpen:[0.6,5]}),
    dragon_sharpener: new Item("\u30C9\u30E9\u30B4\u30F3\u306E\u7825\u77F3", ["sharpen","put"], battle.Status.zero(), "none", `\u88C5\u5099\u4E2D\u306E\u6B66\u5668\u3092\u7814\u304E\u3001\u653B\u6483\u529B\u3092\u4E0A\u4E0B\u3055\u305B\u308B`, {sharpen:[0.58,7]}),

    //flying_pan: new Item("\u30D5\u30E9\u30A4\u30D1\u30F3", ["equip","put"], battle.Status.of_knife(1),"hand",`\u53E4\u4EE3\u306E\u920D\u5668\u3060\u304C\u8ABF\u7406\u306B\u3082\u4F7F\u7528\u3067\u304D\u308B`),
    //dead_mame_mouse: new Item("\u8C46\u306D\u305A\u307F\u306E\u8089",["use","put"],battle.Status.of_food(1),"none",`\u8C46\u306E\u5473\u304C\u3059\u308B`),
    soramame_head: new Item("\u305D\u3089\u8C46\u306E\u5E3D\u5B50",["equip","put"],new battle.Status(2,0,0,0,2,0),"head",`\u305D\u3089\u8C46\u306E\u5F62\u3092\u3057\u305F\u98DF\u3079\u3089\u308C\u308B\u5E3D\u5B50`),
    mame_mouse_ibukuro: new Item("\u8C46\u306D\u305A\u307F\u306E\u80C3\u888B",["use","put"],new battle.Status(0,0,0,0,0,0),"none",`\u98DF\u3079\u308B\u3068\u6D88\u5316\u3092\u7269\u7406\u7684\u306B\u52A9\u3051\u3066\u304F\u308C\u308B\u3068\u3044\u3046`,{effi:1}),
    //dead_lang_dog: new Item("\u4EBA\u8A9E\u3092\u89E3\u3059\u72AC\u306E\u8089",["use","put"],battle.Status.of_food(1),"none",`\u72AC\u3068\u4EBA\u3068\u306E\u30AD\u30E1\u30E9\u3060\u3068\u3044\u3046\u8AAC\u304C\u3042\u308B`),
    lang_dog_shoes: new Item("\u72AC\u306E\u9774",["equip","put"],new battle.Status(0,0,0,0,0,2),"foot",`\u77E5\u6027\u3092\u611F\u3058\u3055\u305B\u308B\u5E03\u88FD\u306E\u9774`,{effi:2}),
    lang_dog_paper: new Item("\u6570\u5F0F\u306E\u30E1\u30E2",["decode","put"],battle.Status.zero(),"none",`\u7D19\u4E00\u9762\u306B\u3073\u3063\u3057\u308A\u3068\u8A18\u53F7\u304C\u66F8\u3044\u3066\u3042\u308B`,{exp:50}),
    dead_sacred_slime: new Item("\u8056\u30B9\u30E9\u30A4\u30E0\u306E\u8089", ["use","put"], battle.Status.of_food(1),"none",`\u8B0E\u591A\u304D\u4E0D\u6B7B\u8EAB\u306E\u30B9\u30E9\u30A4\u30E0`),
    revival: new Item("\u8607\u751F\u85AC",["put"],battle.Status.zero(),"none",`\u6301\u3063\u3066\u3044\u308B\u3060\u3051\u30671\u5EA6\u81EA\u52D5\u3067\u8607\u751F\u3067\u304D\u308B`,{revive:10}),
    candle: new Item("\u308D\u3046\u305D\u304F", ["put"], battle.Status.zero(), "none", `\u706B\u306E\u3064\u3044\u305F\u308D\u3046\u305D\u304F`),
    ghost_camouflage: new Item("\u5E7D\u4F53\u8FF7\u5F69", ["equip","put"],new battle.Status(0,0,0,1,0,0),"head",`\u88AB\u308B\u3068\u6575\u306B\u6C17\u3065\u304B\u308C\u306B\u304F\u304F\u306A\u308B`,{camouflage:0.5})
  }

  /**
   * cond: condition of validating the command  
   * no_hide: show the command even if cond fails. Then cannot_command appears
   */
  export let commands_info: { [key: string]: {name_jp:string, cond?:(ient:ItemEntity)=>boolean, no_hide?:boolean }} = {}
  commands_info["use"] = {name_jp:"\u4F7F\u3046"}
  commands_info["put"] = {name_jp:"\u6368\u3066\u308B"}
  commands_info["equip"] = {name_jp:"\u88C5\u5099", cond:(ient:ItemEntity) => {
    return ("equip_level" in ient.more_props && ient.more_props["equip_level"] <= model.player.level) || (!("equip_level" in ient.more_props))
  }, no_hide:true}
  commands_info["cannot_equip"] = {name_jp:"\u88C5\u5099\u4E0D\u80FD"}
  commands_info["decode"] = {name_jp:"\u89E3\u8AAD\u3059\u308B"}
  commands_info["sharpen"] = {name_jp:"\u7814\u3050", cond:(ient) => equips["hand"].exist(), no_hide:true}
  commands_info["cannot_sharpen"] = {name_jp:"\u6B66\u5668\u88C5\u5099\u7121\u3057"}

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