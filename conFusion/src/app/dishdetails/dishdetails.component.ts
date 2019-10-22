import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss']
})

export class DishdetailComponent implements OnInit {
  @ViewChild('fform') feedbackFormDirective;
  feedback :Comment;
  feedbackForm: FormGroup;
  @Input()dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();

     }
    formErrors = {
      'author': '',
      'comment': '',
    };

    validationMessages = {
      'author': {
        'required':      'Name is required.',
        'minlength':     'Name must be at least 2 characters long.',
        'maxlength':     'Name cannot be more than 25 characters long.'
      },
      'comment': {
        'required':      'comment is required.',
        'minlength':     'comment must be at least 2 characters long.',
        'maxlength':     'comment cannot be more than 25 characters long.'
      }
    };

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }
  
    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }
  goBack(): void {
    this.location.back();
  }
  createForm() : void{
    this.feedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      comment: ['', [Validators.required, Validators.minLength(2)] ],
      rating :[''],
    });
    this.feedbackForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  onSubmit() {
    this.feedbackForm.value.date = new Date();
    this.feedback = this.feedbackForm.value;
    this.dish.comments.push(this.feedbackForm.value);
    console.log(this.feedback);
    this.feedbackForm.reset({
      author: '',
      comment: ''
    });
    this.feedbackFormDirective.resetForm();
  }
  
}
