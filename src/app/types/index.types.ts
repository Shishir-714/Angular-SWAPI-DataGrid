export type SwapiResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<T>;
}

export type Starship = {
    name: string;
    model: string;
    manufacturer: string;
    crew: string;
    passengers: number;
    hyperdrive_rating: number;
    starship_class: string;
    url: string;
}