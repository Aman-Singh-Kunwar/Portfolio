// Wait for DOM to load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile navigation menu
    const navIcon = document.querySelector('.nav-icon');
    const navLinks = document.querySelector('.nav-links');
    if (navIcon && navLinks) {
        navIcon.addEventListener('click', function() {
            navLinks.classList.toggle('nav-open');
        });
    } else {
        console.log('Error: .nav-icon or .nav-links not found');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Select the logo element
    const logo = document.querySelector('.logo');

    // Add click event listener
    logo.addEventListener('click', function(event) {
      // Prevent default link behavior if href is set (e.g., "/")
        event.preventDefault();
      // Refresh the page
        location.reload();
    });
});

// Smooth scrolling for navigation links and logo
document.querySelectorAll('.nav-link, .logo').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({
            behavior: 'smooth'
        });
        // Update active class for nav-links only
        if (this.classList.contains('nav-link')) {
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Role text cycling animation with typing effect
const roleText = document.getElementById('role-text');
const roles = ['Full Stack Web Developer', 'Computer Science Engineer'];
let roleIndex = 0;
let charIndex = 0;
let isTyping = true;
let typingSpeed = 100; // Speed of typing in milliseconds
let pauseSpeed = 2000; // Pause before erasing and switching in milliseconds

function typeRole() {
    const currentRole = roles[roleIndex];
    
    if (isTyping) {
        // Typing phase: add one letter at a time
        const displayText = currentRole.substring(0, charIndex + 1);
        roleText.textContent = displayText;
        roleText.style.animation = 'none'; // Remove blinking animation

        if (charIndex < currentRole.length - 1) {
            charIndex++;
            setTimeout(typeRole, typingSpeed);
        } else {
            // Pause after typing is complete
            charIndex = currentRole.length - 1;
            setTimeout(() => {
                isTyping = false;
                typeRole();
            }, pauseSpeed);
        }
    } else {
        // Erasing phase: remove all text instantly and hide cursor
        roleText.textContent = '.';
        roleText.style.borderRight = 'none';
        roleText.style.animation = 'none';
        charIndex = 0;
        isTyping = true;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeRole, 100);
    }
}

// Project count animation (once only, from 0 to 3)
const projectDigit = document.querySelector('.project-digit');
let count = 0;

function updateProjectCount() {
    if (count < 3) {
        projectDigit.textContent = `${count}+`;
        count++;
    } else {
        projectDigit.textContent = `3+`;
        clearInterval(projectInterval);
    }
}

const projectInterval = setInterval(updateProjectCount, 1500);

// Start role cycling animation on page load
window.onload = () => {
    typeRole();
};

// Highlight active section based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scrollPosition = window.scrollY;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            const sectionId = section.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Initial page load animation and section observation
document.addEventListener('DOMContentLoaded', () => {
    // Initially hide everything and show blank screen
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000000';

    const sections = document.querySelectorAll('.section');

    // Enable scrolling and start observing sections after 0.5s delay
    setTimeout(() => {
        document.body.style.overflow = 'auto';

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }, 500);
});

// Adjust GitHub background image size dynamically
document.addEventListener('DOMContentLoaded', function () {
    const githubProjects = document.getElementById('github-projects');
    const backgroundImg = document.querySelector('.background-img');
    const githubContent = document.querySelector('.github-content');

    function resizeBackgroundImage() {
        backgroundImg.classList.remove('constrained-width');
        githubContent.classList.remove('container');

        const sectionWidth = githubProjects.offsetWidth;
        backgroundImg.style.width = `${sectionWidth}px`;
    }

    resizeBackgroundImage();
    window.addEventListener('resize', resizeBackgroundImage);
});
