import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingpersonComponent } from './missingperson.component';

describe('MissingpersonComponent', () => {
  let component: MissingpersonComponent;
  let fixture: ComponentFixture<MissingpersonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissingpersonComponent]
    });
    fixture = TestBed.createComponent(MissingpersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
