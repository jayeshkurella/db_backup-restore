import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbconsentComponent } from './ubconsent.component';

describe('UbconsentComponent', () => {
  let component: UbconsentComponent;
  let fixture: ComponentFixture<UbconsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbconsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbconsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
