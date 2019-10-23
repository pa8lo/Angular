import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})

export class DishdetailComponent implements OnInit {
  @ViewChild('fform') feedbackFormDirective;
  feedback :Comment;
  feedbackForm: FormGroup;
  @Input()dish: Dish;
  visibility = 'shown';
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishcopy: Dish;
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
      this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess);
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
    this.dishcopy.comments.push(this.feedbackForm.value);
    this.dishservice.putDish(this.dishcopy)
    .subscribe(dish => { this.dish = dish;this.dishcopy = dish},
      errmess => {this.dish = null;this.dishcopy;this.errMess = <any>errmess})
    console.log(this.feedback);
    this.feedbackForm.reset({
      author: '',
      comment: ''
    });
    this.feedbackFormDirective.resetForm();
  }
  
}
