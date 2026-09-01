import { 
    Component, 
    computed, 
    ElementRef, 
    inject, 
    input, 
    output, 
    signal, 
    viewChild 
} from "@angular/core";
import { Starship } from "../types/index.types";
import {
  ColumnDef,
  injectTable,
  tableFeatures,
  columnFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  ColumnFiltersState,
  columnSizingFeature,
  columnResizingFeature,
  ColumnSizingState,
} from '@tanstack/angular-table';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import { StringService } from "../services/stringService";

const features = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
      includesString: filterFn_includesString,
  }
});

@Component({
    selector: 'app-starship-table',
    templateUrl: './table-component.html',
})
export class TableComponent {
    readonly stringService = inject(StringService);
    readonly loadNextPage = output<void>();
    readonly tableContainer = viewChild<ElementRef<HTMLDivElement>>('tableContainer');
    readonly allRows = computed(() => this.table.getRowModel().rows);
    readonly virtualRows = computed(() => this.rowVirtualizer.getVirtualItems());
    readonly totalTableBodySize = computed(() => this.rowVirtualizer.getTotalSize());

    starshipData = input<Starship[]>([]);
    filterInput = signal<string>('');
    columnFilters = signal<ColumnFiltersState>([
        {id: 'name', value: ''}
    ]);
    columnSizing = signal<ColumnSizingState>({});

    private readonly columns: Array<ColumnDef<typeof features, Starship>> = [
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Model',
        accessorKey: 'model',
    },
    {
        header: 'Hyperdrive Rating',
        accessorKey: 'hyperdrive_rating',
    },
    {
        header: 'Manufacturer',
        accessorKey: 'manufacturer',
    },
    {
        header: 'Starship Class',
        accessorFn: (row: Starship) => 
            this.stringService.capitalizeFirstChar(row.starship_class),
    },
  ];

  updateFilterInput = (updatedValue: string) => {
    this.columnFilters.set([
        {id: 'name', value: updatedValue}
    ])
  };

  table = injectTable(() => ({
    features,
    columns: this.columns,
    data: this.starshipData(),
    state: {
      columnFilters: this.columnFilters(),
    },
    onColumnFiltersChange: (updater) => {
      this.columnFilters.update((old) =>
        typeof updater === 'function' ? updater(old) : updater,
      );
    },
    defaultColumn: {
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    columnResizeDirection: 'ltr',
    columnResizeMode: 'onChange',
  }));

  readonly rowVirtualizer = injectVirtualizer(() => ({
    count: this.allRows().length,
    estimateSize: () => 56,
    overscan: 6,
    scrollElement: this.tableContainer()?.nativeElement,
  }));

  onScroll(event: Event): void {
    const tableContainerElement = event.target as HTMLDivElement;
    const nearEnd = tableContainerElement.scrollTop + tableContainerElement.clientHeight >= tableContainerElement.scrollHeight - 120;

    if (nearEnd) {
      this.loadNextPage.emit();
    }
  }

  consoleData = () => {
    console.log(this.starshipData());
  }
}