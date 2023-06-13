import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { HeadComponent } from './head/head.component';
import { TableCxrComponent } from './table-cxr/table-cxr.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TablePxrComponent } from './table-pxr/table-pxr.component';

@NgModule({
  declarations: [
    ButtonComponent,
    HeadComponent,
    TableCxrComponent,
    TablePxrComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  exports: [
    ButtonComponent,
    HeadComponent,
    TableCxrComponent,
    TablePxrComponent,
  ],
})
export class ComponentsModule {}
