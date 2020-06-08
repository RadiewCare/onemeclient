import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddImagePage } from './add-image.page';

describe('AddImagePage', () => {
  let component: AddImagePage;
  let fixture: ComponentFixture<AddImagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddImagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
