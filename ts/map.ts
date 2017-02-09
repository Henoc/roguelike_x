namespace map{
  export var width = 60
  export var height = 60
  export var fields : number[][] = new Array()
  for(var i = 0; i < height; i++){
    fields[i] = new Array()
    for(var j = 0; j < width; j++){
      fields[i][j] = 0
    }
  }

  export function inner(pos:utils.Pos):boolean {
    return pos.x >= 0 && pos.x < map.width &&
        pos.y >= 0 && pos.y < map.height
  }

  export function field_at(pos : utils.Pos){
    return fields[pos.y][pos.x]
  }

  export function field_at_tile(pos : utils.Pos){
    return model.tiles[entity_names[fields[pos.y][pos.x]]]
  }

  export function field_set(pos:utils.Pos,value:number){
    fields[pos.y][pos.x] = value
  }

  export function field_set_by_name(pos:utils.Pos,name:string){
    fields[pos.y][pos.x] = entity_number[name]
  }

  /**
   * fields 上の番号 -> 名前
   */
  export var entity_names = [
    "floor",
    "wall"
  ]

  export var entity_number : { [key: string]: number; } = {
    floor:0,
    wall:1
  }

  var minimap_usize = new utils.Pos(10,10)

  /**
   * ランダムなマップの自動生成
   */
  export function makeMap(){
    for(var i = 0; i < height; i+= minimap_usize.y){
      for(var j = 0; j < width; j+= minimap_usize.x){
        utils.paste(fields, makeMiniMap(), i, j)
      }
    }
  }

  /**
   * このミニマップをつなぎ合わせる
   */
  function makeMiniMap():number[][]{
      var p1 = [
        "1111111111",
        "1111111111",
        "1111001111",
        "1111001111",
        "1000000011",
        "1111001111",
        "1111001111",
        "1111001111",
        "1111111111",
        "1111111111",
      ]

      function patternTo2darray(pattern: string[]){
        var ary : number[][] = new Array()
        for(let str of pattern){
          ary.push(strToArray(str))
        }
        return ary
      }

      function strToArray(str : string){
        var ary : number[] = new Array()
        for(var i = 0; i < str.length; i++){
          ary.push(Number(str.charAt(i)))
        }
        return ary
      }

      return patternTo2darray(p1)
    }
}