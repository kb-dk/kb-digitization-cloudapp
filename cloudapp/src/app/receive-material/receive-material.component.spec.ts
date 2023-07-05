import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveMaterialComponent } from './receive-material.component';

describe('ReceiveMaterialComponent', () => {
  let component: ReceiveMaterialComponent;
  let fixture: ComponentFixture<ReceiveMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiveMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
