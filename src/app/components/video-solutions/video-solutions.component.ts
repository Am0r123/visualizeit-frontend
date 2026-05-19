import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoSolutionService, VideoSolution } from '../../services/video-solution/video-solution.service';

@Component({
  selector: 'app-video-solutions',
  templateUrl: './video-solutions.component.html',
  styleUrls: ['./video-solutions.component.scss']
})
export class VideoSolutionsComponent implements OnInit {
  videos: VideoSolution[] = [];
  userRole: string = ''; 
  instructorName: string = '';

  newTitle: string = '';
  newUrl: string = '';
  isSubmitting: boolean = false;

  constructor(
    private videoService: VideoSolutionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'STUDENT';
    this.instructorName = localStorage.getItem('realName') || localStorage.getItem('username') || 'Instructor';
    this.loadVideos();
  }

  loadVideos(): void {
    this.videoService.getVideos().subscribe({
      next: (data) => this.videos = data,
      error: (err) => console.error('Failed to load videos', err)
    });
  }

  addVideo(): void {
    if (!this.newTitle.trim() || !this.newUrl.trim()) return;

    this.isSubmitting = true;
    const videoData: VideoSolution = {
      title: this.newTitle,
      url: this.newUrl,
      instructorName: this.instructorName
    };

    this.videoService.addVideo(videoData).subscribe({
      next: () => {
        this.newTitle = '';
        this.newUrl = '';
        this.isSubmitting = false;
        this.loadVideos();
      },
      error: () => this.isSubmitting = false
    });
  }

  deleteVideo(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this video?')) {
      this.videoService.deleteVideo(id).subscribe(() => this.loadVideos());
    }
  }

  // ✅ THE UPGRADED EMBED FUNCTION (Loom, YouTube, and Vimeo)
  getSafeEmbedUrl(url: string): SafeResourceUrl | null {
    // 1. Check for Loom
    const loomRegex = /(?:loom)\.com\/(?:share|embed)\/([a-z0-9]+)/i;
    const loomMatch = url.match(loomRegex);
    if (loomMatch && loomMatch[1]) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.loom.com/embed/${loomMatch[1]}`);
    }

    // 2. Check for YouTube
    const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[2].length === 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${ytMatch[2]}`);
    }

    // 3. Check for Vimeo
    const vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${vimeoMatch[1]}`);
    }

    // Not a recognized video link, fallback to a standard button
    return null;
  }
}