import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-expandable',
  standalone: true,
  imports: [],
  templateUrl: './expandable.component.html',
  styleUrl: './expandable.component.scss',
})
export class ExpandableComponent implements AfterViewInit {
  @ViewChild('expandWrapper', { read: ElementRef }) expandWrapper:ElementRef | null = null;
  @Input() expanded = false;

  expandHeight = 900;

  constructor(public renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.setStyle(
      this.expandWrapper?.nativeElement,
      'height',
      this.expandHeight + 'px',
    );
  }
}
