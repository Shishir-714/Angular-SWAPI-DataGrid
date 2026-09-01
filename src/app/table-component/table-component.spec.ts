import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TableComponent } from './table-component';
import { Starship } from '../types/index.types';

describe('TableComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TableComponent>>;
  let component: TableComponent;

  //dummy response.
  const starships = [
    { 
        name: 'Death Star', 
        model: 'DS-1', 
        manufacturer: '', 
        crew: '',
        passengers: 0,
        url: 'https://swapi.dev/api/starships/9/', 
        hyperdrive_rating: 0, 
        starship_class: 'deep space mobile battlestation' 
    },
  ] as Starship[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableComponent] });
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('starshipData', starships);
    fixture.detectChanges();
  });

  //check if editing in cell is actually stores in state.
  it('stores an edit in client state without mutating the source row', () => {
    component.updateCell('9', 'name', 'Death Star II');

    expect(component.edits()['9']).toEqual({ name: 'Death Star II' });
    expect(component.displayUpdatedData()[0].name).toBe('Death Star II');
    expect(starships[0].name).toBe('Death Star');
  });

  //test client-side filter by checking no. of rows based on filter input.
  it('filters rows by name', () => {
    component.updateFilterInput('death');
    fixture.detectChanges();
    expect(component.allRows().length).toBe(1);

    component.updateFilterInput('nothing-matches-this');
    fixture.detectChanges();
    expect(component.allRows().length).toBe(0);
  });
});