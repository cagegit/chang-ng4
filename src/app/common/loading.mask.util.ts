/**
 * Created by houxh on 2017-2-6.
 */
import {ElementRef} from "@angular/core";
declare let Sonic:any;
export class Loading{
   static addSquareLoading(){
     let height=document.activeElement.clientHeight;
     let htmlObj= document.createElement('div');
     htmlObj.setAttribute('id','mask');
     htmlObj.setAttribute('style','position: fixed;z-index: 999;background-color: #000;opacity: 0.5;width: 100%;height: 100%;top: 0px;left: 0px;text-align:center;padding-top:'+(height/2-100)+'px');
    let square = new Sonic({
      width: 100,
      height: 100,
      fillColor: '#fff',
      path: [
        ['line', 10, 10, 90, 10],
        ['line', 90, 10, 90, 90],
        ['line', 90, 90, 10, 90],
        ['line', 10, 90, 10, 10]
      ]
    });
    square.play();
    htmlObj.appendChild(square.canvas);

     document.body.appendChild(htmlObj);
  }
  static addCircleLoading(){
    let height=document.body.clientHeight;
    let htmlObj= document.createElement('div');
    htmlObj.setAttribute('id','mask');
    htmlObj.setAttribute('style','position: fixed;z-index: 999;background-color: rgba(0, 0, 0, 0.5);width: 100%;height: 100%;top: 0px;left: 0px;text-align:center;padding-top:'+(height/2-100)+'px');
    let circle = new Sonic({
      width: 50,
      height: 50,
      padding: 25,
      strokeColor: '#fff',
      pointDistance: .01,
      stepsPerFrame: 3,
      trailLength: .7,
      step: 'fader',
      setup: function() {
        this._.lineWidth = 5;
      },
      path: [
        ['arc', 25, 25, 25, 0, 360]
      ]
    });
    circle.play();
    htmlObj.appendChild(circle.canvas);
    document.body.appendChild(htmlObj);
  }
  static addRainbowLoading(){
    let height=document.activeElement.clientHeight;
    let htmlObj= document.createElement('div');
    htmlObj.setAttribute('id','mask');
    htmlObj.setAttribute('style','position: fixed;z-index: 999;background-color: #000;opacity: 0.5;width: 100%;height: 100%;top: 0px;left: 0px;text-align:center;padding-top:'+(height/2-100)+'px');
    let colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

    let rainbow = new Sonic({
      width: 100,
      height: 100,
      pointDistance: .005,
      trailLength: .9,
      stepsPerFrame: 5,
      setup: function() {
        this._.lineWidth = 5;
      },
      step: function(point, index, frame) {
        this._.beginPath();
        let color, prev, x, y, angle,
          radius = 45,
          cx = 50,
          cy = 50;
        angle = Math.PI/180 * (point.progress * 360);
        for (let i = -1, l = colors.length; ++i < l;) {
          color = colors[i];
          prev = this['_' + color];
          x = Math.cos(angle) * radius + cx;
          y = Math.sin(angle) * radius + cy;
          this._.fillStyle = color;
          this._.strokeStyle = color;
          this._.beginPath();
          prev && this._.moveTo(prev.x, prev.y);
          this._.lineTo(x, y);
          this._.closePath();
          this._.stroke();
          this['_' + color] = {x:x,y:y};
          radius -= 5;
        }
      },
      path: [
        ['arc', 100, 100, 90, 0, 360]
      ]

    });
    rainbow.play();
    htmlObj.appendChild(rainbow.canvas);
    document.body.appendChild(htmlObj);
  }

  static addFishLoading(){
    let height=document.activeElement.clientHeight;
    let htmlObj= document.createElement('div');
    htmlObj.setAttribute('id','mask');
    htmlObj.setAttribute('style','position: fixed;z-index: 999;background-color: #000;opacity: 0.5;width: 100%;height: 100%;top: 0px;left: 0px;text-align:center;padding-top:'+(height/2-100)+'px');
    let loader =
      {
        width: 100,
        height: 100,
        stepsPerFrame: 1,
        trailLength: 1,
        pointDistance: .02,
        fps: 40,
        fillColor: '#9eafdd',
        step: function(point, index) {
          this._.beginPath();
          this._.moveTo(point.x, point.y);
          this._.arc(point.x, point.y, index * 5, 0, Math.PI*2, false);
          this._.closePath();
          this._.fill();
        },
        path: [
          ['arc', 50, 50, 20, 0, 360]
        ]
      };
     let fish = new Sonic(loader);
    fish.play();
    htmlObj.appendChild(fish.canvas);
    document.body.appendChild(htmlObj);
  }

static addCircleLoadingToContainer(container:ElementRef){
  let circle = new Sonic({
    width: 50,
    height: 50,
    padding: 25,
    strokeColor: '#000',
    pointDistance: .01,
    stepsPerFrame: 3,
    trailLength: .7,
    step: 'fader',
    setup: function() {
      this._.lineWidth = 5;
    },
    path: [
      ['arc', 25, 25, 25, 0, 360]
    ]
  });
  circle.play();
  container.nativeElement.appendChild(circle.canvas);
}
  static removeCircleLoadingToContainer(container:ElementRef){
    let con=container.nativeElement.getElementsByTagName('canvas');
    container.nativeElement.removeChild(con[0]);
  }
  static removeLoading(){
    let htmlObj=document.getElementById('mask');
    if(htmlObj){
      document.body.removeChild(htmlObj);
    }
  }
}
