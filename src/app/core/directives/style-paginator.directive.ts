import {
  Directive,
  Host,
  HostListener,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Directive({
  selector: '[appStylePaginator]',
  standalone: true,
})
export class StylePaginatorDirective {
  @HostListener('page', ['$event'])
  onChange(event: PageEvent) {
    this.initPageRange();
  }

  constructor(
    @Host() @Self() @Optional() private matPag: MatPaginator,
    private vr: ViewContainerRef,
    private ren: Renderer2
  ) {
    // inspired by
    // https://stackoverflow.com/questions/53646259/how-to-customize-mat-paginator-in-angular-material
    // https://stackblitz.com/edit/angular-wyx2ue?embed=1&file=app/paginator-overview-example.html
    setTimeout(() => {
      this.initPageRange();
    }, 0);
  }

  private initPageRange(): void {
    console.log(this.vr);
    const pageRange = this.vr.element.nativeElement.querySelector(
      'div.mat-paginator-range-actions > div.mat-paginator-range-label'
    );
    pageRange.innerHTML = '';
    const pageCount = this.pageCount(this.matPag.length, this.matPag.pageSize);
    for (let i = 0; i < pageCount; i++) {
      this.ren.appendChild(
        pageRange,
        this.createPage(i, this.matPag.pageIndex)
      );
    }
    // console.log('HostListener', 'initPageRange', pageCount);
  }

  private createPage(i: number, pageIndex: number): any {
    const span = this.ren.createElement('span');
    this.ren.listen(span, 'click', (evt) => {
      this.switchPage(i);
    });
    const text = this.ren.createText(i + 1 + '');
    this.ren.addClass(span, 'mat-custom-page');
    i === pageIndex
      ? this.ren.addClass(span, 'selected')
      : this.ren.addClass(span, 'unselected');
    this.ren.appendChild(span, text);
    return span;
  }

  private pageCount(length: number, pageSize: number): number {
    return Math.floor(length / pageSize) + 1;
  }

  private switchPage(i: number): void {
    this.matPag.pageIndex = i;
    // https://github.com/angular/components/pull/12586
    this.matPag._changePageSize(this.matPag.pageSize); // fix #12586
    // console.log('<StylePaginatorDirective>', 'switchPage', i);
  }
}
