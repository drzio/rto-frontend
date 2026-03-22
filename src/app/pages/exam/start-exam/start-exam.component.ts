import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { questions } from '../questions';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
    selector: 'app-start-exam',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './start-exam.component.html',
    styleUrls: ['./start-exam.component.css']
})
export class StartExamComponent implements OnInit, OnDestroy {
    currentQuestionIndex = 0;
    selectedOption: number | null = null;
    score = 0;
    timeLeft = 60; // Reset to 60 for consistency
    answers: any[] = [];
    questions: any[] = []; // Initialize empty
    timer: any;

    // TTS State
    isSpeaking = false;

    isAnswered = false;
    wrongAnswers = 0;

    private router = inject(Router);
    private ngZone = inject(NgZone);
    private apiService = inject(ApiService);
    private toast = inject(ToastService);

    ngOnInit() {
        // Try to restore session first
        if (this.restoreState()) {
            // If restored, we don't need to check eligibility again immediately, 
            // but it's good practice to verify in background or just proceed.
            // We will skip startExamSetup() since we have questions and state.
            this.loadQuestion(false); // False = don't reset timer fully, rely on state
        } else {
            this.checkEligibility();
        }
    }

    checkEligibility() {
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                if (res.success && res.data.length > 0) {
                    const status = res.data[0].status;

                    // STRICT BLOCKING: If already passed/failed/generated
                    if (['MCQ Passed', 'License Generated', 'Rejected', 'Approved'].includes(status)) {
                        this.toast.info('You have already completed the exam attempt. Status: ' + status);
                        this.router.navigate(['/dashboard']);
                        return;
                    }

                    // Allow only specific statuses
                    if (['Exam Scheduled', 'Eligible for Slot Booking', 'Documents Verified', 'Eligible for Exam'].includes(status)) {
                        this.startExamSetup();
                    } else if (status === 'Pending Verification' || status === 'Pending' || status === 'Payment Pending') {
                        this.toast.info('Your application is pending. Please wait for Admin approval.');
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.toast.error('You are not eligible for the exam at this stage. Current Status: ' + status);
                        this.router.navigate(['/dashboard']);
                    }
                } else {
                    this.toast.error('No application found.');
                    this.router.navigate(['/dashboard']);
                }
            },
            error: () => {
                this.toast.error('Error checking eligibility.');
                this.router.navigate(['/dashboard']);
            }
        });
    }

    startExamSetup() {
        this.apiService.getExamQuestions().subscribe({
            next: (res: any) => {
                if (res.success && res.data.length > 0) {
                    this.questions = res.data.map((q: any) => ({
                        ...q,
                        image: q.imageUrl // Map backend 'imageUrl' to frontend 'image'
                    }));
                    // Don't shuffle if we want consistent resume? 
                    // Actually, if we just started, we can shuffle. 
                    this.shuffleQuestions();

                    this.loadQuestion();
                    this.saveState(); // Initial Save
                } else {
                    this.toast.error('No questions available. Please contact admin.');
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err) => {
                console.error('Failed to load questions', err);
                this.toast.error('Failed to load exam questions.');
                this.router.navigate(['/dashboard']);
            }
        });
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    ngOnDestroy() {
        this.stopTimer();
    }

    // --- State Persistence ---

    saveState() {
        const state = {
            questions: this.questions, // Save order
            currentQuestionIndex: this.currentQuestionIndex,
            score: this.score,
            wrongAnswers: this.wrongAnswers,
            timeLeft: this.timeLeft,
            answers: this.answers,
            timestamp: Date.now()
        };
        localStorage.setItem('exam_session', JSON.stringify(state));
    }

    restoreState(): boolean {
        const saved = localStorage.getItem('exam_session');
        if (!saved) return false;

        try {
            const state = JSON.parse(saved);
            // Valid for 1 hour
            if (Date.now() - state.timestamp > 3600000) {
                this.clearState();
                return false;
            }

            this.questions = state.questions;
            this.currentQuestionIndex = state.currentQuestionIndex;
            this.score = state.score;
            this.wrongAnswers = state.wrongAnswers;
            this.timeLeft = state.timeLeft > 0 ? state.timeLeft : 60; // Resume time or default
            this.answers = state.answers;

            return true;
        } catch (e) {
            console.error('Error restoring state', e);
            this.clearState();
            return false;
        }
    }

    clearState() {
        localStorage.removeItem('exam_session');
    }

    // -------------------------

    loadQuestion(resetTimer = true) {
        this.stopTimer();
        if (resetTimer) {
            this.timeLeft = 60; // 60 Seconds per question default
        }

        this.isAnswered = false; // Reset for new question
        this.selectedOption = null;
        this.startTimer();
        this.saveState(); // Save on every load
    }

    startTimer() {
        this.ngZone.runOutsideAngular(() => {
            this.timer = setInterval(() => {
                this.ngZone.run(() => {
                    if (this.timeLeft > 0) {
                        this.timeLeft--;
                        // Save every 5 seconds to avoid performance hit? Or every second?
                        // Let's save every second on timer might be too much I/O but localStorage is sync/fast enough for simple text.
                        // Better: Save on change (Question/Answer) and maybe on destroy.
                        // Implementation: We won't save on every tick.
                        // But if user refreshes, they lose *current question* time progress. 
                        // That's acceptable behavior (reset to 60 or save every 5s).
                        // Let's stick to saving on major events for now.
                    } else {
                        // Auto skip only if not answered
                        if (!this.isAnswered) {
                            this.stopTimer();
                            this.handleNext(true);
                        }
                    }
                });
            }, 1000);
        });
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleOptionSelect(index: number) {
        if (this.isAnswered) return; // Lock if already answered

        this.isAnswered = true;
        this.selectedOption = index;
        this.stopTimer(); // Stop timer when answered

        const currentQ = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedOption === currentQ.correct;

        if (isCorrect) {
            this.score++;

            // Auto finish if 9 correct answers
            if (this.score >= 9) {
                setTimeout(() => {
                    this.submitExam();
                }, 1000); // 1s delay to see the correct answer feedback
                return;
            }
        } else {
            this.wrongAnswers++;
        }
        this.saveState(); // Save progress
    }

    handleNext(autoSkip = false) {
        if (!autoSkip && this.selectedOption === null) {
            // Should be covered by UI disabled state, but for safety:
            this.toast.info('Please select an answer before proceeding.');
            return;
        }

        // Save Result
        const currentQ = this.questions[this.currentQuestionIndex];

        this.answers.push({
            q: this.currentQuestionIndex,
            selected: this.selectedOption,
            proper: currentQ.correct,
            skipped: autoSkip
        });

        // Next Question or Finish
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion(); // Reset timer for next
        } else {
            this.submitExam();
        }
    }

    submitExam() {
        this.stopTimer();
        const result = this.score >= 9 ? 'Pass' : 'Fail';

        this.clearState(); // CLEAR SESSION

        this.apiService.submitExam({
            result,
            score: this.score
        }).subscribe({
            next: (res: any) => {
                this.router.navigate(['/exam/result'], {
                    state: {
                        score: this.score,
                        total: this.questions.length,
                        result: result,
                        isOfficial: true
                    }
                });
            },
            error: (err) => {
                this.toast.error('Error submitting exam. Please try again.');
                console.error(err);
            }
        });
    }

    formatTime(seconds: number): string {
        return `${seconds}s`; // Simplified format
    }

    speakQuestion() {
        if ('speechSynthesis' in window) {
            if (this.isSpeaking) {
                window.speechSynthesis.cancel();
                this.isSpeaking = false;
                return;
            }

            const currentQ = this.questions[this.currentQuestionIndex];
            const text = currentQ.question;
            const utter = new SpeechSynthesisUtterance(text);

            utter.lang = 'en-IN'; // Indian English if available
            utter.rate = 0.9;

            utter.onend = () => {
                this.ngZone.run(() => this.isSpeaking = false);
            };

            this.isSpeaking = true;
            window.speechSynthesis.speak(utter);
        } else {
            this.toast.info('Text-to-Speech not supported in this browser.');
        }
    }
}
