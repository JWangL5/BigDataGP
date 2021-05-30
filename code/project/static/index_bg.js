window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function( callback ){
                window.setTimeout( callback, 1000/2 );
           };
})();
var myCanvas = document.getElementById("canvas");
var ctx = myCanvas.getContext("2d");//getContext 设置画笔
var num;
var w,h;
var duixiang = [];
var move = {};
function widthheight(){
    w = myCanvas.width = window.innerWidth;
    h = myCanvas.height = window.innerHeight;
	num= Math.floor(w*h*0.00028);//点的数量。根据屏幕大小确定
    for(var i = 0;i < num;i++){
        duixiang[i] = {
            x:Math.random()*w,
            y:Math.random()*h,
            cX:Math.random()*0.6-0.3,
            cY:Math.random()*0.6-0.3,
			R:Math.floor(Math.random()*5)+2,
			//CC:Math.floor(Math.random()*3)+2,
		    r: Math.floor(Math.random() * 254),   
            g: Math.floor(Math.random() * 254),  
            b:Math.floor(Math.random() * 254)   
        } 
       // console.log(duixiang[i])
        Cricle(duixiang[i].x,duixiang[i].y,duixiang[i].R,duixiang[i].r,duixiang[i].g,duixiang[i].b);
		 //Cricle(duixiang[i].x,duixiang[i].y,duixiang[i].R,duixiang[i].CC);
    }
};widthheight();//获取浏览器的等宽度等高

function Cricle(x,y,R,r,g,b){
    ctx.save();//保存路径
   if(Math.random()>0.991) {ctx.globalAlpha= 0.9;}//ctx.fillStyle = "#CCC";}//填充的背景颜色
    else { ctx.globalAlpha=0.47;}
	 
	ctx.fillStyle = "rgb("+ r +","+ g +","+ b +")";
    ctx.beginPath();//开始绘画
	ctx.arc(x,y,R,Math.PI*2,0);//绘画圆 x y 半径（大小） 角度  一个PI 是180 * 2 = 360    真假 0/1 true/false
    ctx.closePath();//结束绘画
    ctx.fill();//填充背景颜色
    ctx.restore();//回复路径
};Cricle();


!function draw(){
    ctx.clearRect(0,0,w,h)//先清除画布上的点
    for(var i = 0;i < num;i++){
        duixiang[i].x += duixiang[i].cX;
        duixiang[i].y += duixiang[i].cY;
        if(duixiang[i].x>w || duixiang[i].x<0){
            duixiang[i].cX = -duixiang[i].cX;
        }
        if(duixiang[i].y>h || duixiang[i].y<0){
            duixiang[i].cY = -duixiang[i].cY;
        }
        Cricle(duixiang[i].x,duixiang[i].y,duixiang[i].R,duixiang[i].r,duixiang[i].g,duixiang[i].b);
        //勾股定理判断两点是否连线
        for(var j = i + 1;j < num;j++){
            if( (duixiang[i].x-duixiang[j].x)*(duixiang[i].x-duixiang[j].x)+(duixiang[i].y-duixiang[j].y)*(duixiang[i].y-duixiang[j].y) <= 55*55 ){
                line(duixiang[i].x,duixiang[i].y,duixiang[j].x,duixiang[j].y,0,i,j)
            }
            if(move.x){
                if( (duixiang[i].x-move.x)*(duixiang[i].x-move.x)+(duixiang[i].y-move.y)*(duixiang[i].y-move.y) <= 100*100 ){
                    line(duixiang[i].x,duixiang[i].y,move.x,move.y,1,i,1)
                }
            }
        }
    }
    window.requestAnimationFrame(draw)
}();

//绘制线条
function line(x1,y1,x2,y2,flag,i,j){
    
	if (flag){var color = ctx.createLinearGradient(x1,y1,x2,y2);
				ctx.globalAlpha=0.5;
				color.addColorStop(0,"rgb("+ duixiang[i].r +","+ duixiang[i].g +","+ duixiang[i].b +")");
				color.addColorStop(0.8,"#019ee5");
	        }
			else
			{
			
			var color = ctx.createLinearGradient(x1,y1,x2,y2);
				ctx.globalAlpha=0.9;
				color.addColorStop(0,"rgb("+ duixiang[i].r +","+ duixiang[i].g +","+ duixiang[i].b +")");
				color.addColorStop(1,"rgb("+ duixiang[j].r +","+ duixiang[j].g +","+ duixiang[j].b +")");
			}
    ctx.save();
    ctx.strokeStyle = color;
	ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    //ctx.restore();
}


//document.onmousemove = function(e){
 //   move.x = e.clientX;
  //  move.y = e.clientY;
//}
//console.log(move)//去掉注释 ，可以与背景互动

window.onresize = function(){
    location.reload();
}

//----------------------------------------------------------------------

// var _createClass = function () {function defineProperties(target, props) 
// { for (var i = 0; i < props.length; i++) 
//  {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) 
//  descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}
//  return function (Constructor, protoProps, staticProps) 
//  {if (protoProps) defineProperties(Constructor.prototype, protoProps);
//  if (staticProps) defineProperties(Constructor, staticProps);
//  return Constructor;};}();function _classCallCheck(instance, Constructor) 
//  {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}
//  var getRandom = function getRandom(min, max) {
//   return Math.random() * (max - min) + min;
// };

// var getRandomInt = function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min)) + min;
// };

// var getRandomColor = function getRandomColor() {
//   var colors = [
//   'rgba(231, 76, 60, 1)', // red
//   'rgba(241, 196, 15, 1)', // yellow
//   'rgba(46, 204, 113, 1)', // green
//   'rgba(52, 152, 219, 1)', // blue
//   'rgba(155, 89, 182, 1)' // purple
//   ];

//   return colors[getRandomInt(0, colors.length)];
// };

// // Particle//粒子模块
// var
// Particle = function () {

//   function Particle(system, x, y) {_classCallCheck(this, Particle);
//     this.system = system;
//     this.universe = this.system.world.universe;
//     this.x = x;
//     this.y = y;
//     this.color = getRandomColor();
//     this.life = 1;
//     this.aging = getRandom(0.990, 0.999); // 0.99, 0.999 || 0.999, 0.9999

//     this.r = getRandomInt(12, 16);//初始粒子半径范围
//     this.speed = getRandom(18, 18.5);//粒子爆炸速度范围
//     this.velocity = [
//     getRandom(-this.speed, this.speed),
//     getRandom(-this.speed, this.speed)];

//   }_createClass(Particle, [{ key: 'update', value: function update(

//     dt) {
//       this.life *= this.aging;

//       if (
//       this.r < 0.1 ||
//       this.life === 0 ||
//       this.x + this.r < 0 ||
//       this.x - this.r > this.universe.width ||
//       this.y + this.r < 0 ||
//       this.y - this.r > this.universe.height)
//       {
//         this.system.removeObject(this);
//       }

//       this.r *= this.life;
//       this.x += this.velocity[0];
//       this.y += this.velocity[1];
//     } }, { key: 'render', value: function render(

//     ctx) {
//       // Main circle //亮圈模块

//       ctx.fillStyle = this.color;
//       ctx.beginPath();
//       ctx.arc(this.x, this.y, this.r*1.2, 0, 2 * Math.PI, false);
//       ctx.fill();
//       ctx.closePath();

//       var r = this.color.match(/([0-9]+)/g)[0];
//       var g = this.color.match(/([0-9]+)/g)[1];
//       var b = this.color.match(/([0-9]+)/g)[2];

//       // Gradient//梯度变化曲线

//       var spread = 1.5;
//       var gradient = ctx.createRadialGradient(
//       this.x, this.y, this.r,
//       this.x, this.y, this.r * spread);

//       gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)');
//       gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');

//       ctx.globalCompositeOperation = 'lighter';
//       ctx.fillStyle = gradient;
//       ctx.beginPath();
//       ctx.arc(this.x, this.y, this.r * spread, 0, 2 * Math.PI, false);
//       ctx.fill();
//       ctx.closePath();
//       ctx.globalCompositeOperation = 'source-over';

//       // Aberration//偏差

//       var offset = this.r * 0.5;
//       var color = 'rgba(' + g + ', ' + b + ', ' + r + ', 0.5)';

//       ctx.globalCompositeOperation = 'lighter';
//       ctx.fillStyle = color;
//       ctx.beginPath();
//       ctx.arc(this.x + offset, this.y + offset, this.r, 0, 2 * Math.PI, false);
//       ctx.fill();
//       ctx.closePath();
//       ctx.globalCompositeOperation = 'source-over';
//     } }]);return Particle;}();



// // Crown //水波纹圈模块
// var
// Crown = function () {

//   function Crown(system, x, y) {_classCallCheck(this, Crown);
//     this.system = system;
//     this.x = x;
//     this.y = y;
//     this.r = getRandomInt(5, 15); // 5, 20  水波纹圈半径范围
//     this.mod = 1.1;
//     this.life = 0.5; //水波纹线
//     this.aging = getRandom(0.830, 0.899);
//     this.speed = getRandom(8, 9);
//     this.color = {
//       r: getRandomInt(236, 242),
//       g: getRandomInt(70, 80),
//       b: getRandomInt(50, 70) };


//     this.angle1 = Math.PI * getRandom(0, 2);
//     this.angle2 = this.angle1 + Math.PI * getRandom(0.3, 0.4);//水波纹圈完整度
//   }_createClass(Crown, [{ key: 'update', value: function update(

//     dt) {
//       this.life *= this.aging;

//       if (this.life <= 0.0001) this.system.removeObject(this);

//       this.r += Math.abs(1 - this.life) * this.speed;

//       this.x1 = this.x + this.r * Math.cos(this.angle1);
//       this.y1 = this.y + this.r * Math.sin(this.angle1);

//       this.angle3 = this.angle1 + (this.angle2 - this.angle1) / 2;
//       this.x2 = this.x + this.r * this.mod * Math.cos(this.angle3);
//       this.y2 = this.y + this.r * this.mod * Math.sin(this.angle3);
//     } }, { key: 'render', value: function render(

//     ctx) {
//       var gradient = ctx.createRadialGradient(
//       this.x, this.y, this.r * 0.9,
//       this.x, this.y, this.r);

//       gradient.addColorStop(0, 'rgba(' + this.color.r + ', ' + this.color.g + ', ' + this.color.b + ', ' + this.life + ')');
//       gradient.addColorStop(1, 'rgba(' + this.color.r + ', ' + this.color.g + ', ' + this.color.b + ', ' + this.life * 0.5 + ')');

//       ctx.fillStyle = gradient;
//       ctx.beginPath();
//       ctx.arc(this.x, this.y, this.r, this.angle1, this.angle2, false);
//       ctx.quadraticCurveTo(this.x2, this.y2, this.x1, this.y1);
//       ctx.fill();
//       ctx.closePath();
//     } }]);return Crown;}();



// // Explosion //爆炸模块
// var
// Explosion = function () {

//   function Explosion(world, x, y) {_classCallCheck(this, Explosion);
//     this.world = world;
//     this.x = x;
//     this.y = y;
//     this.objects = [];

//     var particles = getRandomInt(10, 30); // 10, 30 amount of particles//爆炸 粒子数量
//     var crowns = particles * getRandom(0.4, 0.5);

//     while (crowns-- > 0) {this.addCrown();}
//     while (particles-- > 0) {this.addParticle();}
//   }_createClass(Explosion, [{ key: 'update', value: function update(

//     dt) {
//       this.objects.forEach(function (obj) {
//         if (obj) obj.update(dt);
//       });

//       if (this.objects.length <= 0) {
//         this.world.clearExplosion(this);
//       }
//     } }, { key: 'render', value: function render(

//     ctx) {
//       this.objects.forEach(function (obj) {
//         if (obj) obj.render(ctx);
//       });
//     } }, { key: 'addCrown', value: function addCrown()

//     {
//       this.objects.push(new Crown(this, this.x, this.y));
//     } }, { key: 'addParticle', value: function addParticle()

//     {
//       this.objects.push(new Particle(this, this.x, this.y));
//     } }, { key: 'removeObject', value: function removeObject(

//     obj) {
//       var index = this.objects.indexOf(obj);

//       if (index !== -1) {
//         this.objects.splice(index, 1);
//       }
//     } }]);return Explosion;}();



// // World 
// var
// ConfettiWorld = function () {function ConfettiWorld() 
// {_classCallCheck(this, ConfettiWorld);}_createClass(ConfettiWorld, [{ key: 'init', value: function init()

//     {
//       this.objects = [];
//       window.addEventListener('click', this.explode.bind(this));

//       // Initial explosion //初始爆炸
//       var counter = 0;
//       while (counter-- > 0) {
//         this.explode({
//           clientX: window.event.clientX, //getRandomInt(10, this.universe.width) ,          //this.universe.width / 2,
//           clientY: window.event.clientY //getRandomInt(10, 50) //this.universe.height / 2 
//           });

//       }
//     } }, { key: 'update', value: function update(

//     dt) {
//       this.objects.forEach(function (obj) {
//         if (obj) obj.update(dt);
//       });

//       var amount = this.objects.reduce(function (sum, explosion) {
//         return sum += explosion.objects.length;
//       }, 0);
//     } }, { key: 'render', value: function render(

//     ctx) {
//       this.objects.forEach(function (obj) {
//         if (obj) obj.render(ctx);
//       });
//     } }, { key: 'explode', value: function explode(

//     event) {
//       var x = event.clientX;
//       var y = event.clientY;

//       this.objects.push(new Explosion(this, x, y));
//     } }, { key: 'clearExplosion', value: function clearExplosion(

//     explosion) {
//       var index = this.objects.indexOf(explosion);

//       if (index !== -1) {
//         this.objects.splice(index, 1);
//       }
//     } }]);return ConfettiWorld;}();



// // Time
// var
// Time = function () {

//   function Time() {_classCallCheck(this, Time);
//     this.now = 0; // current tick time
//     this.prev = 0; // prev tick time
//     this.elapsed = 0; // elapsed time from last tick
//     this.delta = 0; // time from last update
//     this.fps = 60; // desired fps
//     this.step = 1 / 60000; // step duration
//   }_createClass(Time, [{ key: 'update', value: function update(

//     time) {
//       this.now = time;
//       this.elapsed = (this.now - this.prev) / 1000;
//       this.prev = this.now;
//       this.delta += this.elapsed;
//     } }, { key: 'raf', value: function raf(

//     func) {
//       window.requestAnimationFrame(func);
//     } }, { key: 'hasFrames', value: function hasFrames()

//     {
//       return this.delta >= this.step;
//     } }, { key: 'processFrame', value: function processFrame()

//     {
//       this.delta -= this.step;
//     } }]);return Time;}();



// // Canvas
// var
// Universe = function () {

//   function Universe(element) {_classCallCheck(this, Universe);
//     this.el = element;
//     this.ctx = this.el.getContext('2d');
//     this.pixelRatio = window.devicePixelRatio;
//     this.time = new Time();

//     this.worlds = {};
//     this.world = null; // current state

//     this.updateSize();
//     window.addEventListener('resize', this.updateSize.bind(this));

//     this.addWorld('confetti', ConfettiWorld);
//     this.setWorld('confetti');

//     this.start();
//   }_createClass(Universe, [{ key: 'start', value: function start()

//     {
//       this.time.raf(this.tick.bind(this));
//     } }, { key: 'tick', value: function tick(

//     time) {
//       this.time.update(time);

//       if (this.time.hasFrames()) {
//         this.update();
//         this.time.processFrame();
//       }

//       this.render();
//       this.time.raf(this.tick.bind(this));
//     } }, { key: 'update', value: function update()

//     {
//       this.world.update(this.time.step);
//     } }, { key: 'render', value: function render()

//     {
//       var gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
//       this.ctx.clearRect(0, 0, this.width, this.height);
//       this.world.render(this.ctx);
//     }

//     // Helpers 库
//   }, { key: 'updateSize', value: function updateSize()
//     {
//       this.width = window.innerWidth;
//       this.height = window.innerHeight;
//       this.el.width = this.width * this.pixelRatio;
//       this.el.height = this.height * this.pixelRatio;
//       this.el.style.width = window.innerWidth + 'px';
//       this.el.style.height = window.innerHeight + 'px';
//       this.ctx.scale(this.pixelRatio, this.pixelRatio);
//     } }, { key: 'addWorld', value: function addWorld(

//     worldName, World) {
//       this.worlds[worldName] = new World();
//       this.worlds[worldName].universe = this;
//       this.worlds[worldName].init();
//     } }, { key: 'setWorld', value: function setWorld(

//     worldName) {
//       this.world = this.worlds[worldName];
//     } }]);return Universe;}();



// // Main

// console.clear();
// var element = document.querySelector('#canvas1');
// window.Canvas= new Universe(element);

