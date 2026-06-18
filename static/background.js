// background.js - Pixelated Playground Canvas Background
// Renders a pixelated football field, blue sky, floating clouds, square sun, 
// and animated Messi and Ronaldo avatars juggling a soccer ball.

(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'playground-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Disable image smoothing to keep things pixelated
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Sprite Colors Palette
    const PALETTE = {
        ' ': 'transparent',
        's': '#fcd0a1', // skin tone
        'b': '#5a3d28', // brown hair / beard (Messi)
        'h': '#161616', // black hair / boots (Ronaldo)
        'w': '#ffffff', // white
        'a': '#75bbfd', // Argentina light blue
        'r': '#d62222', // Portugal red
        'g': '#1a7f1a', // Portugal green / grass shorts
        'k': '#1a1a1a', // black shorts
        'o': '#ff6600', // orange boots
    };

    // Sprite frames: 12 columns by 16 rows
    const SPRITES = {
        messi: {
            idle: [
                "    bbbb    ",
                "   bbbbbb   ",
                "   bssssb   ",
                "   bssssb   ",
                "    ssss    ",
                "    bbbb    ", // beard
                "   aawaaw   ", // striped shirt
                "  aaawaaww  ",
                "  aawaawww  ",
                "  aawaaww   ",
                "   kkkkkk   ", // black shorts
                "   k    k   ",
                "   s    s   ", // legs
                "   w    w   ", // white socks
                "   w    w   ",
                "   o    o   "  // orange boots
            ],
            kick: [
                "    bbbb    ",
                "   bbbbbb   ",
                "   bssssb   ",
                "   bssssb   ",
                "    ssss    ",
                "    bbbb    ",
                "   aawaaw   ",
                "  aaawaaww  ",
                "  aawaawww  ",
                "  aawaaww   ",
                "   kkkkkk   ",
                "   k    kkk ", // leg up
                "   s     ss ",
                "   w     ww ",
                "   w     w  ",
                "   o     o  "
            ],
            knee: [
                "    bbbb    ",
                "   bbbbbb   ",
                "   bssssb   ",
                "   bssssb   ",
                "    ssss    ",
                "    bbbb    ",
                "   aawaaw   ",
                "  aaawaaww  ",
                "  aawaawww  ",
                "  aawaaww   ",
                "   kkkkkk   ",
                "   k    kk  ", // knee bent
                "   s    s s ",
                "   w    w w ",
                "   w    w   ",
                "   o    o   "
            ],
            head: [
                "    bbbb    ",
                "   bbbbbb   ",
                "   bssssb   ",
                "   bssssb   ",
                "    ssss    ",
                "    bbbb    ",
                "  aaawaaww  ", // body leaning slightly back
                "  aawaawww  ",
                "  aawaaww   ",
                "   kkkkkk   ",
                "   kk  kk   ",
                "   s    s   ",
                "   w    w   ",
                "   w    w   ",
                "   o    o   ",
                "            "
            ]
        },
        ronaldo: {
            idle: [
                "    hhhh    ",
                "   hhhhhh   ",
                "   hssssh   ",
                "   hssssh   ",
                "    ssss    ",
                "    ssss    ", // clean shaven
                "   rrrrrr   ", // red Portugal shirt
                "  rrrrrrrr  ",
                "  rrrrrrrr  ",
                "  rrrrrrr   ",
                "   gggggg   ", // green shorts
                "   g    g   ",
                "   s    s   ", // legs
                "   r    r   ", // red socks
                "   r    r   ",
                "   h    h   "  // black boots
            ],
            kick: [
                "    hhhh    ",
                "   hhhhhh   ",
                "   hssssh   ",
                "   hssssh   ",
                "    ssss    ",
                "    ssss    ",
                "   rrrrrr   ",
                "  rrrrrrrr  ",
                "  rrrrrrrr  ",
                "  rrrrrrr   ",
                "   gggggg   ",
                "   g    ggg ", // leg up
                "   s     ss ",
                "   r     rr ",
                "   r     r  ",
                "   h     h  "
            ],
            knee: [
                "    hhhh    ",
                "   hhhhhh   ",
                "   hssssh   ",
                "   hssssh   ",
                "    ssss    ",
                "    ssss    ",
                "   rrrrrr   ",
                "  rrrrrrrr  ",
                "  rrrrrrrr  ",
                "  rrrrrrr   ",
                "   gggggg   ",
                "   g    gg  ", // knee bent
                "   s    s s ",
                "   r    r r ",
                "   r    r   ",
                "   h    h   "
            ],
            head: [
                "    hhhh    ",
                "   hhhhhh   ",
                "   hssssh   ",
                "   hssssh   ",
                "    ssss    ",
                "    ssss    ",
                "  rrrrrrrr  ", // body leaning back
                "  rrrrrrrr  ",
                "  rrrrrrr   ",
                "   gggggg   ",
                "   gg  gg   ",
                "   s    s   ",
                "   r    r   ",
                "   r    r   ",
                "   h    h   ",
                "            "
            ]
        }
    };

    const BALL_SPRITE = [
        "  ww  ",
        " wkww ",
        "wkkwwk",
        "wkkwwk",
        " wwkw ",
        "  ww  "
    ];

    // Canvas scaling
    const PIXEL_SCALE = 6; // Scale of pixel art
    const PLAYER_WIDTH = 12 * PIXEL_SCALE;
    const PLAYER_HEIGHT = 16 * PIXEL_SCALE;

    // Environment State
    let groundY = 0;
    
    // Players State
    const players = {
        messi: {
            name: 'Messi',
            x: 0,
            y: 0,
            state: 'idle',
            stateTimer: 0,
            facingLeft: false,
            juggles: 0
        },
        ronaldo: {
            name: 'Ronaldo',
            x: 0,
            y: 0,
            state: 'idle',
            stateTimer: 0,
            facingLeft: true,
            juggles: 0
        }
    };

    // Ball State
    const ball = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 3 * PIXEL_SCALE,
        gravity: 0.22,
        trail: []
    };

    // Particles State
    let particles = [];

    // Clouds
    const clouds = [
        { x: 50, y: 60, speed: 0.15, scale: 4 },
        { x: 300, y: 110, speed: 0.08, scale: 6 },
        { x: 600, y: 80, speed: 0.22, scale: 3 }
    ];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        groundY = canvas.height - 120;
        
        // Reposition players relative to screen width
        const cx = canvas.width / 2;
        if (canvas.width > 800) {
            players.messi.x = cx - 280 - PLAYER_WIDTH / 2;
            players.ronaldo.x = cx + 280 - PLAYER_WIDTH / 2;
        } else {
            // Mobile: closer together
            players.messi.x = cx - 80 - PLAYER_WIDTH / 2;
            players.ronaldo.x = cx + 80 - PLAYER_WIDTH / 2;
        }

        players.messi.y = groundY - PLAYER_HEIGHT;
        players.ronaldo.y = groundY - PLAYER_HEIGHT;

        // Reset ball if out of bounds on resize
        if (ball.x <= 0 || ball.x >= canvas.width || ball.y >= canvas.height) {
            resetBall();
        }
    }

    function resetBall() {
        ball.x = players.messi.x + PLAYER_WIDTH / 2;
        ball.y = players.messi.y - 40;
        ball.vx = 1.5 + Math.random() * 1.5;
        ball.vy = -6 - Math.random() * 3;
        players.messi.juggles = 0;
        players.ronaldo.juggles = 0;
    }

    function spawnParticles(x, y, color, count = 6) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                color: color,
                life: 15 + Math.floor(Math.random() * 15)
            });
        }
    }

    function drawSprite(sprite, x, y, facingLeft, type) {
        const height = sprite.length;
        const width = sprite[0].length;
        
        ctx.save();
        if (facingLeft) {
            // Flip horizontally around center of sprite
            ctx.translate(x + (width * PIXEL_SCALE) / 2, y + (height * PIXEL_SCALE) / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(x + (width * PIXEL_SCALE) / 2), -(y + (height * PIXEL_SCALE) / 2));
        }
        
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                const char = sprite[r][c];
                if (char !== ' ') {
                    ctx.fillStyle = PALETTE[char] || '#ffffff';
                    ctx.fillRect(x + c * PIXEL_SCALE, y + r * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                }
            }
        }
        ctx.restore();
    }

    function drawCloud(cx, cy, scale) {
        ctx.fillStyle = '#ffffff';
        // Draw pixel-style puffy cloud made of boxes
        const blocks = [
            { dx: -4, dy: 0, w: 9, h: 3 },
            { dx: -2, dy: -2, w: 6, h: 2 },
            { dx: 1, dy: -1, w: 3, h: 2 },
            { dx: -3, dy: 1, w: 7, h: 3 }
        ];

        blocks.forEach(b => {
            ctx.fillRect(cx + b.dx * scale, cy + b.dy * scale, b.w * scale, b.h * scale);
        });

        // Soft cloud shadow under it (light blue-grey)
        ctx.fillStyle = 'rgba(215, 235, 255, 0.4)';
        ctx.fillRect(cx - 3 * scale, cy + 3 * scale, 7 * scale, 1 * scale);
    }

    function drawField() {
        // Alternating green stripes
        const stripeWidth = 80;
        for (let x = 0; x < canvas.width; x += stripeWidth) {
            ctx.fillStyle = (Math.floor(x / stripeWidth) % 2 === 0) ? '#4da238' : '#43952f';
            ctx.fillRect(x, groundY, stripeWidth, canvas.height - groundY);
        }

        // Touchline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(0, groundY + 4, canvas.width, 4);

        // Center line
        const cx = canvas.width / 2;
        ctx.fillRect(cx - 2, groundY, 4, canvas.height - groundY);

        // Center Circle (drawn pixelated by boxes)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, groundY + 50, 45, Math.PI, 0, false);
        ctx.stroke();

        // Left Goalpost
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, groundY - 80, 4, 80); // post
        ctx.fillRect(20, groundY - 80, 24, 4);  // crossbar
        // Net pattern (pixelated dashed lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let offset = 0; offset <= 20; offset += 5) {
            ctx.moveTo(20 + offset, groundY - 80);
            ctx.lineTo(20, groundY - 80 + offset * 4);
        }
        ctx.stroke();

        // Right Goalpost
        const rx = canvas.width - 24;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx, groundY - 80, 4, 80); // post
        ctx.fillRect(rx - 20, groundY - 80, 24, 4); // crossbar
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let offset = 0; offset <= 20; offset += 5) {
            ctx.moveTo(rx - offset, groundY - 80);
            ctx.lineTo(rx, groundY - 80 + offset * 4);
        }
        ctx.stroke();
    }

    function checkCollision(player) {
        // Bounding box of player
        const left = player.x - 4;
        const right = player.x + PLAYER_WIDTH + 4;
        const top = player.y - 10;
        const bottom = player.y + PLAYER_HEIGHT;

        if (ball.x >= left && ball.x <= right && ball.y >= top && ball.y <= bottom) {
            // Touch!
            player.juggles++;
            
            // Determine touch spot and adjust state
            const relY = (ball.y - player.y) / PLAYER_HEIGHT;
            let kickForceY = -6.5 - Math.random() * 2;
            let kickForceX = (Math.random() - 0.5) * 1.5;

            if (relY < 0.25) {
                // Header
                player.state = 'head';
                kickForceY = -4.5 - Math.random() * 1.5;
            } else if (relY < 0.6) {
                // Knee
                player.state = 'knee';
                kickForceY = -5.8 - Math.random() * 2;
            } else {
                // Kick
                player.state = 'kick';
                kickForceY = -7.0 - Math.random() * 2.5;
            }
            player.stateTimer = 12; // animation frames

            // If player has juggled 3 times, pass to the other player!
            const other = player.name === 'Messi' ? players.ronaldo : players.messi;
            if (player.juggles >= 3) {
                player.juggles = 0;
                
                // Calculate beautiful pass arc
                const flightTime = 70; // frames
                kickForceX = (other.x + PLAYER_WIDTH/2 - ball.x) / flightTime;
                kickForceY = -0.5 * ball.gravity * flightTime - 2; // high arc
                
                spawnParticles(ball.x, ball.y, '#ffffff', 8);
                spawnParticles(ball.x, ball.y, '#ffd700', 4);
            } else {
                // Keep juggling individually
                // Kick slightly towards the center or other player so they don't drift away
                const dirToOther = Math.sign(other.x - player.x);
                kickForceX = dirToOther * (0.2 + Math.random() * 0.8);
                spawnParticles(ball.x, ball.y, '#ffffff', 4);
            }

            ball.vy = kickForceY;
            ball.vx = kickForceX;
            // Move ball out of player box slightly to avoid multi-collides
            ball.y = top - 2;
        }
    }

    function loop() {
        // 1. Draw Sky (blue gradient)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, '#3a86ff');
        skyGrad.addColorStop(1, '#8ec5fc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, groundY);

        // 2. Draw Sun (square pixel sun)
        ctx.fillStyle = '#ffde43';
        ctx.fillRect(canvas.width - 120, 40, 50, 50);
        // Sun glow
        ctx.fillStyle = 'rgba(255, 222, 67, 0.2)';
        ctx.fillRect(canvas.width - 130, 30, 70, 70);

        // 3. Draw Clouds
        clouds.forEach(c => {
            drawCloud(c.x, c.y, c.scale);
            c.x += c.speed;
            if (c.x - 100 > canvas.width) {
                c.x = -150;
            }
        });

        // 4. Draw Grass & Markings
        drawField();

        // 5. Update and Draw Players
        for (const key in players) {
            const p = players[key];
            
            // Decrement state timers
            if (p.stateTimer > 0) {
                p.stateTimer--;
                if (p.stateTimer === 0) {
                    p.state = 'idle';
                }
            }

            // Face the ball
            p.facingLeft = (ball.x < p.x + PLAYER_WIDTH / 2);

            // Draw player
            const frame = SPRITES[key][p.state];
            drawSprite(frame, p.x, p.y, p.facingLeft, key);
        }

        // 6. Update and Draw Ball
        ball.vy += ball.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Ball Trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 8) ball.trail.shift();

        // Draw trail
        ball.trail.forEach((t, index) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${index * 0.08})`;
            ctx.fillRect(t.x - ball.radius / 2, t.y - ball.radius / 2, ball.radius, ball.radius);
        });

        // Ball Collision checks
        checkCollision(players.messi);
        checkCollision(players.ronaldo);

        // Ground collision
        if (ball.y + ball.radius >= groundY) {
            ball.y = groundY - ball.radius;
            ball.vy = -ball.vy * 0.45; // bounce loss
            ball.vx *= 0.6; // friction
            
            spawnParticles(ball.x, ball.y, '#4da238', 3);

            // If ball stopped or rolled off, kick it off again
            if (Math.abs(ball.vy) < 0.4 && Math.abs(ball.vx) < 0.4) {
                resetBall();
            }
        }

        // Wall collision
        if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * 0.8;
        } else if (ball.x + ball.radius >= canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -ball.vx * 0.8;
        }

        // Draw Ball
        drawSprite(BALL_SPRITE, ball.x - 3 * PIXEL_SCALE, ball.y - 3 * PIXEL_SCALE, false, 'ball');

        // 7. Update and Draw Particles
        particles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life--;

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 4, 4);

            if (p.life <= 0) {
                particles.splice(idx, 1);
            }
        });

        requestAnimationFrame(loop);
    }

    // Set initial size and positions
    window.addEventListener('resize', resize);
    resize();
    resetBall();

    // Start rendering loop
    loop();
})();
