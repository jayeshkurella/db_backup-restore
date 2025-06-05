import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetaildataComponent } from './detaildata.component';

describe('DetaildataComponent', () => {
  let component: DetaildataComponent;
  let fixture: ComponentFixture<DetaildataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetaildataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetaildataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
