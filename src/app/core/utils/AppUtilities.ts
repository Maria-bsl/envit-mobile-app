import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import Swal from 'sweetalert2';

export class AppUtilities {
  static readonly TOKEN_NAME = 'profanis_auth';
  static readonly TOKEN_user = 'bizlogicj';
  static readonly TOKEN_Cstomer = 'cstID';
  static readonly EVENT_NAME = 'event_name';
  static readonly EVENT_ID = 'event_id';
  static readonly EVENT_DETAILS_LIST = 'event_details_list';
  static readonly CURRENT_LANG = 'currentLang';
  static showErrorMessage(title: string, message: string) {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      heightAuto: false,
    });
  }
  static showWarningMessage(title: string, message: string) {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      heightAuto: false,
    });
  }
  static showSuccessMessage(title: string, message: string) {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      heightAuto: false,
    });
  }
  static showSuccessToast(title: string) {
    Swal.fire({
      icon: 'success',
      title: title,
      toast: true,
      position: 'center',
      showConfirmButton: false,
      timer: 3000,
    });
  }
  //static httpE;
  static confirmAction(message: string) {
    return Swal.fire({
      title: '',
      text: message,
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Scan',
      heightAuto: false,
    });
  }
  static matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      return !!control.parent &&
        !!control.parent.value &&
        control.value === (control.parent?.controls as any)[matchTo].value
        ? null
        : { matching: true };
    };
  }
}
