// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all feature cards, steps, and other elements
document.querySelectorAll('.feature-card, .step, .about-content, .contact-content').forEach(el => {
    observer.observe(el);
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Simulate form submission (replace with actual API call)
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#28a745';

            // Reset form
            this.reset();

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '#1a1a1a';
                submitBtn.disabled = false;
            }, 3000);
        }, 2000);
    });
}

// Add loading animation for hero image placeholder
document.addEventListener('DOMContentLoaded', function() {
    const heroPlaceholder = document.querySelector('.hero-image-placeholder');
    if (heroPlaceholder) {
        heroPlaceholder.style.opacity = '0';
        heroPlaceholder.style.transform = 'scale(0.8)';

        setTimeout(() => {
            heroPlaceholder.style.transition = 'all 0.8s ease';
            heroPlaceholder.style.opacity = '1';
            heroPlaceholder.style.transform = 'scale(1)';
        }, 300);
    }
});

// Add hover effects for feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Typing effect for hero subtitle (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Initialize typing effect on hero subtitle
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const originalText = heroSubtitle.textContent;
    // Uncomment to enable typing effect
    // typeWriter(heroSubtitle, originalText, 30);
}

// Add parallax effect to hero section (subtle)
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Mobile menu toggle (if needed for smaller screens)
function initMobileMenu() {
    const nav = document.querySelector('.navbar');
    const navContainer = document.querySelector('.nav-container');

    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    `;
    mobileMenuBtn.style.display = 'none';
    mobileMenuBtn.style.background = 'none';
    mobileMenuBtn.style.border = 'none';
    mobileMenuBtn.style.color = '#1a1a1a';
    mobileMenuBtn.style.cursor = 'pointer';

    navContainer.appendChild(mobileMenuBtn);

    // Show mobile menu button on small screens
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
            document.querySelector('.nav-links').style.display = 'none';
        } else {
            mobileMenuBtn.style.display = 'none';
            document.querySelector('.nav-links').style.display = 'flex';
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        const isVisible = navLinks.style.display === 'flex';

        if (isVisible) {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'white';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

initMobileMenu();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease forwards;
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .feature-card, .step {
        transition: all 0.3s ease;
    }

    .hero-image-placeholder {
        transition: all 0.8s ease;
    }

    .mobile-menu-btn {
        display: none;
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block !important;
        }
    }
`;
document.head.appendChild(style);
