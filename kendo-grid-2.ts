import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import {
  ColumnReorderEvent,
  ColumnResizeArgs,
  CreateFormGroupArgs,
  GridComponent,
  MultipleSortSettings,
  RowArgs,
  SelectionEvent,
} from '@progress/kendo-angular-grid';
import { IntlService } from '@progress/kendo-angular-intl';

export interface IColumnConfig {
  field: string;
  title: string;
  editable: boolean;
  editor: 'boolean' | 'text' | 'numeric' | 'date';
  width: number;
  format: string;
  filter: 'boolean' | 'text' | 'numeric' | 'date';
  minResizableWidth?: number;
  maxResizableWidth?: number;
  reorderable?: boolean;
  resizable?: boolean;
}

export interface IGridRowData {
  id?: number;
  parentId?: number;
  isExpanded?: boolean;
  name: string;
  age: number;
  dob: Date;
  isValid: boolean;
  children?: IGridData[];
}

export interface IGridData {
  columns: IColumnConfig[];
  rows: IGridRowData[];
}

@Component({
  selector: 'my-app',
  template: `
    <link rel="stylesheet" href="https://unpkg.com/@progress/kendo-font-icons/dist/index.css"/>

    <ng-container *ngTemplateOutlet="kendo; context: {data: gridDataObj, columns: gridDataObj.columns, showSelectAllColumn: showSelectAllColumn, gridIndex: 0}" />
    
    <ng-template #kendo let-data="data" let-columns="columns" let-showSelectAllColumn="showSelectAllColumn" let-gridIndex="gridIndex">
      <kendo-grid #kendoRef
        [data]="data.rows" 
        [sortable]="sortSettings"
        [sort]="sort" (sortChange)="sortChange($event)" 
        [filterable]="'menu'"
        [selectable]="true"
        [selectable]="{ checkboxOnly: true }"
        [kendoGridInCellEditing]="createFormGroup"
        (selectionChange)="handleSelectionChange($event)"
        [rowSelected]="isRowSelected"
        [isDetailExpanded]="isDetailExpanded"
        [resizable]="true"
        [reorderable]="true"
        (columnReorder)="columnReorder($event)"
        (columnResize)="columnResize($event)"
        >

        <kendo-grid-checkbox-column
          [showSelectAll]="true"
          [width]="42"
          [reorderable]="false"
          [resizable]="false"
          [hidden]="!showSelectAllColumn"
        ></kendo-grid-checkbox-column>

        <kendo-grid-column *ngFor="let column of (data.columns && data.columns.length > 0 ? data.columns : columns); first as isFirst"
          field="{{ column.field }}"
          title="{{ column.title }}"
          [editable]="column.editable"
          [width]="column.width"
          [filter]="column.filter"
          [editor]="column.editor"
          [format]="column.format"
          [minResizableWidth]="column.minResizableWidth"
          [maxResizableWidth]="column.maxResizableWidth"
          [reorderable]="column.reorderable"
          [resizable]="column.resizable"
          [headerStyle]="{ 'display': data.columns && data.columns.length > 0 ? '': 'none' }"
          >

          <ng-template kendoGridHeaderTemplate let-column format="column.format" let-columnIndex="columnIndex">
            <kendo-icon *ngIf="isFirst" name="k-i-plus"  
              (click)="expandAllRows($event)"
              class="k-font-icon k-i-plus k-icon mr-1"
              [size]="'small'"
              [themeColor]="'primary'"
              ></kendo-icon>
            <kendo-icon *ngIf="isFirst" name="k-i-minus" 
            (click)="collapseAllRows($event)"
            [themeColor]="'primary'"
            [size]="'small'"
            class="k-font-icon k-i-minus k-icon mr-1"></kendo-icon>
            <span>{{ column.title }}</span>
            <!-- <span *ngIf="sort[0].field === column.field">
              <span *ngIf="sort[0].dir === 'asc'" class="k-icon k-i-sort-asc"></span>
              <span *ngIf="sort[0].dir === 'desc'" class="k-icon k-i-sort-desc"></span>
            </span> -->
          </ng-template>

          <ng-template kendoGridCellTemplate let-dataItem let-rowIndex="rowIndex">
            <kendo-icon name="k-i-plus" 
              *ngIf="isFirst && dataItem?.children && !dataItem.isExpanded" 
              (click)="expandRow(dataItem)"
              class="k-font-icon k-i-plus k-icon mr-1"
              [size]="'small'"
              [themeColor]="'primary'"
              style="cursor: pointer;"
              [ngStyle]="{'margin-left.px': gridIndex * 10}"
              ></kendo-icon>
            <kendo-icon name="k-i-minus" 
              *ngIf="isFirst && dataItem?.children && dataItem.isExpanded"
              (click)="collapseRow(dataItem)"
              [themeColor]="'primary'"
              [size]="'small'"
              class="k-font-icon k-i-minus k-icon mr-1"
              style="cursor: pointer;"
              [ngStyle]="{'margin-left.px': gridIndex * 10}"
            ></kendo-icon>
            <span [ngStyle]="{ 'font-weight': isFirst ? 'bold' : 'normal', 'padding-left.px' : dataItem?.children ? 0 : (10 + gridIndex * 10)}">{{ intl.toString( dataItem[column.field], column.format) }}</span>
          </ng-template>
        </kendo-grid-column>

        <ng-container *kendoGridDetailTemplate="let rowData; showIf: showkendoGridDetailTemplate">
          <ng-container *ngFor="let child of rowData.children">
          <ng-container *ngTemplateOutlet="kendo; context: {data: child, columns: columns, showSelectAllColumn: showSelectAllColumn, gridIndex: (gridIndex + 1)}" >
          </ng-container>
        </ng-container>
        </ng-container>
      </kendo-grid>
    </ng-template>
  `,
  styles: [
    `
    .k-detail-cell > .k-grid thead.k-table-thead { display: none }
    .k-detail-cell.k-table-td { padding: 0 !important }
    .k-detail-cell .k-grid-content { overflow: hidden }
    .k-hierarchy-col { width: 0 !important }
    .k-hierarchy-cell.k-table-td > a { display: none }
    .k-detail-cell > .k-grid { border: none !important }

    .k-grid .k-grid-header .k-cell-inner > .k-link > .k-sort-icon {
      position: absolute;
      right: 1rem;
      margin: 0 0.25rem;
    }

    .k-grid .k-grid-header .k-cell-inner > .k-link > .k-sort-order {
      /* position: absolute;
      right: 2.25rem; */
      display: none;
    }
  
    .k-grid .k-cell-inner a.k-grid-filter-menu.k-grid-header-menu {
      padding: 0;
      width: 1rem;
      height: 1rem;
    }
  `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  @ViewChild(GridComponent) grid: GridComponent;

  private columnsConfig: IColumnConfig[] = [
    {
      field: 'id',
      title: 'ID',
      editable: false,
      editor: 'text',
      width: 200,
      format: '',
      filter: 'text',
    },
    {
      field: 'name',
      title: 'Name',
      editable: true,
      editor: 'text',
      width: 150,
      format: '',
      filter: 'text',
    },
    {
      field: 'age',
      title: 'Age',
      editable: true,
      editor: 'numeric',
      width: 100,
      format: 'n0',
      filter: 'numeric',
    },
    {
      field: 'dob',
      title: 'Date Of Birth',
      editable: true,
      editor: 'date',
      width: 150,
      format: 'M/d/yyyy',
      filter: 'date',
    },
    {
      field: 'isValid',
      title: 'Is valid',
      editable: true,
      editor: 'boolean',
      width: 100,
      format: '',
      filter: 'boolean',
    },
    <IColumnConfig>{},
  ];

  sort: SortDescriptor[] = [
    {
      field: 'id',
      dir: 'asc',
    },
  ];

  sortSettings: MultipleSortSettings = {
    mode: 'multiple',
    initialDirection: 'desc',
    allowUnsort: true,
    showIndexes: true,
  };

  private gridData: IGridRowData[] = [
    {
      id: 1,
      name: 'P1',
      age: 20,
      isExpanded: false,
      dob: new Date(),
      isValid: true,
      children: [
        {
          columns: [],
          rows: [
            {
              id: 11,
              name: 'P1 -> C1',
              age: 21,
              parentId: 1,
              isExpanded: false,
              dob: new Date(),
              isValid: true,
              children: [
                {
                  columns: [],
                  rows: [
                    {
                      id: 111,
                      name: 'P1 -> C1 -> GC1',
                      age: 21,
                      parentId: 11,
                      isExpanded: false,
                      dob: new Date(),
                      isValid: true,
                    },
                    {
                      id: 112,
                      name: 'P1 -> C1 -> GC2',
                      age: 22,
                      parentId: 11,
                      isExpanded: false,
                      dob: new Date(),
                      isValid: true,
                    },
                  ],
                },
              ],
            },
            {
              id: 12,
              name: 'P1 -> C2',
              age: 22,
              parentId: 1,
              isExpanded: false,
              dob: new Date(),
              isValid: true,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'P2',
      age: 22,
      isExpanded: false,
      dob: new Date(),
      isValid: true,
      children: [
        {
          columns: [],
          rows: [
            {
              id: 21,
              name: 'P2 -> C1',
              age: 22,
              parentId: 2,
              isExpanded: false,
              dob: new Date(),
              isValid: true,
            },
            {
              id: 22,
              name: 'P2 -> C2',
              age: 24,
              parentId: 2,
              isExpanded: false,
              dob: new Date(),
              isValid: true,
            },
          ],
        },
      ],
    },
  ];

  showSelectAllColumn?: boolean = true;
  gridDataObj: IGridData = {
    columns: this.columnsConfig,
    rows: this.gridData,
  };

  mySelection: number[] = [];
  myExpandStatus: number[] = [];

  constructor(public intl: IntlService, private formBuilder: FormBuilder) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  isRowSelected = (e: RowArgs): boolean =>
    this.mySelection.indexOf(e.dataItem.id) >= 0;

  isDetailExpanded = (e: RowArgs): boolean =>
    this.myExpandStatus.indexOf(e.dataItem.id) >= 0;

  showkendoGridDetailTemplate = (dataItem: IGridRowData) =>
    dataItem && dataItem.children && dataItem.children.length > 0;

  columnReorder(e: ColumnReorderEvent) {
    if (e.newIndex > 1 && e.column?.title) {
      let item = this.columnsConfig.find((c) => c.title == e.column.title);
      this.columnsConfig.splice(e.oldIndex - 1, 1);
      this.columnsConfig.splice(e.newIndex - 1, 0, item);
    } else {
      e.preventDefault();
    }
  }

  columnResize(e: ColumnResizeArgs[]) {
    this.columnsConfig.find((col) => col.title == e[0].column.title).width =
      e[0].newWidth;
  }

  handleSelectionChange(e: SelectionEvent) {
    if (e.selectedRows) {
      e.selectedRows.forEach((r) => {
        if (this.mySelection.indexOf(r.dataItem.id) === -1) {
          this.mySelection.push(r.dataItem.id);
          this.handleSelectionChangeForChildItems(r.dataItem, true);
          this.handleSelectionChangeForParentItems(r.dataItem, true);
        }
      });
    }

    if (e.deselectedRows) {
      e.deselectedRows.forEach((r) => {
        if (this.mySelection.indexOf(r.dataItem.id) !== -1) {
          this.mySelection.splice(this.mySelection.indexOf(r.dataItem.id), 1);
          this.handleSelectionChangeForChildItems(r.dataItem, false);
          this.handleSelectionChangeForParentItems(r.dataItem, false);
        }
      });
    }
  }

  handleSelectionChangeForChildItems(
    dataItem: IGridRowData,
    isChecked: boolean
  ) {
    dataItem?.children?.forEach((c) => {
      c?.rows?.forEach((row) => {
        if (isChecked) {
          if (this.mySelection.indexOf(row.id) === -1) {
            this.mySelection.push(row.id);
          }
        } else {
          if (this.mySelection.indexOf(row.id) != -1) {
            this.mySelection.splice(this.mySelection.indexOf(row.id), 1);
          }
          if (this.mySelection.indexOf(row.parentId) != -1) {
            this.mySelection.splice(this.mySelection.indexOf(row.parentId), 1);
          }
        }
        this.handleSelectionChangeForChildItems(row, isChecked);
      });
    });
  }

  handleSelectionChangeForParentItems(
    dataItem: IGridRowData,
    isChecked: boolean
  ) {
    if (dataItem && dataItem.parentId) {
      let parentItem = this.findItem(this.gridData, dataItem.parentId);
      if (parentItem) {
        if (isChecked) {
          let isAllChildrenChecked = this.isAllChildrenChecked(parentItem);
          if (
            isAllChildrenChecked &&
            this.mySelection.indexOf(parentItem.id) === -1
          ) {
            this.mySelection.push(parentItem.id);
            this.handleSelectionChangeForParentItems(parentItem, isChecked);
          }
        } else {
          if (this.mySelection.indexOf(parentItem.id) !== -1) {
            this.mySelection.splice(this.mySelection.indexOf(parentItem.id), 1);
            this.handleSelectionChangeForParentItems(parentItem, isChecked);
          }
        }
      }
    }
  }

  private isAllChildrenChecked(parentItem: IGridRowData) {
    let isAllChildrenChecked = parentItem?.children
      ? parentItem?.children.every((child) => {
          child.rows.every(
            (row) =>
              this.mySelection.indexOf(row.id) !== -1 &&
              this.isAllChildrenChecked(row)
          );
        })
      : true;
    return isAllChildrenChecked;
  }

  sortChange(sort: SortDescriptor[]) {
    this.sort = sort;
    this.gridData = orderBy(this.gridData, this.sort);
  }

  createFormGroup(args: CreateFormGroupArgs) {
    let item = args.dataItem;
    const formGroup = this.formBuilder.group({
      id: item.id,
      name: [item.name, Validators.required],
      age: item.age,
      dob: item.dob,
      isValid: item.isValid,
    });
    return formGroup;
  }

  collapseRow(dataItem: IGridRowData) {
    this.myExpandStatus.splice(this.myExpandStatus.indexOf(dataItem.id), 1);
    dataItem.isExpanded = false;
  }

  expandRow(dataItem: IGridRowData) {
    if (this.myExpandStatus.indexOf(dataItem.id) == -1) {
      this.myExpandStatus.push(dataItem.id);
    }
    dataItem.isExpanded = true;
  }

  expandAllRows(e: MouseEvent) {
    e.stopPropagation();
    this.gridData.forEach((d) => {
      this.expandItem(d);
    });
  }

  collapseAllRows(e: MouseEvent) {
    e.stopPropagation();
    this.myExpandStatus = [];
    this.gridData.forEach((d) => {
      this.collaspeItem(d);
    });
  }

  private findItem(data: IGridRowData[], id: number) {
    let item = data?.find((d) => d.id == id);
    if (item) return item;
    for (let i = 0; i < data?.length; i++) {
      for (let j = 0; j < data[i].children?.length; j++) {
        item = this.findItem(data[i].children[j]?.rows, id);
        if (item) return item;
      }
    }
  }

  private collaspeItem(item: IGridRowData) {
    item.isExpanded = false;
    item?.children?.forEach((child) => {
      child.rows?.forEach((row) => {
        this.collaspeItem(row);
      });
    });
  }

  private expandItem(item: IGridRowData) {
    item.isExpanded = true;
    if (this.myExpandStatus.indexOf(item.id) == -1) {
      this.myExpandStatus.push(item.id);
    }
    item?.children?.forEach((child) => {
      child.rows?.forEach((row) => {
        this.expandItem(row);
      });
    });
  }
}
