import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImageTestsPage } from './image-tests.page';

describe('ImageTestsPage', () => {
  let component: ImageTestsPage;
  let fixture: ComponentFixture<ImageTestsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageTestsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageTestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
