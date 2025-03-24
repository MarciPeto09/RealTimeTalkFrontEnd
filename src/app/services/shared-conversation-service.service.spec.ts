import { TestBed } from '@angular/core/testing';
import { SharedConversationServiceService } from './shared-conversation-service.service';

describe('SharedConversationServiceService', () => {
  let service: SharedConversationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedConversationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
