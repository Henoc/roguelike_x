window.addEventListener('load', init);
window.addEventListener("keydown", keydown)

var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

namespace Asset{
  interface Ast{
    type:string;
    name:string;
    src:string;
  }
  export var assets : Ast[] = [
    {type: "image", name: "back", src: "assets/back.png"},
    {type: "image", name: "box", src: "assets/box.png"}
  ];
  export var images : HTMLImageElement[] = [];
  export var loadAssets = (onComplete:() => void) => {
    var total = assets.length;
    var loadCount = 0;

    function onLoad(){
      loadCount++
      if(loadCount >= total){
        onComplete();
      }
    }

    assets.forEach(asset => {
      switch(asset.type){
        case "image":
          loadImage(asset,onLoad);
          break;
      }
    })
  }
  function loadImage(asset : Ast, onLoad:() => void) {
      var image = new Image();
      image.src = asset.src;
      image.onload = onLoad;
      images[asset.name] = image;
  }
}

function init() {
  canvas = <HTMLCanvasElement> document.getElementById('maincanvas');
  ctx = canvas.getContext('2d');
  canvas.width = view.window_usize.x * view.unit_size.x;
  canvas.height = view.window_usize.y * view.unit_size.y;

  Asset.loadAssets(() => {
    requestAnimationFrame(update)
  })

  // エンティティの配置
  model.initEntities()
}

var lastTimestamp = null

function update(timestamp : number){
  requestAnimationFrame(update)
  render()
}

function render(){
  if(!view.action_lock){
    if(!keys.dir_key.equals(model.dir.none)) {
      model.move()
    }else if(keys.z_key){
      model.attack()
    }

    keys.keyReset()
  }
  view.print(ctx)

  //ctx.drawImage(Asset.images["back"],0,0)
  //ctx.drawImage(Asset.images["box"],mikanX,0)
}

function keydown(e:KeyboardEvent){
  var keyCode = e.keyCode
  switch (keyCode) {
    case 37:
      keys.dir_key = model.dir.left
      break
    case 38:
      keys.dir_key = model.dir.up
      break;
    case 39:
      keys.dir_key = model.dir.right
      break
    case 40:
      keys.dir_key = model.dir.down
      break
    case 90:
      keys.z_key = true
      break
  
    default:
      break;
  }
}