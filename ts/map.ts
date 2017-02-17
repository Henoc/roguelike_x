namespace map{
  export let width = 30
  export let height = 30
  export let fields : number[][] = new Array()
  for(let i = 0; i < height; i++){
    fields[i] = new Array()
    for(let j = 0; j < width; j++){
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
  export let entity_names = [
    "floor",
    "wall"
  ]

  export let entity_number : { [key: string]: number; } = {
    floor:0,
    wall:1
  }

  let minimap_usize = new utils.Pos(10,10)

  /**
   * ランダムなマップの自動生成
   */
  export function make_map(){
    for(let i = 0; i < height; i+= minimap_usize.y){
      for(let j = 0; j < width; j+= minimap_usize.x){
        utils.paste(fields, make_minimap(), i, j)
      }
    }
  }

  /**
   * このミニマップをつなぎ合わせる
   */
  function make_minimap():number[][]{
      let mini_pattern = [
      [
        "1111001111",
        "1111001111",
        "1111001111",
        "1111001111",
        "0000000000",
        "0000000000",
        "1111001111",
        "1111001111",
        "1111001111",
        "1111001111",
      ],
      [
        "1111111111",
        "1001111001",
        "1001111001",
        "1001111111",
        "1000000001",
        "1000000001",
        "1111111001",
        "1001111001",
        "1001111001",
        "1111111111",
      ],
      [
        "1111111111",
        "1001000001",
        "1001000001",
        "1001010001",
        "1000010001",
        "1010010101",
        "1010000101",
        "1010000101",
        "1000010001",
        "1111111111",
      ]]

      function patternTo2darray(pattern: string[]){
        let ary : number[][] = new Array()
        for(let str of pattern){
          ary.push(strToArray(str))
        }
        return ary
      }

      function strToArray(str : string){
        let ary : number[] = new Array()
        for(let i = 0; i < str.length; i++){
          ary.push(Number(str.charAt(i)))
        }
        return ary
      }

      return patternTo2darray(mini_pattern[utils.randInt(mini_pattern.length)])
    }
}