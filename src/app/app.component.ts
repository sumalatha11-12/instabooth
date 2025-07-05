import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('video') videoRef!: ElementRef;
  @ViewChild('canvas') canvasRef!: ElementRef;

  photoCount = 0;
  photos: string[] = [];
  countdown = 3;
  isCapturing = false;

  filters = [
    { name: 'None', value: 'none' },
    { name: 'Saturate', value: 'saturate(200%)' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Vibrant', value: 'saturate(150%) brightness(1.1)' },
    { name: 'Dreamy', value: 'blur(2px) brightness(1.3) contrast(90%)' },
    { name: 'Retro', value: 'sepia(0.7) contrast(1.2) brightness(0.9)' },
    { name: 'Cool Blue', value: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm Glow', value: 'sepia(0.4) brightness(1.2) contrast(1.1)' },
    { name: 'Dramatic', value: 'contrast(140%) grayscale(30%)' },
    { name: 'Glow', value: 'brightness(1.3) saturate(120%) blur(1px)' },
    { name: 'Vintage', value: 'contrast(1.1) sepia(0.9) saturate(70%)' },
    { name: 'Matte', value: 'contrast(85%) brightness(1.1)' },
    { name: 'Mono Pop', value: 'grayscale(100%) contrast(1.2) brightness(1.2)' },
    { name: 'Golden Hour', value: 'sepia(0.4) brightness(1.1) hue-rotate(-10deg)' }
  ];
  selectedFilter = 'none';

  async ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
  }

  applyFilter(filter: string) {
    this.selectedFilter = filter;
  }

  startPhotoSession() {
    this.photos = [];
    this.photoCount = 0;
    this.isCapturing = true;
    this.takeNextPhoto();
  }

  async takeNextPhoto() {
    if (this.photoCount >= 3) {
      this.isCapturing = false;
      return;
    }

    this.countdown = 5;
    const countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(countdownInterval);
        this.capturePhoto();
      }
    }, 1000);
  }

  capturePhoto() {
    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    // Apply filter to canvas as well
    ctx!.filter = this.selectedFilter;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/jpeg');
    this.photos.push(photoData);
    this.photoCount++;

    setTimeout(() => this.takeNextPhoto(), 1000);
  }

  downloadCollage() {
    const collageCanvas = this.canvasRef.nativeElement;
    const ctx = collageCanvas.getContext('2d');
    const photoWidth = 320;
    const photoHeight = 240;

    collageCanvas.width = photoWidth * 3;
    collageCanvas.height = photoHeight;

    this.photos.forEach((photo, i) => {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, i * photoWidth, 0, photoWidth, photoHeight);
      };
      img.src = photo;
    });

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = 'photo-collage.jpg';
      link.href = collageCanvas.toDataURL('image/jpeg');
      link.click();
    }, 1000);
  }
}
