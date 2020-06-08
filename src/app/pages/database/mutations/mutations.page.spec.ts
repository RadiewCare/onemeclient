import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MutationsPage } from './mutations.page';

describe('MutationsPage', () => {
  let component: MutationsPage;
  let fixture: ComponentFixture<MutationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MutationsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MutationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
