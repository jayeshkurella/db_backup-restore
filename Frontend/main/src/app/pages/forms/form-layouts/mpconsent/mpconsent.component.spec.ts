import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpconsentComponent } from './mpconsent.component';

describe('MpconsentComponent', () => {
  let component: MpconsentComponent;
  let fixture: ComponentFixture<MpconsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpconsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpconsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
