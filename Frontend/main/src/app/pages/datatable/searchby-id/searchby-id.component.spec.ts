import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchbyIDComponent } from './searchby-id.component';

describe('SearchbyIDComponent', () => {
  let component: SearchbyIDComponent;
  let fixture: ComponentFixture<SearchbyIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchbyIDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchbyIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
