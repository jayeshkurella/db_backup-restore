import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteersdataComponent } from './volunteersdata.component';

describe('VolunteersdataComponent', () => {
  let component: VolunteersdataComponent;
  let fixture: ComponentFixture<VolunteersdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteersdataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteersdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
