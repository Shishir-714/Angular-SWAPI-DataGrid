import { Injectable } from "@angular/core";
import { SwapiResponse } from "../types/index.types";

@Injectable({
    providedIn: 'root',
})
export class QueryService {
    private readonly baseURL = 'https://swapi.dev/api';

    async getResponse<T>(
        endpoint: string,
        page = 1,
    ): Promise<SwapiResponse<T>> {
        try {
            const url = new URL(`${this.baseURL}/${endpoint}/`);
            url.searchParams.set('format', 'json');
            url.searchParams.set('page', String(page));

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching resource! Status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            throw new Error('Unable to fetch starship resource from SWAPI.');
        }
    }

    // async patchResource<T>(endpoint: string, id: string, changes: Partial<T>): Promise<T> {
    //     const url = new URL(`${this.baseURL}/${endpoint}/${id}/`);
    //     url.searchParams.set('format', 'json');

    //     const response = await fetch(url, {
    //         method: 'PATCH',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(changes),
    //     });

    //     if (!response.ok) {
    //         throw new Error(`Error updating resource! Status: ${response.status}`);
    //     }

    //     return response.json();
    // }
}