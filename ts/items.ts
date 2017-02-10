namespace items{
  /**
   * item type exclude item status
   */
  export class Item{
    name:string
    commands:string[]
    add_status:battle.Status
    text:string
    constructor(name:string, commands:string[], add_status:battle.Status,text:string){
      this.name = name
      this.commands = commands
      this.add_status = add_status
      this.text = text
    }
  }

  export var type = {
    onigiri: new Item("\u304A\u306B\u304E\u308A",["eat","put"],battle.Status.of_food(5),
    `\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B`),
    orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9",["eat","put"],battle.Status.of_drink(10),
    `\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B`)
  }

  export var commands = {
    eat: "\u98DF\u3079\u308B",
    put: "\u7F6E\u304F",
  }

  export class ItemEntity{
    item:Item
    constructor(item:Item){
      this.item = item
    }
  }

  export var item_entities : ItemEntity[] = []

}