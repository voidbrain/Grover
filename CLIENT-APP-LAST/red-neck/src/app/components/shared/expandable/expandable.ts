/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-expandable',
  templateUrl: 'expandable.html',
  styleUrls: ['expandable.scss'],
})
export class ExpandableComponent {
  @ViewChild('expandWrapper', { read: ElementRef }) expandWrapper;
  @Input() expanded;

  expandHeight = 900;

  constructor(public renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.setStyle(
      this.expandWrapper.nativeElement,
      'height',
      this.expandHeight + 'px'
    );
  }
}
