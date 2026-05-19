import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

// ✅ Correct import path
import { ChatService, ChatMessage } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss']
})
export class ChattingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUser: string = ''; 
  currentUserId!: number; 
  
  // ✅ Flag to track if auto-scroll should happen
  private isUserAtBottom = true;

  private pollingInterval: ReturnType<typeof setInterval> | undefined;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const loggedInName = localStorage.getItem('realName') || 'Unknown';
    const role = localStorage.getItem('role');
    this.currentUserId = Number(localStorage.getItem('userId')) || 0;
    this.currentUser = role === 'INSTRUCTOR' ? `Instructor ${loggedInName}` : loggedInName;

    this.loadMessages();
    this.pollingInterval = setInterval(() => { this.loadMessages(); }, 2000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval !== undefined) clearInterval(this.pollingInterval);
  }

  // ✅ Only scroll if the user is already at the bottom
  ngAfterViewChecked() {
    if (this.isUserAtBottom) {
      this.scrollToBottom();
    }
  }

  // ✅ Detect if the user is scrolling up manually
  onScroll(): void {
    const element = this.myScrollContainer.nativeElement;
    const threshold = 50; // pixels from the bottom to be considered "at bottom"
    const position = element.scrollHeight - element.scrollTop - element.clientHeight;
    this.isUserAtBottom = position <= threshold;
  }

  // ✅ Fix for mobile: Ensures view jumps up when keyboard appears
  onInputFocus(): void {
    // Give the keyboard 300ms to fully slide up before we scroll
    setTimeout(() => {
      this.isUserAtBottom = true; // Re-enable auto-scroll
      this.scrollToBottom();
    }, 300);
  }

  loadMessages(): void {
    this.chatService.getMessages().subscribe({
      next: (data: ChatMessage[]) => {
        if (data.length !== this.messages.length) {
          this.messages = data;
        }
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUserId) return;

    const message: ChatMessage = {
      senderId: this.currentUserId,
      senderName: this.currentUser,
      content: this.newMessage
    };

    // When YOU send a message, force the scroll to bottom
    this.isUserAtBottom = true;

    this.chatService.sendMessage(message).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadMessages(); 
      }
    });
  }

  deleteMessage(messageId: number | undefined): void {
    if (!messageId) return;
    if (confirm("Are you sure you want to delete this message?")) {
      this.chatService.deleteMessage(messageId).subscribe({
        next: () => this.loadMessages(),
        error: (err) => console.error("Delete failed", err)
      });
    }
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}