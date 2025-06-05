import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogsComponent } from './changelogs.component';

describe('ChangelogsComponent', () => {
  let component: ChangelogsComponent;
  let fixture: ComponentFixture<ChangelogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangelogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangelogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
