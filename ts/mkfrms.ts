namespace mkfrms{

  let top_frame : utils.Frame
  let item_message : utils.Frame
  let command : utils.Frame
  let dist_frame : utils.Frame

  export function set_top_frame(){
    top_frame = new utils.Frame(0,0,view.window_w,view.window_h,view.window_h * 0.03,"rgba(0,0,0,0)")
    utils.frame_tasks.push(top_frame)
  }

  export function set_explore_frame(){
    top_frame.font_size = view.window_h / 32
    top_frame.insert_text(() => model.rank + "階")
    top_frame.insert_text(() => "level " + model.player.level + "  next " + Math.floor(battle.player_exp) + "/" + battle.max_exp())
    top_frame.insert_text(() => "HP " + model.player.status.hp + "/" + model.player.status.max_hp)
    // let max_hp_frame_w = window_w * model.player.status.max_hp / 100
    // let max_hp_frame = top_frame.insert_subframe(utils.some(max_hp_frame_w),utils.some(window_h * 0.03), "rgba(0,50,20,1)", window_h * 0.002)
    // max_hp_frame.insert_subframe(utils.some((max_hp_frame_w - max_hp_frame.margin * 2) * model.player.status.hp / model.player.status.max_hp),utils.none<number>(), "rgba(0,200,50,1)")
  }

  export function remove_explore_frame(){
    top_frame.clear_contents()
  }

  export function set_items_frame(){
    top_frame.move_point_x(0.6)
    let item_top = top_frame.insert_subframe(utils.none<number>(),utils.some(view.window_h * 0.8),"rgba(30,30,30,1)")
    
    let page_size = 15
    let page_no = Math.floor(main.cursor["items"] / page_size)
    let page_max = Math.floor((main.cursor_max["items"] - 1) / page_size)
    
    item_top.font_size = view.window_h / 32
    item_top.insert_text(() => "アイテム (" + items.item_entities.length + "/" + items.item_entities_max() + ") ページ " + (page_no + 1) + "/" + (page_max + 1))
    item_top.insert_text(() => "")
    for(let i = page_no * page_size; i < Math.min((page_no + 1) * page_size, items.item_entities.length); i++){
      let itemEntity = items.item_entities[i]
      item_top.insert_text(() => (main.cursor["items"] == i ? ">" : " ") + itemEntity.item.name)
    }

    top_frame.reset_point()
    let status_frame = top_frame.insert_subframe(utils.some(view.window_w * 0.3),utils.some(view.window_h * 0.5),"rgba(30,30,30,1)")
    status_frame.insert_text(() => "ステータス")

    // 装備品と食べ物でステータス変動の計算が異なる（装備品は付け替えることがある）
    let modified_status = battle.Status.zero()
    let delta_status = battle.Status.zero()
    if(main.cursor_max["items"] != 0){
      if(items.item_entities[main.cursor["items"]].item.equip_region == "none"){
        delta_status = items.item_entities[main.cursor["items"]].status
        modified_status = model.player.status.add(delta_status)
      }else{
        let item_entity = items.item_entities[main.cursor["items"]]
        delta_status = item_entity.status
        modified_status = model.player.tile.status.get().add(items.equips_status_sum_replace(item_entity))
      }
    }

    status_frame.insert_text(() => "HP " + model.player.status.hp + "/" + model.player.status.max_hp 
      + (delta_status.hp != 0 || delta_status.max_hp != 0 ? " → " + modified_status.hp + "/" + modified_status.max_hp : "") )
    status_frame.insert_text(() => battle.status_jp_names.atk + " " + model.player.status.atk
      + (delta_status.atk != 0 ? " → " + modified_status.atk : ""))
    status_frame.insert_text(() => battle.status_jp_names.def + " " + model.player.status.def
      + (delta_status.def != 0 ? " → " + modified_status.def : ""))
    status_frame.insert_text(() => battle.status_jp_names.dex + " " + model.player.status.dex + (delta_status.dex != 0 ? " → " + modified_status.dex : ""))
    status_frame.insert_text(() => battle.status_jp_names.eva + " " + model.player.status.eva + (delta_status.eva != 0 ? " → " + modified_status.eva : ""))
    status_frame.insert_text(() =>"")
    status_frame.insert_text(() => "装備")
    status_frame.insert_text(() => "頭 " + items.equips["head"].map(e => e.item.name).get_or_else(""))
    status_frame.insert_text(() => "体 " + items.equips["body"].map(e => e.item.name).get_or_else(""))
    status_frame.insert_text(() => "手 " + items.equips["hand"].map(e => e.item.name).get_or_else(""))
    status_frame.insert_text(() => "足 " + items.equips["foot"].map(e => e.item.name).get_or_else(""))

    top_frame.move_point_y(0.2)
    item_message = top_frame.insert_subframe(utils.some(view.window_w * 0.5),utils.none<number>(),"rgba(30,30,30,1)")
    if(main.cursor_max["items"] != 0) {
      item_message.insert_text(() => {
        let item_ent = items.item_entities[main.cursor["items"]]
        let ret = item_ent.item.text
        if("equip_level" in item_ent.more_props) ret += "\nLevel " + item_ent.more_props["equip_level"] + " 以上で装備可能"
        if("sharpen" in item_ent.more_props) ret += "\n成功率 " + item_ent.more_props["sharpen"][0] + " 武器の攻撃 ±" + item_ent.more_props["sharpen"][1]
        if("effi" in item_ent.more_props) ret += "\n燃費 +" + item_ent.more_props["effi"]
        if("heal" in item_ent.more_props) ret += "\n自然治癒力 +" + item_ent.more_props["heal"]
        if("view" in item_ent.more_props) ret += "\n所持時 視野 +" + (item_ent.more_props["view"] * 100) + "%"
        if("camouflage" in item_ent.more_props) ret += "\n視認性 -" + (item_ent.more_props["camouflage"] * 100) + "%"
        if("capacity" in item_ent.more_props) ret += "\n所持時 アイテム容量 +" + item_ent.more_props["capacity"]
        return ret
      },2)
      
    }
  }

  export function remove_items_frame(){
    top_frame.clear_contents()
    item_message = undefined
  }

  export function reflesh_items_frame(){
    remove_items_frame()
    set_items_frame()
  }

  export function set_command_frame(){
    command = item_message.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(100,0,0,1)")  
    let item_ent = items.item_entities[main.cursor["items"]]
    let valid_command_names = item_ent.get_valid_commands()
    for(let i = 0; i < valid_command_names.length; i++){
      command.insert_text(() => (main.cursor["items>command"] == i ? ">" : " ") + items.commands_info[valid_command_names[i]].name_jp)
    }
  }

  export function remove_command_frame(){
    item_message.remove_subframe(command)
    command = undefined
  }

  export function set_dist_frame(){
    top_frame.move_point_x(0.2)
    top_frame.move_point_y(0.2)
    dist_frame = top_frame.insert_subframe(utils.some((view.window_w - top_frame.margin * 2) * 0.6), utils.some((view.window_h - top_frame.margin * 2) * 0.6), "rgba(30,30,30,1)", view.window_h * 0.05)
    dist_frame.font_size = view.window_h / 32
    dist_frame.insert_text(() => "ステータス振り分け")
    dist_frame.insert_text(() => "")
    dist_frame.insert_text(() => "振り分け可能ポイント " + main.point_distributed.rest)
    let status_names = ["atk","def","dex","eva"]
    let status_names_jp = ["攻撃","防御","命中","回避"]
    for(let i = 0; i < status_names.length; i++){
      dist_frame.insert_text(() => (main.cursor["dist"] == i ? ">" : " ") + status_names_jp[i] + " " + model.player.status[status_names[i]] + " + " + main.point_distributed[status_names[i]])
    }
    dist_frame.insert_text(() => "")
    dist_frame.insert_text(() => "←→キーで振り分け Zキーで決定")
  }

  export function remove_dist_frame(){
    top_frame.clear_contents()
    dist_frame = undefined
  }

  export function set_dead_frame(){
    let dead_frame = top_frame.insert_subframe(utils.none<number>(),utils.none<number>(),"rgba(30,30,30,0)")
    dead_frame.font_size = view.window_h / 32
    dead_frame.insert_text(() => "死にました")
  }
}