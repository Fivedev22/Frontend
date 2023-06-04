import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnarchiveClientComponent } from './unarchive-client.component';

describe('UnarchiveClientComponent', () => {
  let component: UnarchiveClientComponent;
  let fixture: ComponentFixture<UnarchiveClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnarchiveClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnarchiveClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
