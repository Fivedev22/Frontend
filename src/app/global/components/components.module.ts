import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { HeadComponent } from './head/head.component';

@NgModule({
  declarations: [ButtonComponent, HeadComponent],
  imports: [CommonModule],
  exports: [ButtonComponent, HeadComponent],
})
export class ComponentsModule {}
