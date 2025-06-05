import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedBodiesComponent } from './unidentified-bodies.component';

describe('UnidentifiedBodiesComponent', () => {
  let component: UnidentifiedBodiesComponent;
  let fixture: ComponentFixture<UnidentifiedBodiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnidentifiedBodiesComponent]
    });
    fixture = TestBed.createComponent(UnidentifiedBodiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
