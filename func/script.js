const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
}

const header = document.getElementById('site-header');
const progress = document.getElementById('scroll-progress');
const toTop = document.getElementById('to-top');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navAnchors = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');

const closeNav = () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
});

document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
});

let ticking = false;

const updateOnScroll = () => {
    const scrollY = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? scrollY / scrollable : 0;

    header.classList.toggle('scrolled', scrollY > 12);
    progress.style.width = `${Math.min(ratio * 100, 100)}%`;
    toTop.classList.toggle('show', scrollY > 500);
    ticking = false;
};

window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateOnScroll);
}, { passive: true });

updateOnScroll();

toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const current = `#${entry.target.id}`;
        navAnchors.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === current);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

const contactForm = document.getElementById('contact-form');
const feedback = document.getElementById('form-feedback');
const contactSubmit = contactForm.querySelector('button[type="submit"]');
const contactEndpoint = 'https://formsubmit.co/ajax/simplealice2@yandex.ru';

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    feedback.classList.remove('is-success', 'is-error');

    if (!name || !email || !message) {
        feedback.textContent = 'Please fill out all fields.';
        feedback.classList.add('is-error');
        return;
    }

    if (!emailPattern.test(email)) {
        feedback.textContent = 'Please enter a valid email address.';
        feedback.classList.add('is-error');
        return;
    }

    contactSubmit.disabled = true;
    feedback.textContent = 'Sending...';

    try {
        const response = await fetch(contactEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                message,
                _subject: `Portfolio message from ${name}`,
                _replyto: email,
                _template: 'table',
                _captcha: 'false'
            })
        });

        if (!response.ok) throw new Error('Request failed');

        const result = await response.json().catch(() => ({}));

        if (String(result.success) !== 'true') {
            throw new Error(result.message || 'Request failed');
        }

        feedback.textContent = `Thanks, ${name.split(' ')[0]}! I'll get back to you soon.`;
        feedback.classList.add('is-success');
        contactForm.reset();
    } catch (error) {
        const detail = error && error.message && error.message !== 'Request failed'
            ? ` (${error.message})`
            : '';
        feedback.textContent = `Sorry, something went wrong${detail}. Please try again or email me directly at simplealice2@yandex.ru.`;
        feedback.classList.add('is-error');
    } finally {
        contactSubmit.disabled = false;
    }
});

const projectMedia = document.querySelectorAll('.project-media[data-video-src]');
const videoModal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('video-modal-player');
const videoTitle = document.getElementById('video-modal-title');
const videoClose = document.getElementById('video-close');

let lastFocusedElement = null;

const closeVideoModal = () => {
    if (!videoModal || videoModal.hidden) return;

    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    videoModal.hidden = true;
    document.body.classList.remove('modal-open');

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
};

const openVideoModal = (trigger) => {
    if (!videoModal || !videoPlayer) return;

    lastFocusedElement = trigger;
    videoTitle.textContent = trigger.dataset.videoTitle || 'Project demo';
    videoPlayer.src = trigger.dataset.videoSrc;
    videoModal.hidden = false;
    document.body.classList.add('modal-open');

    const playPromise = videoPlayer.play();
    if (playPromise) playPromise.catch(() => {});

    if (videoClose) videoClose.focus();
};

projectMedia.forEach((trigger) => {
    trigger.addEventListener('click', () => openVideoModal(trigger));
});

if (videoModal) {
    videoModal.querySelectorAll('[data-video-close]').forEach((el) => {
        el.addEventListener('click', closeVideoModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeVideoModal();
    });
}

const year = document.getElementById('year');

if (year) {
    year.textContent = new Date().getFullYear();
}
