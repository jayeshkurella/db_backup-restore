import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpconsentComponent } from './upconsent.component';

describe('UpconsentComponent', () => {
  let component: UpconsentComponent;
  let fixture: ComponentFixture<UpconsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpconsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpconsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
