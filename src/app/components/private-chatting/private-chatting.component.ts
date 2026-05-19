import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PrivateChatService, PrivateMessage } from '../../services/private-messages/private-chat.service';

@Component({
  selector: 'app-private-chatting',
  templateUrl: './private-chatting.component.html',
  styleUrls: ['./private-chatting.component.scss']
})
export class PrivateChattingComponent implements OnInit {
  @ViewChild('chatWindow') private chatScroll!: ElementRef;

  userName: string = '';
  userRole: string = '';
  messages: PrivateMessage[] = [];
  newMessage: string = '';
  activeStudents: string[] = [];
  selectedStudent: string = '';

  constructor(private chatService: PrivateChatService) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('realName') || localStorage.getItem('username') || 'Unknown';
    this.userRole = localStorage.getItem('role') || 'STUDENT';
    
    if (this.userRole === 'STUDENT') {
      this.selectedStudent = this.userName;
      this.loadThread();
    } else {
      this.loadActiveStudents();
    }
  }

  loadActiveStudents(): void {
    this.chatService.getActiveStudents().subscribe(students => {
      this.activeStudents = students;
    });
  }

  selectStudent(student: string): void {
    this.selectedStudent = student;
    this.loadThread();
  }

  loadThread(): void {
    if (!this.selectedStudent) return;
    this.chatService.getChatThread(this.selectedStudent).subscribe(data => {
      this.messages = data;
      this.scrollToBottom();
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedStudent) return;

    const payload: PrivateMessage = {
      studentUsername: this.selectedStudent,
      senderName: this.userName,
      senderRole: this.userRole,
      content: this.newMessage
    };

    this.chatService.sendMessage(payload).subscribe(() => {
      this.newMessage = '';
      this.loadThread();
      if (this.userRole === 'INSTRUCTOR' && !this.activeStudents.includes(this.selectedStudent)) {
        this.loadActiveStudents();
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScroll) {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      }
    }, 100);
  }
}