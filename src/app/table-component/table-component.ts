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

    private readonly columns: Array<ColumnDef<typeof features, Starship>> = [
    {
        header: 'Name',
        accessorKey: 'name',
        meta: {
          editable: true,
        },
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
    {
        header: 'Passengers',
        accessorKey: 'passengers',
    },
    {
        header: 'Crew',
        accessorKey: 'crew',
    },
  ];

  updateFilterInput = (updatedValue: string) => {
    this.columnFilters.set([
        {id: 'name', value: updatedValue}
    ])
  };

  table = injectTable(() => ({
    features,
    getRowId: (row) => this.stringService.generateIdFromUrl(row.url),
    columns: this.columns,
    data: this.displayUpdatedData(),
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
    const nearEnd = tableContainerElement.scrollTop + tableContainerElement.clientHeight >= tableContainerElement.scrollHeight - 150;

    if (nearEnd) {
      this.loadNextPage.emit();
    }
  }

  //keeping track of edited cells for patch request.
  edits = signal<Record<string, Partial<Starship>>>({});
  readonly save = output<Record<string, Partial<Starship>>>();
  readonly dirtyRowsCount = computed(() => Object.keys(this.edits()).length);
  editingCell = signal<{ rowId: string; columnId: string } | null>(null);
  draftValue = signal<string>('');

  isEditableColumn(columnDef: ColumnDef<typeof features, Starship>): boolean {
    return !!(columnDef.meta as { editable?: boolean } | undefined)?.editable;
  }

  readonly displayUpdatedData = computed(() =>
    this.starshipData().map((ship) => {
      const id = this.stringService.generateIdFromUrl(ship.url);
      return { ...ship, ...this.edits()[id] };
    }),
);

  updateCell = (rowId: string, field: keyof Starship, value: unknown) => {
    this.edits.update((current) => ({
      ...current,
      [rowId]: {...current[rowId], [field]: value},
    }));
  }

  isDirty = (rowId: string) => {
    return !!Object.keys(this.edits()[rowId] ?? {}).length;
  }

  isEditingCell(rowId: string, columnId: string): boolean {
    const editing = this.editingCell();
    return !!editing && editing.rowId === rowId && editing.columnId === columnId;
  }

  startEdit(rowId: string, columnId: string, currentValue: unknown): void {
    this.editingCell.set({ rowId, columnId });
    this.draftValue.set(String(currentValue ?? ''));
  }

  commitEdit(rowId: string, columnId: string): void {
    this.updateCell(rowId, columnId as keyof Starship, this.draftValue());
    this.editingCell.set(null);
  }

  cancelEdit(): void {
    this.editingCell.set(null);
  }
}