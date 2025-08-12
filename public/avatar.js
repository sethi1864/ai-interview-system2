// AI Avatar System for Interview
class AIAvatar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isSpeaking = false;
        this.currentEmotion = 'neutral';
        this.animationFrame = null;
        this.lipSyncData = [];
        
        this.init();
    }
    
    init() {
        // Set up canvas
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.borderRadius = '10px';
        
        // Clear container and add canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        
        // Start animation loop
        this.animate();
        
        // Load avatar assets
        this.loadAssets();
    }
    
    loadAssets() {
        // Create avatar elements
        this.createAvatarElements();
    }
    
    createAvatarElements() {
        // Avatar face structure
        this.face = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 120,
            color: '#FFE4C4'
        };
        
        // Eyes
        this.eyes = {
            left: { x: this.face.x - 40, y: this.face.y - 30, radius: 8, color: '#2C3E50' },
            right: { x: this.face.x + 40, y: this.face.y - 30, radius: 8, color: '#2C3E50' }
        };
        
        // Eyebrows
        this.eyebrows = {
            left: { x: this.face.x - 40, y: this.face.y - 45, width: 20, height: 4, color: '#2C3E50' },
            right: { x: this.face.x + 40, y: this.face.y - 45, width: 20, height: 4, color: '#2C3E50' }
        };
        
        // Mouth
        this.mouth = {
            x: this.face.x,
            y: this.face.y + 30,
            width: 40,
            height: 20,
            color: '#E74C3C'
        };
        
        // Hair
        this.hair = {
            x: this.face.x,
            y: this.face.y - 80,
            width: 160,
            height: 80,
            color: '#8B4513'
        };
        
        // Professional attire
        this.attire = {
            x: this.face.x,
            y: this.face.y + 120,
            width: 200,
            height: 100,
            color: '#34495E'
        };
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw avatar components
        this.drawHair();
        this.drawAttire();
        this.drawFace();
        this.drawEyes();
        this.drawEyebrows();
        this.drawMouth();
        
        // Add speaking animation
        if (this.isSpeaking) {
            this.animateSpeaking();
        }
        
        // Add blinking
        this.animateBlinking();
        
        // Add subtle movements
        this.animateSubtleMovements();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawHair() {
        this.ctx.fillStyle = this.hair.color;
        this.ctx.beginPath();
        this.ctx.ellipse(this.hair.x, this.hair.y, this.hair.width / 2, this.hair.height / 2, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Add hair details
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const x = this.hair.x - 60 + i * 30;
            const y = this.hair.y - 20;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.quadraticCurveTo(x + 15, y - 10, x + 30, y);
            this.ctx.stroke();
        }
    }
    
    drawAttire() {
        // Professional blazer
        this.ctx.fillStyle = this.attire.color;
        this.ctx.fillRect(this.attire.x - this.attire.width / 2, this.attire.y, this.attire.width, this.attire.height);
        
        // Blazer collar
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.beginPath();
        this.ctx.moveTo(this.attire.x - 30, this.attire.y);
        this.ctx.lineTo(this.attire.x - 20, this.attire.y - 20);
        this.ctx.lineTo(this.attire.x + 20, this.attire.y - 20);
        this.ctx.lineTo(this.attire.x + 30, this.attire.y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Blazer buttons
        this.ctx.fillStyle = '#F39C12';
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.attire.x, this.attire.y + 20 + i * 20, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    drawFace() {
        this.ctx.fillStyle = this.face.color;
        this.ctx.beginPath();
        this.ctx.arc(this.face.x, this.face.y, this.face.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Add subtle shading
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.beginPath();
        this.ctx.arc(this.face.x - 20, this.face.y - 20, this.face.radius * 0.8, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawEyes() {
        // Eye whites
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.left.x, this.eyes.left.y, this.eyes.left.radius + 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.right.x, this.eyes.right.y, this.eyes.right.radius + 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Iris
        this.ctx.fillStyle = this.eyes.left.color;
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.left.x, this.eyes.left.y, this.eyes.left.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.right.x, this.eyes.right.y, this.eyes.right.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.left.x, this.eyes.left.y, this.eyes.left.radius * 0.6, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.right.x, this.eyes.right.y, this.eyes.right.radius * 0.6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Eye highlights
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.left.x - 2, this.eyes.left.y - 2, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.eyes.right.x - 2, this.eyes.right.y - 2, 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawEyebrows() {
        this.ctx.fillStyle = this.eyebrows.left.color;
        
        // Left eyebrow
        this.ctx.fillRect(
            this.eyebrows.left.x - this.eyebrows.left.width / 2,
            this.eyebrows.left.y,
            this.eyebrows.left.width,
            this.eyebrows.left.height
        );
        
        // Right eyebrow
        this.ctx.fillRect(
            this.eyebrows.right.x - this.eyebrows.right.width / 2,
            this.eyebrows.right.y,
            this.eyebrows.right.width,
            this.eyebrows.right.height
        );
    }
    
    drawMouth() {
        this.ctx.fillStyle = this.mouth.color;
        
        if (this.isSpeaking) {
            // Open mouth for speaking
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.mouth.x,
                this.mouth.y,
                this.mouth.width / 2,
                this.mouth.height + Math.sin(Date.now() * 0.01) * 5,
                0, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Tongue
            this.ctx.fillStyle = '#FFB6C1';
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.mouth.x,
                this.mouth.y + 5,
                this.mouth.width / 3,
                this.mouth.height / 2,
                0, 0, 2 * Math.PI
            );
            this.ctx.fill();
        } else {
            // Closed mouth
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.mouth.x,
                this.mouth.y,
                this.mouth.width / 2,
                this.mouth.height / 2,
                0, 0, 2 * Math.PI
            );
            this.ctx.fill();
        }
    }
    
    animateSpeaking() {
        // Lip sync animation
        const time = Date.now() * 0.01;
        this.mouth.height = 20 + Math.sin(time * 3) * 8;
    }
    
    animateBlinking() {
        const time = Date.now() * 0.001;
        const blink = Math.sin(time * 2) < -0.8;
        
        if (blink) {
            this.eyes.left.radius = 2;
            this.eyes.right.radius = 2;
        } else {
            this.eyes.left.radius = 8;
            this.eyes.right.radius = 8;
        }
    }
    
    animateSubtleMovements() {
        const time = Date.now() * 0.002;
        
        // Subtle head movement
        this.face.x = this.canvas.width / 2 + Math.sin(time) * 2;
        this.face.y = this.canvas.height / 2 + Math.cos(time * 0.5) * 1;
        
        // Eye movement
        this.eyes.left.x = this.face.x - 40 + Math.sin(time * 0.7) * 3;
        this.eyes.right.x = this.face.x + 40 + Math.sin(time * 0.7) * 3;
    }
    
    setEmotion(emotion) {
        this.currentEmotion = emotion;
        
        switch (emotion) {
            case 'happy':
                this.eyebrows.left.y = this.face.y - 50;
                this.eyebrows.right.y = this.face.y - 50;
                this.mouth.height = 25;
                break;
            case 'serious':
                this.eyebrows.left.y = this.face.y - 40;
                this.eyebrows.right.y = this.face.y - 40;
                this.mouth.height = 15;
                break;
            case 'neutral':
            default:
                this.eyebrows.left.y = this.face.y - 45;
                this.eyebrows.right.y = this.face.y - 45;
                this.mouth.height = 20;
                break;
        }
    }
    
    startSpeaking() {
        this.isSpeaking = true;
        this.setEmotion('neutral');
    }
    
    stopSpeaking() {
        this.isSpeaking = false;
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Export for use in main script
window.AIAvatar = AIAvatar;