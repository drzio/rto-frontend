import { Component, OnInit, OnDestroy, inject, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-driving-test',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './driving-test.component.html',
    styleUrls: ['./driving-test.component.css']
})
export class DrivingTestComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;

    // Game Configuration
    trackConfig = {
        leftCenter: { x: 250, y: 220 },
        rightCenter: { x: 550, y: 220 },
        radius: 150,
        roadWidth: 100
    };

    cpLabels = ["Start Point", "Right Loop", "Top Crossing", "Center Point", "Bottom Crossing", "Left Loop", "Finish Line"];
    checkpoints: any[] = [];

    // Car Physics
    car = {
        x: 400, y: 220,
        length: 40, width: 22,
        angle: -Math.PI / 2,
        speed: 0,
        maxSpeed: 2.5,
        acceleration: 0.04,
        friction: 0.96,
        turnSpeed: 0.035,
        color: '#1565c0'
    };

    // Game State
    gameState: 'START' | 'PLAY' | 'GAMEOVER' | 'WIN' = 'START';
    timer = 120;
    speedDisplay = 0;
    currentTargetIndex = 0;
    gameOverMessage = '';

    keys: any = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

    private timerInterval: any;
    private animationFrameId: any;

    // Angular Services
    private router = inject(Router);
    private ngZone = inject(NgZone);
    private apiService = inject(ApiService);
    private toast = inject(ToastService);
    applicationId: string | null = null;

    ngOnInit() {
        this.checkEligibility();
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    ngAfterViewInit() {
        // Initial Draw (Background/Title Screen if needed, but we have Overlay)
    }

    ngOnDestroy() {
        this.stopGameLoop();
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    checkEligibility() {
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                if (res.success && res.data.length > 0) {
                    this.applicationId = res.data[0]._id;
                    // We can add stricter checks here if needed, but dashboard handles entry
                }
            }
        });
    }

    // --- Input Handling ---
    handleKeyDown = (e: KeyboardEvent) => {
        if (this.keys.hasOwnProperty(e.code)) {
            e.preventDefault(); // Prevent scrolling
            this.keys[e.code] = true;
        }
    };

    handleKeyUp = (e: KeyboardEvent) => {
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = false;
        }
    };

    startKey(key: string) {
        this.keys[key] = true;
    }

    stopKey(key: string) {
        this.keys[key] = false;
    }

    // --- Game Logic ---

    initGame() {
        const coords = [
            { x: 550, y: 370 }, // Bottom Right
            { x: 700, y: 220 }, // Right Edge
            { x: 550, y: 70 },  // Top Right
            { x: 400, y: 220 }, // Center
            { x: 250, y: 370 }, // Bottom Left
            { x: 100, y: 220 }, // Left Edge
            { x: 250, y: 70 }   // Top Left
        ];
        this.checkpoints = this.cpLabels.map((l, i) => ({
            id: i, x: coords[i].x, y: coords[i].y, radius: 35, reached: false, label: l
        }));
    }

    startGame() {
        if (!this.canvasRef) return;
        this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

        this.car.x = 400; this.car.y = 220; this.car.angle = -Math.PI / 2; this.car.speed = 0;
        this.timer = 120;
        this.gameState = 'PLAY';
        this.currentTargetIndex = 0;
        this.initGame();

        // Start Timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer--;
            if (this.timer <= 0) this.gameOver("Time Expired!");
        }, 1000);

        // Start Loop
        this.ngZone.runOutsideAngular(() => {
            this.gameLoop();
        });
    }

    stopGameLoop() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    gameLoop() {
        if (this.gameState !== 'PLAY') return;

        this.updatePhysics();
        this.checkLogic();
        this.draw();

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    updatePhysics() {
        if (this.keys.ArrowUp) this.car.speed += this.car.acceleration;
        if (this.keys.ArrowDown) this.car.speed -= this.car.acceleration;
        this.car.speed *= this.car.friction;

        if (this.keys.ArrowLeft) this.car.angle -= this.car.turnSpeed;
        if (this.keys.ArrowRight) this.car.angle += this.car.turnSpeed;

        this.car.x += Math.cos(this.car.angle) * this.car.speed;
        this.car.y += Math.sin(this.car.angle) * this.car.speed;

        // Update UI (Throttle this if needed, but for now we run it inside Angular zone occasionally or just bind)
        // To avoid change detection spam, we update a property but use zone.run only when needed?
        // Actually, for smooth UI updates in Angular from a RAF loop, define a separate updateUI or rely on local variables
        // speedDisplay binding effectively requires change detection.
        // Let's use manual DOM update or allow CD. Since it's a simple game, CD every frame might be OK or use OnPush.
        // For now, let's just update the property. To make it show up, we might need `this.ngZone.run`.
        // But running CD 60fps is bad. Better to update DOM directly or throttle.
        // Let's do simple throttle: every 10 frames?
        // For simplicity in this prompt, I'll update it but maybe CD won't pick it up instantly outside zone.
        // I'll leave it as is, and force detect changes if crucial, but usually for speed display we can be lazy.
        this.ngZone.run(() => {
            this.speedDisplay = Math.abs(Math.round(this.car.speed * 15));
        });
    }

    checkLogic() {
        const outer = this.trackConfig.radius + this.trackConfig.roadWidth / 2;
        const inner = this.trackConfig.radius - this.trackConfig.roadWidth / 2;

        const corners = this.getCarCorners();
        let carIsSafe = true;

        for (let p of corners) {
            const dL = Math.hypot(p.x - this.trackConfig.leftCenter.x, p.y - this.trackConfig.leftCenter.y);
            const dR = Math.hypot(p.x - this.trackConfig.rightCenter.x, p.y - this.trackConfig.rightCenter.y);

            const inLeft = dL <= outer && dL >= inner;
            const inRight = dR <= outer && dR >= inner;

            if (!inLeft && !inRight) {
                carIsSafe = false;
                break;
            }
        }

        if (!carIsSafe) {
            this.ngZone.run(() => this.gameOver("Touched the Border!"));
            return;
        }

        if (this.currentTargetIndex < this.checkpoints.length) {
            const t = this.checkpoints[this.currentTargetIndex];
            if (Math.hypot(this.car.x - t.x, this.car.y - t.y) < t.radius) {
                t.reached = true;
                this.currentTargetIndex++;
                // Trigger CD to update checklist
                this.ngZone.run(() => { });

                if (this.currentTargetIndex >= this.checkpoints.length) {
                    this.ngZone.run(() => this.gameOver("Test Passed Successfully!", true));
                }
            }
        }
    }

    getCarCorners() {
        const cos = Math.cos(this.car.angle);
        const sin = Math.sin(this.car.angle);
        const dx = this.car.length / 2;
        const dy = this.car.width / 2;
        return [
            { x: this.car.x + (dx * cos - dy * sin), y: this.car.y + (dx * sin + dy * cos) },
            { x: this.car.x + (dx * cos + dy * sin), y: this.car.y + (dx * sin - dy * cos) },
            { x: this.car.x + (-dx * cos - dy * sin), y: this.car.y + (-dx * sin + dy * cos) },
            { x: this.car.x + (-dx * cos + dy * sin), y: this.car.y + (-dx * sin - dy * cos) }
        ];
    }

    // State for UI
    isSavingResult = false;
    resultSaved = false;

    gameOver(msg: string, win = false) {
        this.stopGameLoop();
        this.gameState = win ? 'WIN' : 'GAMEOVER';
        this.gameOverMessage = msg;

        if (win && this.applicationId) {
            this.isSavingResult = true;
            this.apiService.submitDrivingTestResult({
                applicationId: this.applicationId,
                result: 'Pass'
            }).subscribe({
                next: (res) => {
                    console.log('Result Submitted', res);
                    this.isSavingResult = false;
                    this.resultSaved = true;
                },
                error: (err) => {
                    console.error('Failed to submit result', err);
                    this.isSavingResult = false;
                    this.toast.error('Error saving result. Please contact admin.');
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    goToAppointment() {
        this.router.navigate(['/slot-booking']);
    }

    // --- Drawing ---
    draw() {
        const ctx = this.ctx;
        const width = this.canvasRef.nativeElement.width;
        const height = this.canvasRef.nativeElement.height;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // 1. Borders (Blue)
        const borderWidth = 8;
        ctx.lineCap = 'butt';
        ctx.lineWidth = this.trackConfig.roadWidth + borderWidth;
        ctx.strokeStyle = "#2196f3";

        ctx.beginPath(); ctx.arc(this.trackConfig.leftCenter.x, this.trackConfig.leftCenter.y, this.trackConfig.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(this.trackConfig.rightCenter.x, this.trackConfig.rightCenter.y, this.trackConfig.radius, 0, Math.PI * 2); ctx.stroke();

        // 2. Road (Grey)
        ctx.lineWidth = this.trackConfig.roadWidth;
        ctx.strokeStyle = "#455a64";

        ctx.beginPath(); ctx.arc(this.trackConfig.leftCenter.x, this.trackConfig.leftCenter.y, this.trackConfig.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(this.trackConfig.rightCenter.x, this.trackConfig.rightCenter.y, this.trackConfig.radius, 0, Math.PI * 2); ctx.stroke();

        // Checkpoints
        this.checkpoints.forEach((cp, i) => {
            if (!cp.reached) {
                const active = (i === this.currentTargetIndex);
                ctx.beginPath(); ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
                ctx.fillStyle = active ? "rgba(25, 118, 210, 0.2)" : "rgba(0,0,0,0.05)";
                ctx.fill();
                ctx.strokeStyle = active ? "#1976d2" : "rgba(0,0,0,0.1)";
                ctx.lineWidth = 2; ctx.stroke();

                ctx.fillStyle = active ? "#ffffff" : "#999";
                ctx.font = "bold 16px Roboto"; ctx.textAlign = "center";
                ctx.fillText((i + 1).toString(), cp.x, cp.y + 6);
            }
        });

        // Car
        ctx.save();
        ctx.translate(this.car.x, this.car.y);
        ctx.rotate(this.car.angle);

        // Accessing helper: this.roundRect
        ctx.fillStyle = "rgba(0,0,0,0.2)"; this.roundRect(ctx, -this.car.length / 2 + 4, -this.car.width / 2 + 4, this.car.length, this.car.width, 5); ctx.fill();
        ctx.fillStyle = this.car.color; this.roundRect(ctx, -this.car.length / 2, -this.car.width / 2, this.car.length, this.car.width, 6); ctx.fill();
        ctx.fillStyle = "#90caf9"; this.roundRect(ctx, -this.car.length / 4, -this.car.width / 2 + 3, this.car.length / 2, this.car.width - 6, 4); ctx.fill();
        ctx.fillStyle = "#ffeb3b"; this.roundRect(ctx, this.car.length / 2 - 2, -this.car.width / 2 + 2, 4, 5, 2); ctx.fill();
        this.roundRect(ctx, this.car.length / 2 - 2, this.car.width / 2 - 7, 4, 5, 2); ctx.fill();
        ctx.restore();
    }

    roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
        ctx.beginPath(); ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath(); return ctx;
    }

    formatTime(seconds: number) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `0${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
}
