import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatwithupComponent } from './matwithup.component';

describe('MatwithupComponent', () => {
  let component: MatwithupComponent;
  let fixture: ComponentFixture<MatwithupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatwithupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatwithupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
