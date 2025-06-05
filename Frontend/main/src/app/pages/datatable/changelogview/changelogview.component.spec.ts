import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogviewComponent } from './changelogview.component';

describe('ChangelogviewComponent', () => {
  let component: ChangelogviewComponent;
  let fixture: ComponentFixture<ChangelogviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangelogviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangelogviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
