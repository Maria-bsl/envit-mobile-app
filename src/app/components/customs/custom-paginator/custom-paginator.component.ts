import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-custom-paginator',
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.scss'],
  standalone: true,
})
export class CustomPaginatorComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  @Input() totalItems!: number;
  @Input() pageSize!: number;
  @Input() pageIndex!: number;
  @Output() pageChange = new EventEmitter();

  pageSizeOptions = [5, 10, 25, 100];

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    });
  }
}
