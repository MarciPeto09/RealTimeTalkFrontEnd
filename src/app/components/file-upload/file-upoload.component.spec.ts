import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUpoloadComponent } from './file-upoload.component';

describe('FileUpoloadComponent', () => {
  let component: FileUpoloadComponent;
  let fixture: ComponentFixture<FileUpoloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUpoloadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUpoloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
