import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class StringService {
    capitalizeFirstChar = (input: string) => {
        return input ? `${input[0].toUpperCase()}${input.slice(1)}` : '-';
    }

    //returns last segment (uniquer number) from the url.
    generateIdFromUrl = (url: string): string => {
        return url.replace(/\/$/, '').split('/').pop()!;
    }
}