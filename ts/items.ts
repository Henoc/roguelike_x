namespace items{
  /**
   * item type exclude item status
   */
  export class Item{
    name:string
    commands:string[]
    add_status:battle.Status
    text:string
    equip_region:"head" | "body" | "hand" | "none"
    constructor(name:string, commands:string[], add_status:battle.Status,equip_region:"head" | "body" | "hand" | "none",
    text:string){
      this.name = name
      this.commands = commands
      this.add_status = add_status
      this.equip_region = equip_region
      this.text = text
    }
  }

  export var type = {
    onigiri: new Item("\u304A\u306B\u304E\u308A",["use","put"],battle.Status.of_food(5),"none",
    `\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B`),
    orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9",["use","put"],battle.Status.of_drink(10),"none",
    `\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B`),
    knife: new Item("\u30CA\u30A4\u30D5", ["use","put","equip"], battle.Status.of_knife(1),"hand",
    `\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064`),
  }

  export var commands = {
    use: "\u4F7F\u3046",
    put: "\u7F6E\u304F",
    equip: "\u88C5\u5099",
  }

  export class ItemEntity{
    item:Item
    constructor(item:Item){
      this.item = item
    }
  }

  export var item_entities : ItemEntity[] = []
  export var equips = {
    head:utils.none<ItemEntity>(),
    body:utils.none<ItemEntity>(),
    hand1:utils.none<ItemEntity>(),
    hand2:utils.none<ItemEntity>(),
  }

}