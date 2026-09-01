import { Component, computed, inject } from "@angular/core";
import { QueryService } from "../services/queryService";
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { Starship } from "../types/index.types";
import { LoaderComponent } from "../loader/loader";
import { TableComponent } from "../table-component/table-component";
import { StringService } from "../services/stringService";

@Component({
    selector: 'app-show-starship-response',
    templateUrl: './show-starship-response.html',
    imports: [LoaderComponent, TableComponent]
})
export class ShowStarshipResponse {
    private readonly starshipEndpoint = 'starships';
    private readonly queryService = inject(QueryService);

    readonly starshipQuery = injectInfiniteQuery(() => ({
        queryKey: [this.starshipEndpoint],
        initialPageParam: 1,
        queryFn: ({pageParam}) => 
            this.queryService.getResponse<Starship>(
                this.starshipEndpoint,
                pageParam,
            ),
        getNextPageParam: (lastPage) => {
            if (!lastPage.next) {
                return undefined;
            }

            const nextPage = Number(
                new URL(lastPage.next).searchParams.get('page'),
            );

            return Number.isInteger(nextPage)
                ? nextPage
                : undefined;
            },
    }));

    readonly Starship = computed(
        () => this.starshipQuery.data()?.pages.flatMap((page) => page.results) ?? [],
    )

    loadNextPage(): void {
        if (!this.starshipQuery.hasNextPage() || this.starshipQuery.isFetching()) {
        return;
        }

        void this.starshipQuery.fetchNextPage();
    }
}