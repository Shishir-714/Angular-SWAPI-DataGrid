import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class StringService {
    capitalizeFirstChar = (input: string) => {
        return input ? `${input[0].toUpperCase()}${input.slice(1)}` : '-';
    }

    generateIdFromUrl = (url: string) => {
        //todo
        return ;
    }
}