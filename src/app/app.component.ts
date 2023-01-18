import { Component } from "@angular/core";
import { SampleData } from "./data";
import { GroupKey } from "@progress/kendo-angular-grid";

import {
  AggregateDescriptor,
  groupBy,
  GroupDescriptor,
  aggregateBy,
  AggregateResult
} from "@progress/kendo-data-query";

interface ColumnSetting {
  field: string;
  title: string;
  format?: string;
  type: "text" | "numeric" | "boolean" | "date";
  showtotal?: boolean;
  clientGroupBy?: boolean;
}

@Component({
  selector: "my-app",
  template: `
    <label for="uploadsettings">Upload Column(s) Settings</label>
    <input
      type="file"
      text="Upload Column Settings"
      accept="json/plain"
      (change)="openFile($event)"
      id="uploadsettings"
    />

    <kendo-grid
      kendoGridExpandGroupBy
      [groupsInitiallyExpanded]="initiallyExpanded"
      [(expandedGroupKeys)]="expandedGroupKeys"
      [groupable]="{ showFooter: true }"
      [data]="gridData"
      (groupChange)="onGroupChange($event)"
    >
      <ng-template kendoGridToolbarTemplate>
        <button kendoButton (click)="expandAll()">Expand All Groups</button>
        <button kendoButton (click)="collapseAll()">Collapse All Groups</button>
      </ng-template>
      <kendo-grid-column
        *ngFor="let column of columns"
        field="{{ column.field }}"
        title="{{ column.title }}"
        format="{{ column.format }}"
        [filter]="column.type"
      >
        <ng-template
          kendoGridGroupFooterTemplate
          *ngIf="column.showtotal"
          let-aggregates="aggregates"
        >
          <span> Total: {{ aggregates[column.field]?.sum }} </span>
        </ng-template>

        <ng-template kendoGridFooterTemplate *ngIf="column.showtotal">
          Grand Total: {{ total[column.field]?.sum }}
        </ng-template>
      </kendo-grid-column>
    </kendo-grid>
  `
})
export class AppComponent {
  public columns: ColumnSetting[] = [];

  openFile(event) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
      let reader = new FileReader();
      reader.onload = () => {
        var text = reader.result;
        let jsonObj = JSON.parse(text);
        this.columns = jsonObj as ColumnSetting[];
        this.onGroupChange(this.getgroups());
      };
      reader.readAsText(input.files[index]);
    }
  }

  public gridData: unknown[];

  public aggregates: AggregateDescriptor[] = this.getaggregators();

  public group: GroupDescriptor[] = this.getgroups();

  public getgroups(): GroupDescriptor[] {
    let groups = [] as GroupDescriptor[];
    let aggregators = this.getaggregators();
    this.columns.forEach(function (value) {
      if (value.clientGroupBy) {
        let customGroup = {} as GroupDescriptor;
        customGroup.field = value.field;
        customGroup.aggregates = aggregators;
        groups.push(customGroup);
      }
    });
    return groups;
  }

  public getaggregators(): AggregateDescriptor[] {
    let aggregator = [] as AggregateDescriptor[];
    this.columns.forEach(function (value) {
      if (value.showtotal) {
        let customAggregator = {} as AggregateDescriptor;
        customAggregator.field = value.field;
        customAggregator.aggregate = "sum";
        aggregator.push(customAggregator);
      }
    });
    return aggregator;
  }

  public total: AggregateResult = aggregateBy(SampleData, this.aggregates);

  onGroupChange(group: GroupDescriptor[]): void {
    // set aggregates to the returned GroupDescriptor
    group.map((group) => (group.aggregates = this.getaggregators()));
    this.group = group;
    this.gridData = groupBy(SampleData, this.group);
    this.total = aggregateBy(SampleData, this.getaggregators());
  }

  public initiallyExpanded = false;
  public expandedGroupKeys: GroupKey[] = [];

  public expandAll(): void {
    this.expandedGroupKeys = [];
    this.initiallyExpanded = true;
  }

  public collapseAll(): void {
    this.expandedGroupKeys = [];
    this.initiallyExpanded = false;
  }
}
