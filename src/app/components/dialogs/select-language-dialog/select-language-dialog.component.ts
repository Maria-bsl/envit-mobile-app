import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateConfigService } from 'src/app/translate-config.service';

@Component({
  selector: 'app-select-language-dialog',
  templateUrl: './select-language-dialog.component.html',
  styleUrls: ['./select-language-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class SelectLanguageDialogComponent implements OnInit {
  languageChange: EventEmitter<{ language: string }> = new EventEmitter<{
    language: string;
  }>();
  formGroup!: FormGroup;
  languages: { title: string; code: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<SelectLanguageDialogComponent>,
    private translateConfigService: TranslateConfigService,
    @Inject(MAT_DIALOG_DATA) public data: { language: string }
  ) {}
  private createFormGroup() {
    if (this.data.language) {
      this.formGroup = this.fb.group({
        language: this.fb.control(this.data.language, [Validators.required]),
      });
    } else {
      let lang = this.translateConfigService.getCurrentLang();
      this.formGroup = this.fb.group({
        language: this.fb.control(lang, [Validators.required]),
      });
    }
  }
  ngOnInit() {
    this.createFormGroup();
    this.translate.get('navbar.selectLanguage.languages').subscribe({
      next: (languages) => {
        this.languages = languages;
      },
    });
  }
  changeLanguage() {
    this.languageChange.emit(this.formGroup.value);
  }
  get language() {
    return this.formGroup.get('language') as FormControl;
  }
}
