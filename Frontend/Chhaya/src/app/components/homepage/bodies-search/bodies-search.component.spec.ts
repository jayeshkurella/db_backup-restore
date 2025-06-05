import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodiesSearchComponent } from './bodies-search.component';

describe('BodiesSearchComponent', () => {
  let component: BodiesSearchComponent;
  let fixture: ComponentFixture<BodiesSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BodiesSearchComponent]
    });
    fixture = TestBed.createComponent(BodiesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
