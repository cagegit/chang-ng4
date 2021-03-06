import { Component, OnInit, ElementRef, Inject, Host, Input, SimpleChange, OnChanges ,ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import { GridsterService } from '../gridster.service';

@Component({
    selector: 'gridster-item',
    templateUrl: './gridster-item.component.html',
    styleUrls: ['./gridster-item.component.css']
})
export class GridsterItemComponent implements OnInit, OnChanges {
    @Input('x') x: number;
    @Input('y') y: number;
    @Input('w') w: number;
    @Input('h') h: number;
    @ViewChild('scaleBtn') scaleBtn:ElementRef;

    el:HTMLElement;
    /**
     * Mouse drag observable
     */
    dragging:Observable<any>;
    /**
     * Gridster provider service
     */
    gridster:GridsterService;
    /**
     * Subscribtion for drag observable
     */
    dragSubscription:ISubscription;

    item:any;

    constructor(@Inject(ElementRef) elementRef:ElementRef, @Host() gridster:GridsterService) {
        this.gridster = gridster;

        this.el = elementRef.nativeElement;
    }


    ngOnInit() {
      console.log(this);
        this.item = this.gridster.registerItem({
            $element: this.el,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        });

        if(this.gridster.options.dragAndDrop) {
            this.createMouseDrag(this.el);
            //this.createTouchDrag(this.el);
            //
            //// Update position
            this.dragSubscription = this.dragging.subscribe((pos) => {
              this.el.style.top = (pos.top - this.gridster.$element.offsetTop) + 'px';
              this.el.style.left = (pos.left - this.gridster.$element.offsetLeft) + 'px';
            });
        }
      // this.createScaleEvent(this.scaleBtn.nativeElement);
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
      console.log('change');
        let item = this.gridster.getItemByElement(this.el);
        if(!item) {
            return ;
        }
        if(changes['w']) {
            item.w = changes['w'].currentValue;
        }
        if(changes['h']) {
            item.h = changes['h'].currentValue;
        }

        this.gridster.createGridSnapshot();
        this.gridster.gridList.resizeItem(item, {w: item.w, h: item.h});
        this.gridster.updateGridSnapshot();

        this.gridster.render();
    }

    /**
     * Checks if between target and container exists element with given class
     * @param target
     * @param container
     * @returns {boolean}
     */
    private hasElementWithClass(className:string, target:Element, container:HTMLElement) {
        while(target !== container) {
            if(target.classList
                    .contains(this.gridster.draggableOptions.handlerClass)) {
                return true;
            }
            target = target.parentElement;
        }
        return false;
    }

    /**
     * Create and subscribe to drag event.
     * @param {HTMLElement} dragTarget
     */
    private createMouseDrag(dragTarget:HTMLElement) {
        // Get the three major events
        var mouseup = Observable.fromEvent(dragTarget, 'mouseup'),
            mousemove = Observable.fromEvent(document, 'mousemove'),
            mousedown = Observable.fromEvent(dragTarget, 'mousedown');

        this.dragging = mousedown.flatMap((md:MouseEvent) => {
          console.log('mousedown');
            var drag,
                coordinates = this.getRelativeCoordinates({pageX: md.pageX, pageY: md.pageY}, dragTarget),
                startX = coordinates.x,
                startY = coordinates.y,
                hasHandler = this.hasElementWithClass(
                    this.gridster.draggableOptions.handlerClass,
                    <Element>md.target,
                    dragTarget
                ),
                containerCoordincates = this.gridster.$element.getBoundingClientRect();

            if(this.gridster.draggableOptions.handlerClass && !hasHandler) {
                return Observable.of(false);
            }

            this.gridster.onStart(this);
            this.el.classList.add('is-dragging');

            // Calculate delta with mousemove until mouseup
            drag = mousemove.map((mm:MouseEvent) => {
                mm.preventDefault();

                this.gridster.onDrag(this);
                // console.log("move: left:",`${mm.clientX} - ${containerCoordincates.left} - ${startX}=`,mm.clientX - containerCoordincates.left - startX);
                return {
                  left: mm.clientX - containerCoordincates.left - startX+230,
                  top: mm.clientY - containerCoordincates.top - startY
                    // left: mm.clientX - containerCoordincates.left - startX+230,
                    // top: mm.clientY - containerCoordincates.top - startY
                };
            }).takeUntil(mouseup);

            drag.subscribe(null, null, () => {
                this.gridster.onStop(this);
                this.el.classList.remove('is-dragging');
            });

            return drag;
        });
    }
    private createScaleEvent(scaleBtn:HTMLElement) {
      let mousedown = Observable.fromEvent(scaleBtn,"mousedown"),
          mousemove = Observable.fromEvent(scaleBtn,"mousemove"),
          moveup = Observable.fromEvent(scaleBtn,"mouseup");
      mousedown.subscribe((e:MouseEvent) => {
        e.defaultPrevented;
        e.stopPropagation();
        let startX = e.pageX,
            startY = e.pageY;
        mousemove.subscribe((e:MouseEvent) => {
          let x = e.pageX-startX,
              y = e.pageY-startY;
          //let item = this.gridster.getItemByElement(this.el);
          //this.el.style.width = this.gridster.getItemWidth(item) + x + 'px';
          //this.el.style.height = this.gridster.getItemHeight(item) + y +'px';
          //console.log(item);
          console.log(x,y);
          this.gridster.scaleItemSize(this.el,x,y);
          //console.log(e.pageX-startX,e.pageY-startY);
        })
      })
    }
    private createTouchDrag(dragTarget:HTMLElement) {
        // Get the three major events
        var touchstart = Observable.fromEvent(dragTarget, 'touchstart'),
            touchmove = Observable.fromEvent(document, 'touchmove'),
            touchend = Observable.merge(
                Observable.fromEvent(dragTarget, 'touchend'),
                Observable.fromEvent(dragTarget, 'touchcancel')
            ),
            touchhold = touchstart.flatMap(function (e:TouchEvent) {
                e.preventDefault();

                return Observable
                    .of(e)
                    .delay(500) // hold press delay
                    .map((data) => {
                        return data;
                    })
                    .takeUntil(Observable.merge(touchend, touchmove));
            });

        this.dragging = Observable.merge(this.dragging, touchstart.flatMap((td:TouchEvent) => {
            var drag,
                touchData = td.touches[0],
                coordinates = this.getRelativeCoordinates({pageX: touchData.pageX, pageY: touchData.pageY}, dragTarget),
                startX = coordinates.x,
                startY = coordinates.y,
                hasHandler = this.hasElementWithClass(
                    this.gridster.draggableOptions.handlerClass,
                    <Element>td.target,
                    dragTarget
                ),
                containerCoordincates = this.gridster.$element.getBoundingClientRect();

            if(this.gridster.draggableOptions.handlerClass && !hasHandler) {
                return Observable.of(false);
            }

            this.gridster.onStart(this);
            this.el.classList.add('is-dragging');

            // Calculate delta with mousemove until mouseup
            drag = touchmove.map((tm:TouchEvent) => {
                let touchMoveData = tm.touches[0];
                tm.preventDefault();

                this.gridster.onDrag(this);

                return {
                    left: touchMoveData.clientX - containerCoordincates.left - startX,
                    top: touchMoveData.clientY - containerCoordincates.top - startY
                };
            }).takeUntil(touchend);

            drag.subscribe(null, null, () => {
                this.gridster.onStop(this);
                this.el.classList.remove('is-dragging');
            });

            return drag;
        }));
    }
    /**
     * Get coordinates of cursor relative to given container
     * @param {{pageX,pageY}} e
     * @param {HtmlElement} container
     * @return {{x: number, y: number}}
     */
    private getRelativeCoordinates(e:{pageX:number,pageY:number}, container:HTMLElement) {
        var offset,
            ref;

        offset = {left: 0, top: 0};
        ref = container.offsetParent;

        offset.left = container.offsetLeft;
        offset.top = container.offsetTop;

        while (ref) {
            offset.left += ref.offsetLeft;
            offset.top += ref.offsetTop;

            ref = ref.offsetParent;
        }

        return {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top,
        };
    }

    ngOnDestroy() {
      if(this.dragSubscription){
        this.dragSubscription.unsubscribe();
      }
    }
}




