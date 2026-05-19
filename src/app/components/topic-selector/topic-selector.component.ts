import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topic-selector',
  templateUrl: './topic-selector.component.html',
  // Make sure this points to your main dashboard SCSS file!
  styleUrls: ['../dashboard/dashboard.scss', './topic-selector.component.scss'] 
})
export class TopicSelectorComponent implements OnInit {

  topics: any[] = [];
  
  // Variables for the "Add New" form
  isAddingTopic = false;
  newTopicName = '';

  // Connects to the @GetMapping and @PostMapping in LevelsController
  private apiUrl = `${environment.backendUrl}/api/topics`;

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.topics = data,
      error: (err) => console.error("Failed to load topics", err)
    });
  }

  toggleAddForm() {
    this.isAddingTopic = !this.isAddingTopic;
    this.newTopicName = ''; // Reset input when toggling
  }

  saveNewTopic() {
    if (!this.newTopicName.trim()) {
      this.toastr.warning('Topic name cannot be empty!');
      return;
    }

    const payload = { name: this.newTopicName };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (savedTopic) => {
        this.toastr.success('New topic added successfully!');
        this.topics.push(savedTopic); // Instantly add the new folder to the screen
        this.toggleAddForm(); // Close the input box
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to add topic.');
      }
    });
  }

  /**
   * 🗑️ NEW: Method to handle topic deletion
   */
  deleteTopic(topicId: number, event: Event) {
    // CRITICAL: Stop the routerLink from firing when clicking the button
    event.preventDefault();
    event.stopPropagation();

    const confirmDelete = confirm("Are you sure you want to delete this topic? All associated levels will also be deleted.");
    
    if (confirmDelete) {
      this.http.delete(`${this.apiUrl}/${topicId}`).subscribe({
        next: (res) => {
          // Remove the topic from the UI instantly
          this.topics = this.topics.filter((t: any) => t.id !== topicId);
          this.toastr.success('Topic deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting topic:', err);
          this.toastr.error("Failed to delete topic. Make sure your database allows cascading deletes.");
        }
      });
    }
  }
}