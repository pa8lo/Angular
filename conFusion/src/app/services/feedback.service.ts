import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { Feedback } from '../shared/feedback';
import { baseURL } from '../shared/baseurl';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }
  submitFeedback(feedback : Feedback){
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json'
        })
      };
      return this.http.post<Feedback>(baseURL + 'feedback/', feedback, httpOptions)
        .pipe(catchError(this.processHTTPMsgService.handleError));
  }
  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(baseURL + 'feedback')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  } 
}
